# GitHub Actions OIDC provider and scoped deploy role.
# These resources do NOT yet exist in AWS — they will be created on first
# `terraform apply` as part of the CD pipeline build-out (README §7).

# Fetch the current TLS certificate chain for GitHub's OIDC issuer so the
# thumbprint self-heals if GitHub rotates certs. IAM no longer enforces the
# thumbprint for token.actions.githubusercontent.com (it validates against
# built-in trusted root CAs), but the field is still required by the API.
data "tls_certificate" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    data.tls_certificate.github_actions.certificates[0].sha1_fingerprint,
  ]
}

resource "aws_iam_role" "github_deploy" {
  name = "brooks-security-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github_actions.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          # Restrict to the brooks-security.com repo, master branch only.
          # Use StringEquals (not StringLike) since the value is an exact match —
          # no wildcards, so the stricter operator is both safer and clearer.
          "token.actions.githubusercontent.com:sub" = "repo:LittleSeneca/brooks-security.com:ref:refs/heads/master"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_deploy" {
  name = "deploy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3Deploy"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.origin.arn,
          "${aws_s3_bucket.origin.arn}/*",
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations",
          "cloudfront:GetDistribution",
          "cloudfront:ListDistributions",
        ]
        Resource = aws_cloudfront_distribution.main.arn
      },
    ]
  })
}
