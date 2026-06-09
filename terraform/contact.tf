# Contact-form backend.
#
# Flow: static page -> CloudFront /api/contact behavior (see cloudfront.tf) ->
# Lambda Function URL -> Lambda verifies a reCAPTCHA v3 token and a
# CloudFront-injected shared-secret header, then publishes the message to an SNS
# topic that emails var.contact_email. No API Gateway, no always-on infra.
#
# The key is a reCAPTCHA Enterprise score key, but the Lambda verifies tokens via
# the legacy `siteverify` endpoint using the key's legacy secret, read at runtime
# from a pre-existing SSM SecureString so its value never enters Terraform state.
# boto3 ships with the Lambda Python runtime, so the function has no bundled
# dependencies.

# --- Shared secret: CloudFront origin header -> Lambda ----------------------
# Generated here (lives only in the encrypted S3 state backend) and injected by
# CloudFront as a custom origin header. The Lambda rejects any request that
# doesn't carry it, so the public Function URL can't be invoked directly.
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
        Sid      = "ReadRecaptchaSecret"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_secret_ssm_param}"
      },
      {
        # Decrypt the SecureString. Scoped to SSM-mediated calls so this never
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
  description   = "Contact form: reCAPTCHA siteverify (legacy secret) + shared secret, publish submission to SNS."
  role          = aws_iam_role.contact_lambda.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  timeout       = 10

  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256

  environment {
    variables = {
      RECAPTCHA_SECRET_SSM_PARAM = var.recaptcha_secret_ssm_param
      RECAPTCHA_MIN_SCORE        = tostring(var.recaptcha_min_score)
      SNS_TOPIC_ARN              = aws_sns_topic.contact.arn
      ORIGIN_SECRET              = random_password.contact_origin.result
    }
  }
}

# Public Function URL. authType NONE is acceptable because every request is
# validated against the shared-secret header inside the handler; the resource
# policy below is what actually permits unauthenticated invokes.
resource "aws_lambda_function_url" "contact" {
  function_name      = aws_lambda_function.contact.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "contact_url" {
  statement_id           = "AllowFunctionURLInvoke"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.contact.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

# Explicit log group with retention so logs don't accumulate forever.
resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/${aws_lambda_function.contact.function_name}"
  retention_in_days = 14
}
