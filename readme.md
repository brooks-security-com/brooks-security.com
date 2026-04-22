# brooks-security.com

Personal portfolio site for Graham Brooks. Content is authored in
[Hugo](https://gohugo.io) using the [hugo-book](https://github.com/alex-shpak/hugo-book)
theme (wired in as a git submodule) and served from AWS as a fully static site
behind CloudFront with a custom domain managed in Route 53.

This README inventories the **current production AWS footprint** (as it exists
today, configured by hand). It is the reference used to port the environment to
Terraform and to wire up a GitHub Actions continuous-delivery pipeline. Every
resource below is listed with its real ID so it can be imported into Terraform
rather than re-created.

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
                         │ Static-website index: index.html         │
                         │ 186 objects, ~3.3 MB (Hugo output)       │
                         └──────────────────────────────────────────┘

                         Developer laptop → `hugo deploy` →
                         sync `public/` to S3, invalidate CloudFront
```

Google Workspace handles email via the apex `MX` record; AWS only owns web
delivery and DNS.

---

## 2. AWS account & tooling

| Item                      | Value                                          |
|---------------------------|------------------------------------------------|
| AWS account               | `570516803292`                                 |
| Primary region            | `us-east-1` (required — CloudFront ACM certs) |
| AWS CLI profile (local)   | `brooks-security`                              |
| IAM principal used today  | `arn:aws:iam::570516803292:user/graham.brooks` |
| Group membership          | `Full-Admins` → `AdministratorAccess` (AWS-managed) |
| Deploy keys               | 2 long-lived IAM access keys on `graham.brooks` (2023, 2024) |
| GitHub OIDC provider      | **Not configured** — will be added for CD      |

---

## 3. Resource inventory

### 3.1 Route 53

**Registered domain** `brooks-security.com` via Amazon Registrar
(`AutoRenew: true`, expires 2026‑07‑22). Registrant contact is privacy-masked
at the registrar.

**Hosted zone** `Z0929787253OYUX8XP5MU` (public) with 12 record sets:

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
| (plus `NS` and `SOA` as created by Route 53)                                                            |

The three `_xxxx` validation CNAMEs are leftovers from ACM renewals; they must
be preserved for automatic renewal of the certificate.

### 3.2 ACM certificate

Only cert in use for this site (must live in `us-east-1` for CloudFront):

| Field                  | Value                                                                        |
|------------------------|------------------------------------------------------------------------------|
| ARN                    | `arn:aws:acm:us-east-1:570516803292:certificate/debddc75-de5c-4103-9c4e-d9fe952236e2` |
| DomainName             | `brooks-security.com`                                                        |
| SANs                   | `brooks-security.com`, `www.brooks-security.com`                             |
| Status                 | `ISSUED` / `InUse: true` / `RenewalEligibility: ELIGIBLE`                    |
| Validation             | DNS (via the `_xxxx.…` CNAMEs in the hosted zone above)                      |
| Key algorithm          | RSA‑2048                                                                     |
| Not before / Not after | 2025‑11‑25 → 2026‑12‑25                                                     |

A second us-east-1 cert exists for `valdyr.io` (EXPIRED, `InUse: false`) — not
related to this project, safe to ignore or delete separately.

### 3.3 CloudFront

**Distribution `E1QZQDBCV5WT01`**
(ARN `arn:aws:cloudfront::570516803292:distribution/E1QZQDBCV5WT01`,
domain `d3u2adlqufnlrp.cloudfront.net`, `Status: Deployed`, last modified
2024‑01‑15)

Key configuration:

- **Aliases**: `brooks-security.com`, `www.brooks-security.com`
- **Viewer cert**: ACM `debddc75-…`, `sni-only`, `MinimumProtocolVersion: TLSv1.2_2021`
- **HTTP version**: `http2`, **IPv6**: enabled
- **Price class**: `PriceClass_100`
- **Logging**: disabled
- **WebACL**: none, **GeoRestriction**: none
- **DefaultRootObject**: empty (handled by the viewer-request function)
- **Custom error responses**: none

**Origin** (only one):

| Field                  | Value                                                |
|------------------------|------------------------------------------------------|
| Id / DomainName        | `brooks-security.com.s3.us-east-1.amazonaws.com`     |
| Type                   | S3 (REST endpoint — **not** the website endpoint)    |
| Origin Access Control  | `E1BP7TXJ6IVWD7` (see below)                         |
| OAI                    | none (intentionally empty under OAC)                 |

**Default cache behavior**:

- Target origin: `brooks-security.com.s3.us-east-1.amazonaws.com`
- `ViewerProtocolPolicy`: `redirect-to-https`
- Allowed / cached methods: `HEAD, GET`
- `Compress: true`
- `CachePolicyId`: `658327ea-f89d-4fab-a63d-7e88639e58f6`
  — AWS-managed **CachingOptimized**
- No origin request policy, no response headers policy, no Lambda@Edge
- Function association (viewer-request):
  `arn:aws:cloudfront::570516803292:function/hugo`

No additional cache behaviors are configured.

**Origin Access Control** `E1BP7TXJ6IVWD7`

| Field                             | Value                                              |
|-----------------------------------|----------------------------------------------------|
| Name                              | `brooks-security.com.s3.us-east-1.amazonaws.com`   |
| OriginAccessControlOriginType     | `s3`                                               |
| SigningProtocol / SigningBehavior | `sigv4` / `always`                                 |

**CloudFront Function `hugo`** (runtime `cloudfront-js-2.0`, viewer-request,
LIVE and DEVELOPMENT stages identical):

```js
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    // Check if URI ends with '/' or does not contain a dot ('.')
    if (uri.endsWith('/') || !uri.includes('.')) {
        request.uri += 'index.html';
    }
    return request;
}
```

This is what lets Hugo's pretty URLs work against the S3 REST origin:
`/posts/foo/` is rewritten to `/posts/foo/index.html` before S3 is asked for
the object. (The S3 static-website endpoint does this automatically, but the
REST endpoint does not, which is why the function exists.)

**Legacy CloudFront Origin Access Identity** `E2U5EOA7T2DBV3`
(`Comment: "Access identity for S3 bucket"`) exists in the account but is not
referenced by any distribution in use. It is a leftover from an earlier pre-OAC
configuration and can be deleted.

### 3.4 S3

**Active origin bucket: `brooks-security.com`** (`us-east-1`)

| Field                      | Value                                                      |
|----------------------------|------------------------------------------------------------|
| Contents                   | 186 objects, ~3.3 MB — Hugo `public/` output               |
| Public access block        | All four flags **ON** (fully private)                      |
| Ownership controls         | `BucketOwnerEnforced` (ACLs disabled)                      |
| Default encryption         | SSE-S3 (`AES256`), `BucketKeyEnabled: true`                |
| Versioning                 | Not enabled                                                |
| Server access logging      | Not enabled                                                |
| CORS / Tags / Lifecycle    | None                                                       |
| Website configuration      | `IndexDocument.Suffix = index.html` (set but unused — CF hits the REST endpoint, not the website endpoint) |
| Bucket policy              | Grants `s3:GetObject` **only** to the CloudFront service principal, conditioned on `AWS:SourceArn = arn:aws:cloudfront::570516803292:distribution/E1QZQDBCV5WT01` |

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

**Legacy bucket: `brooks-security`** (`us-east-1`) — **empty (0 objects)**,
world-readable public-website configuration (`PublicRead` bucket policy, all
public-access blocks off, website hosting enabled with `index.html` +
`error.html`). This is a leftover from an older, pre-OAC architecture that
used the S3 static-website endpoint directly. It serves no current traffic and
can be deleted as part of the cleanup. Recommendation is to *not* port this
into Terraform; just delete it once the CD pipeline is validated against the
real origin bucket.

### 3.5 IAM

No site-specific IAM identities exist today. Deploys happen manually with
Graham's personal admin user:

- User `graham.brooks` (created 2023‑09‑18) — member of `Full-Admins`
  (attached policy: `arn:aws:iam::aws:policy/AdministratorAccess`).
- Two long-lived access keys on that user (2023, 2024), both Active. One of
  them is what `hugo deploy` uses locally via the `brooks-security` CLI
  profile.
- No IAM role scoped to the site. No OIDC provider for GitHub.
- Unrelated roles in the account (`havamal-talks*`, `eks-cluster-role`,
  `nautilus-runner`, `workspaces_DefaultRole`, etc.) are for other projects and
  are **not** part of this environment.

The CD rewrite should add:

1. An IAM OIDC provider for `token.actions.githubusercontent.com`.
2. A scoped deploy role trusted by that OIDC provider, restricted by repo and
   branch/tag conditions, with only the permissions needed
   (`s3:*Object`/`s3:ListBucket` on the origin bucket,
   `cloudfront:CreateInvalidation` / `GetInvalidation` on the distribution,
   and `cloudfront:Describe*`/`List*` for `hugo deploy` sync).

---

## 4. Content & deploy flow (today, manual)

1. Author Markdown under `content/` locally.
2. Build: `hugo` (outputs to `public/`, which is gitignored).
3. Deploy: `hugo deploy` — Hugo reads the `[deployment]` block in `hugo.toml`:

   ```toml
   [[deployment.targets]]
     name = "brooks-security"
     URL = "s3://brooks-security.com?region=us-east-1"
     cloudFrontDistributionID = "E1QZQDBCV5WT01"
   ```

   Hugo then:
   - Syncs `public/` → `s3://brooks-security.com/` (uploads changes, deletes
     objects no longer in `public/`).
   - Applies the `[[deployment.matchers]]` rules — images / CSS / JS are
     uploaded with `Cache-Control: max-age=31536000, no-transform, public` and
     gzip enabled.
   - Issues a CloudFront invalidation against distribution `E1QZQDBCV5WT01`.
