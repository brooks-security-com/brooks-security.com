# Spec: Services section + contact form (Lambda + reCAPTCHA v3 + SNS)

**Branch:** `claude/loving-meitner-599625`
**Status:** In design

---

## Overview

Add a discrete **Services** category to the sidebar with three child pages —
**Security Consulting**, **Operations Consulting**, and **Contact Me** — where the
Contact Me page hosts a working contact form.

The site is a static Hugo build on S3 + CloudFront, so the form needs a small
serverless backend. We reuse the patterns already in the repo: a Python 3.12
Lambda (mirroring `contrib-dispatch`), SSM SecureString secrets, and the
existing CloudFront distribution. The form is wired same-origin via a new
`/api/contact` CloudFront behavior pointed at a Lambda Function URL, so there is
**no API Gateway and no CORS** to manage.

Spam is handled with reCAPTCHA v3 (invisible, score-based) plus a honeypot
field and a CloudFront-only shared-secret header. Submissions are delivered to
an **SNS topic** with an email subscription.

### Goals

- New top-level **Services** sidebar section with 3 child pages.
- A functional contact form that emails Graham on submission.
- Bot/spam resistance without user friction.
- Stay inside the existing architecture (Hugo + Terraform + S3/CloudFront +
  Lambda + SSM). No new always-on infra, ~$0 incremental cost.

### Non-goals

- No CRM / ticketing / database persistence (SNS email is the sink).
- No branded HTML email (SNS plain-text is acceptable; SES is a future swap).
- No file uploads.

---

## Architecture

```
Visitor browser
  │  GET https://www.brooks-security.com/docs/services/contact-me/
  ▼
CloudFront ──(default behavior, S3 origin, existing)──▶ S3  (static page + form HTML/JS)
  │
  │  reCAPTCHA v3: grecaptcha.execute() → token
  │  fetch POST  https://www.brooks-security.com/api/contact   (same-origin → no CORS)
  ▼
CloudFront ──(NEW ordered behavior: path "/api/contact")──────────────────┐
   • allowed_methods incl. POST                                            │
   • CachingDisabled + AllViewerExceptHostHeader managed policies          │
   • NO hugo cf-function attached (would mangle the path)                  │
   • custom origin header X-Origin-Secret: <random_password>              │
                                                                          ▼
                                                          Lambda Function URL (authType NONE)
                                                          brooks-security-contact (python3.12)
                                                                          │
                              ┌───────────────────────────────────────────┼───────────────┐
                              ▼                       ▼                     ▼               ▼
                  verify X-Origin-Secret   Google siteverify      SSM GetParameter    SNS Publish
                  (reject direct hits)     (success && action     /brooks-security.com  contact topic
                                            =="contact" &&        /recaptcha/secret_key      │
                                            score >= 0.5)                                     ▼
                                                                                      email subscription
                                                                                      → Graham's inbox
```

Build-time site-key injection (separate flow, at CI build):

```
GitHub Actions "Hugo Build" job
  │ aws ssm get-parameter /brooks-security.com/recaptcha/site_key --with-decryption
  ▼ export HUGO_PARAMS_RECAPTCHASITEKEY=<value>  (>> $GITHUB_ENV)
hugo --minify --gc   →  site key baked into the rendered contact form HTML
```

---

## Components & Changes

### 1. Hugo content — Services section + 3 pages

New directory `hugo/content/docs/Services/`:

| File | Purpose | Frontmatter |
|---|---|---|
| `_index.md` | Section landing; intro + "Contact me" CTA button | `weight: 4`, `bookFlatSection: true`, `title: "Services"` |
| `Security-Consulting.md` | Security consulting offering | `title: "Security Consulting"`, `weight: 1` |
| `Operations-Consulting.md` | Operations consulting offering | `title: "Operations Consulting"`, `weight: 2` |
| `Contact-Me.md` | Contact page; calls the form shortcode | `title: "Contact Me"`, `weight: 3` |

- `weight: 4` slots Services after Curriculum Vitae (2) and Portfolio (3), before
  the Blog (`menu.after`). Trivially adjustable.
- `bookFlatSection: true` matches the Portfolio section so the three children
  render flat in the sidebar tree.
- URLs (Hugo default slugification): `/docs/services/`,
  `/docs/services/security-consulting/`, `/docs/services/operations-consulting/`,
  `/docs/services/contact-me/`.
- `Contact-Me.md` body is intro prose followed by the shortcode call:
  `{{< contact-form >}}`.
