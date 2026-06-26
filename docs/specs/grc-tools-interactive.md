# grc-tools Interactive Platform — Technical Specification

**Status:** Draft  
**Author:** Graham Brooks  
**Date:** 2026-06-26

## Overview

Transform the grc-tools static documentation into an interactive, gated platform where users track their progress building a governance program. Users authenticate, complete policies and procedures, and see their completion percentage climb from 0 to 100 percent. Session state persists so they can return and resume.

Every component is serverless. The target infrastructure cost is under $1/month at low user volume.

## Architecture

```
User → CloudFront → S3 (brooks-security.com)
                ↓
         Lambda@Edge (auth gate on /grc-tools/*)
                ↓
         Cognito User Pool (Hosted UI for login/signup)
                ↓
         API Gateway (HTTP API) → Lambda → DynamoDB (progress state)
                                   ↓
                              S3 (clients.brooks-security.com — export/backup)
```

### Component Details

**CloudFront distribution** (existing)
- Already serves brooks-security.com via S3 origin
- Add a Lambda@Edge viewer-request trigger on `/grc-tools/*` path pattern
- The Lambda checks for a valid session cookie; if absent, redirects to Cognito Hosted UI

**Cognito User Pool**
- Federation-only: Google (Gmail / Google Workspace) and Microsoft (personal / Entra ID) as the only identity providers. No username/password option. Cognito acts purely as a federation broker — no credentials stored, no password management, no account recovery flows to manage.
- Hosted UI for signin (Google and Microsoft buttons only, no signup form)
- App client configured for authorization code grant with PKCE
- Domain: `auth-brooks-security.auth.us-east-1.amazoncognito.com` (custom domain backed by Cognito)
- User attributes: email (required, mapped from IdP), name (optional, mapped from IdP)
- Post-authentication: redirect back to `/grc-tools/` with a code; Lambda@Edge exchanges it for tokens and sets a session cookie
- Federation setup: one-time app registration in Google Cloud Console and Azure Portal. No ongoing operational cost.
- No password policies to define, no password reset flows to build, no credential breach risk. Users authenticate exclusively through their existing Google or Microsoft accounts.

**Lambda@Edge — Auth Gate**
- Triggers on viewer-request for `/grc-tools/*`
- Checks for `grc_session` cookie containing a signed JWT
- If valid JWT: pass request through to S3 origin
- If no cookie: redirect to Cognito login
- If login callback (code in query string): exchange code for tokens, validate, set cookie, redirect to clean URL
- JWT validation: verify signature against Cognito JWKS, check expiration

**API Gateway — HTTP API**
- Routes:
  - `GET /progress/{userId}` — return progress state
  - `PUT /progress/{userId}` — save progress state
  - `GET /health` — public health check
- Cognito JWT authorizer on all `/progress/*` routes
- CORS configured for brooks-security.com

**Lambda — Progress API**
- Handles CRUD for user progress state
- Reads/writes DynamoDB
- Returns JSON progress objects
- Cold start: under 200ms with Node.js or Python minimal runtime

**DynamoDB — Progress State**
- Table: `grc-tools-progress`
- Partition key: `userId` (Cognito sub UUID)
- Sort key: none (single item per user)
- Attributes:
  - `userId` — Cognito sub
  - `email` — user email
  - `tier` — "startup" | "growth" | "enterprise"
  - `completedPolicies` — array of policy IDs
  - `completedProcedures` — array of procedure IDs
  - `completedGuides` — array of guide IDs
  - `customizations` — map of policy ID → custom values
  - `createdAt` — ISO timestamp
  - `updatedAt` — ISO timestamp
- Billing mode: PAY_PER_REQUEST
- Cost: $0.25 per million read/write units. At low volume, fractional pennies.

**S3 — Client Data Export**
- Bucket: `clients.brooks-security.com`
- Per-user prefix: `clients/{userId}/`
- Exports: completed policy customizations as JSON or rendered markdown
- Static website hosting disabled (private bucket, accessed via pre-signed URLs)
- Lifecycle policy: none (client data persists)

**Client-side JavaScript**
- Minimal vanilla JS (no framework — keeps the Hugo site SPA-free and fast)
- On `/grc-tools/*` pages, reads progress from API and renders completion indicators
- Checkboxes for policy completion that call the Progress API
- Tier selector that filters which policies are shown
- All delivered as a single JS file in `hugo/static/` (cached by CloudFront)

