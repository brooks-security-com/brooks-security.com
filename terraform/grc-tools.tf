# =============================================================================
# grc-tools policy builder — phase 1 infrastructure
#
# Resources that can be created BEFORE the Docker image is pushed to ECR.
# Apply this first, then docker build/push, then apply grc-tools-lambda.tf.
#
# Phase 1: ECR, DynamoDB, IAM, CloudWatch
# Phase 2: Lambda + API Gateway (grc-tools-lambda.tf — needs image in ECR)
# =============================================================================

locals {
  grc_tags = {
    Project = "grc-tools"
  }
}

# --- ECR repository for Lambda container image -------------------------------

resource "aws_ecr_repository" "grc_tools" {
  name = "grc-tools"
  tags = local.grc_tags

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
  tags         = local.grc_tags

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
  tags         = local.grc_tags

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
  tags               = local.grc_tags
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
