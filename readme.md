# brooks-security.com

Personal portfolio site for Graham Brooks. Content is authored in
[Hugo](https://gohugo.io) using the [hugo-book](https://github.com/alex-shpak/hugo-book)
theme (wired in as a git submodule) and served from AWS as a fully static site
behind CloudFront with a custom domain managed in Route 53. Infrastructure is
managed in Terraform and continuously delivered from this repo via GitHub
Actions.

This README is the operator's manual for the site: what's running, where it
lives, how it's deployed, and how to change anything safely.

---

## 1. High-level architecture

```
                    (Route 53 Registrar — Amazon Registrar, auto-renew on)
                                         │
                                         ▼
                  Hosted Zone  brooks-security.com.  (Z0929787253OYUX8XP5MU)
                  ┌──────────────────────────────────────────────────┐
                  │ brooks-security.com         A/AAAA ─► alias ─┐   │
                  │ www.brooks-security.com     A/AAAA ─► alias ─┤   │
                  │ MX  → SMTP.GOOGLE.COM    (Google Workspace)  │   │
                  │ TXT @ → google-site-verification             │   │
                  │ TXT _dmarc → v=DMARC1; p=quarantine          │   │
                  │ _xxxx CNAME → *.acm-validations.aws (ACM)    │   │
                  └──────────────────────────────────────────────┼───┘
                                                                 │
                                                                 ▼
                         CloudFront distribution  E1QZQDBCV5WT01
                         d3u2adlqufnlrp.cloudfront.net
                         ┌──────────────────────────────────────────┐
                         │ Aliases: brooks-security.com, www.…      │
                         │ ACM cert (us-east-1): debddc75-…8ef4     │
                         │ TLSv1.2_2021, SNI, HTTP/2, IPv6 on       │
                         │ PriceClass_100, redirect-to-https        │
                         │ Cache policy: CachingOptimized (AWS-mgd) │
                         │ Viewer-request function: `hugo`          │
                         │   ↳ rewrites /foo/  → /foo/index.html    │
                         │ Origin access: OAC  E1BP7TXJ6IVWD7       │
                         └───────────────────────┬──────────────────┘
                                                 │ signed S3 GetObject
                                                 ▼
                         S3 bucket  brooks-security.com  (us-east-1)
                         ┌──────────────────────────────────────────┐
                         │ Private (all 4 public-access blocks ON)  │
                         │ SSE-S3 (AES256), BucketKeyEnabled        │
                         │ BucketOwnerEnforced (ACLs disabled)      │
                         │ Bucket policy: CloudFront OAC only       │
                         │ ~3.3 MB of Hugo output                   │
                         └──────────────────────────────────────────┘

                         GitHub master push → Actions runner →
                         hugo build → S3 sync → CloudFront invalidate
```

Google Workspace handles email via the apex `MX` record; AWS only owns web
delivery and DNS. All AWS changes — including to the DNS and the certificate —
flow through Terraform in this repo. Site content flows through Hugo.

---

## 2. Repository layout

```
brooks-security.com/
├── .github/
│   └── workflows/
│       ├── terraform.yml        # infra CI/CD (plan on PR, apply on master)
│       └── hugo-deploy.yml      # site CI/CD (build on PR, deploy on master)
├── hugo/
│   ├── hugo.toml                # Hugo config, includes [deployment] target
│   ├── archetypes/              # `hugo new` templates
│   ├── content/                 # markdown — the actual site content
│   ├── static/                  # static assets copied verbatim
│   ├── resources/               # Hugo's SCSS build cache
│   └── themes/
│       └── hugo-book/           # submodule → alex-shpak/hugo-book
├── terraform/
│   ├── main.tf                  # providers, backend, required versions
│   ├── variables.tf             # input variables (domain, account id, profile)
│   ├── outputs.tf               # CloudFront/S3/ACM/Route53 IDs for reference
│   ├── acm.tf                   # us-east-1 ACM cert + DNS validation records
│   ├── cloudfront.tf            # CloudFront distribution + Function + OAC
│   ├── iam.tf                   # GitHub OIDC provider + scoped deploy role
│   ├── route53.tf               # hosted zone + all record sets
│   ├── s3.tf                    # origin bucket + policies + encryption
│   ├── imports.tf               # `import` blocks for the existing resources
│   ├── files/                   # assets consumed by Terraform (e.g. CF function)
│   └── bootstrap/               # one-time state-bucket + lock-table setup
└── readme.md                    # you are here
```

Terraform state lives in S3 bucket `brooks-security-tfstate` with a DynamoDB
lock table `brooks-security-tfstate-lock`, both provisioned by
`terraform/bootstrap/` (run once).

---

## 3. Branching and pull-request workflow

**The `master` branch is protected. Never push directly to it.** Every change
— whether to Terraform, to Hugo content, or to the workflows themselves —
goes through a short-lived feature branch and a pull request.

### Branch naming

There's no hard convention, but the existing history uses
[Conventional Commits](https://www.conventionalcommits.org/) prefixes, which
translate cleanly into branch names:

| Prefix   | Meaning                                | Example branch                    |
|----------|----------------------------------------|-----------------------------------|
| `feat/`  | a new feature or piece of content      | `feat/add-rds-magazine-post`      |
| `fix/`   | a bug or broken-thing fix              | `fix/cloudfront-function-syntax`  |
| `chore/` | maintenance, deps, cleanup             | `chore/upgrade-hugo-to-0.160.1`   |
| `docs/`  | README or other doc-only change        | `docs/explain-pr-workflow`        |
| `ci/`    | workflow or pipeline change            | `ci/switch-to-oidc-auth`          |

### The full loop

```
  ┌────────────────────┐        ┌──────────────────────────┐
  │ git checkout -b    │  push  │ PR opened → GitHub       │
  │ feat/whatever      ├───────▶│ Actions runs:            │
  └────────────────────┘        │   • terraform fmt        │
                                │   • terraform validate   │
                                │   • terraform plan       │──┐
                                │   • hugo build           │  │ plan posted
                                └──────────────────────────┘  │ as PR comment
                                          │                   │
                               review + ✅ checks             │
                                          ▼                   │
  ┌────────────────────┐        ┌──────────────────────────┐  │
  │ merge via "Squash  │  push  │ GitHub Actions on master:│◀─┘
  │ and merge"         ├───────▶│   • terraform apply      │
  └────────────────────┘        │   • hugo deploy          │
                                │       (S3 + invalidate)  │
                                └──────────────────────────┘
```

### Concretely

1. Create a branch off `master`:

   ```bash
   git checkout master && git pull
   git checkout -b feat/add-new-post
   ```

2. Make your changes. For content: edit under `hugo/content/`. For
   infrastructure: edit under `terraform/`. Run `terraform fmt -recursive` and
   (optionally) `terraform validate` locally before committing.

3. Commit using Conventional Commits:

   ```bash
   git add hugo/content/posts/my-new-post.md
   git commit -m "feat: add post on cost-effective migration"
   git push -u origin feat/add-new-post
   ```

4. Open a pull request against `master`. GitHub Actions runs the relevant
   workflow(s) automatically — see §4 below. If you touched `terraform/**`,
   the plan is posted as a PR comment so you (and any reviewer) can see
   exactly what AWS is about to change.

5. Get approval (if a reviewer is required), wait for all status checks
   to turn green, then **Squash and merge**. The squash strategy keeps `master`
   history clean — one commit per PR.

6. On the merge push, the production jobs run: `terraform apply` updates AWS,
   `hugo deploy` uploads the new site and invalidates CloudFront. Usually
   takes under two minutes end-to-end.

### Why no direct pushes

`terraform apply` on `master` is irrevocable against a live production account.
Running `plan` first in an isolated PR environment, with the plan visible in
the PR comment thread, is the forcing function that prevents surprise changes.
The same logic applies to `hugo deploy`: it can delete objects from the S3
bucket, so sending every change through a PR keeps a clear audit trail of
what shipped, when, and why.

---

## 4. GitHub Actions pipelines

Two workflows live in `.github/workflows/`. Both fire on **every** push and PR
to `master` — so every PR sees both status checks run and (hopefully) pass.
Each workflow starts with a lightweight `Detect Changes` job
(`dorny/paths-filter@v3`) that compares the diff against the base. If the
relevant paths (`terraform/**` or `hugo/**`) haven't changed, the downstream
jobs still execute but short-circuit to a single `echo "…marking check as
passed."` step and return green in seconds. The practical upshot: a PR that
only touches `hugo/` still gets a passing Terraform check, and vice versa —
which lets GitHub branch protection require both checks without forcing
every PR to touch both paths.

Both run on GitHub-hosted `ubuntu-latest` runners. There is no self-hosted
infrastructure. Authentication to AWS is via three repository secrets:

| Secret                   | Purpose                                  |
|--------------------------|------------------------------------------|
| `AWS_ACCESS_KEY_ID`      | Access key for the deploy principal      |
| `AWS_SECRET_ACCESS_KEY`  | Corresponding secret key                 |
| `AWS_REGION`             | `us-east-1`                              |

These credentials belong to an IAM user with just the permissions needed to
manage the site. The account also has a GitHub OIDC provider and a scoped
deploy role declared in `terraform/iam.tf` — see §8 for the migration path
that retires these long-lived keys.

### 4.1 `terraform.yml` — infrastructure pipeline

**Triggered on**: push or pull_request to `master` (always — the path filter
lives inside the workflow, not in the trigger).

**Terraform version**: `1.14.4` (pinned), installed via
`hashicorp/setup-terraform@v3`.

Jobs:

| Job                  | When                      | What it does                                                                 |
|----------------------|---------------------------|------------------------------------------------------------------------------|
| `changes`            | Every run                 | `dorny/paths-filter@v3` detects whether `terraform/**` or the workflow itself changed. Exposes a `terraform` output consumed by every downstream job. |
| `terraform-fmt`      | PR and push               | `terraform fmt -check -recursive` — fails if anything is unformatted. Short-circuits to pass when `needs.changes.outputs.terraform != 'true'`. |
| `terraform-validate` | After fmt                 | `terraform init -backend=false` + `terraform validate`. No AWS call. Same short-circuit.                                   |
| `terraform-plan`     | PRs only                  | Full `terraform init` + `terraform plan`. Output posted to the PR as a comment (updates in place on subsequent pushes). Same short-circuit. |
| `terraform-apply`    | Push to master only       | `terraform init` + `plan` + `apply -auto-approve`. Gated on the `production` GitHub environment. Same short-circuit.        |

The plan comment is keyed by an HTML marker (`<!-- brooks-security-terraform-plan -->`), so re-pushing to a PR edits the existing comment instead of appending new ones. A ✅ or ❌ emoji in the comment header reflects the plan's exit status.

The AWS provider in `terraform/main.tf` reads its credentials from
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars in CI. Locally, it uses
the `brooks-security` named profile by default — see §5 for how this is wired.

### 4.2 `hugo-deploy.yml` — site content pipeline

**Triggered on**: push or pull_request to `master` (always — the path filter
lives inside the workflow, not in the trigger).

**Hugo version**: `0.160.1` (pinned, extended/withdeploy edition). Extended is
required because hugo-book uses SCSS; withdeploy is required because the
`hugo deploy` subcommand was split out behind a build tag in v0.159.2.

Jobs:

| Job       | When                | What it does                                                                                                 |
|-----------|---------------------|--------------------------------------------------------------------------------------------------------------|
| `changes` | Every run           | `dorny/paths-filter@v3` detects whether `hugo/**` or the workflow itself changed. Exposes a `hugo` output consumed by every downstream job. |
| `build`   | PR and push         | Checkout (with submodule), install Hugo, run `hugo --minify --gc`. On push, the built `public/` is uploaded as a short-lived artifact for the deploy job. Short-circuits to pass when `needs.changes.outputs.hugo != 'true'`. |
| `deploy`  | Push to master only | Checkout, install Hugo, download the build artifact, run `hugo deploy --target brooks-security --invalidateCDN`. Gated on the `production` GitHub environment. Same short-circuit.                |

`hugo deploy` reads the `[deployment]` block in `hugo/hugo.toml`, which
targets `s3://brooks-security.com?region=us-east-1` and invalidates CloudFront
distribution `E1QZQDBCV5WT01`. It uses the same AWS env-var credentials as the
Terraform workflow — no profile needed in CI.

### 4.3 Failure modes worth knowing about

- **`terraform fmt` failed.** Someone committed unformatted HCL. Run
  `terraform fmt -recursive terraform/` locally, commit, push.
- **`terraform plan` succeeded but shows unexpected drift.** Someone clicked
  something in the AWS console. Either fold the drift into Terraform (preferred)
  or revert the console change.
- **`terraform apply` partially failed.** AWS can leave resources in a
  half-created state. Re-running the workflow (via "Re-run failed jobs" in the
  Actions UI) usually converges; otherwise `terraform state` surgery from a
  laptop is needed.
- **`hugo deploy` failed with "not supported in this version".** The runner
  pulled a Hugo build without the `withdeploy` tag. Re-check `HUGO_VERSION` and
  the tarball filename in `hugo-deploy.yml`.
- **Theme shortcode not found.** Either the `hugo-book` submodule didn't
  clone (check the "Checkout (with theme submodule)" step) or the pinned Hugo
  version is below the theme's `min_version` (`0.158.0`).

---

## 5. Terraform conventions

The root module lives under `terraform/`. There is one environment —
production — and one AWS account, so there's no `environments/` layout.

### 5.1 Backend

```hcl
backend "s3" {
  bucket         = "brooks-security-tfstate"
  key            = "brooks-security.com/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "brooks-security-tfstate-lock"
  encrypt        = true
}
```

The backend block uses **partial configuration**: the `profile` attribute is
omitted on purpose so CI can init using env-var credentials. Locally, either
`export AWS_PROFILE=brooks-security` before running Terraform, or pass
`-backend-config=profile=brooks-security` to `terraform init`.

### 5.2 Provider profile

The `aws` provider reads from a variable:

```hcl
provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile != "" ? var.aws_profile : null
}
```

`var.aws_profile` defaults to `brooks-security` (your laptop), and CI sets
`TF_VAR_aws_profile=""` so the provider falls through to the env-var
credential chain.

### 5.3 Importing existing resources

Every AWS resource in production predates Terraform. `terraform/imports.tf`
contains `import` blocks keying each live resource (CloudFront distribution,
S3 bucket, Route 53 zone, ACM cert, etc.) into the corresponding Terraform
resource, so the first `plan` is a no-op.

### 5.4 Running Terraform locally

```bash
cd terraform/

# one-time
terraform init -reconfigure

# check what a change would do
terraform plan

# (do not apply from a laptop except in an emergency — CI is the deploy path)
```

---

## 6. Hugo content workflow

### 6.1 Adding a new post

```bash
cd hugo/
hugo new content posts/my-new-post.md
# edit hugo/content/posts/my-new-post.md …
hugo server -D      # preview at http://localhost:1313
```

Then follow the PR flow in §3.

### 6.2 Deployment mechanics

`hugo deploy` (invoked by CI on the merge to `master`) reads the deployment
block in `hugo/hugo.toml`:

```toml
[[deployment.targets]]
  name = "brooks-security"
  URL  = "s3://brooks-security.com?region=us-east-1"
  cloudFrontDistributionID = "E1QZQDBCV5WT01"

[[deployment.matchers]]
  pattern      = "^.+\\.(jpg|jpeg|png|gif|webp|svg)$"
  cacheControl = "max-age=31536000, no-transform, public"
  gzip         = true

[[deployment.matchers]]
  pattern      = "^.+\\.(css|js)$"
  cacheControl = "max-age=31536000, no-transform, public"
  gzip         = true
```

Hugo syncs the local `public/` directory into the S3 bucket, applies the
matcher rules (long `Cache-Control` for static assets, gzip on CSS/JS), and
then issues a CloudFront invalidation so viewers see the new content.

### 6.3 Request path in production

1. User hits `https://brooks-security.com/some/page/`.
2. Route 53 alias returns CloudFront edge IPs.
3. CloudFront terminates TLS with the ACM cert and runs the `hugo`
   viewer-request function, which rewrites `/some/page/` to
   `/some/page/index.html`.
4. On a cache miss, CloudFront signs a SigV4 request to the S3 REST endpoint
   using OAC `E1BP7TXJ6IVWD7`.
5. S3 returns the object because the bucket policy allows the CloudFront
   distribution's ARN via the `AWS:SourceArn` condition.
6. CloudFront caches (managed `CachingOptimized` policy) and serves.

---

## 7. AWS resource inventory

### 7.1 Account & tooling

| Item                      | Value                                          |
|---------------------------|------------------------------------------------|
| AWS account               | `570516803292`                                 |
| Primary region            | `us-east-1` (required — CloudFront ACM certs) |
| AWS CLI profile (local)   | `brooks-security`                              |
| Local IAM principal       | `arn:aws:iam::570516803292:user/graham.brooks` |
| CI principal              | IAM access key pair stored in GitHub secrets   |
| GitHub OIDC provider      | Declared in Terraform, not yet used for CI     |

### 7.2 Route 53

**Registered domain** `brooks-security.com` via Amazon Registrar
(`AutoRenew: true`, expires 2026‑07‑22). Registrant contact is privacy-masked
at the registrar.

**Hosted zone** `Z0929787253OYUX8XP5MU` (public), with the following record
sets:

| Name                                   | Type  | Target                                       | Notes                     |
|----------------------------------------|-------|----------------------------------------------|---------------------------|
| `brooks-security.com.`                 | A     | alias → `d3u2adlqufnlrp.cloudfront.net.`     | CF zone `Z2FDTNDATAQYW2` |
| `brooks-security.com.`                 | AAAA  | alias → `d3u2adlqufnlrp.cloudfront.net.`     |                           |
| `www.brooks-security.com.`             | A     | alias → `d3u2adlqufnlrp.cloudfront.net.`     |                           |
| `www.brooks-security.com.`             | AAAA  | alias → `d3u2adlqufnlrp.cloudfront.net.`     |                           |
| `brooks-security.com.`                 | MX    | `1 SMTP.GOOGLE.COM`                          | Google Workspace          |
| `brooks-security.com.`                 | TXT   | `google-site-verification=Xkgt-…`            |                           |
| `_dmarc.brooks-security.com.`          | TXT   | `v=DMARC1; p=quarantine`                     |                           |
| `_781ab460…brooks-security.com.`       | CNAME | `_7f56e3e2…acm-validations.aws.`             | ACM DNS validation        |
| `_a8223b3c…brooks-security.com.`       | CNAME | `_a40d0552…acm-validations.aws.`             | ACM DNS validation        |
| `_b7d54799…www.brooks-security.com.`   | CNAME | `_2cfd9693…acm-validations.aws.`             | ACM DNS validation        |
| plus the zone's own `NS` + `SOA`                                                                          |

The three `_xxxx` validation CNAMEs are preserved for automatic ACM renewal.

### 7.3 ACM certificate

| Field                  | Value                                                                        |
|------------------------|------------------------------------------------------------------------------|
| ARN                    | `arn:aws:acm:us-east-1:570516803292:certificate/debddc75-de5c-4103-9c4e-d9fe952236e2` |
| DomainName             | `brooks-security.com`                                                        |
| SANs                   | `brooks-security.com`, `www.brooks-security.com`                             |
| Status                 | `ISSUED` / `InUse: true` / `RenewalEligibility: ELIGIBLE`                    |
| Validation             | DNS (via the `_xxxx.…` CNAMEs in the hosted zone)                            |
| Key algorithm          | RSA‑2048                                                                     |
| Not before / Not after | 2025‑11‑25 → 2026‑12‑25                                                     |

### 7.4 CloudFront

**Distribution `E1QZQDBCV5WT01`**
(domain `d3u2adlqufnlrp.cloudfront.net`, `Status: Deployed`)

Key configuration:

- **Aliases**: `brooks-security.com`, `www.brooks-security.com`
- **Viewer cert**: ACM `debddc75-…`, `sni-only`, `MinimumProtocolVersion: TLSv1.2_2021`
- **HTTP version**: `http2`, **IPv6**: enabled
- **Price class**: `PriceClass_100`
- **Logging**: disabled
- **WebACL**: none, **GeoRestriction**: none
- **DefaultRootObject**: empty (handled by the viewer-request function)

**Origin**: S3 REST endpoint `brooks-security.com.s3.us-east-1.amazonaws.com`
accessed via Origin Access Control `E1BP7TXJ6IVWD7` (SigV4, always-sign).

**Default cache behavior**: `redirect-to-https`, methods `HEAD, GET`,
`Compress: true`, AWS-managed `CachingOptimized` policy
(`658327ea-f89d-4fab-a63d-7e88639e58f6`). The viewer-request function
`arn:aws:cloudfront::570516803292:function/hugo` is attached.

**CloudFront Function `hugo`** (runtime `cloudfront-js-2.0`, viewer-request):

```js
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    if (uri.endsWith('/') || !uri.includes('.')) {
        request.uri += 'index.html';
    }
    return request;
}
```

This is what lets Hugo's pretty URLs work against the S3 REST origin:
`/posts/foo/` is rewritten to `/posts/foo/index.html` before S3 is asked for
the object. The S3 static-website endpoint does this automatically, but the
REST endpoint does not.

### 7.5 S3

**Active origin bucket: `brooks-security.com`** (`us-east-1`)

| Field                      | Value                                                      |
|----------------------------|------------------------------------------------------------|
| Contents                   | Hugo `public/` output — roughly 3.3 MB, ~190 objects       |
| Public access block        | All four flags **ON** (fully private)                      |
| Ownership controls         | `BucketOwnerEnforced` (ACLs disabled)                      |
| Default encryption         | SSE-S3 (`AES256`), `BucketKeyEnabled: true`                |
| Versioning                 | Not enabled (see §9)                                       |
| Server access logging      | Not enabled                                                |
| Bucket policy              | `s3:GetObject` granted **only** to the CloudFront service principal, conditioned on the distribution's `AWS:SourceArn` |

Policy in full:

```json
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::brooks-security.com/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::570516803292:distribution/E1QZQDBCV5WT01"
      }
    }
  }]
}
```

### 7.6 IAM (current state)

- **User `graham.brooks`** — admin on the account, used for emergency local
  runs. Two long-lived access keys on this user (2023, 2024); one of them is
  what `hugo deploy` uses locally via the `brooks-security` CLI profile.
- **CI access keys** — a separate key pair stored in GitHub secrets, scoped
  to just what CI needs. (These should be moved to the OIDC role, below.)
- **IAM OIDC provider + deploy role `brooks-security-github-deploy`** —
  defined in `terraform/iam.tf`. The role's trust policy restricts it to the
  `LittleSeneca/brooks-security.com` repository on `refs/heads/master`. Its
  inline policy permits S3 object ops on the origin bucket and CloudFront
  invalidation on the distribution. **Not yet used by the workflows.**

---

## 8. Local development

```bash
# one-time: clone including the theme submodule
git clone --recurse-submodules git@github.com:LittleSeneca/brooks-security.com.git
cd brooks-security.com

# or, if the repo is already cloned:
git submodule update --init --recursive

# run locally (drafts visible at localhost:1313)
cd hugo && hugo server -D

# build for release (outputs to hugo/public/)
cd hugo && hugo --minify
```

Prereqs:

- **Hugo**, version `>= 0.158.0`, extended/withdeploy edition. On macOS:
  `brew install hugo` gets the right build. Verify with `hugo version` — you
  want output containing `+extended +withdeploy`.
- **AWS CLI** with the `brooks-security` profile configured in `~/.aws/config`.
- **Terraform** `1.14.x` if you want to run `plan` locally.
- **Git** with submodule support (anything modern).

---

## 9. Known cleanup / tech-debt items

- **Delete legacy bucket `brooks-security`** (no `.com`) — empty, public,
  unused. Old pre-OAC architecture.
- **Delete legacy OAI `E2U5EOA7T2DBV3`** — not referenced by any distribution.
- **Remove the unused S3 website configuration** from `brooks-security.com` —
  CloudFront hits the REST endpoint, so the `IndexDocument` setting is a no-op
  and adds confusion.
- **Turn on S3 versioning (and possibly MFA delete)** — now that deploys are
  automated, a bad `hugo deploy` could wipe the bucket with no recovery.
- **Enable CloudFront standard logging** to a separate lifecycle-managed log
  bucket if traffic visibility is desired.
- **Migrate CI auth to the OIDC deploy role** declared in `terraform/iam.tf`
  using `aws-actions/configure-aws-credentials@v4` with `role-to-assume`, then
  delete the two long-lived keys from GitHub secrets and from `graham.brooks`.
- **Unrelated expired `valdyr.io` ACM cert** in us-east-1 can be deleted —
  not this project, but it's the only other thing in the region.

---

## 10. Quick reference — resource IDs

| Resource                               | ID / ARN                                                                            |
|----------------------------------------|-------------------------------------------------------------------------------------|
| AWS account                            | `570516803292`                                                                      |
| Route 53 hosted zone                   | `Z0929787253OYUX8XP5MU`                                                             |
| CloudFront distribution                | `E1QZQDBCV5WT01`                                                                    |
| CloudFront distribution domain         | `d3u2adlqufnlrp.cloudfront.net`                                                     |
| CloudFront Origin Access Control       | `E1BP7TXJ6IVWD7`                                                                    |
| CloudFront Function                    | `arn:aws:cloudfront::570516803292:function/hugo`                                    |
| Legacy (unused) OAI                    | `E2U5EOA7T2DBV3`                                                                    |
| ACM certificate (us-east-1)            | `arn:aws:acm:us-east-1:570516803292:certificate/debddc75-de5c-4103-9c4e-d9fe952236e2` |
| S3 origin bucket                       | `brooks-security.com`                                                               |
| S3 legacy bucket (empty, to delete)    | `brooks-security`                                                                   |
| CloudFront alias zone ID (constant)    | `Z2FDTNDATAQYW2`                                                                    |
| Terraform state bucket                 | `brooks-security-tfstate`                                                           |
| Terraform state lock table             | `brooks-security-tfstate-lock`                                                      |
| IAM deploy role (OIDC)                 | `brooks-security-github-deploy`                                                     |
| GitHub repository                      | `LittleSeneca/brooks-security.com`                                                  |

---

## 11. Operating cost

**The entire stack costs roughly $0.50 per month to run.** Fifty cents. That
covers serving the site, DNS, TLS, CI/CD, and all of the state-management
plumbing behind Terraform. Here's where the nickels and dimes actually go:

| Line item                                         | Monthly cost       | Notes                                                                                                   |
|---------------------------------------------------|--------------------|---------------------------------------------------------------------------------------------------------|
| Route 53 hosted zone                              | **$0.50**          | Flat fee per public hosted zone. This is the entire cost floor — everything else rounds to zero.        |
| Route 53 queries                                  | ~$0.00             | $0.40 per million queries; a personal site gets thousands, not millions.                                |
| CloudFront data transfer + requests               | ~$0.00             | `PriceClass_100` (US/EU/Canada edges only) + ~3.3 MB of content + `CachingOptimized`. First 1 TB/month out of CloudFront is free under the AWS Free Tier, and steady-state traffic is well below that. |
| CloudFront invalidations                          | ~$0.00             | First 1,000 invalidation paths per month are free. `hugo deploy --invalidateCDN` issues one wildcard per deploy. |
| CloudFront Function invocations                   | ~$0.00             | $0.10 per million invocations. Same story — traffic volume never reaches a measurable bill.             |
| S3 storage                                        | ~$0.00             | ~3.3 MB × $0.023/GB-month = fractions of a cent.                                                        |
| S3 requests (GET from CloudFront, PUT from Hugo)  | ~$0.00             | Cached-heavy workload; most viewer requests never hit S3.                                               |
| ACM certificate                                   | **$0.00**          | Public ACM certs used with CloudFront are free.                                                         |
| Route 53 domain registration                      | ~$1/month amortized| `$12/year` for the `.com`. Paid annually, not a recurring AWS charge in the usage sense.                |
| Terraform state — S3 bucket                       | ~$0.00             | A few KB of state file. Negligible.                                                                     |
| Terraform state — DynamoDB lock table             | ~$0.00             | Pay-per-request billing + near-zero lock traffic.                                                       |
| GitHub Actions minutes                            | **$0.00**          | GitHub-hosted `ubuntu-latest` runners are free for public repos; otherwise well within the included monthly minutes for a private repo on a free/Pro plan. |
| **Total AWS spend**                               | **~$0.50/month**   |                                                                                                         |

The dominant cost is the Route 53 hosted zone, and there is no way to make it
cheaper while keeping `brooks-security.com` on AWS DNS. Every other component
is either inside the AWS Free Tier, billed on usage volumes we never reach,
or genuinely free (ACM, GitHub-hosted runners for public repos). Adding the
amortized `$1/month` domain renewal, the real out-of-pocket cost is closer
to **$1.50/month**, but the *AWS bill* itself is the famous fifty cents.

A few things worth noting about how this cost shape stays flat:

- **No always-on compute.** No EC2, no ECS, no Lambda@Edge, no RDS. The site is
  static bytes in S3 behind a CDN, so the bill doesn't scale with uptime.
- **CloudFront, not S3, is the public face.** That pulls traffic into the free
  tier and keeps S3 request charges near zero.
- **No paid third-party services.** Email is Google Workspace (separate,
  personal line item), but DNS, TLS, hosting, and CI are all in-stack.
- **A viral spike would still be cheap.** 1 TB of CloudFront egress per month
  is free; after that it's $0.085/GB in North America. Even a 10× traffic
  surge costs cents, not dollars.

If you ever need to explain the economics of hosting a modern static site on
AWS to someone: the answer is "fifty cents a month, and it scales to the
front page of Hacker News without anyone waking up."
