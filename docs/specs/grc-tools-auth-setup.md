# grc-tools Auth Gate — Setup Guide

## Prerequisites

Before running `terraform apply`, you need to create OAuth apps in Google Cloud Console and Microsoft Azure Portal.

### 1. Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or use an existing one)
3. Configure the OAuth consent screen:
   - User type: External
   - App name: "GRC Tools"
   - User support email: your email
   - Authorized domains: `brooks-security.com`
   - Scopes: `openid`, `email`, `profile`
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: "grc-tools"
   - Authorized redirect URIs: `https://auth-brooks-security.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
   - Authorized JavaScript origins: `https://brooks-security.com`
5. Copy the Client ID and Client Secret

### 2. Microsoft OAuth App

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. New registration:
   - Name: "GRC Tools"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web → `https://auth-brooks-security.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
3. Copy the Application (client) ID
4. Under "Certificates & secrets", create a new client secret. Copy the value.
5. Under "API permissions", add `openid`, `email`, `profile` (Microsoft Graph, delegated)

### 3. Store credentials in AWS SSM

Run these commands with your production AWS credentials:

```bash
aws ssm put-parameter \
  --name "/brooks-security.com/grc-tools/google_client_id" \
  --value "YOUR_GOOGLE_CLIENT_ID" \
  --type SecureString \
  --overwrite

aws ssm put-parameter \
  --name "/brooks-security.com/grc-tools/google_client_secret" \
  --value "YOUR_GOOGLE_CLIENT_SECRET" \
  --type SecureString \
  --overwrite

aws ssm put-parameter \
  --name "/brooks-security.com/grc-tools/microsoft_client_id" \
  --value "YOUR_MICROSOFT_CLIENT_ID" \
  --type SecureString \
  --overwrite

aws ssm put-parameter \
  --name "/brooks-security.com/grc-tools/microsoft_client_secret" \
  --value "YOUR_MICROSOFT_CLIENT_SECRET" \
  --type SecureString \
  --overwrite
```

### 4. Deploy

```bash
cd terraform
terraform init
terraform plan   # Review changes
terraform apply  # Deploy
```

### 5. Verify

1. Visit `https://brooks-security.com/grc-tools/`
2. You should be redirected to the Cognito login page at `auth-brooks-security.auth.us-east-1.amazoncognito.com`
3. Click "Google" or "Microsoft" to authenticate
4. After authentication, you should be redirected back to `/grc-tools/`
5. The `grc_session` cookie should be set (check browser dev tools → Application → Cookies)

## Architecture

```
User → CloudFront (/grc-tools/*)
         ↓ viewer-request
       Lambda@Edge auth-gate
         ├── valid JWT cookie → pass through to S3
         ├── code in query → exchange for tokens → set cookie → redirect
         └── no auth → redirect to Cognito
                         ↓
                   Cognito Hosted UI (auth-brooks-security.auth.us-east-1.amazoncognito.com)
                         ├── Google OAuth
                         └── Microsoft OAuth
```

## Troubleshooting

**Redirect loop:** Check that the redirect URI in Cognito matches the OAuth app configuration. The Cognito redirect URI is `https://auth-brooks-security.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`.

**JWT validation fails:** Check CloudWatch logs for the Lambda@Edge function (in us-east-1). The function logs token exchange and JWT validation errors.

**Cookie not set:** Lambda@Edge `set-cookie` headers require specific formatting. Check that the function version is published and associated with the CloudFront distribution.
