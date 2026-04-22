# brooks-security.com

Personal portfolio site built with [Hugo](https://gohugo.io), hosted as a static site on AWS (S3 + CloudFront + Route 53), and managed with Terraform.

## Stack at a glance

- **Content**: Hugo (`hugo/`) with the `hugo-book` theme (git submodule)
- **Infra**: Terraform (`terraform/`)
- **Hosting**: S3 origin bucket behind CloudFront
- **DNS**: Route 53 (`brooks-security.com`, `www`)
- **CI/CD**: GitHub Actions (plan/build on PR, apply/deploy on merge to `master`)

## Repository layout

```text
.
├── .github/workflows/     # terraform + hugo pipelines
├── hugo/                  # site content, config, theme submodule
├── terraform/             # AWS infrastructure code
└── readme.md
```

## Local development

```bash
# first clone
git clone --recurse-submodules git@github.com:LittleSeneca/brooks-security.com.git
cd brooks-security.com

# if already cloned
git submodule update --init --recursive

# run site locally
cd hugo
hugo server -D
```

## Day-to-day workflow

1. Create a feature branch from `master`.
2. Make changes in `hugo/` (content) and/or `terraform/` (infra).
3. Open a PR to `master`.
4. Wait for checks:
   - Terraform: fmt, validate, plan (when terraform files changed)
   - Hugo: build (when hugo files changed)
5. Squash and merge.
6. Merge triggers production deploy:
   - `terraform apply` for infra changes
   - `hugo deploy` + CloudFront invalidation for content changes

## Terraform quick start

```bash
cd terraform
terraform init -reconfigure
terraform fmt -recursive
terraform validate
terraform plan
```

Notes:
- Backend state: S3 bucket `brooks-security-tfstate`
- State lock: DynamoDB table `brooks-security-tfstate-lock`
- Local AWS profile default: `brooks-security`

## Hugo deploy behavior

`hugo deploy` syncs `hugo/public/` to `s3://brooks-security.com` and invalidates CloudFront distribution `E1QZQDBCV5WT01`.

CloudFront uses a viewer-request function (`hugo`) to map pretty URLs like `/posts/foo/` to `/posts/foo/index.html`.

## Operational notes

- Do not push directly to `master`; use PRs.
- Prefer CI/CD for deploys instead of local `terraform apply`.
- Keep the `hugo-book` submodule initialized in local and CI environments.
- Email (MX) is Google Workspace; AWS handles web hosting and DNS.
