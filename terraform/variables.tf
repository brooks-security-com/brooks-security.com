variable "domain" {
  type    = string
  default = "brooks-security.com"
}

variable "aws_account_id" {
  type    = string
  default = "570516803292"
}

# AWS CLI profile used by the provider. Defaults to the local dev profile so
# `terraform plan/apply` works without extra flags on Graham's laptop. CI sets
# TF_VAR_aws_profile="" so the provider falls through to the standard
# credential chain (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars).
variable "aws_profile" {
  type    = string
  default = "brooks-security"
}

# --- GitHub contribution-heatmap nightly refresh ----------------------------
variable "github_owner" {
  type    = string
  default = "LittleSeneca"
}

variable "github_repo" {
  type    = string
  default = "brooks-security.com"
}

variable "github_workflow_file" {
  type    = string
  default = "hugo-deploy.yml"
}

# Pre-existing SSM SecureString holding a GitHub PAT (repo + read:user). Lives
# outside this Terraform; referenced by ARN so its value never enters state.
variable "github_token_ssm_param" {
  type    = string
  default = "/github/admin_token"
}

# EventBridge schedule for the nightly heatmap rebuild. 09:00 UTC (~2am PT).
variable "contrib_schedule" {
  type    = string
  default = "cron(0 9 * * ? *)"
}

# --- Contact form -----------------------------------------------------------
# SNS email-subscription endpoint for contact-form submissions. Requires a
# one-time confirmation click after the first apply.
variable "contact_email" {
  type    = string
  default = "graham@brooks-security.com"
}

# The reCAPTCHA key is a reCAPTCHA Enterprise score-based key, but the contact
# Lambda verifies tokens through the legacy `siteverify` endpoint using the key's
# legacy secret. This avoids needing a GCP API key or service account. The
# frontend still uses enterprise.js (an Enterprise key is rejected by classic
# api.js).

# Pre-existing SSM SecureString holding the key's legacy reCAPTCHA secret (the
# "Secret key" in the reCAPTCHA console). Read by the contact Lambda at runtime;
# referenced by ARN so its value never enters Terraform state.
variable "recaptcha_secret_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/secret_key"
}

# Pre-existing SSM SecureString holding the reCAPTCHA *site* key. Read by the Hugo
# build job (hugo-deploy.yml) and baked into the contact form HTML. Public by
# design (it ships to every visitor); kept in SSM to centralize the keys.
variable "recaptcha_site_key_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/site_key"
}

# reCAPTCHA minimum score (0.0–1.0) the contact Lambda will accept.
variable "recaptcha_min_score" {
  type    = number
  default = 0.7
}