- Service-page copy (Security/Operations) is placeholder text for Graham to
  refine; the structure is what's being built here.

### 2. Hugo shortcode — the form

New file `hugo/layouts/shortcodes/contact-form.html`:

- Renders a `<form>` with: `name`, `email`, `subject`, `message`, plus a hidden
  **honeypot** field (e.g. `company`) that real users never fill.
- Reads the public site key from `.Site.Params.recaptchaSiteKey`.
  - If empty (e.g. local `hugo serve` without the env var), render a visible
    dev-mode notice instead of a broken widget, and disable submit.
- Loads reCAPTCHA v3: `https://www.google.com/recaptcha/api.js?render=<siteKey>`.
- On submit (JS):
  1. `grecaptcha.ready()` → `grecaptcha.execute(siteKey, {action: 'contact'})`.
  2. `fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...fields, token}) })`.
  3. Render inline success or error status; clear the form on success.
- All markup inline in the shortcode (Goldmark `unsafe = true` is already set, so
  raw HTML is fine, but a shortcode keeps it isolated and reusable).

### 3. Hugo config + build-time site-key injection

- `hugo/hugo.toml`: add to `[params]`:
  ```toml
  [params]
    BookLogo = 'grahambrooks.png'
    recaptchaSiteKey = ''   # injected at build from SSM via HUGO_PARAMS_RECAPTCHASITEKEY
  ```
  Left empty in the repo because the value lives in SSM. Hugo overrides it from
  the `HUGO_PARAMS_RECAPTCHASITEKEY` env var at build time (Hugo maps
  `HUGO_PARAMS_*` onto `[params]`, case-insensitive).
- `.github/workflows/hugo-deploy.yml` (build job): add a step **before**
  "Hugo Build (minified)", gated on `steps.gate.outputs.run == 'true'`:
  ```yaml
  - name: Inject reCAPTCHA site key
    if: steps.gate.outputs.run == 'true'
    run: |
      KEY="$(aws ssm get-parameter --name /brooks-security.com/recaptcha/site_key \
        --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || true)"
      if [ -z "$KEY" ] || [ "$KEY" = "None" ]; then
        echo "::warning::Could not read recaptcha site_key from SSM; form will render in dev-mode notice"
      else
        echo "HUGO_PARAMS_RECAPTCHASITEKEY=$KEY" >> "$GITHUB_ENV"
      fi
  ```
  The deploy job does **not** rebuild (it restores the `hugo-public` artifact and
  runs `hugo deploy`), so only the build job needs the key.

> **Note on the site key being a SecureString:** a reCAPTCHA *site* key is public
> by design (it ships in the page HTML to every visitor). Storing it in SSM is
> fine and keeps both keys centralized, but it provides no secrecy benefit — the
> only thing that must stay secret is the *secret* key, which is never exposed to
> the browser.

### 4. Styling

Extend `hugo/assets/_custom.scss` with:
- `.contact-form` layout (stacked fields, spacing) using the theme's CSS vars
  (`--gray-100`, `--gray-200`, etc.) for light/dark consistency.
- A primary button style for submit + the `_index.md` "Contact me" CTA.
- `.contact-status` success/error message states.
- Honeypot field hidden via off-screen positioning (not `display:none`, which
  some bots skip).

### 5. Terraform — new file `terraform/contact.tf`

Mirrors `lambda.tf` conventions.

**Lambda execution role + policy** (`aws_iam_role` + `aws_iam_role_policy`):
- Logs (`logs:CreateLogGroup/CreateLogStream/PutLogEvents` on
  `arn:aws:logs:*:${var.aws_account_id}:*`).
- `ssm:GetParameter` on
  `arn:aws:ssm:us-east-1:${var.aws_account_id}:parameter${var.recaptcha_secret_ssm_param}`.
- `kms:Decrypt` with `Condition kms:ViaService = ssm.us-east-1.amazonaws.com`
  (same scoped pattern as contrib-dispatch).
- `sns:Publish` on `aws_sns_topic.contact.arn`.

**Lambda function** (`aws_lambda_function`):
- `function_name = "brooks-security-contact"`, `runtime = python3.12`,
  `handler = index.handler`, `timeout = 10`.
- Source `terraform/files/contact/index.py`, zipped via `archive_file`
  (boto3-only, no bundled deps).
- Env vars:
  | Var | Value |
  |---|---|
  | `RECAPTCHA_SSM_PARAM` | `var.recaptcha_secret_ssm_param` |
  | `RECAPTCHA_MIN_SCORE` | `var.recaptcha_min_score` |
  | `SNS_TOPIC_ARN` | `aws_sns_topic.contact.arn` |
  | `ORIGIN_SECRET` | `random_password.contact_origin.result` |

