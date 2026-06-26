# System Access Control Policy - Implementation Procedures

> **Companion to:** System Access Control Policy (Template.md)
> **Purpose:** These procedures describe how to implement the access control lifecycle. The policy defines WHAT must be done; this document describes HOW.

---

## Procedure 1: Access Provisioning

### Standard Approach

1. Define role-based access profiles for each job function in the organization. Document each role in ____ (IAM platform / role catalog) with:
  - Role name and description
  - Job functions covered
  - Systems and permission levels granted
  - Business justification
  - Role owner (who approves membership)
2. When a new hire or role change occurs, HR/Manager submits an access request in ____ (ticketing/IAM system) with:
  - Individual's full name and employee/contractor ID
  - Role(s) to be assigned
  - Start date
  - Any special access needs beyond the standard role (with justification)
3. The request is routed for approval:
  - Standard role assignment: Manager approval
  - Privileged access (admin, root, DBA): Manager + System Owner + Security Officer
  - Third-party/contractor: Sponsor (internal) + Security Officer; must include contract end date
4. Identity verification - before access is provisioned:
  - In-person: Government-issued photo ID verified by HR or IT
  - Remote hire: Video call with ID verification, out-of-band confirmation via phone call to known number, or identity verification service
5. IAM team provisions access:
  - Create unique user ID following naming convention (e.g., firstname.lastname for employees, ct-firstname.lastname for contractors)
  - Assign to pre-defined role groups - never assign individual permissions directly unless documented as an exception
  - Set account expiry for contractors and temporary workers
  - Enforce MFA enrollment at first login
6. Before access is activated, the individual must:
  - Acknowledge the Acceptable Use Policy
  - Complete security awareness training (if not already done)
  - Acknowledge confidentiality obligations (Employee Access Agreement or Contractor Access Agreement)
7. Verify the provisioning:
  - IT/IAM confirms all groups, permissions, and expirations are correct
  - Manager confirms the individual can access required resources
  - Document the completed provisioning in the access log
8. Add the provisioning event to the next access review queue.

### Alternative Approaches

> **💡 Why you might choose differently:** Fully automated provisioning from HRIS to IAM is the gold standard but requires integration maturity. Manual provisioning with checklists works at smaller scale; the risk is missed revocations, not missed creations.

- **Alternative A - HRIS-Driven Automation:** Integrate your HR system (BambooHR, Workday) with your IAM platform (Okta, Azure AD) via SCIM. When HR marks someone as hired, the IAM system automatically provisions the birthright role and notifies the manager to approve additional access. Eliminates manual ticket creation.
- **Alternative B - Manager Self-Service Portal:** Instead of a ticketing system, provide managers with an IAM self-service portal where they can request, approve, and review team access. Reduces IT overhead for routine changes but requires managers to understand role definitions.
- **Alternative C - Attribute-Based Access Control (ABAC):** Instead of pre-defined roles, define access policies based on attributes (department, location, project, clearance level). Access is computed dynamically. More flexible, significantly more complex to implement and audit.

### Common Pitfalls

> **⚠️ Watch out:** "Just give them the same access as [coworker]" is how permission creep starts. Person A accumulated 47 permissions over 4 years, and now Person B inherits all of them on day one. Always provision by role, not by copying an existing user.

> **⚠️ Watch out:** Contractor access without an expiration date is a ticking time bomb. The contract ends, nobody tells IT, and six months later the contractor still has VPN access because "they might come back for another project." Every contractor account must have an auto-expiration that requires affirmative renewal.

> **⚠️ Watch out:** Remote identity verification over a video call is trivially spoofed with deepfake technology. For remote hires with access to sensitive systems, invest in an identity verification service (e.g., Onfido, Jumio, or notary-based verification) rather than trusting "I saw their face on Zoom."

---

## Procedure 2: Access Reviews

### Standard Approach

1. Schedule access reviews on a recurring basis:
  - Standard user access: ____ (e.g., quarterly)
  - Privileged access (admin, root, DBA, security roles): ____ (e.g., monthly)
  - Third-party/contractor access: ____ (e.g., monthly)
  - Shared account exceptions: ____ (e.g., monthly)
