# Vendor Management - Implementation Procedures

> **Companion to:** Vendor Management Policy (Template.md)
> **Purpose:** These procedures describe how to execute the vendor risk assessment, onboarding, access management, and offboarding requirements set forth in the Vendor Management Policy. The policy defines WHAT must be done; this document describes HOW to do it.

---

## Procedure 1: Vendor Risk Assessment Execution

### Standard Approach

This procedure covers the end-to-end assessment of a new vendor before engagement.

#### 1.1 Intake and Triage

1. **Assessment Request:** The business owner or system owner submits a vendor assessment request via `____` (procurement system, Jira form, or service desk). Request must include:
  - Vendor name, website, and primary contact.
  - Service description and business purpose.
  - Data types the vendor will access, store, or process (classified per Data Classification Policy).
  - Access method: API, VPN, SSO, shared credentials, physical access?
  - Estimated annual spend and contract term.
  - Urgency: when is the vendor needed?
2. **Initial Triage:** The Vendor Management Office / Security team reviews the request within `____` business days and assigns a risk tier:
  - **High:** Vendor accesses Restricted or Confidential data, OR failure has critical business impact. → Proceed to 1.2.
  - **Medium:** Vendor may access Internal data; moderate impact. → Proceed to 1.3.
  - **Low:** No organizational data access; minimal impact. → Proceed to 1.5.

#### 1.2 High-Risk Vendor Assessment

1. **Security Documentation Request:** Send the vendor a formal request for:
  - Most recent SOC 2 Type II report (dated within last `____` months, recommended: 12 months) or ISO 27001 certificate.
  - If no independent audit exists: completed SIG questionnaire (Standard Information Gathering) or CAIQ (Consensus Assessments Initiative Questionnaire).
  - Written information security policy and incident response plan.
  - Data flow diagram showing where organizational data will be stored, processed, and transmitted, including geographic locations and sub-processors.
  - Evidence of background checks for personnel accessing organizational systems/data.
2. **Document Review:** The Security team evaluates:
  - **SOC 2 Report:** Review the auditor's opinion (unqualified = good). Check the scope (does it cover the services you're using?). Review control exceptions - any exception in the Security or Availability criteria is a red flag.
  - **ISO 27001 Certificate:** Verify the certificate is current, check the scope statement, and look up the certificate on the certification body's registry.
  - **SIG/CAIQ Responses:** Score responses using a predefined rubric. Flag any response indicating lack of encryption, lack of MFA, lack of incident response testing, or data stored in non-approved jurisdictions.
3. **Risk Rating:** Based on the review, assign a vendor risk rating: Low Risk, Moderate Risk, High Risk, or Unacceptable. Document the rationale.
  - **Moderate Risk or higher:** Identify compensating controls or additional contractual requirements.
  - **Unacceptable Risk:** Deny the engagement and notify the business owner.

#### 1.3 Medium-Risk Vendor Assessment

1. **Security Questionnaire:** Send a standardized, lightweight questionnaire (SIG-Lite or custom). Key questions:
  - Do you encrypt data at rest and in transit? (Must be: Yes)
  - Do you enforce MFA for all users? (Must be: Yes)
  - Do you have an incident response plan? (Must be: Yes)
  - Do you perform background checks on employees? (Must be: Yes)
  - Where is organizational data stored? (Must be: Approved jurisdictions only)
  - Do you have cyber insurance? (If handling any sensitive data)
2. **Review and Decision:**
  - Any "No" to a critical question: escalate to a fuller review or require compensating controls.
  - All critical questions answered acceptably: approve with standard security terms in the contract.

#### 1.4 Technical Assessment (Optional, for High-Risk)

For vendors with direct network/system access or processing Highly Confidential data:

