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

    ip_config {
      ipv4 {
        address = "192.168.2.200/16"
        gateway = "192.168.1.1"
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