2. One week before the review window opens, Security Officer sends notification to all reviewers (system owners, managers) with:
  - Review window dates (must complete within ____ days)
  - Link to the review dashboard or report
  - Instructions for certifying, modifying, or revoking access
3. Generate the review report from ____ (IAM platform) for each reviewer's scope:
  - List of users and their access rights
  - Last login date for each system
  - Any privilege escalation events since last review
4. Reviewer actions for each user in their scope:
  - **Certify:** User still needs this access, level is appropriate → no action
  - **Modify:** Access level too high or too low → submit modification request
  - **Revoke:** User no longer needs this access → submit revocation request
  - **Investigate:** Reviewer cannot determine if access is needed → escalate to user's manager
5. Track completion: the Security Officer monitors progress and escalates overdue reviews at ____ days past the deadline.
6. After the review window closes, the Security Officer compiles results:
  - ____ of ____ users reviewed
  - ____ modifications requested
  - ____ revocations requested
  - ____ escalations (manager could not be reached, discrepancy identified)
7. Remediate all modification and revocation requests within ____ business days.
8. Document the review: completed report, actions taken, timeline, any discrepancies found and their resolution. Retain as audit evidence.
9. Review the process itself annually: were deadlines met, were all reviewers engaged, did the review catch any real issues, what can be improved?

### Alternative Approaches

> **💡 Why you might choose differently:** Full manual review of every user's access doesn't scale beyond ~200 users. Automated review with manager certification of exceptions is more practical at scale.

- **Alternative A - Manager Certification with Automated Baselining:** The IAM system automatically certifies access that matches the user's role and hasn't changed since the last review. Managers only need to review exceptions: new access, privilege changes, users with unusual patterns. Reduces reviewer burden by 80%+.
- **Alternative B - Continuous Certification:** Instead of quarterly reviews, the IAM system continuously monitors access against role definitions and flags deviations in real time. Reviewers address exceptions as they occur rather than in a quarterly batch. Higher operational tempo, lower compliance risk.
- **Alternative C - User-Initiated Recertification:** Require users to re-certify their own access quarterly (with manager confirmation for privileged access). Users are more likely to flag access they no longer need than managers are to notice it. Adds user friction.

### Common Pitfalls

> **⚠️ Watch out:** Rubber-stamp reviews - where every access is certified without scrutiny - are worse than no review at all. They create a paper trail that says "everything is fine" while access accumulates unchecked. Random spot-checks by the Security team on a sample of certifications can deter rubber-stamping.

> **⚠️ Watch out:** The access review report shows current access, but the real risk is in the delta: what changed since the last review? Without historical context, a reviewer can't tell if a user quietly accumulated access over the quarter. Include a "changes since last review" column in the report.

> **⚠️ Watch out:** Revocation requests from the review that sit in a queue for weeks defeat the purpose. The SLA for access review remediation should be shorter than the review interval. If you review quarterly but take 60 days to revoke, that's 60 days of unnecessary access.

---

## Procedure 3: Offboarding and Access Revocation

### Standard Approach

#### Voluntary Departure

1. HR notifies IT/Security via ____ (automated integration or ticket) immediately upon receiving a resignation notice. Include:
  - Employee name and ID
  - Last working day
  - Any transition or handoff requirements
  - Whether access should be maintained during a notice period (with business justification)
2. IT/Security creates a termination ticket with a checklist of all access to revoke:
  - User account (SSO/IAM: disable, not delete - retain for audit trail)
  - Email account (forward to manager, then disable after ____ days)
  - VPN/remote access
  - Database accounts
  - Application-specific accounts
  - Cloud console access
  - Shared account passwords the individual knew (rotate these!)
  - Physical access (badge deactivation)
3. Execute revocations on a tiered timeline:
  - **Immediately:** Disable all privileged access (admin, root, DBA) - reduce blast radius
  - **End of last working day:** Disable remaining logical access, deactivate badge
  - **Within ____ business days:** Recover all physical assets (laptop, phone, tokens, keys)
4. Asset recovery:
  - Schedule equipment return (in person or shipping label)
  - Verify all assets are returned against the asset inventory
  - Flag any unreturned assets for follow-up