1. **External Security Scan:** Run a passive vulnerability scan against the vendor's public-facing infrastructure (with written permission).
2. **Penetration Test Review:** Request the vendor's most recent penetration test report. If vendor hasn't had one, consider conducting a limited-scope test against the integration points.
3. **Architecture Review:** Review how the vendor connects to organizational systems. Ensure the integration follows least privilege and defense-in-depth principles.

#### 1.5 Low-Risk Vendor Assessment

1. **Brief Review:** Confirm the vendor's risk tier classification is accurate. Verify:
  - Does the vendor truly have no access to organizational data?
  - Is the service properly isolated?
2. **Documentation:** Record the vendor name, service description, risk tier, and assessment date in the vendor inventory. No formal questionnaire required.

#### 1.6 Assessment Documentation

All assessment records must be maintained for the duration of the vendor relationship plus `____` years (recommended: 3 years after offboarding). Records include:
- Completed questionnaires and responses.
- Reviewed audit reports (store a copy, not just a link that may expire).
- Risk assessment decision and rationale.
- Any exceptions or compensating controls.
- Approvals.

### Alternative Approaches

> **💡 Why you might choose differently:** Assessment depth should scale with risk, not be one-size-fits-all.

- **Shared Assessments / Standardized Questionnaires:** Join the Shared Assessments Program or use the Standardized Information Gathering (SIG) questionnaire to reduce redundant assessment work. If every customer sends your organization a different questionnaire, the same friction applies to your vendors. Encourage use of standardized assessments.
- **Third-Party Risk Management Platform:** For organizations with many vendors (>50), use a TPRM platform (e.g., OneTrust, BitSight, SecurityScorecard, UpGuard) to automate risk tiering, questionnaire distribution, and continuous monitoring. Reduces manual effort but requires budget and configuration.
- **Audit Report Reliance:** For vendors with a current SOC 2 or ISO 27001 from a reputable auditor, rely primarily on the audit report rather than issuing a separate questionnaire. The audit report is more comprehensive and independently verified.

### Common Pitfalls