4. The `brooks-security` AWS CLI profile is what supplies credentials for
   step 3 (`export AWS_PROFILE=brooks-security` or equivalent in `~/.aws/config`).

### Request path in production

1. User hits `https://brooks-security.com/some/page/`.
2. Route 53 alias returns the CloudFront edge IPs.
3. CloudFront terminates TLS with the ACM cert and runs the `hugo`
   viewer-request function, which rewrites `/some/page/` to
   `/some/page/index.html`.
4. Cache miss? CloudFront signs a SigV4 request to the S3 REST endpoint using
   OAC `E1BP7TXJ6IVWD7`.
5. S3 returns the object because the bucket policy allows the CloudFront
   distribution's ARN via the `AWS:SourceArn` condition.
6. CloudFront caches (managed `CachingOptimized` policy) and serves.

---

## 5. Local development

```bash
# one-time: pull the theme submodule
git submodule update --init --recursive

# run locally (with drafts)
hugo server -D

# build for release
hugo
```

Prereqs: recent Hugo (extended build, because the theme uses SCSS), a working
AWS CLI with the `brooks-security` profile, and git.

---

## 6. Known cleanup / tech-debt items

These are safe to address *before or during* the Terraform port:

- **Delete legacy bucket `brooks-security`** — empty, public, unused. Old
  pre-OAC architecture.
