# =============================================================================
# grc-tools policy builder backend
#
# DynamoDB (session state + policy metadata) + ECR (Lambda container image) +
# IAM role + API Gateway routes. The Lambda function itself is deployed via
# docker build/push, not Terraform — the aws_lambda_function resource just
# points at the latest ECR image.
#
# API Gateway routes for the grc-tools API are added to the existing
# brooks-security-contact HTTP API (contact.tf) to avoid creating a second
# API Gateway.
#
# S3 bucket policy for Lambda write access is patched into the existing
# aws_s3_bucket_policy.origin in s3.tf.
# =============================================================================

# --- ECR repository for Lambda container image -------------------------------

resource "aws_ecr_repository" "grc_tools" {
  name = "grc-tools"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true
}

# --- DynamoDB tables ---------------------------------------------------------

resource "aws_dynamodb_table" "grc_sessions" {
  name         = "grc-tools-sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

resource "aws_dynamodb_table" "grc_policies" {
  name         = "grc-tools-policies"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "policy_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "policy_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# --- IAM role for grc-tools Lambda ------------------------------------------

data "aws_iam_policy_document" "grc_tools_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "grc_tools" {
  name               = "grc-tools"
  assume_role_policy = data.aws_iam_policy_document.grc_tools_assume.json
}

resource "aws_iam_role_policy" "grc_tools" {
  name = "grc-tools"
  role = aws_iam_role.grc_tools.id

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
        Sid    = "DynamoDBSessions"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
        ]
        Resource = aws_dynamodb_table.grc_sessions.arn
      },
      {
        Sid    = "DynamoDBPolicies"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
        ]
        Resource = aws_dynamodb_table.grc_policies.arn
      },
      {
        Sid    = "S3GeneratedPolicies"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
        ]
        Resource = "arn:aws:s3:::${var.domain}/grc-tools/users/*"
      },
      {
        Sid      = "DecryptSSM"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "ssm.us-east-1.amazonaws.com"
          }
        }
      },
    ]
  })
}

# --- Lambda function (container image from ECR) -----------------------------

resource "aws_lambda_function" "grc_tools" {
  function_name = "grc-tools"
  role          = aws_iam_role.grc_tools.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.grc_tools.repository_url}:latest"
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      SESSIONS_TABLE = aws_dynamodb_table.grc_sessions.name
      POLICIES_TABLE = aws_dynamodb_table.grc_policies.name
      S3_BUCKET      = var.domain
      S3_PREFIX      = "grc-tools/users"
      USER_POOL_ID   = aws_cognito_user_pool.grc_tools.id
      CLIENT_ID      = aws_cognito_user_pool_client.grc_tools.id
      ORIGIN_SECRET  = random_password.contact_origin.result
    }
  }
}

resource "aws_cloudwatch_log_group" "grc_tools" {
  name              = "/aws/lambda/${aws_lambda_function.grc_tools.function_name}"
  retention_in_days = 14
}

# --- API Gateway routes (added to the existing contact API) ------------------

resource "aws_apigatewayv2_integration" "grc_tools" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.grc_tools.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "grc_whoami" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/whoami"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_session_get" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/session"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_session_put" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "PUT /api/grc-tools/session"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_templates" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/templates"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_generate" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/grc-tools/generate"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_bundle" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/grc-tools/bundle"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_policies" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/policies"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

# Let API Gateway invoke the Lambda
resource "aws_lambda_permission" "grc_tools_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.grc_tools.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}
