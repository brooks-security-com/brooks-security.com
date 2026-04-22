# Import blocks for all pre-existing AWS resources.
# Run `terraform init && terraform plan` after these are in place — the goal
# is a no-op plan that confirms every resource matches the live configuration.
#
# Resources NOT in this file (created fresh by terraform apply):
#   - aws_iam_openid_connect_provider.github_actions
#   - aws_iam_role.github_deploy / aws_iam_role_policy.github_deploy
#   - aws_acm_certificate_validation.cert (synthetic; no AWS-side state)

# Route 53
import {
  to = aws_route53_zone.main
  id = "Z0929787253OYUX8XP5MU"
}

import {
  to = aws_route53_record.apex_a
  id = "Z0929787253OYUX8XP5MU_brooks-security.com_A"
}

import {
  to = aws_route53_record.apex_aaaa
  id = "Z0929787253OYUX8XP5MU_brooks-security.com_AAAA"
}

import {
  to = aws_route53_record.apex_mx
  id = "Z0929787253OYUX8XP5MU_brooks-security.com_MX"
}

import {
  to = aws_route53_record.apex_txt
  id = "Z0929787253OYUX8XP5MU_brooks-security.com_TXT"
}

import {
  to = aws_route53_record.www_a
  id = "Z0929787253OYUX8XP5MU_www.brooks-security.com_A"
}

import {
  to = aws_route53_record.www_aaaa
  id = "Z0929787253OYUX8XP5MU_www.brooks-security.com_AAAA"
}

import {
  to = aws_route53_record.dmarc
  id = "Z0929787253OYUX8XP5MU__dmarc.brooks-security.com_TXT"
}

import {
  to = aws_route53_record.acm_validation_apex_1
  id = "Z0929787253OYUX8XP5MU__781ab460a2114680546b56456a9a7106.brooks-security.com_CNAME"
}

import {
  to = aws_route53_record.acm_validation_apex_2
  id = "Z0929787253OYUX8XP5MU__a8223b3c38860c4d3d786de9ac06447a.brooks-security.com_CNAME"
}

import {
  to = aws_route53_record.acm_validation_www
  id = "Z0929787253OYUX8XP5MU__b7d5479979587ee499168ad52dd0c2e9.www.brooks-security.com_CNAME"
}

# ACM certificate
import {
  to = aws_acm_certificate.cert
  id = "arn:aws:acm:us-east-1:570516803292:certificate/debddc75-de5c-4103-9c4e-d9fe952236e2"
}

# S3 origin bucket
import {
  to = aws_s3_bucket.origin
  id = "brooks-security.com"
}

import {
  to = aws_s3_bucket_public_access_block.origin
  id = "brooks-security.com"
}

import {
  to = aws_s3_bucket_ownership_controls.origin
  id = "brooks-security.com"
}

import {
  to = aws_s3_bucket_server_side_encryption_configuration.origin
  id = "brooks-security.com"
}

import {
  to = aws_s3_bucket_website_configuration.origin
  id = "brooks-security.com"
}

import {
  to = aws_s3_bucket_policy.origin
  id = "brooks-security.com"
}

# CloudFront
import {
  to = aws_cloudfront_origin_access_control.oac
  id = "E1BP7TXJ6IVWD7"
}

import {
  to = aws_cloudfront_function.hugo
  id = "hugo"
}

import {
  to = aws_cloudfront_distribution.main
  id = "E1QZQDBCV5WT01"
}