5. Data transfer from personal equipment (if applicable):
  - If employee used personal equipment, supervise transfer of all organization data to organization-controlled storage
  - Securely wipe organization data from personal equipment with witness verification
  - Monitor for unauthorized bulk data transfers during the notice period
6. Complete the termination checklist - every item must be signed off. File with HR records.
7. After ____ days, review the disabled account: convert to a deleted state or archive per retention policy.

#### Involuntary Termination

1. HR notifies IT/Security BEFORE or SIMULTANEOUSLY with notifying the individual - not after.
2. Execute immediate revocation of ALL access (logical and physical) within ____ minutes of notification.
3. If remote, force-terminate all active sessions (SSO session invalidation, VPN disconnect, RDP/logoff commands).
4. Escort from premises if on-site; badge deactivation at the door.
5. Follow the same asset recovery and checklist process as voluntary termination, accelerated.
6. Post-revocation review within 24 hours: confirm all access is revoked, no active sessions, no backdoor accounts.

#### Role Change

1. Manager submits a role-change ticket in ____ (ticketing system), specifying old role and new role.
2. IT/IAM provisions new role access per the standard provisioning procedure.
3. After new access is verified and working, review old role access:
  - Which permissions from the old role are fully superseded by the new role? → Revoke.
  - Which permissions from the old role are still needed temporarily during transition? → Set expiration (max ____ days).
  - Which permissions from the old role are not in the new role and not needed? → Revoke immediately.
4. The manager certifies the final access state: "Employee no longer has any access from previous role except what was explicitly retained."
5. Flag for the next access review: "Role change - verify no accumulated access."

#### Extended Inactivity

1. Configure automated inactivity detection in ____ (IAM platform):
  - Accounts with no login for ____ (e.g., 90) days: automatically disable and notify manager
  - Accounts disabled for an additional ____ (e.g., 90) days: flag for deletion
2. Before deletion, the Security Officer reviews: any legal holds, any compliance retention requirements, any HR records that indicate expected return (leave of absence, sabbatical).
3. Deletion is logged with: account ID, last active date, approver, deletion date.

### Alternative Approaches

> **💡 Why you might choose differently:** Offboarding is the highest-risk access control event. A disgruntled employee with lingering access during a notice period can cause enormous damage. Some organizations choose zero-notice termination with pay in lieu for high-risk roles.

- **Alternative A - Automated Offboarding Workflow:** HRIS-to-IAM integration detects termination in HR and automatically triggers the full offboarding sequence: disable account, revoke sessions, notify manager, generate asset return labels, schedule badge deactivation. Zero human delay.
- **Alternative B - Immediate Revocation for All Departures:** Even for voluntary departures, revoke all access immediately upon notice and pay out the notice period. Eliminates the risk of a notice-period insider threat. More expensive (pay without work) but eliminates a significant risk window.
- **Alternative C - Graduated Access Reduction:** For long-notice departures (C-suite, key engineers), reduce access in stages: first remove privileged access, then remove customer data access, then remove internal systems, keeping only email until the final day. Allows knowledge transfer while limiting risk.

### Common Pitfalls

> **⚠️ Watch out:** The most common offboarding failure is system accounts that are NOT managed by central IAM. The employee's Okta account is disabled, but their direct MySQL login still works, their AWS IAM user wasn't deactivated, and they have an API key in a secrets manager that nobody remembered. Maintain a comprehensive system inventory cross-referenced with IAM coverage.

> **⚠️ Watch out:** Shared account passwords are "known secrets" after an employee with access departs. If John knew the break-glass root password and John leaves, the password must be rotated IMMEDIATELY. The revocation checklist must include a "rotate all shared credentials this person knew" step.

> **⚠️ Watch out:** "We'll do it tomorrow" is how involuntary termination revocations fail. It takes exactly one breach where a terminated admin still had VPN access to destroy an organization's reputation. Practice involuntary termination drills quarterly - measure the time from HR notification to full access revocation. Target: under ____ minutes.

---

## Procedure 4: Privileged Access Management

### Standard Approach

1. Identify all privileged accounts in the environment:
  - Domain/enterprise admins
  - Root/superuser on servers and databases
  - Cloud platform admin/owner roles
  - Application admin accounts
  - Service accounts with elevated permissions
  - Break-glass emergency accounts
