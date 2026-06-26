# Password and Credential Management - Implementation Procedures

Document Title: Password and Credential Management - Implementation Procedures
Parent Policy: Password Policy (PWD-001)
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

---

## Purpose

This document provides step-by-step procedures for managing authentication credentials across the organization in compliance with the Password Policy. It covers password manager deployment and adoption, initial credential distribution, password rotation (event-driven, not scheduled), compromise response, and service account management - with practical alternatives and common pitfalls.

---

## Standard Approach - Password Manager Deployment and Adoption

### Phase 1: Deploy and Configure the Password Manager

**Step 1 - Select and Provision the Password Manager**

The organization-approved password manager is: `____` (e.g., 1Password, Bitwarden, Keeper, Dashlane). Ensure the deployment covers:

- **Provisioning:** Enterprise licensing for all Personnel. Create the organization account and configure the admin console.
- **SSO Integration:** Integrate the password manager with the organization's SSO provider (SAML 2.0 or OIDC) so Personnel use their existing corporate credentials to unlock the vault, plus a separate master password or biometric for decryption.
- **MFA Enforcement:** Require MFA for all password manager access. The password manager's own MFA must use a phishing-resistant method (FIDO2 hardware key or TOTP) - not SMS.
- **Policy Configuration:** Configure the organizational policy within the password manager to enforce:
 - Minimum generated password length: `____` characters (recommended: 20+)
 - Password breach monitoring: enabled
 - Secure sharing: enabled (with audit logging)

**Step 2 - Roll Out to Personnel**

Phase the rollout:

1. **Pilot Group (Week 1-2):** Deploy to IT and Security teams. Collect feedback, resolve issues, refine documentation.
2. **Early Adopters (Week 3-4):** Deploy to department champions who will assist their colleagues.
3. **Organization-Wide (Week 5-8):** Deploy to all Personnel. Provide:
  - A setup guide (link to internal wiki page: `____`)
  - A 30-minute training session (live or recorded)
  - Office hours for Q&A during the first two weeks
  - A Slack/Teams channel for ongoing support: `#password-manager-help`

**Step 3 - Verify Adoption**

After the rollout window, verify adoption through:

1. **Admin Console Reporting:** Check the password manager's admin dashboard for user activation rates. Target: >`____`% of Personnel activated within `____` weeks.
2. **Credential Count:** Verify that active users have stored credentials. Users with zero stored credentials haven't adopted the tool yet.
3. **Breach Monitoring Enrollment:** Verify users have enabled breach monitoring (if opt-in).
4. **Follow Up:** Directly contact non-adopters (manager escalation if needed). Provide one-on-one assistance for those struggling.

---

### Phase 2: Master Password Setup Guidance

**Step 4 - Guide Personnel on Master Password Creation**

The master password for the password manager is the **single password Personnel must memorize**. Provide this guidance during onboarding and password manager training:

**Do:**
- Create a passphrase: 4-6 unrelated words with spaces (e.g., "correct horse battery staple"). Aim for at least `____` characters.
- Make it memorable but not guessable - avoid personal information, quotes, song lyrics, or common phrases.
- Write it down **exactly once** on the emergency kit provided by the password manager (a printable PDF stored in a secure physical location - not a sticky note on the monitor).

**Don't:**
- Don't use the same passphrase anywhere else.
- Don't store it in a file, email, note app, or any electronic format outside the password manager.
- Don't share it with anyone - including IT, your manager, or the Security team. No legitimate support process will ever ask for your master password.

**Step 5 - Configure Account Recovery**

Ensure Personnel configure the password manager's account recovery options:

- **Emergency Access:** Designate a trusted individual (e.g., manager, team lead) who can request access to the vault if the user is incapacitated. Access is granted after a configurable waiting period (recommended: `____` days) during which the user can deny the request.
- **Recovery Code:** Store the password manager's recovery code in a secure physical location.
- **Admin Recovery:** If the password manager supports admin-initiated account recovery, configure it according to organizational policy. Note: this creates a privileged recovery path that must be strictly controlled and audited.

---

### Phase 3: Credential Distribution and Initial Setup

**Step 6 - Issue Credentials to New Personnel**

When a new employee, contractor, or temporary worker joins:

