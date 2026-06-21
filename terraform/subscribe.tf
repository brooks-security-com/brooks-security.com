# Subscribe backend: lead-magnet email capture into a Google Sheet.
#
# Flow mirrors the contact form (see contact.tf): static page -> CloudFront
# /api/subscribe behavior (see cloudfront.tf) -> the SAME API Gateway HTTP API
# (a new route) -> a new Lambda that verifies the CloudFront-injected shared
# secret and a reCAPTCHA Enterprise token (action "subscribe"), then appends a
# row to a Google Sheet.
#
# Difference from contact: the write target is Google, reached keyless via
# Workload Identity Federation. The Lambda's AWS role impersonates a service
# account in GCP; there is no service-account key. The WIF credential config and
# the sheet id are read at runtime from SSM, so neither enters Terraform state.
# The federated token exchange needs the google-auth library, shipped as a
# committed, reproducible Lambda layer (the one dependency this Lambda carries).

# --- Lambda execution role --------------------------------------------------
# The role NAME is load-bearing: the GCP WIF provider's attribute condition and
# the workloadIdentityUser binding both trust this role's assumed-role ARN by
# string. Renaming it breaks federation. Do not change "brooks-security-subscribe".
data "aws_iam_policy_document" "subscribe_lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "subscribe_lambda" {
  name               = "brooks-security-subscribe"
  assume_role_policy = data.aws_iam_policy_document.subscribe_lambda_assume.json
}

resource "aws_iam_role_policy" "subscribe_lambda" {
  name = "subscribe"
  role = aws_iam_role.subscribe_lambda.id

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
        # The two new subscribe params plus the existing reCAPTCHA params.
        Sid    = "ReadParams"
        Effect = "Allow"
        Action = ["ssm:GetParameter"]
        Resource = [
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.subscribe_google_cred_config_ssm_param}",
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.subscribe_sheet_id_ssm_param}",
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_api_key_ssm_param}",
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_site_key_ssm_param}",
        ]
      },
      {
        # Decrypt the SecureStrings. Scoped to SSM-mediated calls (copy of the
        # contact pattern) so it never grants broad KMS access.
        Sid      = "DecryptSecret"
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

# --- google-auth Lambda layer -----------------------------------------------
# Built from terraform/files/subscribe-layer/ (run build.sh, commit python/).
# Pure-Python deps, so the build is platform-independent and reproducible.
data "archive_file" "subscribe_layer" {
  type        = "zip"
  source_dir  = "${path.module}/files/subscribe-layer"
  output_path = "${path.module}/files/subscribe-layer.zip"
  excludes    = ["build.sh", "requirements.txt", "subscribe-layer.zip"]
}

resource "aws_lambda_layer_version" "google_auth" {
  layer_name          = "brooks-security-google-auth"
  description         = "google-auth for the subscribe Lambda's keyless WIF token exchange."
  filename            = data.archive_file.subscribe_layer.output_path
  source_code_hash    = data.archive_file.subscribe_layer.output_base64sha256
  compatible_runtimes = ["python3.12"]
}

# --- Lambda function --------------------------------------------------------
data "archive_file" "subscribe" {
  type        = "zip"
  source_file = "${path.module}/files/subscribe/index.py"
  output_path = "${path.module}/files/subscribe.zip"
}

resource "aws_lambda_function" "subscribe" {
  function_name = "brooks-security-subscribe"
  description   = "Subscribe form: reCAPTCHA Enterprise + shared secret, append row to a Google Sheet via WIF."
  role          = aws_iam_role.subscribe_lambda.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  # More work than the contact Lambda: reCAPTCHA assessment plus the WIF token
  # exchange (STS, IAM generateAccessToken) and the Sheets append, several
  # sequential TLS round trips plus google-auth crypto. 512 MB buys proportional
  # CPU so TLS/crypto on a cold start finishes well inside the timeout.
  timeout     = 30
  memory_size = 512
  layers      = [aws_lambda_layer_version.google_auth.arn]

  filename         = data.archive_file.subscribe.output_path
  source_code_hash = data.archive_file.subscribe.output_base64sha256

  environment {
    variables = {
      RECAPTCHA_PROJECT_ID         = var.recaptcha_project_id
      RECAPTCHA_API_KEY_SSM_PARAM  = var.recaptcha_api_key_ssm_param
      RECAPTCHA_SITE_KEY_SSM_PARAM = var.recaptcha_site_key_ssm_param
      RECAPTCHA_MIN_SCORE          = tostring(var.recaptcha_min_score)
      ORIGIN_SECRET                = random_password.contact_origin.result
      GOOGLE_CRED_CONFIG_SSM_PARAM = var.subscribe_google_cred_config_ssm_param
      SHEET_ID_SSM_PARAM           = var.subscribe_sheet_id_ssm_param
      SHEET_RANGE                  = "Subscribers!A:E"
    }
  }
}

# --- API Gateway: new route on the existing contact HTTP API ----------------
resource "aws_apigatewayv2_integration" "subscribe" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.subscribe.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "subscribe" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/subscribe"
  target    = "integrations/${aws_apigatewayv2_integration.subscribe.id}"
}

resource "aws_lambda_permission" "subscribe_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subscribe.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "subscribe" {
  name              = "/aws/lambda/${aws_lambda_function.subscribe.function_name}"
  retention_in_days = 14
}
