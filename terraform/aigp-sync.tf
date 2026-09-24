# Sync API for the AIGP study app: username/password accounts and cross-device
# progress. Spec: docs/specs/cross-device-sync.md in the aigp-study repo.
#
# Flow mirrors the contact form (see contact.tf): the app -> CloudFront /api/*
# behavior on the aigp distribution (see aigp.tf) -> an HTTP API -> one Lambda
# that checks a CloudFront-injected shared secret, then registers, logs in, or
# merges and stores the caller's progress in DynamoDB.
#
# Its own HTTP API rather than new routes on the contact API: the throttles
# below are per stage, and login/register need a far lower ceiling than the
# contact form. The API costs nothing when idle.
#
# Both secrets are generated here, so they live only in the encrypted S3 state
# backend and the Lambda's environment, the same as contact_origin.

resource "random_password" "aigp_origin" {
  length  = 48
  special = false
}

# HMAC key for the stateless session tokens. Rotating it (taint + apply) signs
# every user out; their progress is untouched.
resource "random_password" "aigp_token_key" {
  length  = 64
  special = false
}

# --- DynamoDB ---------------------------------------------------------------
# One item per user: credentials, lockout counter and the zlib-compressed
# progress blob. On-demand, so idle cost is storage only (kilobytes).

resource "aws_dynamodb_table" "aigp_users" {
  name         = "aigp-study-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "username"

  # User progress is the one thing here that cannot be rebuilt from git.
  deletion_protection_enabled = true

  attribute {
    name = "username"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  # The cost ceiling. A write is billed at the item's full size (up to 350 KB
  # compressed), so without a cap a scripted sync loop on one padded account could
  # run to hundreds of dollars a day. At these caps the worst case is about
  # $11/day of writes and $4/day of reads; a heavy real user's sync is ~80 WRU.
  # Throttled requests fail fast (see _db() in index.py) and the app retries on
  # its next sync, so a flood delays sync without losing anyone's progress.
  on_demand_throughput {
    max_write_request_units = 200
    max_read_request_units  = 400
  }
}

# --- Lambda execution role --------------------------------------------------
data "aws_iam_policy_document" "aigp_sync_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "aigp_sync" {
  name               = "aigp-study-sync"
  assume_role_policy = data.aws_iam_policy_document.aigp_sync_assume.json
}

resource "aws_iam_role_policy" "aigp_sync" {
  name = "aigp-sync"
  role = aws_iam_role.aigp_sync.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:${var.aws_account_id}:*"
      },
      {
        # No Scan, Query or DeleteItem: the function only ever touches the one
        # item named by the caller's username or token.
        Sid      = "UserItems"
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
        Resource = aws_dynamodb_table.aigp_users.arn
      },
    ]
  })
}

# --- Lambda function --------------------------------------------------------
data "archive_file" "aigp_sync" {
  type        = "zip"
  source_file = "${path.module}/files/aigp-sync/index.py"
  output_path = "${path.module}/files/aigp-sync.zip"
}

resource "aws_lambda_function" "aigp_sync" {
  function_name = "aigp-study-sync"
  description   = "AIGP study app: register, log in, and merge/store a user's progress in DynamoDB."
  role          = aws_iam_role.aigp_sync.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  # PBKDF2 at 600k iterations is pure CPU, and Lambda CPU scales with memory, so
  # 1024 MB makes a login several times faster than 128 MB would. The cost per
  # login is about the same either way (less time at a higher rate).
  memory_size = 1024
  timeout     = 10

  filename         = data.archive_file.aigp_sync.output_path
  source_code_hash = data.archive_file.aigp_sync.output_base64sha256

  environment {
    variables = {
      TABLE         = aws_dynamodb_table.aigp_users.name
      ORIGIN_SECRET = random_password.aigp_origin.result
      TOKEN_KEY     = random_password.aigp_token_key.result
    }
  }
}

resource "aws_cloudwatch_log_group" "aigp_sync" {
  name              = "/aws/lambda/${aws_lambda_function.aigp_sync.function_name}"
  retention_in_days = 14
}

# --- API Gateway HTTP API ---------------------------------------------------
resource "aws_apigatewayv2_api" "aigp" {
  name          = "aigp-study"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "aigp" {
  api_id                 = aws_apigatewayv2_api.aigp.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.aigp_sync.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "aigp" {
  for_each  = toset(["register", "login", "sync"])
  api_id    = aws_apigatewayv2_api.aigp.id
  route_key = "POST /api/aigp/${each.key}"
  target    = "integrations/${aws_apigatewayv2_integration.aigp.id}"
}

# Throttles are stage-wide ceilings across all callers, not per client, so a
# flood can briefly block sign-in for everyone (signed-in devices keep syncing
# locally). register/login at 2 req/s bounds the PBKDF2 compute an attacker can
# make us pay for; the per-account lockout in the Lambda bounds guessing against
# one user. sync at 5 req/s is ~50 people studying at once (the app syncs at most
# once per pause) and caps response egress at 5 x 1 MB/s.
resource "aws_apigatewayv2_stage" "aigp" {
  api_id      = aws_apigatewayv2_api.aigp.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 5
  }

  dynamic "route_settings" {
    for_each = ["register", "login"]
    content {
      route_key              = aws_apigatewayv2_route.aigp[route_settings.value].route_key
      throttling_burst_limit = 5
      throttling_rate_limit  = 2
    }
  }
}

resource "aws_lambda_permission" "aigp_sync_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.aigp_sync.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.aigp.execution_arn}/*/*"
}
