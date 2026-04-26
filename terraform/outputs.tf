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

output "pve1_tailscale_ip" {
  value       = local.pve1_ipv4[0]
  description = "pve1 Tailscale IPv4 — use this for SSH after DNS flips to Caddy"
}

output "pve1_mgmt_ip" {
  value       = data.aws_ssm_parameter.pve1_mgmt_ip.value
  description = "pve1 bridge management IP used by Caddy to proxy to Proxmox UI"
  sensitive   = true
}