## User Flow

```
1. User visits /grc-tools/
2. Lambda@Edge: no session cookie → redirect to Cognito login
3. User signs up or signs in (Cognito Hosted UI)
4. Redirect back to /grc-tools/?code=xxx
5. Lambda@Edge: exchanges code for tokens, sets cookie, redirects to /grc-tools/
6. User sees personalized roadmap with 0% completion
7. User picks a tier (Startup/Growth/Enterprise)
8. Page shows only policies relevant to their tier
9. User reads a policy, completes the template
10. User checks "done" → PUT /progress/{userId}
11. Completion percentage updates in real time
12. User returns later: session cookie still valid, progress preserved
```

## Cost Analysis

All prices are AWS us-east-1, pay-as-you-go tier.

| Service | Free Tier | Projected Usage | Monthly Cost |
|---------|-----------|----------------|-------------|
| Cognito | 50,000 MAUs free | <100 MAUs initially | $0.00 |
| Lambda@Edge | 1M requests free | <10,000 requests | $0.00 |
| API Gateway HTTP | 1M requests free | <5,000 requests | $0.00 |
| Lambda (Progress API) | 1M requests + 400K GB-seconds free | <5,000 requests | $0.00 |
| DynamoDB | 25 GB + 25 WCU/RCU free | Sub-1MB of data | $0.00 |
| S3 | 5 GB free | Minimal JSON blobs | $0.00 |
| CloudFront | 1 TB free | Within existing distribution | $0.00 |
| Route 53 | Per-hosted-zone charge | 1 zone | $0.50 |
| ACM certificate | Free | 1 cert for auth domain | $0.00 |

**Total projected cost: $0.50/month** (the Route 53 hosted zone)

At 1,000+ active users, costs might reach $2-5/month from CloudFront and data transfer. Still well under the $1 benchmark for the initial user base.

## Security Considerations

**Token handling:**
- JWTs validated against Cognito JWKS on every request
- Access tokens never exposed to client-side JS (HTTP-only cookie)
- ID tokens used only for displaying user info (email, name)
- Refresh tokens handled by Cognito Hosted UI (not custom code)

**Cookie attributes:**
- `HttpOnly` — prevents JS access to access token
- `Secure` — HTTPS only
- `SameSite=Lax` — prevents CSRF on GET requests
- `Path=/grc-tools` — scoped to the gated section
- `Max-Age=24h` — session expires after 24 hours; re-auth via Cognito silent refresh

**API authorization:**
- API Gateway Cognito authorizer validates JWT before invoking Lambda
- Lambda verifies the userId in the JWT matches the requested resource path
- No IAM credentials needed on the client side

**Data isolation:**
- Each user's progress scoped to their Cognito sub
- DynamoDB IAM policy restricts Lambda to only read/write the authenticated user's item
- S3 client data in per-user prefixes, no cross-user access

**Cognito security:**
- MFA optional for users (can be required later)
- Password policy: 8+ characters, require number and special character
- Account recovery: email only
- Advanced security features: off (keeps costs at zero; can enable for suspicious activity detection at $0.015/MAU)

## Implementation Phases

### Phase 1 — Auth Gate (estimated 2-3 days)
- Deploy Cognito User Pool + Hosted UI
- Add custom domain `auth-brooks-security.auth.us-east-1.amazoncognito.com` with ACM certificate
- Deploy Lambda@Edge for viewer-request auth gating
- Test full login/logout flow
- Outcome: visiting `/grc-tools/` redirects to login; authenticated users see the static content

### Phase 2 — Progress API (estimated 2-3 days)
- Create DynamoDB table
- Deploy Lambda function for progress CRUD
- Configure API Gateway HTTP API with Cognito authorizer
- Deploy client-side JS that fetches and displays progress
- Outcome: authenticated users see their completion percentage on the landing page

### Phase 3 — Interactive Features (estimated 3-5 days)
- Add checkboxes to policy pages that update progress
- Implement tier selection (filters policy list to relevant tier)
- Add policy customization save (user fills in template fields, values persist)
- Export completed program as JSON or rendered markdown to S3
- Outcome: users can interactively build and export their governance program

