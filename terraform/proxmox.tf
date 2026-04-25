data "aws_ssm_parameter" "proxmox_api_url" {
  name = "/proxmox/auth/api_url"
}

data "aws_ssm_parameter" "proxmox_token_id" {
  name            = "/proxmox/auth/token_id"
  with_decryption = true
}

data "aws_ssm_parameter" "proxmox_token_secret" {
  name            = "/proxmox/auth/token_secret"
  with_decryption = true
}
