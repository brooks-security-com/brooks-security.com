data "aws_ssm_parameter" "proxmox_root_password" {
  name            = "/proxmox/auth/root_password"
  with_decryption = true
}

resource "proxmox_virtual_environment_container" "github_runner" {
  description  = "GitHub Actions self-hosted runner"
  node_name    = "pve1"
  vm_id        = 200
  unprivileged = true
  tags         = ["github-runner"]

  # Tailscale requires /dev/net/tun. After creation, add to /etc/pve/lxc/200.conf on pve1:
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
    dedicated = 2048
  }

  disk {
    datastore_id = "local-lvm"
    size         = 20
  }

  initialization {
    hostname = "github-runner"

    dns {
      servers = ["8.8.8.8"]
    }

    ip_config {
      ipv4 {
        address = "192.168.2.200/16"
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

output "runner_ip_address" {
  value = "192.168.2.200"
}
