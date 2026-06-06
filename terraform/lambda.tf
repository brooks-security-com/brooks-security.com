# Nightly GitHub contribution-heatmap refresh.
#
# Flow: EventBridge rule (cron) -> Lambda -> POST workflow_dispatch on
# hugo-deploy.yml -> Hugo build re-bakes hugo/data/contributions.json from the
# GitHub GraphQL API -> S3 + CloudFront. No new always-on infra: a single
# Lambda invocation per day, which is effectively free.
#
# An external trigger (rather than a GitHub Actions `schedule:` cron) is
# deliberate: GitHub auto-disables scheduled workflows after 60 days of repo
# inactivity, which a personal blog can easily hit. EventBridge does not.
#
# The GitHub PAT is read from a pre-existing SSM SecureString (var.github_token_ssm_param,
# default /github/admin_token) that lives outside this Terraform. We reference
# it by a constructed ARN rather than a data source so its secret value is
# never pulled into Terraform state.

# --- Lambda execution role --------------------------------------------------
data "aws_iam_policy_document" "contrib_lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "contrib_lambda" {
  name               = "brooks-security-contrib-dispatch"
  assume_role_policy = data.aws_iam_policy_document.contrib_lambda_assume.json
}

resource "aws_iam_role_policy" "contrib_lambda" {
  name = "contrib-dispatch"
  role = aws_iam_role.contrib_lambda.id

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
        Sid      = "ReadToken"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.github_token_ssm_param}"
      },
      {
        # Decrypt the SecureString. Scoped to SSM-mediated calls so this never
        # grants broad KMS access even though it targets the AWS-managed key.
        Sid      = "DecryptToken"
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

# --- Lambda function --------------------------------------------------------
data "archive_file" "contrib_dispatch" {
  type        = "zip"
  source_file = "${path.module}/files/contrib-dispatch/index.py"
  output_path = "${path.module}/files/contrib-dispatch.zip"
}

resource "aws_lambda_function" "contrib_dispatch" {
  function_name = "brooks-security-contrib-dispatch"
  description   = "Nightly: trigger the Hugo deploy workflow to re-bake the GitHub contribution heatmap."
  role          = aws_iam_role.contrib_lambda.arn
  runtime       = "python3.12"
  handler       = "index.handler"
  timeout       = 30

  filename         = data.archive_file.contrib_dispatch.output_path
  source_code_hash = data.archive_file.contrib_dispatch.output_base64sha256

  environment {
    variables = {
      SSM_PARAM     = var.github_token_ssm_param
      REPO_OWNER    = var.github_owner
      REPO_NAME     = var.github_repo
      WORKFLOW_FILE = var.github_workflow_file
      REF           = "main"
    }
  }
}

# Explicit log group with retention so logs don't accumulate forever.
resource "aws_cloudwatch_log_group" "contrib_dispatch" {
  name              = "/aws/lambda/${aws_lambda_function.contrib_dispatch.function_name}"
  retention_in_days = 14
}

# --- Nightly schedule -------------------------------------------------------
resource "aws_cloudwatch_event_rule" "contrib_nightly" {
  name                = "brooks-security-contrib-nightly"
  description         = "Nightly trigger to re-bake the GitHub contribution heatmap."
  schedule_expression = var.contrib_schedule
}

resource "aws_cloudwatch_event_target" "contrib_nightly" {
  rule      = aws_cloudwatch_event_rule.contrib_nightly.name
  target_id = "contrib-dispatch-lambda"
  arn       = aws_lambda_function.contrib_dispatch.arn
}

resource "aws_lambda_permission" "contrib_nightly" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contrib_dispatch.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.contrib_nightly.arn
}
