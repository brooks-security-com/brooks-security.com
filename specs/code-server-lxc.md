# Spec: code-server LXC (LXC 202)

**Branch:** `littleseneca/code-server`
**Subdomain:** `code.brooks-security.com`
**Status:** In design

---

## Overview

Add a third Proxmox LXC (VM ID 202) that runs [code-server](https://github.com/coder/code-server) — a browser-based VS Code server. The instance is:

- Accessible only via Tailscale (DNS resolves to pve1's Tailscale IP, same pattern as `pve.brooks-security.com`)
- TLS-terminated by Caddy (LXC 201), routed over the private LAN bridge
- Password-protected via code-server's built-in auth; password sourced from AWS SSM Parameter Store
- Tailscale-enabled inside the container for outbound connectivity to other homelab resources
- Pre-provisioned with git

---

## Architecture

```
User (Tailscale client)
  │
  ▼ HTTPS :443
Route53: code.brooks-security.com → pve1 Tailscale IP (100.64.x.x)
  │
  ▼ iptables DNAT (already in place on pve1)
Caddy LXC 201 (192.168.2.201:443)
  │  TLS termination via DNS-01 ACME (existing caddy-dns01 IAM user)
  ▼ HTTP :8080 over LAN bridge
code-server LXC 202 (192.168.2.202:8080)
  │
  └─ code-server process (VS Code in browser)
       auth: password from SSM /code-server/auth/password
```

Tailscale also runs inside LXC 202 (same TUN device pattern as LXC 200) so the dev environment can reach other homelab services directly via Tailscale mesh.

---

## Components & Changes

### 1. Terraform — new file `terraform/code-server.tf`

New Proxmox LXC resource:

| Field | Value |
|---|---|
| VM ID | 202 |
| Hostname | `code-server` |
| CPU | 2 cores |
| RAM | 4096 MB |
| Disk | 20 GB (`local-lvm`) |
| OS | Ubuntu 24.04 standard (same template as LXC 200/201) |
| IP | `192.168.2.202/16` |
| Gateway | `192.168.0.1` |
| DNS | `8.8.8.8` |
| Bridge | `vmbr0` |
| Privileged | `false` (unprivileged) |
| Root password | `data.aws_ssm_parameter.proxmox_root_password.value` (existing param) |
| `prevent_destroy` | `true` (same reasoning as LXC 200: manual TUN config done post-create) |

Post-create manual step on `pve1` (same as LXC 200):
```
# /etc/pve/lxc/202.conf
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```
Then restart the container. `prevent_destroy` guards against Terraform re-creation wiping this.

### 2. Terraform — Route53 A record in `terraform/route53.tf`

Add a new A record in `aws_route53_zone.main` (the apex zone):

```hcl
resource "aws_route53_record" "code" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "code.${var.domain}"
  type    = "A"
  ttl     = 60
  records = local.pve1_ipv4
}
```

Same target as `pve.brooks-security.com` — resolves to pve1's Tailscale IP, so the subdomain is only reachable via Tailscale.

### 3. Ansible — new playbook `ansible/playbooks/code-server.yml`

Provisions the LXC after Terraform creates it. Tasks:

1. **Base packages** — `curl`, `ca-certificates`, `git`, `wget`
2. **Install code-server** — via the official install script (`code-server.dev/install.sh`); pinned to a specific version for reproducibility
3. **Fetch password from SSM** — AWS CLI call to `aws ssm get-parameter --name /code-server/auth/password --with-decryption`
4. **Write config** — `/etc/code-server/config.yaml`:
   ```yaml
   bind-addr: 0.0.0.0:8080
   auth: password
   password: "<value from SSM>"
   cert: false   # Caddy handles TLS upstream
   ```
5. **Install Tailscale** — using the official apt repository
6. **Enable & start services** — `code-server` and `tailscaled` as systemd units

The playbook runs as part of the `ansible-setup-code-server` job in the CI pipeline (added to `infrastructure.yml`).

**Inventory addition (`ansible/inventory.yml`):**
```yaml
code-server:
  hosts:
    code-server:
      ansible_host: 192.168.2.202
```

### 4. Ansible — Caddyfile update `ansible/templates/Caddyfile.j2`

Add a new vhost block to route `code.brooks-security.com` to LXC 202:

```
code.brooks-security.com {
  tls {
    dns route53 {
      region us-east-1
    }
  }
  reverse_proxy http://192.168.2.202:8080
}
```

TLS is handled by the existing `caddy-dns01` IAM user via Route53 DNS-01 challenge — no additional IAM changes needed.

### 5. SSM Parameter Store — new parameters

These are created manually before the first `terraform apply` / Ansible run:

| Path | Type | Purpose |
|---|---|---|
| `/code-server/auth/password` | `SecureString` | code-server web UI password; read by Ansible at provisioning time |

The Proxmox root password (`/proxmox/auth/root_password`) is already in Parameter Store and reused for the LXC OS login.

### 6. CI Pipeline — `infrastructure.yml` additions

Add a new job after `ansible-setup-caddy`:

```yaml
ansible-setup-code-server:
  needs: [terraform-apply, ansible-setup-caddy]
  steps:
    - tailscale-connect
    - ansible-playbook ansible/playbooks/code-server.yml
      -i ansible/inventory.yml
      --extra-vars "..."
```

The Caddy reload (triggered by the Caddyfile change) must complete before testing code-server is accessible, so it depends on `ansible-setup-caddy`.

---

## Security Notes

| Concern | Mitigation |
|---|---|
| Public exposure | DNS resolves to pve1 Tailscale IP — unreachable without Tailscale |
| Transport security | Caddy terminates TLS with a valid certificate via DNS-01 ACME |
| Web UI auth | code-server built-in password auth; password stored only in SSM SecureString |
| Credential hygiene | Password never written to disk in plaintext by CI; Ansible `no_log: true` on SSM fetch task |
| Container isolation | Unprivileged LXC; no host filesystem access |
| Tailscale inside container | TUN device bind-mounted as on LXC 200; `prevent_destroy` prevents re-creation wiping manual config |

---

## Implementation Sequence

1. **Manual pre-step** — create `/code-server/auth/password` SecureString in AWS SSM
2. **Terraform** — add `terraform/code-server.tf` and the Route53 record in `route53.tf`
3. **Manual post-step on pve1** — add TUN device lines to `/etc/pve/lxc/202.conf`, restart container
4. **Ansible** — add `code-server.yml` playbook, update `inventory.yml`
5. **Caddyfile** — add `code.brooks-security.com` vhost, trigger Caddy reload
6. **CI** — add `ansible-setup-code-server` job to `infrastructure.yml`
7. **Verify** — connect via Tailscale, navigate to `https://code.brooks-security.com`, confirm code-server loads and password auth works

---

## Decisions

- **Tailscale tag** — `tag:code-server` added to `tailscale.tf` tagOwners. Terraform creates a `tailscale_tailnet_key` resource (reusable, 90-day expiry, pre-authorized) and stores the key in SSM at `/code-server/tailscale/auth_key`. The Ansible playbook runs `tailscale up --authkey=<key> --advertise-tags=tag:code-server`. To rotate the key: `terraform taint tailscale_tailnet_key.code_server && terraform apply`.
- **Persistent workspace** — Bind-mounted from pve1 at `/var/lib/pve/code-server/workspace` → `/home/coder/workspace` inside the container, configured via the `mount_point` block in `terraform/code-server.tf`. Pre-step: `mkdir -p /var/lib/pve/code-server/workspace` on pve1 before first apply.
- **Tailscale auth during Ansible run** — The provisioning playbook needs the container to have network access. The Tailscale install step happens inside the container; the SSM fetch uses the runner's existing AWS credentials, not the container's.