2. Inventory each privileged account in ____ (PAM tool or spreadsheet) with:
  - Account name, system, permission level
  - Account owner
  - Justification for privileged status
  - Review cadence (monthly for human accounts, quarterly for service accounts)
3. Configure Just-in-Time (JIT) access for human privileged accounts:
  - Default state: no standing privileged access
  - Access request: ticket with business justification, scope, time window (max ____ hours)
  - Approval: System Owner + Security Officer
  - Provisioning: temporary group membership or role elevation with auto-expiration
4. Configure Privileged Access Workstations (PAW):
  - All privileged operations must originate from a dedicated, hardened workstation
  - PAWs must not be used for email, web browsing, or non-privileged work
  - PAWs must have enhanced monitoring (session recording, keystroke logging if required by risk assessment)
5. Session management:
  - All privileged sessions must be recorded (commands, output, screen if feasible)
  - Session recordings must be stored in a tamper-proof repository with access controls (only Security team can view)
  - Spot-check ____% of privileged sessions monthly for inappropriate activity
6. Service account management:
  - Service accounts must have the minimum permissions needed for their specific function
  - Service account passwords/keys must be rotated per the credential rotation policy (____ days)
  - Service accounts must not be used for interactive login
  - Monitor service accounts for anomalous behavior (interactive login, unusual commands, off-hours activity)
7. Monthly privileged access review:
  - Security Officer generates privileged access report from PAM tool
  - System owners certify each privileged account: still needed, permissions still appropriate
  - Any uncertified account is disabled after ____ days
  - Document review results

### Alternative Approaches

> **💡 Why you might choose differently:** Full PAM tooling (CyberArk, BeyondTrust, Delinea) is expensive and complex. For smaller organizations, cloud-native tools (Azure PIM, AWS IAM Access Analyzer) or simpler solutions (Teleport, HashiCorp Vault) provide adequate privileged access management without the enterprise price tag.

- **Alternative A - Cloud-Native PAM Only:** Use built-in cloud IAM features: Azure AD Privileged Identity Management (PIM), AWS IAM Roles with max session duration, GCP IAM Recommender. Sufficient if your entire infrastructure is in one cloud.
- **Alternative B - Sudo with Centralized Policy:** For on-prem Linux environments, manage sudo access via centralized sudoers distribution (LDAP sudoers, SSSD, or configuration management). All sudo commands are logged to SIEM. Lighter weight than a full PAM, but harder to audit.
- **Alternative C - No Standing Privileged Access (Zero Standing Privileges):** All privileged access is JIT, all sessions are ephemeral, and privileges are never persistent. The most secure posture, but requires mature automation and may slow down incident response.

### Common Pitfalls

> **⚠️ Watch out:** Service accounts are the forgotten privileged accounts. They're created during system setup, never reviewed, and often have more permissions than any human. A compromised CI/CD service account with cloud admin access can destroy your entire infrastructure. Inventory and right-size service account permissions.

> **⚠️ Watch out:** Break-glass accounts are tricky: they need high privileges for emergencies but must be incredibly hard to abuse. If the break-glass password is in a sticky note on the wall, it's not a break-glass - it's a back door. Store break-glass credentials in a password manager with access alerts, require multi-party approval to retrieve, and rotate after every use.

> **⚠️ Watch out:** Session recording without a review process is security theater. Recording 10,000 privileged sessions per month but reviewing 0 means a malicious admin can do anything and you'll only discover it after the fact - if ever. Commit to reviewing a statistically significant sample or use automated anomaly detection on session logs.

---

## Procedure Quick Reference

| Procedure | Owner | Cadence | Key Artifact |
|-----------|-------|---------|-------------|
| Access Provisioning | ____ / IAM Team | Per request | Access request ticket, provisioning log |
| Access Reviews | ____ / Security Officer | Quarterly (standard), Monthly (privileged) | Access review report, certification records |
| Offboarding & Revocation | ____ / IT + HR | Per departure/change | Termination checklist, revocation confirmation |
| Privileged Access Mgmt | ____ / Security Engineering | Continuous + monthly review | PAM inventory, session recordings, review report |
