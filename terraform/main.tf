terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    tailscale = {
      source  = "tailscale/tailscale"
      version = "~> 0.17"
    }
    proxmox = {
      source  = "bpg/proxmox"
      version = "0.104.0"
    }
  }

  # `profile` is intentionally omitted here (partial backend config) so CI can
  # init using env-var AWS credentials. Locally, either export
  # AWS_PROFILE=brooks-security before running terraform, or pass
  # `-backend-config=profile=brooks-security` to `terraform init`.
  backend "s3" {
    bucket         = "brooks-security-tfstate"
    key            = "brooks-security.com/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "brooks-security-tfstate-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  # Null when var.aws_profile is empty so the provider falls through to
  # AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars in CI.
  profile = var.aws_profile != "" ? var.aws_profile : null
}

provider "tailscale" {
  oauth_client_id     = data.aws_ssm_parameter.tailscale_oauth_client_id.value
  oauth_client_secret = data.aws_ssm_parameter.tailscale_oauth_client_secret.value
}

provider "proxmox" {
  endpoint  = data.aws_ssm_parameter.proxmox_api_url.value
  api_token = "${data.aws_ssm_parameter.proxmox_token_id.value}=${data.aws_ssm_parameter.proxmox_token_secret.value}"
  insecure  = true
}
