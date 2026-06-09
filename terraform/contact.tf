# Contact-form backend.
#
# Flow: static page -> CloudFront /api/contact behavior (see cloudfront.tf) ->
# API Gateway HTTP API -> Lambda verifies a reCAPTCHA Enterprise token and a
# CloudFront-injected shared-secret header, then publishes the message to an SNS
# topic that emails var.contact_email. Both API Gateway and Lambda are
# request-priced, so there is no always-on infra.
#
# Why API Gateway and not a Lambda Function URL: anonymous (authType NONE)
# Function URLs are blocked account-wide in this account, and CloudFront OAC
# cannot sign POST requests to an AWS_IAM Function URL (InvalidSignatureException).
# API Gateway invokes the Lambda as a service principal, so there is no
# client-side request signing to get wrong.
#
# Verification uses reCAPTCHA Enterprise: the Lambda calls the Cloud
# createAssessment API with a GCP API key and the site key, both read at runtime
# from pre-existing SSM SecureStrings so their values never enter Terraform
# state. boto3 ships with the Lambda Python runtime, so the function has no
# bundled dependencies.

# --- Shared secret: CloudFront origin header -> Lambda ----------------------
# Generated here (lives only in the encrypted S3 state backend) and injected by
# CloudFront as a custom origin header. The Lambda rejects any request that
# doesn't carry it, so the public API Gateway endpoint can't be invoked directly.
resource "random_password" "contact_origin" {
  length  = 48
  special = false
}

# --- SNS topic + email subscription -----------------------------------------
resource "aws_sns_topic" "contact" {
  name = "brooks-security-contact"
}

# Email subscriptions require a one-time confirmation click after first apply;
# until confirmed, no mail flows.
resource "aws_sns_topic_subscription" "contact_email" {
  topic_arn = aws_sns_topic.contact.arn
  protocol  = "email"
  endpoint  = var.contact_email
}

# --- Lambda execution role --------------------------------------------------
data "aws_iam_policy_document" "contact_lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "contact_lambda" {
  name               = "brooks-security-contact"
  assume_role_policy = data.aws_iam_policy_document.contact_lambda_assume.json
}

resource "aws_iam_role_policy" "contact_lambda" {
  name = "contact"
  role = aws_iam_role.contact_lambda.id

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
        Sid    = "ReadRecaptchaParams"
        Effect = "Allow"
        Action = ["ssm:GetParameter"]
        Resource = [
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_api_key_ssm_param}",
          "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_site_key_ssm_param}",
        ]
      },
      {
        # Decrypt the SecureStrings. Scoped to SSM-mediated calls so this never
        # grants broad KMS access even though it targets the AWS-managed key.
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
      {
        Sid      = "PublishContact"
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.contact.arn
      },
    ]
  })
}

# --- Lambda function --------------------------------------------------------
data "archive_file" "contact" {
  type        = "zip"
  source_file = "${path.module}/files/contact/index.py"
  output_path = "${path.module}/files/contact.zip"
}

resource "aws_lambda_function" "contact" {
  function_name = "brooks-security-contact"
  description   = "Contact form: reCAPTCHA Enterprise assessment + shared secret, publish submission to SNS."
  role          = aws_iam_role.contact_lambda.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  timeout       = 10

  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256

  environment {
    variables = {
      RECAPTCHA_PROJECT_ID         = var.recaptcha_project_id
      RECAPTCHA_API_KEY_SSM_PARAM  = var.recaptcha_api_key_ssm_param
      RECAPTCHA_SITE_KEY_SSM_PARAM = var.recaptcha_site_key_ssm_param
      RECAPTCHA_MIN_SCORE          = tostring(var.recaptcha_min_score)
      SNS_TOPIC_ARN                = aws_sns_topic.contact.arn
      ORIGIN_SECRET                = random_password.contact_origin.result
    }
  }
}

# --- API Gateway HTTP API ---------------------------------------------------
# CloudFront's /api/contact behavior proxies to this API; API Gateway invokes the
# Lambda with a proxy integration (payload format 2.0, the same event shape a
# Function URL delivers, so the handler is unchanged).
resource "aws_apigatewayv2_api" "contact" {
  name          = "brooks-security-contact"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

# $default stage with auto-deploy: serves at the API root with no stage prefix,
# so POST /api/contact is reachable directly under the execute-api domain.
resource "aws_apigatewayv2_stage" "contact" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true
}

# Let API Gateway invoke the Lambda.
resource "aws_lambda_permission" "contact_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

# Explicit log group with retention so logs don't accumulate forever.
resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/${aws_lambda_function.contact.function_name}"
  retention_in_days = 14
}
