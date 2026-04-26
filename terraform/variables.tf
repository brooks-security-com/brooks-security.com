variable "domain" {
  type    = string
  default = "brooks-security.com"
}

variable "sso_portal_subdomain" {
  type        = string
  description = "Custom IAM Identity Center portal subdomain (the 'xyz' in xyz.awsapps.com/start). Leave null to use the default identity_store_id."
  default     = "brooks-security"
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

