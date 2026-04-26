# Enable AWS IAM Identity Center (singleton per account).
# If it already exists, import it:
#   terraform import aws_ssoadmin_instance.main arn:aws:sso:::instance/<id>
resource "aws_ssoadmin_instance" "main" {
  name = "brooks-security"
}

locals {
  # Default subdomain is the identity_store_id (e.g. d-9067644baf).
  # Set var.sso_portal_subdomain if you customise the portal URL in the console.
  sso_portal_url = "https://${coalesce(var.sso_portal_subdomain, aws_ssoadmin_instance.main.identity_store_id)}.awsapps.com/start"
}

# --- ACM certificate for aws.brooks-security.com ---
# CloudFront requires certs in us-east-1 — already our default region.

resource "aws_acm_certificate" "aws_subdomain" {
  domain_name       = "aws.${var.domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "aws_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.aws_subdomain.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "aws_subdomain" {
  certificate_arn         = aws_acm_certificate.aws_subdomain.arn
  validation_record_fqdns = [for record in aws_route53_record.aws_acm_validation : record.fqdn]
}

# --- CloudFront Function: 301 redirect to IAM Identity Center portal ---

resource "aws_cloudfront_function" "sso_redirect" {
  name    = "sso-redirect"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      return {
        statusCode: 301,
        statusDescription: "Moved Permanently",
        headers: {
          location: { value: "${local.sso_portal_url}" }
        }
      };
    }
  EOT
}

# --- CloudFront distribution: aws.brooks-security.com → SSO portal ---
# All requests are intercepted by the function; the origin is never contacted.

resource "aws_cloudfront_distribution" "sso" {
  enabled         = true
  comment         = "SSO portal redirect"
  aliases         = ["aws.${var.domain}"]
  http_version    = "http2and3"
  is_ipv6_enabled = true

  origin {
    domain_name = "aws.amazon.com"
    origin_id   = "dummy"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "dummy"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.sso_redirect.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.aws_subdomain.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# --- IAM Identity Center user, permission set, and account assignment ---

resource "aws_identitystore_user" "graham" {
  identity_store_id = aws_ssoadmin_instance.main.identity_store_id

  display_name = "Graham Brooks"
  user_name    = "a.younger.cato@gmail.com"

  name {
    given_name  = "Graham"
    family_name = "Brooks"
  }

  emails {
    value   = "a.younger.cato@gmail.com"
    primary = true
  }
}

resource "aws_ssoadmin_permission_set" "administrator" {
  name             = "AdministratorAccess"
  instance_arn     = aws_ssoadmin_instance.main.arn
  session_duration = "PT8H"
}

resource "aws_ssoadmin_managed_policy_attachment" "administrator" {
  instance_arn       = aws_ssoadmin_instance.main.arn
  permission_set_arn = aws_ssoadmin_permission_set.administrator.arn
  managed_policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_ssoadmin_account_assignment" "graham_admin" {
  instance_arn       = aws_ssoadmin_instance.main.arn
  permission_set_arn = aws_ssoadmin_permission_set.administrator.arn
  principal_id       = aws_identitystore_user.graham.user_id
  principal_type     = "USER"
  target_id          = var.aws_account_id
  target_type        = "AWS_ACCOUNT"
}

# --- Route53: aws.brooks-security.com → CloudFront ---

resource "aws_route53_record" "aws_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "aws.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.sso.domain_name
    zone_id                = aws_cloudfront_distribution.sso.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "aws_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "aws.${var.domain}"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.sso.domain_name
    zone_id                = aws_cloudfront_distribution.sso.hosted_zone_id
    evaluate_target_health = false
  }
}
