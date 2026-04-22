resource "aws_acm_certificate" "cert" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Synthetic resource — no AWS API backing, just waits for ISSUED status.
# The three validation CNAMEs already exist in Route 53 and the cert is ISSUED.
resource "aws_acm_certificate_validation" "cert" {
  certificate_arn = aws_acm_certificate.cert.arn
  validation_record_fqdns = [
    aws_route53_record.acm_validation_apex_1.fqdn,
    aws_route53_record.acm_validation_apex_2.fqdn,
    aws_route53_record.acm_validation_www.fqdn,
  ]
}
