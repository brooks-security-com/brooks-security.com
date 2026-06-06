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

