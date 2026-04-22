resource "aws_route53_zone" "main" {
  name    = var.domain
  comment = "HostedZone created by Route53 Registrar"
}

# Apex A + AAAA → CloudFront alias
resource "aws_route53_record" "apex_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# www A + AAAA → CloudFront alias
resource "aws_route53_record" "www_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain}"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# ACM DNS validation CNAMEs — must be preserved for automatic cert renewal
resource "aws_route53_record" "acm_validation_apex_1" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_781ab460a2114680546b56456a9a7106.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = ["_7f56e3e23528fa5778927669315d883b.jsxlrrpjwm.acm-validations.aws."]
}

resource "aws_route53_record" "acm_validation_apex_2" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_a8223b3c38860c4d3d786de9ac06447a.${var.domain}"
  type    = "CNAME"
  ttl     = 500
  records = ["_a40d05521de06272d5f47ad68480c054.npyrrzfbbp.acm-validations.aws."]
}

resource "aws_route53_record" "acm_validation_www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_b7d5479979587ee499168ad52dd0c2e9.www.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = ["_2cfd969320fde17b0e672fbda3336bf9.mhbtsbpdnt.acm-validations.aws."]
}