- **Delete legacy OAI `E2U5EOA7T2DBV3`** — not referenced by any distribution.
- **Remove the unused S3 website configuration** from
  `brooks-security.com` — CloudFront hits the REST endpoint, so the
  `IndexDocument` setting is a no-op and adds confusion.
- **Turn on S3 versioning + MFA delete?** Worth considering now that deploys
  will be automated; a bad `hugo deploy` with `--delete` semantics would
  currently wipe the bucket with no recovery.
- **Enable CloudFront standard logging** (to a separate, lifecycle-managed
  log bucket) if you want traffic visibility.
- **Rotate or retire the two long-lived IAM access keys** on `graham.brooks`
  once the GitHub OIDC deploy role takes over day-to-day publishing.
- **Unrelated expired `valdyr.io` ACM cert** in us-east-1 can be deleted — not
  this project, but it's the only other thing in the region.

---

## 7. Roadmap: Terraform + GitHub Actions CD

Planned follow-up work (not yet implemented; this README just documents the
current state that the Terraform port needs to match):

1. Write Terraform that reproduces every resource in §3 exactly — same IDs
   where possible, same configuration — then `terraform import` the live
   resources into that state so the first `plan` is a no-op.
2. Add an IAM OIDC provider for GitHub Actions and a scoped deploy role
   (see §3.5).
3. GitHub Actions workflow:
   - On pull request: `terraform fmt`, `terraform validate`,
     `terraform plan` (posted as a PR comment), `hugo --minify` build check.
   - On merge to `main`: `terraform apply`, then `hugo deploy` against
     `s3://brooks-security.com` with a CloudFront invalidation. Both steps
     authenticate via the OIDC-assumed role — no long-lived keys in the repo.

Terraform state should live in a separate bucket (e.g.
`brooks-security-tfstate`) with versioning and a DynamoDB lock table; that
infrastructure does **not** exist today and will be bootstrapped as part of
the port.

---

## 8. Quick reference — resource IDs

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
