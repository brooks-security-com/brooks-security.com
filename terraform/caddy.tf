resource "proxmox_virtual_environment_container" "caddy" {
  description  = "Caddy reverse proxy"
  node_name    = "pve1"
  vm_id        = 201
  unprivileged = true
  tags         = ["caddy"]

  cpu {
    cores = 1
  }

  memory {
    dedicated = 1024
  }

  disk {
    datastore_id = "local-lvm"
    size         = 8
  }

  initialization {
    hostname = "caddy"

    dns {
      servers = ["8.8.8.8"]
    }

    ip_config {
      ipv4 {
        address = "192.168.2.201/16"
        gateway = "192.168.0.1"
      }
    }

    user_account {
      password = data.aws_ssm_parameter.proxmox_root_password.value
    }
  }

  network_interface {
    name   = "eth0"
    bridge = "vmbr0"
  }

  operating_system {
    template_file_id = "local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
    type             = "ubuntu"
  }

  started = true
}

# IAM user for Caddy DNS-01 ACME challenge via Route 53.
# Scoped to only the prod.brooks-security.com hosted zone.
resource "aws_iam_user" "caddy_dns01" {
  name = "caddy-dns01"
}

resource "aws_iam_user_policy" "caddy_dns01" {
  name = "caddy-route53-dns01"
  user = aws_iam_user.caddy_dns01.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EditProdZone"
        Effect = "Allow"
        Action = [
          "route53:GetChange",
          "route53:ChangeResourceRecordSets",
          "route53:ListResourceRecordSets",
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/${aws_route53_zone.prod.zone_id}",
          "arn:aws:route53:::change/*",
        ]
      },
      {
        Sid      = "ListZones"
        Effect   = "Allow"
        Action   = ["route53:ListHostedZonesByName"]
        Resource = ["*"]
      },
    ]
  })
}

resource "aws_iam_access_key" "caddy_dns01" {
  user = aws_iam_user.caddy_dns01.name
}

resource "aws_ssm_parameter" "caddy_aws_access_key_id" {
  name  = "/caddy/aws/access_key_id"
  type  = "SecureString"
  value = aws_iam_access_key.caddy_dns01.id
}

resource "aws_ssm_parameter" "caddy_aws_secret_access_key" {
  name  = "/caddy/aws/secret_access_key"
  type  = "SecureString"
  value = aws_iam_access_key.caddy_dns01.secret
}

output "caddy_ip_address" {
  value = "192.168.2.201"
}
