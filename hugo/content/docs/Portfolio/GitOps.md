# GitOps
## Brooks-Security.com

[![GitHub: LittleSeneca/brooks-security.com](https://img.shields.io/badge/GitHub-LittleSeneca%2Fbrooks--security.com-181717?logo=github&logoColor=white)](https://github.com/LittleSeneca/brooks-security.com)

This portfolio is managed with GitOps: content in Hugo, infrastructure in Terraform, and deployments automated through GitHub Actions. The repository `readme.md` describes the stack as Hugo + AWS (S3, CloudFront, Route 53) with Terraform managing infrastructure changes.

The key point: **everything runs for about $0.50 per month in AWS**.

## What the repo actually does

- Builds static content from `hugo/`
- Provisions and manages AWS resources from `terraform/`
- Runs checks on pull requests (Hugo build + Terraform validation/plan)
- Deploys on merge to `master` (`hugo deploy`, Terraform apply when infra changes, CloudFront invalidation)

## Traffic graph

```mermaid
flowchart LR
    U[Visitor browser] --> R[Route 53 DNS]
    R --> C[CloudFront distribution]
    C -->|Cache hit| V[Response from edge cache]
    C -->|Cache miss| S[S3 origin bucket]
    S --> C
    C --> U
```

## CI/CD graph (chain of custody)

```mermaid
flowchart LR
    A[Write content or infra changes] --> B[Commit to feature branch]
    B --> C[Open PR to master]
    C --> D[GitHub Actions checks]
    D --> E[Squash and merge]
    E --> F[Production workflows]
    F --> G[Hugo deploy syncs to S3]
    F --> H[Terraform apply for infra updates]
    G --> I[CloudFront invalidation]
    H --> I
    I --> J[Route 53 serves brooks-security.com]
```