### Phase 4 — Polish (estimated 2-3 days)
- Loading states and error handling in JS
- Password reset and account management flows
- Session refresh (silent re-auth when token expires)
- Admin dashboard (basic user count, popular policies)
- Logging and monitoring (CloudWatch metrics, basic error alerting)

## Data Model

### DynamoDB — grc-tools-progress

```
{
  "userId": "us-east-1:abc123...",       // Cognito sub (partition key)
  "email": "user@example.com",
  "tier": "growth",                        // startup | growth | enterprise
  "completedPolicies": [
    "information-security-policy",
    "acceptable-use-policy",
    "password-policy"
  ],
  "completedProcedures": [
    "isp-procedures",
    "aup-procedures"
  ],
  "completedGuides": [
    "getting-started",
    "log-management"
  ],
  "customizations": {
    "information-security-policy": {
      "organizationName": "Acme Corp",
      "securityOfficer": "Jane Smith",
      "effectiveDate": "2026-07-01"
    }
  },
  "createdAt": "2026-06-26T12:00:00Z",
  "updatedAt": "2026-06-26T14:30:00Z"
}
```

### Completion Calculation

```
TOTAL_POLICIES = {
  "startup": 8,
  "growth": 22,
  "enterprise": 32
}

completionPercent = floor(
  (len(completedPolicies) / TOTAL_POLICIES[tier]) * 100
)

// Guides and procedures contribute bonus percentage above 100%
// (optional — keeps the core metric focused on policies)
``` 

## Session Persistence

Session state is the core value of this feature. A user who logs in, completes five policies, and returns next week must see their five policies completed.

**How it works:**
1. User authenticates via Cognito (email, Google, or Microsoft)
2. Cognito issues JWT tokens (ID, access, refresh)
3. Access token stored in HttpOnly session cookie (`grc_session`) scoped to `/grc-tools`
4. Cookie expires after 24 hours; Cognito refresh tokens last 30 days
5. On return: Lambda@Edge checks cookie. If expired but within Cognito session window, silent re-auth via Cognito token endpoint refreshes the session without user interaction
6. Progress state loaded from DynamoDB by userId (Cognito sub) — same userId regardless of which identity provider was used
7. If the same person logs in via Google on one device and Microsoft on another, Cognito account linking merges them into a single profile with consistent progress

**Failure modes:**
- Expired refresh token: user sees login screen. Progress is intact (keyed by Cognito sub)
- Network error on save: client retries with exponential backoff; last saved state displayed with "unsaved changes" indicator
- DynamoDB throttle: PAY_PER_REQUEST auto-scales; at sub-1000 user volume, throttling effectively impossible

## Decisions to Make

1. **Tier filtering:** Show all policies regardless of tier, with tier recommendations, or filter to only the user's tier? Recommendation: filter to user's tier by default, with a toggle to show all.

2. **Guest access:** Allow unauthenticated browsing of public content (/grc-tools/ overview, guides), gating only the interactive features (progress tracking, policy customization, exports). The landing page and guides should remain open. Federation keeps login friction low: most users already have Google or Microsoft accounts.

3. **Export format:** JSON (structured, machine-readable) or rendered markdown/PDF (human-readable, deliverable to auditors)? Recommendation: both. JSON for API consumers, rendered markdown for human review.

4. **Custom domain for Cognito:** Use `auth-brooks-security.auth.us-east-1.amazoncognito.com` or the default Cognito domain (`brooks-security.auth.us-east-1.amazoncognito.com`)? Recommendation: custom domain for trust and branding. Adds ~$0.50/month for the Route 53 hosted zone.

5. **Account linking:** Should a user who logs in via Google and later via Microsoft have their progress merged? Recommendation: yes, enable Cognito account linking. Progress keyed by Cognito sub, so linked accounts share the same progress.

## Open Questions

- Should the Hugo site include client-side JS inline, or as a separate static asset? Separate file in `hugo/static/grc-tools.js` is cleaner and cacheable.
- How should policy customization work? User fills in a form on the policy page that maps `____` placeholders to their values. Values stored in DynamoDB. "Export" button renders the policy with their values filled in.
- Should users be able to share progress or collaborate? Not in v1. Keep it single-user for now.