**Function URL** (`aws_lambda_function_url`):
- `authorization_type = "NONE"` (locked down by the shared-secret header check,
  not by IAM — keeps CloudFront wiring simple).
- No CORS block needed (same-origin via CloudFront).
- Requires an `aws_lambda_permission` (`action = lambda:InvokeFunctionUrl`,
  `principal = "*"`, `function_url_auth_type = "NONE"`) — Terraform does not add
  this automatically the way the console does.

**CloudWatch log group** (`aws_cloudwatch_log_group`): `retention_in_days = 14`.

**Shared secret** (`random_password.contact_origin`): 32+ chars, no special chars
that complicate header values. Lives only in TF state (encrypted S3 backend).

**SNS**:
- `aws_sns_topic.contact` — `name = "brooks-security-contact"`.
- `aws_sns_topic_subscription.contact_email` — `protocol = "email"`,
  `endpoint = var.contact_email`. (Email subs require a one-time manual
  confirmation click — see Manual Steps.)

### 6. CloudFront — edits to `terraform/cloudfront.tf`

- **Second origin** for the Lambda Function URL:
  ```hcl
  origin {
    origin_id   = "contact-lambda"
    domain_name = replace(replace(aws_lambda_function_url.contact.function_url, "https://", ""), "/", "")
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    custom_header {
      name  = "X-Origin-Secret"
      value = random_password.contact_origin.result
    }
  }
  ```
- **Ordered cache behavior** for `path_pattern = "/api/contact"`:
  - `target_origin_id = "contact-lambda"`
  - `viewer_protocol_policy = "redirect-to-https"`
  - `allowed_methods = ["GET","HEAD","OPTIONS","PUT","POST","PATCH","DELETE"]`,
    `cached_methods = ["GET","HEAD"]`
  - `cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"` (CachingDisabled, AWS-managed)
  - `origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"` (AllViewerExceptHostHeader, AWS-managed)
  - **No** `function_association` (the hugo pretty-URL rewrite must not touch `/api/*`).

> Editing the distribution triggers a ~few-minute CloudFront propagation on
> apply. Expected, not downtime.

### 7. Terraform variables — `terraform/variables.tf`

```hcl
variable "contact_email" {
  type    = string
  default = "graham@brooks-security.com"
}

variable "recaptcha_secret_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/secret_key"
}

variable "recaptcha_site_key_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/site_key"
}

variable "recaptcha_min_score" {
  type    = number
  default = 0.7
}
```

### 8. IAM — future OIDC deploy role (`terraform/iam.tf`)

The build currently runs with static admin keys (so SSM reads already work). For
the planned OIDC cutover, add to `aws_iam_role_policy.github_deploy` a statement
granting `ssm:GetParameter` on the **site_key** param + `kms:Decrypt`
(`kms:ViaService = ssm`), so the build step in §3 keeps working post-cutover.
Documented here so it isn't forgotten; harmless to add now.

---

## Lambda handler contract (`terraform/files/contact/index.py`)

**Request** (POST JSON body from the form):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Consulting inquiry",
  "message": "…",
  "company": "",          // honeypot — must be empty
  "token": "<recaptcha v3 token>"
}
```

**Handler logic:**
1. Read `X-Origin-Secret` header; if it != `ORIGIN_SECRET`, return `403`
   (blocks direct Function-URL hits that bypass CloudFront).
2. Parse body (handle `isBase64Encoded`). Reject malformed JSON → `400`.
3. If honeypot `company` is non-empty → return `200 {ok:true}` silently (drop;
   don't tip off bots).
4. Validate required fields (`name`, `email`, `message`, `token`); basic email
   shape check → `400` on failure.
5. `siteverify`: POST `secret` + `response=token` to
   `https://www.google.com/recaptcha/api/siteverify`. Require
   `success == true && action == "contact" && score >= RECAPTCHA_MIN_SCORE`,
   else `400`.
6. `sns:Publish` with a formatted subject/body. On AWS error → `502`.
7. Return `200 {ok:true}` with `Content-Type: application/json`.

- boto3 ships in the Lambda runtime; HTTP via `urllib` (no bundled deps), same as
  contrib-dispatch.
- Secret key fetched from SSM with `WithDecryption=True`; cache in a
  module-level global across warm invocations.

**Response codes:** `200` ok / `400` validation or low score / `403` bad origin
secret / `502` SNS failure.

