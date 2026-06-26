# Contractor Access and Confidentiality Agreement - Implementation Procedures

> **Companion to:** Contractor Access and Confidentiality Agreement (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Contractor Onboarding Access Setup
### Standard Approach
1. Before any system access is provisioned, confirm that the following prerequisites are complete:
   a. Signed Contractor Access and Confidentiality Agreement on file.
   b. Master Services Agreement (MSA) or Statement of Work (SOW) executed with a defined contract period.
   c. Background check completed (if required by organizational policy or client requirements).
   d. Security awareness training assigned or completed.
2. Create a contractor record in the identity provider (IdP) or HRIS with the following attributes:
   a. Contractor name, company, and contact information.
   b. Contract start date and end date (this drives automatic access expiration).
   c. Manager or organizational sponsor.
   d. Contractor flag/group for policy differentiation.
3. Provision system access based on the principle of least privilege:
   a. The sponsoring manager submits an access request specifying the systems and permissions required, with business justification.
   b. The access request is approved by the system owner or designated approver.
   c. Access is provisioned to the contractor account. Default access is deny-all; only explicitly requested and approved access is granted.
4. Enforce multi-factor authentication (MFA) enrollment at first login. The contractor cannot access any system until MFA is configured.
5. Assign organization-managed equipment where required. If the contractor uses their own equipment (BYOD), ensure endpoint security controls (encryption, endpoint detection, patching) are applied and compliance is verified before access is granted.
6. Log the provisioning event: contractor identity, systems accessed, permissions granted, date of provisioning, and authorizing approvals.
7. Provide the contractor with the Acceptable Use Policy, relevant system-specific policies, and a point of contact for security questions.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Just-in-Time (JIT) access for short engagements:** For contractors engaged for less than 30 days, use JIT access - no standing permissions. Access is requested and approved per session, with automatic revocation after a defined period (e.g., 8 hours). This eliminates the risk of forgotten access revocation.
> - **Vendor-managed identity federation:** If the contractor's organization maintains an identity provider, federate their identities into your systems rather than creating separate accounts. This keeps the contractor's employer responsible for identity lifecycle, and your access revocation is as simple as disabling the federation trust.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Access provisioned before the agreement is signed.** The agreement is a prerequisite, not a parallel activity. System access must be gated on a signed, verified agreement on file. Use an automated check: the IdP provisioning workflow queries the contract management system before creating the account.
> - **Contractor gets the same default access as employees.** Contractor accounts often inherit the same default group memberships as employee accounts, granting access they don't need. Create a distinct "contractor" base role with zero permissions, then grant only what is explicitly requested.
> - **No equipment tracking for contractor-assigned devices.** If the organization issues a laptop to a contractor, it must be tracked in the asset inventory with the contractor's name, contract end date, and expected return date. Without tracking, contractor equipment disappears without consequence.

## Procedure 2: Periodic Contractor Access Review
### Standard Approach
1. Schedule quarterly contractor access reviews. Align with the broader user access review cycle if one exists.
2. Generate a report from the identity provider listing all active contractor accounts, including:
   a. Contractor name and company.
   b. Contract start date and end date.
   c. Systems and permissions held.
   d. Last login date.
   e. Sponsoring manager.
3. For each contractor account:
   a. Verify that the contract is active (current date is within the contract period).
   b. Verify that the permissions held match the current statement of work - remove any access no longer required.
   c. Flag accounts with no login activity in the past 90 days for investigation.
   d. Flag accounts where the contract end date is within the next 30 days for offboarding planning.
4. For accounts that fail review:
   a. Contract expired or not found → Immediately disable the account and notify the sponsoring manager.
   b. Excessive permissions → Revoke unneeded access and document the change.
   c. No login activity → Contact the sponsoring manager to confirm continued need.
5. Document review results: accounts reviewed, issues found, corrective actions taken, and reviewer sign-off.
6. Escalate unresolved issues (manager unresponsive, access not revoked after 5 business days) to the Security Officer.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated access certification via GRC platform:** If using a GRC platform with access certification capabilities, configure a recurring certification campaign for contractor accounts. Managers receive an automated prompt to certify or revoke access. The platform tracks responses and escalates non-responders.
> - **Continuous access monitoring:** Instead of quarterly point-in-time reviews, implement continuous monitoring that alerts when a contractor account deviates from expected patterns: access without an active contract, permissions outside the approved baseline, or activity from unusual locations.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Reviewing accounts but not permissions.** A quarterly review that only confirms "yes, the contractor is still active" without examining what they can access misses the point. Contractors accumulate permissions over time (especially during project transitions). Each review must include a permissions audit.
> - **Manager who doesn't respond.** If the sponsoring manager doesn't respond to a review request, the default action must be access revocation, not "assume it's fine." Define the escalation timeline and default-deny outcome in the review procedure.

## Procedure 3: Contractor Offboarding and Access Revocation
### Standard Approach
1. Trigger offboarding at contract end or early termination:
   a. **Planned end:** The IdP automatically disables the contractor account on the contract end date + 1 day (grace period for transition). Automated notification goes to the sponsoring manager 14 days and 7 days before expiration.
   b. **Early termination:** The sponsoring manager or vendor manager submits an offboarding request. Access is revoked within 4 hours of request submission.
2. Immediate revocation actions (execute in parallel where possible):
   a. Disable the contractor account in the identity provider (this should cascade to all connected systems).
   b. Revoke all API keys, access tokens, and service account credentials associated with the contractor.
   c. Remove the contractor from all distribution lists, shared mailboxes, and collaboration platforms.
   d. Disable VPN and remote access credentials.
   e. Revoke MFA tokens and sessions.
3. Asset recovery:
   a. If the contractor was issued organization equipment, initiate the asset return process. Issue a return shipping label or schedule an in-person return.
   b. If the contractor used their own equipment, verify that organization data has been removed (or invoke remote wipe if the MDM policy permits).
   c. Confirm receipt of all returned assets and update the asset inventory.
4. Data integrity:
   a. Suspend (do not delete) the contractor's email account and cloud storage for a defined hold period (e.g., 30 days) to allow the sponsoring manager to recover any business-critical data.
   b. After the hold period, transfer ownership of any retained business data to the sponsoring manager and delete the contractor's data stores.
5. Exit certification:
   a. Send the contractor an exit certification form: confirmation that all Confidential Material has been returned or securely destroyed, all copies deleted, and no organization data retained.
   b. Require signed return of the exit certification within 10 business days. Escalate non-response to the contracting company.
6. Document offboarding completion: date, actions taken, assets recovered, exit certification received, and any exceptions or follow-up items.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated offboarding orchestration:** For organizations with high contractor volume, use an identity governance platform that orchestrates the full offboarding workflow - revocation, notification, asset tracking, and certification - triggered by a single offboarding event.
> - **Contractor responsible for their own offboarding attestation:** In vendor management platforms, the vendor organization (not the individual contractor) attests that all access has been terminated and all data returned. This shifts legal accountability to the contracting company.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Access that survives account disable.** Disabling the IdP account may not revoke all access: cloud consoles, SaaS tools with local accounts, SSH keys on servers, and shared credentials are all paths that survive IdP disable. Maintain an access inventory per contractor and verify revocation for each system individually.
> - **Contract extension that doesn't update the system.** If a contract is extended but the IdP account expiration date isn't updated, the contractor gets locked out mid-engagement. Build a contract extension workflow that automatically updates the IdP expiration date.
> - **Exit certification never collected.** If the contractor ignores the exit certification request and nobody follows up, the organization has no record that data was returned. At the 10-business-day mark, escalate to the contracting company with a formal notice.
