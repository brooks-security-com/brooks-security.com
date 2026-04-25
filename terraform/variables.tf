variable "domain" {
  type    = string
  default = "brooks-security.com"
}

variable "aws_account_id" {
  type    = string
  default = "570516803292"
}

# AWS CLI profile used by the provider. Defaults to the local dev profile so
# `terraform plan/apply` works without extra flags on Graham's laptop. CI sets
# TF_VAR_aws_profile="" so the provider falls through to the standard
# credential chain (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars).
variable "aws_profile" {
  type    = string
  default = "brooks-security"
}

# Management IP of the pve1 Proxmox node on the vmbr0 bridge. Caddy uses this
# to reverse-proxy HTTPS traffic to the Proxmox web UI on port 8006.
variable "pve1_mgmt_ip" {
  type        = string
  description = "Proxmox node bridge IP reachable from the Caddy LXC (e.g. 192.168.1.10)"
}

# Tailscale IP assigned to the Caddy LXC after Ansible installs Tailscale.
# Leave null on first deploy; once Tailscale is running on the Caddy LXC,
# set this to flip *.prod and pve1.prod DNS to route through Caddy.
variable "caddy_tailscale_ip" {
  type        = string
  description = "Tailscale IP of the Caddy LXC (set after first Ansible run)"
  default     = null
}
