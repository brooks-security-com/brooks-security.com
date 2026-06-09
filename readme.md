# brooks-security.com

Personal portfolio site built with [Hugo](https://gohugo.io), served as a static site on AWS (S3, CloudFront, Route 53, ACM), and managed end to end with Terraform. The repository is its own deployment system: the same place that holds the content also holds the infrastructure that ships it. Total AWS cost is about $1 per month.

Everything runs on GitHub-hosted runners against AWS. There is no self-hosted runner, no Ansible, and nothing in the deploy path touching a homelab.

## Stack at a glance

| Layer | Technology |
|---|---|
| Content | Hugo with the `hugo-book` theme (git submodule) |
| Infrastructure as code | Terraform (`terraform/`) |
| Hosting | Private S3 origin bucket behind CloudFront |
| DNS and TLS | Route 53 (`brooks-security.com`, `www`, `aws`) with ACM, DNS-validated |
| AWS access portal | IAM Identity Center, fronted by a CloudFront 301 redirect |
| Scheduled jobs | EventBridge to Lambda (nightly contribution-heatmap refresh) |
| Contact form | Lambda Function URL behind CloudFront, with reCAPTCHA Enterprise and SNS email delivery |
| Secrets | AWS SSM Parameter Store |
| CI/CD | GitHub Actions on GitHub-hosted runners |

## Repository layout

```text
.
├── .github/workflows/
│   ├── infrastructure.yml      # terraform fmt → validate → plan/apply
│   └── hugo-deploy.yml         # hugo build → deploy → CloudFront invalidation
├── hugo/                       # site content, config, theme submodule, data/
├── terraform/
│   ├── *.tf                    # s3, cloudfront, route53, acm, iam, sso, lambda, contact
│   ├── imports.tf              # import blocks adopting pre-existing resources
│   ├── bootstrap/              # one-time: tfstate bucket + lock table
│   └── files/                  # CloudFront function + Lambda sources (heatmap, contact)
├── specs/                      # design docs for in-flight work
└── readme.md
```

## How a change ships

Two workflows fire on every push and pull request to `main`. Each uses a `paths-filter` so it only does real work when its own files changed. The checks still report either way, so branch protection's required status checks are satisfied on every PR.

1. Create a feature branch from `main`.
2. Make changes in `hugo/` (content) or `terraform/` (infrastructure).
3. Open a PR to `main`. On a PR:
   - `infrastructure.yml` runs `terraform fmt -check`, `validate`, and `plan`, then posts the plan as a sticky PR comment.
   - `hugo-deploy.yml` builds the site to prove it compiles.
4. Squash and merge. On merge to `main`:
   - `terraform apply` reconciles AWS infrastructure.
   - `hugo deploy` syncs the rendered site to S3 and invalidates CloudFront.

The `apply` and `deploy` jobs both target the `production` GitHub Environment, so they pause for an explicit approval before touching anything.

## Public site architecture

The site is a pile of static files in a private S3 bucket. The bucket blocks all public access; CloudFront is the only thing allowed to read it, through an Origin Access Control and a bucket policy scoped to the distribution's ARN. A small CloudFront Function (`terraform/files/hugo-cf-function.js`) runs at the edge on every viewer request and rewrites Hugo's pretty URLs (`/posts/foo/`) to the underlying `index.html` keys.

A second, tiny CloudFront distribution backs `aws.brooks-security.com`. Its origin is a dummy; a CloudFront Function intercepts every request and returns a `301` to the IAM Identity Center portal. No compute, no S3, just a redirect at the edge. Terraform also manages the identity side: the Identity Center user, an `AdministratorAccess` permission set, and the account assignment that binds them.

## Nightly contribution-heatmap refresh

The homepage renders a GitHub-style contribution heatmap from `hugo/data/contributions.json`, re-baked once a day so the calendar stays current without a human in the loop:

1. EventBridge fires a cron rule at 09:00 UTC.
2. A Lambda (`brooks-security-contrib-dispatch`, `python3.12`) reads a GitHub PAT from SSM (`/github/admin_token`) and POSTs `workflow_dispatch` to `hugo-deploy.yml`.
3. The build step queries the GitHub GraphQL `contributionsCollection` API, overwrites `hugo/data/contributions.json`, and redeploys to S3 and CloudFront.

EventBridge does the kicking, rather than a GitHub Actions `schedule:` cron, on purpose: GitHub auto-disables scheduled workflows after 60 days of repository inactivity, which a personal site can easily hit. The whole job is one Lambda invocation per day, and the fetch is fail-soft: any error leaves the last-known-good JSON in place so the build still succeeds.

## Contact form

The Services section includes a working contact form, added without an API Gateway or any always-on backend. A new CloudFront behavior routes `/api/contact` to a Lambda Function URL, so the form posts same-origin (no CORS):

1. The page loads reCAPTCHA Enterprise and, on submit, POSTs the form as JSON to `/api/contact`.
2. CloudFront forwards the request to the `brooks-security-contact` Lambda (`python3.12`) over a Function URL, injecting a shared-secret header so the Function URL cannot be invoked directly.
3. The Lambda creates a reCAPTCHA Enterprise assessment for the token (rejecting an invalid token, a mismatched action, or anything below the score threshold), checks the shared secret and a honeypot field, and publishes the message to an SNS topic that emails the site owner.

reCAPTCHA Enterprise verification uses a Google Cloud API key and the owning project (`var.recaptcha_project_id`); there is no classic secret key. The API key and the public site key live in SSM (`/brooks-security.com/recaptcha/*`): the site key is also injected into the Hugo build from SSM at build time, and the Lambda reads both at runtime, neither entering Terraform state. The whole feature is effectively free, costing a handful of Lambda invocations and SNS emails a month (Enterprise assessments are free up to a generous monthly tier).

## Terraform quick start

```bash
cd terraform
terraform init -reconfigure -backend-config=profile=brooks-security
terraform fmt -recursive
terraform validate
terraform plan
```

Notes:

- Backend state lives in the S3 bucket `brooks-security-tfstate`, locked by the DynamoDB table `brooks-security-tfstate-lock`. Both are created once by the `terraform/bootstrap/` module, whose own state is local and committed to the repo.
- The provider defaults to the local AWS profile `brooks-security`. In CI, `TF_VAR_aws_profile=""` makes the provider fall through to the standard credential chain (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).
- `terraform/imports.tf` holds `import` blocks that adopt the already-existing Route 53, ACM, S3, and CloudFront resources, so the steady-state plan is a clean no-op.

## Hugo deploy behaviour

`hugo deploy` reads the `[deployment]` block in `hugo.toml`: it syncs `hugo/public/` to `s3://brooks-security.com`, sets long-lived `Cache-Control` headers on hashed assets, and invalidates CloudFront distribution `E1QZQDBCV5WT01`. With the `AWS_*` env vars set in CI, the AWS credential chain is used directly, so no profile is needed.

## Local development

```bash
# first clone
git clone --recurse-submodules git@github.com:LittleSeneca/brooks-security.com.git
cd brooks-security.com

# if already cloned without submodules
git submodule update --init --recursive

# run the site locally
cd hugo
hugo server -D
```

The `hugo-book` theme is a git submodule, so it must be initialized before the site will build locally or in CI.

## Deploy credentials

Today the workflows authenticate to AWS with a scoped IAM user's access keys, stored as GitHub Actions secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`). A GitHub OIDC provider and a dedicated deploy role are already defined in `terraform/iam.tf`, staged for a planned cutover to short-lived, keyless credentials. When that lands, the static keys go away.

## Operational notes

- Do not push directly to `main`. Use PRs.
- Prefer CI/CD for deploys over a local `terraform apply`.
- IAM Identity Center must be enabled by hand in the AWS console before `terraform apply` can manage the SSO resources (`Settings → Enable` in the IAM Identity Center console).
- A separate Proxmox and Tailscale homelab exists and is reachable privately at `pve.brooks-security.com`, but it is not part of this repository's deploy path and not managed by the Terraform here. Homelab design docs live under `specs/`.
