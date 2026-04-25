data "aws_ssm_parameter" "tailscale_oauth_client_id" {
  name            = "/tailscale/oauth/client_id"
  with_decryption = true
}

data "aws_ssm_parameter" "tailscale_oauth_client_secret" {
  name            = "/tailscale/oauth/client_secret"
  with_decryption = true
}
