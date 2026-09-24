# Deploy identity for the AIGP study app repo (github.com/LittleSeneca/aigp-study).
#
# The app is a static file set in a *different* repo from this one, so it needs its
# own write path into the bucket that aigp.tf created. This role is that path: the
# app repo's workflow assumes it over OIDC and runs `aws s3 sync`. No static keys.
#
# Deliberately NOT reusing brooks-security-github-deploy. That role's trust policy is
# pinned to `repo:LittleSeneca/brooks-security.com:ref:refs/heads/master` — a branch
# that does not exist (this repo's default is `main`), so the role cannot be assumed
# by anything. It is also scoped to the main site bucket only. Fixing it is a
# separate concern; this role is correct from the start.

resource "aws_iam_role" "aigp_deploy" {
  name = "aigp-study-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github_actions.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          # Exact match on the app repo's default branch. No wildcard: a push to
          # `main` in that one repo is the only thing that can assume this role.
          "token.actions.githubusercontent.com:sub" = "repo:LittleSeneca/aigp-study:ref:refs/heads/main"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "aigp_deploy" {
  name = "deploy"
  role = aws_iam_role.aigp_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # `aws s3 sync` needs ListBucket to build its inventory and to read the
        # ETags it compares against. Without it, sync silently re-uploads
        # everything, every run.
        Sid      = "ListAppBucket"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.aigp.arn
      },
      {
        # PutObject for the upload; DeleteObject for `sync --delete`, which is
        # what removes files that a bank update retires. Scoped to this bucket's
        # objects only — no other bucket in the account is reachable.
        Sid      = "WriteAppObjects"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.aigp.arn}/*"
      },
      {
        # Not needed on the happy path: the deploy sets per-object Cache-Control,
        # so CloudFront revalidates on its own and no purge is ever required.
        # Granted anyway, scoped to this distribution, as the escape hatch for a
        # bad cache header — otherwise a wrong Cache-Control needs a human with
        # console access to recover.
        Sid      = "InvalidateOnDemand"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
        Resource = aws_cloudfront_distribution.aigp.arn
      },
    ]
  })
}

output "aigp_deploy_role_arn" {
  value       = aws_iam_role.aigp_deploy.arn
  description = "Role for the aigp-study repo's deploy workflow to assume via OIDC."
}
