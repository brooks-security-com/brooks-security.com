resource "proxmox_virtual_environment_container" "code_server" {
  description  = "code-server (VS Code in browser)"
  node_name    = "pve1"
  vm_id        = 202
  unprivileged = true
  tags         = ["code-server"]

  # Tailscale requires /dev/net/tun. After creation, add to /etc/pve/lxc/202.conf on pve1:
  #   lxc.cgroup2.devices.allow: c 10:200 rwm
  #   lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
  # Then restart the container. prevent_destroy guards against re-creation wiping these.
  lifecycle {
    prevent_destroy = true
  }

  cpu {
    cores = 2
  }

  memory {
    dedicated = 4096
  }

  disk {
    datastore_id = "local-lvm"
    size         = 20
  }

  # Bind-mount the workspace from pve1 for persistence and easy snapshotting.
  # Pre-step: run `mkdir -p /var/lib/pve/code-server/workspace` on pve1 before first apply.
  mount_point {
    path   = "/home/coder/workspace"
    volume = "/var/lib/pve/code-server/workspace"
  }

  initialization {
    hostname = "code-server"

    dns {
      servers = ["8.8.8.8"]
    }

    ip_config {
      ipv4 {
        address = "192.168.2.202/16"
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

# Auth key for LXC 202 to join the tailnet with tag:code-server.
# expiry is 90 days; once the container is in the tailnet the key is not needed
# for ongoing connectivity — only for re-provisioning. Rotate with:
#   terraform taint tailscale_tailnet_key.code_server && terraform apply
resource "tailscale_tailnet_key" "code_server" {
  reusable      = true
  ephemeral     = false
  preauthorized = true
  expiry        = 7776000 # 90 days in seconds
  description   = "LXC 202 code-server"
  tags          = ["tag:code-server"]

  lifecycle {
    ignore_changes = [expiry]
  }
}

resource "aws_ssm_parameter" "code_server_tailscale_auth_key" {
  name  = "/code-server/tailscale/auth_key"
  type  = "SecureString"
  value = tailscale_tailnet_key.code_server.key
}

output "code_server_ip_address" {
  value = "192.168.2.202"
}
