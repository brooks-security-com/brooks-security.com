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
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
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
