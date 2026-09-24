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
          # Restrict to the brooks-security.com repo, main branch only.
          # Use StringEquals (not StringLike) since the value is an exact match —
          # no wildcards, so the stricter operator is both safer and clearer.
          #
          # This previously said `refs/heads/master`. The repo's default branch is
          # `main`, and there is no `master`, so the condition never matched and
          # the role could not be assumed by anything. Neither workflow used it
          # either — both authenticated with static keys — which is why the
          # breakage went unnoticed.
          #
          # Consequence of the exact match: a pull_request run has
          # `refs/pull/N/merge` and therefore cannot assume this role. That is
          # intended. The PR-time steps that read SSM are fail-soft by design, so
          # PR builds still pass without it; only push-to-main and
          # workflow_dispatch assume the role.
          "token.actions.githubusercontent.com:sub" = "repo:LittleSeneca/brooks-security.com:ref:refs/heads/main"
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
      {
        # The Hugo build job reads the public reCAPTCHA site key from SSM and
        # bakes it into the contact form.
        Sid      = "ReadRecaptchaSiteKey"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_site_key_ssm_param}"
      },
      {
        # The same job reads a GitHub PAT to re-bake the contribution heatmap
        # (hugo-deploy.yml, GH_CONTRIB_SSM_PARAM). Previously ungranted: the
        # step is fail-soft, so it silently kept the committed JSON rather than
        # failing. Now that the workflow assumes this role, grant it properly.
        Sid      = "ReadGithubContribToken"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = "arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.github_token_ssm_param}"
      },
      {
        # Covers decryption of any SSM parameter read above; the condition keeps
        # it to the SSM path rather than blanket kms:Decrypt.
        Sid      = "DecryptSsmParameters"
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

# Caddy DNS-01 ACME identity (caddy-dns/route53 plugin on devbox). Lets
# Encrypt validates hermes.brooks-security.com via TXT challenge records that
# Caddy creates and removes in this zone. The access key is generated
# out-of-band after apply (aws iam create-access-key) and stored only in
# devbox's Caddy credentials file — never in Terraform state.
resource "aws_iam_user" "caddy_dns" {
  name = "caddy-dns"
}

resource "aws_iam_user_policy" "caddy_dns" {
  name = "route53-acme"
  user = aws_iam_user.caddy_dns.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # ListHostedZonesByName is a global list API — cannot be
        # resource-scoped. caddy-dns/route53 discovers the zone by name.
        Sid      = "FindZone"
        Effect   = "Allow"
        Action   = ["route53:ListHostedZonesByName"]
        Resource = "*"
      },
      {
        Sid    = "ManageChallengeRecords"
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ChangeResourceRecordSets",
          "route53:ListResourceRecordSets",
        ]
        Resource = "arn:aws:route53:::hostedzone/${aws_route53_zone.main.zone_id}"
      },
      {
        Sid      = "PollChangeStatus"
        Effect   = "Allow"
        Action   = ["route53:GetChange"]
        Resource = "arn:aws:route53:::change/*"
      },
    ]
  })
}