> **⚠️ Watch out:** Accepting a SOC 2 report without reading it. "They have a SOC 2" is not enough. Read the scope (does it cover the service you're using?), the opinion (qualified is bad), and the control exceptions. A vendor with a SOC 2 that has 5 exceptions in the security section is not equivalent to one with a clean report.

> **⚠️ Watch out:** Assessment that happens once and is never revisited. Vendors change their infrastructure, get acquired, or have security incidents. Re-assess High-risk vendors annually and Medium-risk vendors biennially. Subscribe to security news alerts for all critical vendors.

> **⚠️ Watch out:** Forgetting about the vendor's vendors (fourth-party risk). Your cloud provider uses other providers. Your SaaS vendor uses AWS. Ask vendors to disclose their critical sub-processors and verify that those sub-processors meet equivalent security standards.

---

## Procedure 2: Vendor Onboarding

### Standard Approach

This procedure covers the steps to bring an assessed and approved vendor into the operational environment.

#### 2.1 Contract Finalization

1. **Security Terms Review:** Legal and Security must review the vendor contract before signing. Verify inclusion of:
  - [ ] Data security obligations (vendor responsible for security of organizational data).
  - [ ] Compliance with applicable laws and organizational security requirements.
  - [ ] Confidentiality provisions, including return/destruction upon termination.
  - [ ] Incident notification requirement: within `____` hours (24-48) of confirmed security incident.
  - [ ] Subcontractor disclosure and flow-down of security requirements.
  - [ ] Audit rights: organization's right to audit vendor compliance (or rely on third-party audit reports).
  - [ ] Data location: geographic restrictions on data storage/processing.
  - [ ] Data return/destruction: timelines and procedures upon termination.
  - [ ] Right to terminate for security failures.
  - [ ] For High-risk: independent review requirements, SLAs, background check attestation.
  - [ ] For cloud services: shared responsibility model definition, advance notification of substantive changes, exit strategy.
2. **Contract Signing:** No vendor access may be granted before the contract is fully executed. This includes "trial" or "pilot" access.

#### 2.2 Vendor Access Provisioning

1. **Access Request:** The business owner submits a vendor access request via `____` (IT service desk). Specify:
  - Vendor contact(s) requiring access.
  - Systems/resources they need access to.
  - Required access level (read, write, admin).
  - Contract start and end dates.
2. **Access Configuration:**
  - Create dedicated vendor accounts (not shared accounts). Username format: `vnd-[vendor]-[name]` (e.g., `vnd-acme-johns`).
  - Apply least privilege: grant access only to the specific resources required. For cloud access, use IAM roles with resource-level restrictions. For application access, use role-based access control.
  - Configure time-bound access: set account expiration to the contract end date + `____` days buffer.
  - Enable MFA on all vendor accounts. Require phishing-resistant MFA (FIDO2/WebAuthn or hardware token) for High-risk vendor access.
  - Configure just-in-time (JIT) access where possible: vendor requests temporary elevated access, approved by the business owner, and automatically revoked after a set duration.
3. **Access Verification:**
  - Verify the vendor can access ONLY the intended resources.
  - Verify the vendor CANNOT access resources outside scope (negative testing).
  - Document the access configuration in the vendor inventory.

#### 2.3 Vendor Onboarding Checklist

A standardized checklist ensures consistency. Complete and document each item:

- [ ] Vendor risk assessment completed and approved.
- [ ] Contract executed with required security terms.
- [ ] Vendor contact information registered in vendor inventory.
- [ ] Vendor accounts created with least privilege and MFA.
- [ ] Access verified (positive and negative testing).
- [ ] Vendor security documentation filed (SOC 2, ISO 27001, questionnaire responses).
- [ ] Business owner trained on vendor management responsibilities.
- [ ] Vendor provided with organizational security requirements (Acceptable Use Policy, data handling requirements).
- [ ] Monitoring/logging enabled for vendor access.
- [ ] Vendor offboarding procedure communicated to business owner (who triggers it, timelines).

### Alternative Approaches

> **💡 Why you might choose differently:** Integration architecture dictates access method.

- **Vendor Access via API Gateway:** Instead of giving vendors direct system access, expose a controlled API through an API gateway with rate limiting, authentication, and logging. This limits the blast radius if the vendor is compromised.
- **Vendor Access via Dedicated Tenant/Environment:** For vendors that need broader access (e.g., managed service providers), provision a dedicated environment (separate AWS account, separate Kubernetes namespace) with cross-account/cross-namespace access controls. This provides strong isolation.
- **Vendor-Managed Credentials (PAM):** For High-risk vendors needing privileged access, use a Privileged Access Management (PAM) solution (e.g., CyberArk, Delinea, Teleport) that proxies, records, and time-limits all vendor sessions.

### Common Pitfalls

> **⚠️ Watch out:** Vendor access that is never reviewed. A vendor who finished their project 6 months ago still has active access. Configure automatic access reviews: quarterly for High-risk vendors, semi-annually for Medium-risk. The business owner must re-certify that access is still needed.

> **⚠️ Watch out:** Shared vendor accounts. "The Acme team shares the 'acme-admin' account." This eliminates individual accountability. If a security incident originates from a shared account, you can't determine which individual was responsible. Require individual accounts for all vendor personnel.

> **⚠️ Watch out:** "Temporary" vendor access that becomes permanent during a crisis. "The vendor needed admin access to fix an issue over the weekend." If you must grant emergency access, set a hard expiration (24 hours) and require re-approval. Flag all emergency access grants in the next vendor access review.

---

## Procedure 3: Vendor Access Control and Monitoring

### Standard Approach

#### 3.1 Access Review Process

1. **Review Schedule:**
  - High-risk vendor access: quarterly.
  - Medium-risk vendor access: semi-annually.
  - Low-risk vendor access: annually.
2. **Review Execution:**
  - Generate an access report from IAM, application access controls, and VPN: all vendor accounts and their permissions.
  - Send to each business owner: "Here are the vendor accounts for your vendors. Please confirm each is still needed with the current access level."
  - Business owner responds within `____` business days. Non-response is escalated to their manager.
  - If access is no longer needed: initiate offboarding (Procedure 4).
3. **Review Documentation:** Record the review date, reviewer, and decisions in the vendor inventory.

#### 3.2 Vendor Activity Monitoring

1. **Logging:**
  - Enable logging for all vendor access: cloud API calls (CloudTrail/Activity Log), application access logs, VPN session logs, database query logs.
  - Forward vendor-specific logs to a dedicated dashboard or report.
2. **Alert Rules:**
  - Vendor activity outside business hours (unless pre-authorized for 24/7 support).
  - Vendor accessing resources outside their approved scope.
  - Vendor account used from an unexpected geography.
  - Vendor performing privileged actions (IAM changes, security group modifications, data exports).
  - Vendor account with no activity for > `____` days (dormant - revoke).
3. **Monthly Review:** Security team reviews vendor activity logs monthly. Flag anomalies for investigation.

### Common Pitfalls

> **⚠️ Watch out:** Vendor access reviews that are rubber-stamped. "Yeah, looks fine" without actually reviewing each account. Require business owners to explicitly confirm each vendor account by name. If the business owner doesn't recognize a vendor account, it gets disabled pending investigation.

> **⚠️ Watch out:** Logging vendor access but never reviewing the logs. Vendor activity monitoring that produces terabytes of logs and zero alerts is security theater. Configure specific, high-signal alert rules and assign a person to review them.

---

## Procedure 4: Vendor Offboarding

### Standard Approach

#### 4.1 Offboarding Trigger

Offboarding is triggered by:
- Contract expiration or termination.
- Business owner request.
- Security incident involving the vendor.
- Vendor risk re-assessment resulting in "Unacceptable" rating.

#### 4.2 Offboarding Execution

1. **Access Revocation (within `____` business day, recommended: 1):**
  - Disable/delete all vendor user accounts (IAM, SSO, application accounts, VPN accounts).
  - Revoke API keys, OAuth tokens, and service account credentials.
  - Rotate any shared credentials the vendor had access to.
  - Remove vendor from security groups, distribution lists, and shared drives.
2. **Data Return and Destruction:**
  - Send formal written notice to vendor: all organizational data must be returned or securely destroyed within `____` days (recommended: 30 days).
  - Vendor must provide written certification of data return/destruction.
  - If vendor fails to certify within the deadline, escalate to Legal.
3. **Asset Recovery:**
  - Retrieve any organizational assets provided to the vendor (laptops, hardware tokens, access badges).
4. **Integration Cleanup:**
  - Deactivate vendor-specific API integrations, webhooks, and data feeds.
  - Remove vendor-specific firewall rules and network ACLs.
5. **Vendor Inventory Update:**
  - Update the vendor inventory: mark vendor as "Offboarded" with date, record data destruction certification, archive security documentation.

### Common Pitfalls

> **⚠️ Watch out:** Offboarding the vendor's primary accounts but forgetting about secondary access - the vendor's "backup admin account," the API key in a config file, the SSH key on a jump host. Use an access management tool that can enumerate ALL access paths for a vendor, not just the obvious ones.

> **⚠️ Watch out:** Assuming the vendor deleted your data without verification. A written certification is good; audit evidence is better. For High-risk vendors, consider a remote verification session (screen share of the deletion) or contractual right to audit data deletion.

---

## Related Documents

- Vendor Management Policy (Template.md)
- Data Classification Policy (../Data-Classification-Policy/Template.md)
- System Access Control Policy (../System-Access-Control-Policy/Template.md)
- Incident Response Policy (../Incident-Response-Policy/IR-Policy-Template.md)
- Information Security Policy (../Information-Security-Policy/ISP-Template.md)
