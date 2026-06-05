output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.origin.id
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.cert.arn
}

output "route53_zone_id" {
  value = aws_route53_zone.main.zone_id
}
