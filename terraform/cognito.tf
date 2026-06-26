# Cognito User Pool — federation-only auth for grc-tools
# Google and Microsoft as the only identity providers.
# No username/password — Cognito is purely a federation broker.

# SSM parameters for Google and Microsoft OAuth credentials
# Values stored out-of-band via AWS CLI or console; never in Terraform state
data "aws_ssm_parameter" "google_client_id" {
  name = var.google_client_id_ssm_param
}
data "aws_ssm_parameter" "google_client_secret" {
  name = var.google_client_secret_ssm_param
}
data "aws_ssm_parameter" "microsoft_client_id" {
  name = var.microsoft_client_id_ssm_param
}
data "aws_ssm_parameter" "microsoft_client_secret" {
  name = var.microsoft_client_secret_ssm_param
}

resource "aws_cognito_user_pool" "grc_tools" {
  name = "grc-tools"

  # No username/password auth at all
  username_attributes      = []
  auto_verified_attributes = ["email"]

  # Federation-only: email comes from the IdP
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }
  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

# Google identity provider
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.grc_tools.id
  provider_name = "Google"
  provider_type = "Google"

  attribute_mapping = {
    email    = "email"
    name     = "name"
    username = "sub"
  }

  provider_details = {
    authorize_scopes              = "openid email profile"
    client_id                     = data.aws_ssm_parameter.google_client_id.value
    client_secret                 = data.aws_ssm_parameter.google_client_secret.value
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
    token_request_method          = "POST"
    oidc_issuer                   = "https://accounts.google.com"
  }
}

# Microsoft identity provider (personal + Entra ID)
resource "aws_cognito_identity_provider" "microsoft" {
  user_pool_id  = aws_cognito_user_pool.grc_tools.id
  provider_name = "Microsoft"
  provider_type = "OIDC"

  attribute_mapping = {
    email    = "email"
    name     = "name"
    username = "sub"
  }

  provider_details = {
    attributes_request_method = "GET"
    authorize_scopes          = "openid email profile"
    client_id                 = data.aws_ssm_parameter.microsoft_client_id.value
    client_secret             = data.aws_ssm_parameter.microsoft_client_secret.value
    oidc_issuer               = "https://login.microsoftonline.com/common/v2.0"
    attributes_url            = "https://graph.microsoft.com/oidc/userinfo"
  }
}

# App client — auth code grant with PKCE, no client secret needed for SPAs
resource "aws_cognito_user_pool_client" "grc_tools" {
  name            = "grc-tools-client"
  user_pool_id    = aws_cognito_user_pool.grc_tools.id
  generate_secret = false

  callback_urls = [
    "https://${var.domain}/grc-tools/",
    "https://www.${var.domain}/grc-tools/",
    "http://localhost:1313/grc-tools/",
  ]

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["Google", "Microsoft"]

  # No username/password auth flows
  explicit_auth_flows = []
}

# Cognito domain — users see auth.brooks-security.com as the login page
resource "aws_cognito_user_pool_domain" "grc_tools" {
  domain       = "auth.${var.domain}"
  user_pool_id = aws_cognito_user_pool.grc_tools.id
}

# ACM certificate for auth subdomain (used by Cognito, provisioned in us-east-1)
resource "aws_acm_certificate" "auth" {

  domain_name       = "auth.${var.domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Route53 validation record for the auth cert
resource "aws_route53_record" "auth_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.auth.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "auth" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.auth.arn
  validation_record_fqdns = [for r in aws_route53_record.auth_acm_validation : r.fqdn]
}

# Route53 A record for Cognito domain (required for custom domain)
resource "aws_route53_record" "auth_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "auth.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_cognito_user_pool_domain.grc_tools.cloudfront_distribution
    zone_id                = "Z2FDTNDATAQYW2" # Cognito CloudFront zone
    evaluate_target_health = false
  }
}