---

## Secrets & SSM

| Param (SecureString) | Created by | Read by | Exposure |
|---|---|---|---|
| `/brooks-security.com/recaptcha/secret_key` | Graham (done) | contact Lambda at runtime | server-only, never in browser |
| `/brooks-security.com/recaptcha/site_key` | Graham (done) | CI build job (injected as Hugo param) | public (ships in page HTML) |
| `X-Origin-Secret` value | `random_password` (TF) | CloudFront origin header + Lambda env | never in browser |

---

## Security considerations

- **Layered spam defense:** reCAPTCHA v3 score gate + honeypot + same-origin only
  via CloudFront shared-secret header.
- **Function URL hardening:** `authType NONE` is acceptable because every request
  is validated against `X-Origin-Secret`; direct invocations (which lack the
  CloudFront-injected header) get `403`.
- **Least-privilege IAM:** Lambda can only read the one SSM param, decrypt via
  SSM, write its own logs, and publish to the one SNS topic — same posture as
  contrib-dispatch.
- **No secret leakage to state beyond the backend:** the only TF-generated secret
  is `random_password`, which lives in the already-encrypted S3 state backend.
- **Abuse ceiling:** consider a future per-IP rate check; for a personal site the
  reCAPTCHA gate is sufficient initially.

---

## Manual steps (Graham)

1. ✅ **Done** — reCAPTCHA v3 keys created and stored in SSM
   (`/brooks-security.com/recaptcha/secret_key`, `.../site_key`).
2. **Ensure `graham@brooks-security.com` can receive mail** — this is the SNS
   subscription endpoint (`var.contact_email`). The address must accept the AWS
   confirmation email in step 4.
3. **Merge the PR** → `infrastructure.yml` runs `terraform apply` (behind the
   `production` approval gate) creating the Lambda, Function URL, SNS topic, and
   CloudFront behavior; `hugo-deploy.yml` rebuilds + ships the pages.
4. **Confirm the SNS email subscription** — AWS sends a confirmation email after
   the first apply; click the link or the topic stays unconfirmed and no mail
   flows.
5. **Verify the reCAPTCHA domain registration** in Google's admin console
   includes `brooks-security.com` and `www.brooks-security.com`.

---

## Cost

- Lambda: a handful of invocations/month → effectively free.
- SNS: pennies per thousand emails → free at this volume.
- CloudFront: form POSTs are negligible additional requests.
- **Net incremental: ~$0/month.**

---

## Testing plan

1. **Local:** `hugo serve` with `HUGO_PARAMS_RECAPTCHASITEKEY` exported → form
   renders; without it → dev-mode notice shows.
2. **reCAPTCHA reject:** force a low score / missing token → `400`, friendly
   inline error.
3. **Honeypot:** populate `company` → silent `200`, no SNS publish (check logs).
4. **Direct Function URL hit** (no `X-Origin-Secret`) → `403`.
5. **Happy path:** real submission → `200`, email arrives at `contact_email`.
6. **CORS sanity:** confirm no preflight (same-origin) in browser devtools.

---

## Open questions / decisions

1. **Delivery inbox** — `graham@brooks-security.com` (decided; separate business
   from AvatarFleet). Confirm this mailbox exists / can receive the SNS
   confirmation email.
2. **Section weight** — `Services` at `weight: 4` (after Portfolio). Bump lower if
   you want it more prominent in the sidebar.
3. **Service-page copy** — placeholder text shipped; Graham to refine wording for
   Security Consulting / Operations Consulting.
4. **Min score** — `0.7` (decided). Lower toward `0.5` if legit submissions get
   blocked; raise if spam slips through.

---

## File manifest

**New:**
- `hugo/content/docs/Services/_index.md`
- `hugo/content/docs/Services/Security-Consulting.md`
- `hugo/content/docs/Services/Operations-Consulting.md`
- `hugo/content/docs/Services/Contact-Me.md`
- `hugo/layouts/shortcodes/contact-form.html`
- `terraform/contact.tf`
- `terraform/files/contact/index.py`

**Edited:**
- `hugo/hugo.toml` (params: `recaptchaSiteKey`)
- `hugo/assets/_custom.scss` (form + button + status styles)
- `terraform/cloudfront.tf` (Lambda origin + `/api/contact` behavior)
- `terraform/variables.tf` (4 new vars)
- `terraform/iam.tf` (OIDC deploy role: SSM read on site_key — for future cutover)
- `.github/workflows/hugo-deploy.yml` (build job: inject site key from SSM)
