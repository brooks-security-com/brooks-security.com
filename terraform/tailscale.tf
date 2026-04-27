data "aws_ssm_parameter" "tailscale_oauth_client_id" {
  name            = "/tailscale/oauth/client_id"
  with_decryption = true
}

data "aws_ssm_parameter" "tailscale_oauth_client_secret" {
  name            = "/tailscale/oauth/client_secret"
  with_decryption = true
}

# Manages the full tailnet ACL policy. Any manual changes in the admin console
# will be overwritten on the next apply.
resource "tailscale_acl" "main" {
  acl = jsonencode({
    acls = [
      {
        action = "accept"
        src    = ["*"]
        dst    = ["*:*"]
      }
    ]

    ssh = [
      {
        action = "check"
        src    = ["autogroup:member"]
        dst    = ["autogroup:self"]
        users  = ["autogroup:nonroot", "root"]
      }
    ]

    tagOwners = {
      "tag:proxmox"     = ["a.younger.cato@gmail.com"]
      "tag:ci"          = ["a.younger.cato@gmail.com"]
      "tag:code-server" = ["a.younger.cato@gmail.com"]
    }
  })
}
