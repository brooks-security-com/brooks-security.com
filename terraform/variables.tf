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

# reCAPTCHA Enterprise lives in Google Cloud. The contact Lambda authenticates to
# the Enterprise createAssessment API with a GCP API key (stored in SSM) and the
# project that owns the key (below). There is no classic "secret key".

# GCP project ID (or number) that owns the reCAPTCHA Enterprise key. Not secret;
# the assessment call targets .../v1/projects/<this>/assessments.
variable "recaptcha_project_id" {
  type    = string
  default = "brooks-security-website"
}

# Pre-existing SSM SecureString holding a Google Cloud API key restricted to the
# reCAPTCHA Enterprise API. Read by the contact Lambda at runtime; referenced by
# ARN so its value never enters Terraform state.
variable "recaptcha_api_key_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/api_key"
}

# Pre-existing SSM SecureString holding the reCAPTCHA Enterprise *site* key. Read
# by the Hugo build job (hugo-deploy.yml) and baked into the contact form HTML,
# and by the Lambda at runtime (the assessment event must include it). Public by
# design (it ships to every visitor).
variable "recaptcha_site_key_ssm_param" {
  type    = string
  default = "/brooks-security.com/recaptcha/site_key"
}

# reCAPTCHA minimum score (0.0–1.0) the contact Lambda will accept.
variable "recaptcha_min_score" {
  type    = number
  default = 0.7
}

# --- Subscribe (lead-magnet email capture into a Google Sheet) ---------------
# Authentication to Google is keyless Workload Identity Federation. The subscribe
# Lambda's AWS role (brooks-security-subscribe) federates into GCP and
# impersonates a service account; no service-account key exists. The WIF
# credential config and the spreadsheet id live in pre-existing SSM
# SecureStrings, created out of band (see prerequisites). Referenced by name so
# their values never enter Terraform state.

# Pre-existing SSM SecureString holding the WIF credential config JSON produced
# by `gcloud iam workload-identity-pools create-cred-config --aws`. Not a secret
# (it carries identifiers, not a key), but stored encrypted for consistency.
variable "subscribe_google_cred_config_ssm_param" {
  type    = string
  default = "/brooks-security.com/subscribe/google_cred_config"
}

# Pre-existing SSM SecureString holding the target Google Sheet's spreadsheet id.
variable "subscribe_sheet_id_ssm_param" {
  type    = string
  default = "/brooks-security.com/subscribe/sheet_id"
}

# Pre-existing SSM SecureString holding the Notion integration API key.
variable "subscribe_notion_key_ssm_param" {
  type    = string
  default = "/brooks-security.com/subscribe/notion_key"
}

# Notion Clients database id. New Prospect rows are created here on each form
# submission. This is the database_id (parent.database_id of the Clients data
# source), not the data_source_id. These are distinct UUIDs in the Notion API.
# The data_source_id (b650d9f2-...) is for queries; this id is for page creation.
variable "subscribe_notion_database_id" {
  type    = string
  default = "eb487cb9-8d2b-4fd9-831f-e09099aee25d"
}

