# --- Tailscale device lookups ---

data "tailscale_device" "pve1" {
  hostname = "pve1"
}

locals {
  # Tailscale assigns each device one IPv4 in 100.64.0.0/10 and one IPv6.
  # Strip any CIDR suffix (provider may return "100.x.x.x/32") and keep IPv4 only.
  pve1_ipv4 = [
    for addr in data.tailscale_device.pve1.addresses :
    split("/", addr)[0]
    if can(regex("^100\\.", addr))
  ]
}

# --- prod.brooks-security.com hosted zone ---

resource "aws_route53_zone" "prod" {
  name = "prod.${var.domain}"
}

# Delegate prod.brooks-security.com from the apex zone so DNS resolves correctly.
resource "aws_route53_record" "prod_ns" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "prod.${var.domain}"
  type    = "NS"
  ttl     = 300
  records = aws_route53_zone.prod.name_servers
}

# --- Host records ---

resource "aws_route53_record" "pve1_prod" {
  zone_id = aws_route53_zone.prod.zone_id
  name    = "pve1.prod.${var.domain}"
  type    = "A"
  ttl     = 60
  records = local.pve1_ipv4
}
