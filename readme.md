# brooks-security.com

Personal portfolio site built with [Hugo](https://gohugo.io), hosted as a static site on AWS (S3 + CloudFront + Route 53), and managed with Terraform. Infrastructure automation also provisions and configures a homelab running on Proxmox. Total AWS cost is about $1.05 per month.

## Stack at a glance

| Layer | Technology |
|---|---|
| Content | Hugo (`hugo/`) with the `hugo-book` theme (git submodule) |
| Infra as code | Terraform (`terraform/`) |
| Hosting | S3 origin bucket behind CloudFront |
| DNS | Route 53 (`brooks-security.com`, `www`, `pve`, `aws`, `*.prod`) |
| Secrets | AWS SSM Parameter Store |
| Homelab | Proxmox VE (`pve1`) with LXC containers for Caddy and GitHub Actions |
| Private network | Tailscale mesh - the only ingress path to the homelab |
| CI/CD | GitHub Actions on a self-hosted runner inside a Proxmox LXC |

## Repository layout

```text
.
├── .github/
│   ├── actions/tailscale-connect/   # reusable Tailscale OAuth action
│   └── workflows/                   # terraform + hugo pipelines
├── ansible/
│   ├── playbooks/                   # github-runner.yml, caddy.yml
│   └── templates/                   # Caddyfile.j2, caddy-aws.env.j2
├── hugo/                            # site content, config, theme submodule
├── terraform/                       # all infrastructure code
└── README.md
```

## Homelab network architecture

The homelab runs on a **dedicated network that is physically isolated from the household internet connection**. The Proxmox host (`pve1`) lives on this separate network; personal devices (laptops, phones) live on an entirely different upstream. The two networks do not share a switch or router.

The only way into the homelab from outside is through [Tailscale](https://tailscale.com), which creates an encrypted peer-to-peer mesh between enrolled devices without requiring any open ports on the homelab's upstream router. `pve1` is the Tailscale anchor point for the homelab - it receives all inbound traffic and routes it into the internal bridge (`vmbr0`, `192.168.2.0/16`) where the LXC containers live.

```
Personal device (any network)
  │  Tailscale mesh (100.64.0.0/10)
  └─────────────────────────────► pve1 Tailscale IP
                                     │
                                     ├── iptables DNAT :443 → 192.168.2.201
                                     │
                              vmbr0 bridge (192.168.2.0/16)
                                     │
                              ┌──────┴──────┐
                        LXC 201            LXC 200
                        Caddy              GitHub runner
                        192.168.2.201      192.168.2.200
```

### Proxmox UI - `pve.brooks-security.com`

Route 53 resolves `pve.brooks-security.com` to pve1's Tailscale IP. That address is only routable within the Tailscale mesh - the public internet cannot reach it.

When a Tailscale-enrolled device requests `https://pve.brooks-security.com`:

1. Route 53 returns pve1's Tailscale IP (`100.64.x.x`).
2. Traffic travels over the encrypted Tailscale tunnel to pve1 on port 443.
3. iptables DNAT on pve1 forwards port 443 to the Caddy container at `192.168.2.201:443`.
4. Caddy holds a valid TLS certificate obtained via DNS-01 ACME challenge against Route 53, so the browser sees a trusted cert with no port number in the URL.
5. Caddy reverse-proxies the request to the Proxmox API at `https://<pve1-mgmt-ip>:8006`, skipping verification of the self-signed Proxmox cert.

The net effect: from any device enrolled in Tailscale, `https://pve.brooks-security.com` opens the Proxmox UI with a browser-trusted certificate on standard HTTPS.

### Caddy setup

Caddy runs in LXC 201 (`192.168.2.201`) and is built from source using `xcaddy` with the `caddy-dns/route53` plugin baked in. This enables DNS-01 ACME challenges for domains that Caddy cannot serve directly (wildcard certs, private IP addresses).

Caddy's AWS credentials (scoped to only the Route 53 changes needed for ACME) are injected as environment variables via a systemd `EnvironmentFile`. The `Caddyfile` is rendered from an Ansible template and currently handles:

- `pve.brooks-security.com` - reverse proxy to Proxmox UI (TLS skip verify on backend)
- `*.prod.brooks-security.com` - wildcard cert pre-provisioned for future internal services

Ansible provisions Caddy automatically as part of the CI/CD pipeline after every `terraform apply`.

## Self-hosted GitHub Actions runner

All CI/CD jobs run on a self-hosted runner inside Proxmox LXC 200 (`192.168.2.200`). Because the runner lives on the homelab network and connects to Tailscale at startup, Terraform jobs can reach the Proxmox API and Ansible can SSH to other containers - none of this is exposed to the public internet.

**Automatic provisioning**

Terraform creates container 200. After each `terraform apply`, the infrastructure workflow:

1. Generates a short-lived GitHub runner registration token via the GitHub API.
2. SSH-bootstraps LXC 200 via `pct exec` on pve1 (no public IP required).
3. Runs the `github-runner.yml` Ansible playbook, which installs Node.js 20, AWS CLI v2, GitHub CLI, Ansible, and all other dependencies, then registers and starts the runner as a systemd service with labels `[self-hosted, Linux, X64, proxmox]`.

**One-time manual step**

After the container is first created, add the following lines to `/etc/pve/lxc/200.conf` on pve1 (required to pass `/dev/net/tun` into the container so Tailscale can run inside the LXC):

```
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

Then restart container 200.

**Security model for a public repo with a self-hosted runner**

A self-hosted runner on a public repository is a potential attack surface: a pull request from an external contributor could execute arbitrary code on the runner if not controlled. Several layers of defence are in place:

| Control | What it does |
|---|---|
| **First-time contributor approval** | GitHub Actions requires a maintainer to approve workflows before they run on any PR from a contributor who has not previously had a PR merged |
| **OIDC deploy role scoped to `main`** | The AWS role used for deployments uses `StringEquals` on `ref:refs/heads/main` - PRs from forks cannot assume the role even if the workflow runs |
| **Plan on PR, apply on merge** | `terraform plan` runs on PRs (read-only); `terraform apply` only runs after a PR is merged to `main` |
| **Production environment gate** | The apply and deploy jobs target the `production` GitHub environment, requiring an explicit approval click before they execute |
| **No long-lived secrets in GitHub** | All sensitive values live in AWS SSM Parameter Store; only short-lived OIDC tokens and scoped IAM credentials are used |
| **Least-privilege IAM** | The Caddy DNS-01 user, OIDC deploy role, and Proxmox API token are each scoped to the minimum set of permissions they need |
| **Physical network isolation** | The runner container is on a network that is not reachable from the public internet; the only ingress is Tailscale |

## Day-to-day workflow

1. Create a feature branch from `main`.
2. Make changes in `hugo/` (content) and/or `terraform/` (infra).
3. Open a PR to `main`.
4. Wait for checks:
   - Terraform: fmt → validate → plan (when terraform files changed)
   - Hugo: build (when hugo files changed)
5. Squash and merge.
6. Merge triggers production deploy:
   - `terraform apply` for infra changes
   - Ansible to re-provision Caddy and the runner if needed
   - `hugo deploy` + CloudFront invalidation for content changes

## Terraform quick start

```bash
cd terraform
terraform init -reconfigure -backend-config=profile=brooks-security
terraform fmt -recursive
terraform validate
terraform plan
```

Notes:
- Backend state: S3 bucket `brooks-security-tfstate`
- State lock: DynamoDB table `brooks-security-tfstate-lock`
- Local AWS profile default: `brooks-security`
- In CI, `TF_VAR_aws_profile=""` causes the provider to fall through to `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars

## Hugo deploy behaviour

`hugo deploy` syncs `hugo/public/` to `s3://brooks-security.com` and invalidates CloudFront distribution `E1QZQDBCV5WT01`.

CloudFront uses a viewer-request function (`hugo`) to map pretty URLs like `/posts/foo/` to `/posts/foo/index.html`.

## Local development

```bash
# first clone
git clone --recurse-submodules git@github.com:LittleSeneca/brooks-security.com.git
cd brooks-security.com

# if already cloned without submodules
git submodule update --init --recursive

# run site locally
cd hugo
hugo server -D
```

## Operational notes

- Do not push directly to `main`; use PRs.
- Prefer CI/CD for deploys over local `terraform apply`.
- Keep the `hugo-book` submodule initialized in local and CI environments.
- The runner container has `lifecycle { prevent_destroy = true }` - destroying it requires a manual `terraform state rm` to avoid losing the registered runner.
- IAM Identity Center must be enabled manually in the AWS console before `terraform apply` can manage SSO resources (`Settings → Enable` in the IAM Identity Center console).
