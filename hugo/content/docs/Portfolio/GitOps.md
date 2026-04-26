# GitOps
## Brooks-Security.com

[![GitHub: LittleSeneca/brooks-security.com](https://img.shields.io/badge/GitHub-LittleSeneca%2Fbrooks--security.com-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/brooks-security.com)

This portfolio is managed with GitOps: content in Hugo, infrastructure in Terraform, and deployments automated through GitHub Actions running on a self-hosted runner inside a Proxmox homelab. The same repository that publishes this site also provisions the homelab containers that run its own CI/CD pipeline.

**Everything runs for about $0.50 per month in AWS.**

## Network overview

The infrastructure spans two planes: a **public AWS plane** for the website and SSO portal, and a **private homelab plane** behind Tailscale.

The homelab sits on a **dedicated network that is physically isolated from the household internet connection** - separate upstream, separate switch. Personal devices (laptops, phones) live on an entirely different network. The two never share a path. The only ingress to the homelab from anywhere outside it is through [Tailscale](https://tailscale.com), which creates an encrypted peer-to-peer mesh without requiring any open ports on the homelab's upstream router.

```mermaid
flowchart TB
    subgraph internet["Public internet"]
        browser["Browser / visitor"]
        ghactions["GitHub Actions"]
    end

    subgraph aws["AWS (us-east-1)"]
        direction TB
        r53["Route 53"]
        cf_site["CloudFront (site)"]
        s3["S3 origin bucket"]
        cf_sso["CloudFront (SSO redirect)"]
        sso_portal["IAM Identity Center"]
        ssm["SSM Parameter Store"]
        iam_oidc["IAM OIDC deploy role (master only)"]
    end

    subgraph tailscale["Tailscale mesh · 100.64.0.0/10"]
        ts_dev["Personal device (any network)"]
    end

    subgraph homelab["Homelab - dedicated network, physically isolated from home internet"]
        subgraph pve1_host["pve1 - Proxmox VE host"]
            ts_daemon["Tailscale daemon (100.64.x.x)"]
            ipt["iptables DNAT :443 → 192.168.2.201"]
            pve_api["Proxmox VE API :8006"]
        end

        subgraph vmbr0["vmbr0 bridge · 192.168.2.0/16"]
            caddy["LXC 201 - Caddy (192.168.2.201)"]
            runner["LXC 200 - GitHub runner (192.168.2.200)"]
        end
    end

    %% --- public site traffic ---
    browser -- "HTTPS" --> r53
    r53 -- "A/AAAA alias" --> cf_site
    cf_site -- "cache miss" --> s3
    s3 --> cf_site

    %% --- SSO portal redirect ---
    browser -- "aws.brooks-security.com" --> cf_sso
    cf_sso -- "HTTP 301" --> sso_portal

    %% --- Tailscale access to Proxmox UI ---
    ts_dev -- "Tailscale encrypted tunnel" --> ts_daemon
    ts_daemon --> ipt
    ipt -- "DNAT" --> caddy
    caddy -- "reverse_proxy https (skip-verify)" --> pve_api

    %% --- CI/CD ---
    ghactions -- "trigger" --> runner
    runner -- "Tailscale" --> ts_daemon
    runner -- "AssumeRoleWithWebIdentity" --> iam_oidc
    iam_oidc -- "hugo deploy" --> s3
    iam_oidc -- "CloudFront invalidation" --> cf_site
    iam_oidc -- "terraform apply" --> aws
    runner -- "fetch secrets" --> ssm
    runner -- "Ansible SSH via pct exec" --> vmbr0
```

## Public website traffic

```mermaid
flowchart LR
    U["Visitor browser"] --> R["Route 53 DNS"]
    R --> C["CloudFront distribution"]
    C -- "Cache hit" --> V["Response from edge cache"]
    C -- "Cache miss" --> S["S3 origin bucket"]
    S --> C
    C --> U
```

A CloudFront viewer-request function rewrites pretty URLs (`/posts/foo/`) to the underlying S3 key (`/posts/foo/index.html`). A separate CloudFront distribution at `aws.brooks-security.com` issues an HTTP 301 to the IAM Identity Center portal - no compute involved, just a CloudFront Function at the edge.

## Proxmox UI - `pve.brooks-security.com`

Route 53 resolves `pve.brooks-security.com` to pve1's Tailscale IP (`100.64.x.x`). Because Tailscale IPs are only routable within the mesh, this address is invisible to the public internet.

```mermaid
flowchart LR
    D["Personal device (Tailscale enrolled)"]
    D -- "DNS resolves to 100.64.x.x" --> R["Route 53"]
    R --> D
    D -- "Tailscale tunnel :443" --> P["pve1 - iptables DNAT :443 → 192.168.2.201"]
    P --> C["LXC 201 - Caddy (DNS-01 cert via Route 53)"]
    C -- "reverse_proxy https (skip-verify)" --> X["Proxmox VE UI :8006"]
```

Caddy holds a browser-trusted certificate obtained via DNS-01 ACME challenge against Route 53 - no HTTP-01 challenge needed, which means the cert works even though the container has no public IP. From any enrolled device, `https://pve.brooks-security.com` opens the Proxmox UI with no port number and no certificate warning.

## CI/CD pipeline

```mermaid
flowchart LR
    A["Write content or infra changes"] --> B["Commit to feature branch"]
    B --> C["Open PR to master"]
    C --> D["Self-hosted runner checks"]
    D --> E{"Checks pass?"}
    E -- "no" --> G["Fix and push"]
    G --> C
    E -- "yes" --> F["Squash and merge (maintainer approval)"]
    F --> H["Production workflows (approval gate)"]
    H --> I["hugo deploy to S3 + CloudFront invalidation"]
    H --> J["terraform apply - AWS infra"]
    H --> K["Ansible - Caddy + runner provisioning"]
```

All jobs run on the self-hosted runner inside LXC 200. Because that container is on the homelab network and enrolled in Tailscale, the runner can reach the Proxmox API and SSH into other containers - all without any public ingress.

## Security model

This is a **public repository** with a self-hosted runner. A malicious pull request could, without controls, execute arbitrary code on the runner. Several layers of defence address this:

| Control | Mechanism |
|---|---|
| **First-time contributor approval** | GitHub requires a maintainer to approve Actions runs on any PR from a contributor who has not previously had a PR merged |
| **OIDC role scoped to `master`** | The AWS deploy role trust policy uses `StringEquals` on `ref:refs/heads/master` - fork PRs cannot assume it |
| **Plan on PR, apply on merge** | `terraform plan` runs on PRs (read-only); `terraform apply` only runs after merge to `master` |
| **Production environment gate** | Apply and deploy jobs target the `production` GitHub environment, requiring an explicit approval before execution |
| **Secrets in SSM, not GitHub** | No long-lived credentials are stored in GitHub secrets; SSM Parameter Store is the source of truth |
| **Least-privilege IAM** | Caddy DNS-01 user, OIDC deploy role, and Proxmox API token are each scoped to the minimum permissions needed |
| **Physical network isolation** | The runner is on a network with no public ingress; the only entry point is Tailscale |

## What this costs

| Service | Monthly cost |
|---|---|
| Route 53 hosted zones (×2) | ~$1.00 |
| S3 storage + requests | ~$0.01 |
| CloudFront (low traffic) | ~$0.01 |
| ACM, SSM, IAM | $0.00 |
| **Total** | **~$0.50–1.00** |

The homelab hardware is sunk cost - Tailscale is free for personal use, and Proxmox is free (community edition).
