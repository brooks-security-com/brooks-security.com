# Lambda@Edge — auth gate for /grc-tools/*
# Must be created in us-east-1 (Lambda@Edge requirement)

# IAM role for Lambda@Edge
data "aws_iam_policy_document" "auth_gate_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "auth_gate" {
  name               = "grc-tools-auth-gate"
  assume_role_policy = data.aws_iam_policy_document.auth_gate_assume_role.json
}

data "aws_iam_policy_document" "auth_gate" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_role_policy" "auth_gate" {
  name   = "grc-tools-auth-gate-logs"
  role   = aws_iam_role.auth_gate.id
  policy = data.aws_iam_policy_document.auth_gate.json
}

# Lambda@Edge function (us-east-1 required)
resource "aws_lambda_function" "auth_gate" {
  provider = aws.us_east_1

  function_name = "grc-tools-auth-gate"
  role          = aws_iam_role.auth_gate.arn
  handler       = "auth-gate.handler"
  runtime       = "nodejs20.x"
  timeout       = 5 # Lambda@Edge max
  memory_size   = 128

  filename         = data.archive_file.auth_gate.output_path
  source_code_hash = data.archive_file.auth_gate.output_base64sha256

  publish = true # Required for Lambda@Edge — creates a version
}

# Zip the function code
data "archive_file" "auth_gate" {
  type        = "zip"
  output_path = "${path.module}/.terraform/tmp/auth-gate.zip"

  source {
    content  = templatefile("${path.module}/files/auth-gate.js", {
      COGNITO_DOMAIN = aws_cognito_user_pool_domain.grc_tools.domain
      CLIENT_ID      = aws_cognito_user_pool_client.grc_tools.id
      REDIRECT_URI   = "https://${var.domain}/grc-tools/"
      USER_POOL_ID   = aws_cognito_user_pool.grc_tools.id
    })
    filename = "auth-gate.js"
  }
}