1. **Create the identity:** Provision accounts in the identity provider (IdP) and HR system. Use the standard onboarding workflow at `____`.
2. **Generate temporary credentials:** A unique, non-guessable temporary password for each initial account. Do NOT use shared or predictable patterns (e.g., "Welcome123", employee number, date of birth). Use the organization's credential generation tool or script:
   ```bash
   # Example: generate a 20-character random temporary password
   openssl rand -base64 20 | tr -d '/+=' | cut -c1-20
   ```
3. **Deliver securely:**
  - **Preferred:** Use the password manager's secure sharing feature. Share the credential item with the user's account (once they've set up their password manager).
  - **Acceptable:** Provide credentials through a secure portal that requires identity verification for first access.
  - **NOT Acceptable:** Unencrypted email, chat message, text message, printed sheet left on desk, verbal communication.
4. **Verify identity:** Before issuing credentials, confirm the recipient is who they claim to be. For remote onboarding, use video call with government ID verification, or a trusted HR representative physically present with the new hire.
5. **Force password change on first use:** Configure all accounts to require a password change at first login.

**Step 7 - Enroll in Password Manager and SSO During Onboarding**

The onboarding workflow should include:

1. Day 1, Hour 1: Personnel set up their password manager account and create their master password.
2. Day 1, Hour 2: Personnel are walked through generating and storing their first credential (usually their SSO password) in the password manager.
3. Day 1, Hours 2-4: As each new system account is provisioned, Personnel replace the temporary password with a password-manager-generated credential. Each credential is stored in the password manager.
4. Day 1, End: Personnel should have zero memorized passwords beyond their master password. All work-related credentials live in the password manager.

**Step 8 - Verify Completion**

The hiring manager or IT onboarding coordinator verifies at the end of Day 1 (or by end of Week 1 for complex environments) that:
- Password manager is installed and activated on all work devices.
- MFA is configured on the password manager and SSO.
- All issued accounts have been converted from temporary to generated passwords.
- The new hire can successfully authenticate to all required systems without needing to type passwords from memory.

---

### Phase 4: Password Rotation and Compromise Response

**Step 9 - Implement Event-Driven (Not Scheduled) Rotation**

Per the policy (aligned with NIST SP 800-63B), passwords are NOT rotated on a fixed schedule. They are rotated only on specific events.

**Scheduled Rotation is Prohibited because:**
- It encourages users to choose weak, predictable passwords or make minor, predictable changes ("Summer2024!" → "Autumn2024!").
- It imposes a cognitive burden that leads to password reuse across systems.
- Research (NIST, NCSC, Microsoft) shows it does not improve security and can degrade it.

**Configure systems to disable mandatory periodic password expiration.** This applies to:
- Active Directory / Entra ID (set `Enforce password history` but `Maximum password age` to 0 or not configured)
- SSO / IdP policies
- Application-local password policies

**Step 10 - Respond to a Suspected Password Compromise**

When a password is suspected of compromise (user report, breach notification, incident finding):

1. **Immediate Action (within minutes):**
  - The affected user changes the password on the affected system immediately using the password manager's password generator.
  - The user checks the password manager for any other accounts using the same password and changes those.
  - The user verifies that MFA methods are intact (hardware keys still possessed, TOTP app still functioning).

2. **Investigation (within hours):**
  - Security reviews account activity logs for the affected account going back `____` days.
  - Look for: logins from unusual IPs, off-hours access, privilege escalation attempts, data export events, configuration changes.
  - If unauthorized activity is found, escalate to a full incident per the Incident Response Policy.

3. **Reporting (within 24 hours):**
  - The user reports the incident to the Security Officer at `____`.
  - Security documents the incident in the ticketing system with: affected account(s), how compromise was discovered, actions taken, and investigation findings.

**Step 11 - Respond to a Publicly Disclosed Breach**

When a service discloses that user credentials may have been compromised (e.g., a public breach announcement):

1. **Identify affected users:** Query the password manager's breach monitoring or cross-reference the breached service against the organization's SSO-integrated application list.
2. **Force credential rotation:** For any users with accounts on the breached service, require immediate password change. If the password manager's breach monitoring flags the credential, the user already has a notification.
3. **Check password reuse:** The password manager should alert if the same password was used on other services. If the password manager doesn't have this data (e.g., credentials stored outside the manager), run a manual check using the password manager's "reused passwords" report.
4. **Review MFA status:** Ensure MFA was enabled on the breached service. If not, treat the incident more seriously - the password alone may have been sufficient for access.

---

### Phase 5: Service Account and API Key Management

**Step 12 - Inventory Service Accounts**

Create and maintain a service account inventory covering:
- Account name, purpose, and owning team
- Systems/services the account authenticates to
- Credential type (password, API key, certificate, token)
- Credential storage location (secrets manager path or vault reference)
- Rotation schedule (if applicable) and last rotation date
- Account owner (individual, not team)

Store the inventory at `____`. Review quarterly.

**Step 13 - Generate and Store Service Account Credentials**

For each service account or machine-to-machine credential:

1. **Generate a strong random credential:** At least `____` characters (recommended: 32+) using the secrets manager's generation function:
   ```bash
   # Example: 64-character random string
   openssl rand -base64 48
   ```
2. **Store in the approved secrets management system** (e.g., HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager). Never in source code, config files, environment variables in plaintext, or a shared spreadsheet.
3. **Configure automated rotation** where the system supports it. For databases, use the secrets manager's rotation Lambda/function. For API keys, use provider APIs to generate new keys on a schedule.
4. **Log access to secrets:** Every retrieval of a service account credential from the secrets manager must be logged and monitored for anomalies.

**Step 14 - Scan for Hardcoded Credentials**

Continuously scan for credentials embedded in source code:

1. **Pre-Commit Hooks:** Configure `git-secrets`, `truffleHog`, or `detect-secrets` as pre-commit hooks to block commits containing potential credentials.
2. **CI/CD Pipeline Scanning:** Run the same scanners in the CI/CD pipeline as a safety net.
3. **Repository Scanning:** Periodically scan the full repository history for credentials that may have been committed before the pre-commit hooks were in place.
4. **Secret Rotation on Exposure:** If a credential is found in source code, rotate it immediately (even if the repository is private - treat the credential as compromised).

---

## Alternative Approaches

### 💡 Alternative 1 - Passwordless (Passkey / FIDO2) First

Move beyond passwords entirely for user-facing authentication. Deploy passkeys (FIDO2 / WebAuthn) as the primary authentication method across all supported applications. Use the password manager as the passkey store.

**Implementation:** For each application that supports WebAuthn, guide Personnel to create a passkey stored in their password manager. The passkey replaces the password - authentication uses biometrics or device PIN, and the private key never leaves the user's device (or password manager vault). The password manager becomes a passkey manager, not just a password manager.

**Trade-off:** Not all applications support passkeys yet (coverage is growing rapidly). Personnel need compatible devices. The transition period requires managing both passwords and passkeys. But for supported applications, the security improvement is dramatic - phishing-resistant, no password to steal or reuse.

### 💡 Alternative 2 - Centralized Secrets Management Only (No Individual Password Manager)

For organizations that can't deploy individual password managers (e.g., highly regulated environments, air-gapped networks, union restrictions), manage all credentials centrally through a secrets management platform with just-in-time (JIT) access. Personnel never see or know passwords - they request temporary, time-limited credentials that are automatically revoked.

**Trade-off:** Higher infrastructure investment. Requires JIT integration with every system. Personnel lose the convenience of a password manager for individual productivity. Only practical in environments where the organization already operates a comprehensive privileged access management (PAM) solution.

### 💡 Alternative 3 - Breach Notification Automation via HIBP Domain Monitoring

Instead of relying solely on the password manager's breach monitoring, register all organizational email domains with Have I Been Pwned (HIBP) domain monitoring. HIBP will notify the security team when any email address on those domains appears in a breach, enabling proactive response before users notice.

**Trade-off:** Requires the security team to monitor and act on HIBP alerts. The alerts are email-level, not credential-level - you'll know an email appeared in a breach but not which password. Combine with password manager breach monitoring for full coverage.

---

## Common Pitfalls

### ⚠️ Pitfall 1 - Writing Down the Master Password Insecurely

**Symptom:** Despite training, Personnel write their master password on a sticky note attached to their monitor, in a plaintext file on their desktop, or in their email drafts "so I don't forget."

**Why It's Dangerous:** The master password protects ALL the user's credentials. If an attacker obtains it (physically or via malware), they gain access to every work account the user has.

**How to Avoid:** During training, explicitly show examples of insecure storage and explain why they're dangerous. Provide the password manager's emergency kit as the one acceptable place to write it down. Conduct periodic clean-desk audits that include checking for written passwords. Use positive reinforcement - make it easy to recover the master password through the password manager's recovery mechanisms so users don't feel they need a backup.

### ⚠️ Pitfall 2 - Password Manager Master Password = SSO Password

**Symptom:** Personnel set their password manager master password to the same value as their SSO/corporate password. "One less thing to remember."

**Why It's Dangerous:** If the SSO password is compromised (phishing, credential stuffing, breach), the attacker now has the keys to the password manager - and thus every credential the user has ever stored. The master password is a single point of failure, and sharing it with another service eliminates its isolation.

**How to Avoid:** Explicitly address this in training: "Your master password must be unique - it must not be used anywhere else, including your corporate SSO." The password manager can't technically enforce this, so it's a training and culture issue. During onboarding, confirm the new hire understands why this is critical.

### ⚠️ Pitfall 3 - "Just Share the Password Quick"

**Symptom:** A team needs shared access to a service (e.g., a social media account, a test environment). Instead of using the password manager's secure sharing feature or provisioning a separate account, someone pastes the password into Slack or sends it via email.

**Why It's Dangerous:** The password is now permanently stored in chat logs and email archives, accessible to anyone with access to those systems - including future employees, IT admins, and potentially attackers who compromise those platforms. There's no way to "un-share" a password sent through chat.

**How to Avoid:** Make the right behavior the easy behavior. Ensure the password manager's sharing feature is well-documented and demonstrated. If a service doesn't support separate accounts and shared access is required, the password manager's sharing feature should be the only approved sharing method. During investigations, if a password is found in chat logs, treat it as a compromise and rotate immediately.

### ⚠️ Pitfall 4 - Hardcoded Credentials in Automation Scripts

**Symptom:** A developer writes a deployment script that needs database credentials. They embed the credentials directly in the script because "it's just a dev environment" or "it's temporary." The script gets committed to the repository, pushed to a shared CI/CD system, and eventually finds its way into logs, artifacts, and backups.

**Why It's Dangerous:** Credentials in source code are a leading cause of security breaches. They're exposed to anyone with repository access, persist in git history even after "removal," and are often discovered by automated scanners run by attackers. "Dev" credentials often have surprising levels of production access.

**How to Avoid:** Never allow credentials in source code, full stop. Use the secrets manager for all environments, including dev. Inject credentials at runtime via the secrets manager API or environment variables populated from the secrets manager (never checked into source). Run pre-commit and CI/CD credential scanners. When a hardcoded credential is found, rotate it immediately and treat it as a security incident.

### ⚠️ Pitfall 5 - Unrotated Service Account Credentials

**Symptom:** Service accounts and API keys were created years ago. Nobody knows who owns them, what they access, or whether they're still needed. They've never been rotated. The person who created them left the organization two years ago.

**Why It's Dangerous:** Unrotated, unowned service credentials are a prime target for attackers. They provide persistent, often privileged access with no human interaction required. If an attacker obtains one, they can operate undetected for months or years. During offboarding, unrevoked service account credentials from departed employees can remain active indefinitely.

**How to Avoid:** The service account inventory must be maintained and reviewed quarterly. Every service account must have an owner (individual, not team) and a rotation schedule. Automate rotation where technically possible. During offboarding, review the service account inventory for credentials created or managed by the departing individual and rotate them. For cloud environments, use IAM credential reports to identify old access keys and force rotation.

---

## Quick Reference: Credential Onboarding Flow

1. [ ] HR creates personnel record → triggers IAM provisioning
2. [ ] IAM creates accounts with unique, non-guessable temporary passwords
3. [ ] Temporary credentials stored securely (password manager share or secure portal)
4. [ ] Personnel verified (in person or video call with ID)
5. [ ] Personnel sets up password manager on Day 1
6. [ ] Personnel creates master password (unique, memorable passphrase, `____`+ characters)
7. [ ] Personnel configures MFA on password manager and SSO
8. [ ] Personnel replaces all temporary passwords with generated credentials
9. [ ] All credentials stored in password manager
10. [ ] Onboarding coordinator verifies completion

---

## Related Documents

- Password Policy (PWD-001)
- Encryption Policy
- System Access Control Policy
- Data Classification Policy
- Acceptable Use Policy

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version - extracted implementation procedures from Password Policy. |
