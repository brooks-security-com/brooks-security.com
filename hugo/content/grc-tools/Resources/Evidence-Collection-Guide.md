# Evidence Collection Guide

When an auditor asks "show me evidence that this control is working," you need to produce specific, convincing proof. This guide tells you what evidence looks like for each major control area and how to collect it.

## How to use this guide

1. Identify the control area being audited.
2. Collect the evidence types listed below.
3. Verify each piece of evidence: is it dated? Does it clearly demonstrate the control's operation? Would a reasonable person accept it as proof?
4. Store evidence in a location accessible to both you and your auditor. A shared drive or GRC platform works. Email attachments do not.

## Evidence by control area

### Access Control

**Control:** Access is granted following a formal process, reviewed periodically, and revoked upon termination.

**Evidence to collect:**
- Screenshot of your identity provider showing MFA enforcement is enabled for all users
- Access review documentation: list of users, their access levels, review date, reviewer sign-off. This is typically a report from your identity provider or a spreadsheet.
- Three examples of access provisioning tickets: new hire, role change, contractor access. Each should show who requested, who approved, and what access was granted.
- Three examples of termination tickets showing access was revoked within the policy's SLA. Include timestamp of termination notification and timestamp of access revocation.
- For privileged accounts: screenshot showing separate admin accounts are used (not the same account for daily work and administration)

**Auditor will check:** Are there any accounts that should have been revoked but were not? Are there any users with access levels inconsistent with their role?

### Password and Authentication

**Control:** Password policy is enforced. MFA is required.

**Evidence to collect:**
- Screenshot of identity provider MFA configuration showing enforcement policy
- Screenshot or report showing MFA enrollment rate (should be near 100 percent)
- Password policy configuration from your identity provider (minimum length, complexity, expiration settings)
- Password manager adoption report (if applicable): percentage of employees with activated accounts

**Auditor will check:** Is MFA actually enforced, or just enabled? Are there accounts exempt from MFA, and if so, why?

### Security Awareness Training

**Control:** All employees complete security awareness training at onboarding and annually.

**Evidence to collect:**
- Training completion report from your LMS or training platform, showing all employees and their completion status
- Training content outline or screenshot of the training module
- For new hires: three examples showing training was completed within the onboarding window (per the Information Security Policy, typically 30 days)
- Annual acknowledgment report: list of employees who acknowledged the Information Security Program and Code of Conduct

**Auditor will check:** Is training actually completed by everyone? Are there employees who skipped training, and if so, what was the consequence? Is the training content relevant to the organization's actual risks?

### Vulnerability Management

**Control:** Systems are scanned for vulnerabilities. Findings are remediated within defined SLAs.

**Evidence to collect:**
- Vulnerability scan report from the most recent scan cycle, showing all findings and their severity
- Three examples of finding-to-remediation tickets: show the finding was identified, assigned, remediated, and verified within the SLA
- Scan configuration showing scan frequency and scope (all production systems, weekly)
- Patch management dashboard or report showing patch compliance percentage

**Auditor will check:** Are Critical and High findings actually remediated within the SLA? Are there findings that have been open for months? Is scanning happening on the stated frequency?

### Change Management

**Control:** Changes to production systems follow a formal approval process.

**Evidence to collect:**
- Three examples of change requests: one routine change, one emergency change, one rejected change. Each should show the request, approval, testing results, and implementation record.
- Change management policy configuration if using a platform that enforces approvals
- CAB meeting minutes (if applicable) showing change review

**Auditor will check:** Are changes tested before production deployment? Are emergency changes reviewed after the fact? Is there evidence of unauthorized changes?

### Backup and Disaster Recovery

**Control:** Backups are performed. Restore tests are conducted.

**Evidence to collect:**
- Backup configuration showing backup frequency, retention period, and encryption
- Backup success report from the most recent cycle showing all systems were backed up
- Restore test documentation: date of test, systems restored, results. This is the most scrutinized evidence. The auditor wants to see that you actually restored data, not just that backups ran.
- Backup monitoring configuration showing alerts for backup failures

**Auditor will check:** Are all critical systems backed up? When was the last restore test? Did it succeed? If not, what was the remediation?

### Vendor Management

**Control:** Vendors are assessed for security risk before engagement.

**Evidence to collect:**
- Vendor inventory listing all vendors, their risk tier, and date of last review
- Three examples of completed vendor security reviews: one High-risk, one Medium-risk, one Low-risk
- For High-risk vendors: SOC 2 report or equivalent, plus the organization's review notes on the report
- Contract with security requirements included

**Auditor will check:** Are all vendors in the inventory? Have High-risk vendors been reviewed within the last 12 months? Are there vendors with access to sensitive data that have not been assessed?

### Incident Response

**Control:** Security incidents are documented, investigated, and resolved.

**Evidence to collect:**
- Incident response plan and team contact list
- Incident log showing all incidents in the audit period (even if zero, the log should exist)
- Three examples of incident reports (if incidents occurred): initial detection, containment actions, root cause analysis, remediation
- Post-incident review documentation with lessons learned
- Evidence that the incident response plan has been tested (tabletop exercise or simulation)

**Auditor will check:** Were incidents responded to within the stated SLA? Was root cause analysis conducted? Were lessons learned implemented?

### Physical Security

**Control:** Physical access to facilities is controlled.

**Evidence to collect:**
- For organizations with offices: badge access logs, visitor log, camera coverage map
- For remote-first organizations: statement that all personnel work remotely; cloud provider's SOC 2 report covering physical data center security
- Clean desk policy enforcement: if you conduct walkthroughs, provide the walkthrough reports

**Auditor will check:** Is there evidence of physical security controls? For cloud-only organizations, is there documentation that the cloud provider's physical security has been reviewed?

## Evidence quality standards

Good evidence is:

- **Dated.** The auditor needs to know when this evidence was collected. Screenshots without timestamps are weak evidence. System-generated reports with embedded timestamps are strong evidence.
- **Complete.** A screenshot of "MFA: Enabled" is weak. A report showing MFA enforcement policy plus enrollment rate is strong.
- **Recent.** Evidence from last year does not prove a control is working today. Most evidence should be from within the current audit period.
- **Auditable.** Can the auditor independently verify this evidence? System-generated reports are better than manually created spreadsheets. Manually created spreadsheets are better than verbal assurances.
- **Representative.** Three examples of a working process (start, middle, end of the audit period) are more convincing than one example from last week.

## Evidence storage

Store evidence in a location that:
- Is accessible to the auditor without giving them access to production systems
- Has version history or immutability (prevent accidental deletion or modification)
- Is organized by control area, not by date collected
- Is maintained continuously, not assembled the week before the audit

A GRC platform handles this automatically. If you are using a manual process, a shared drive with a folder per control area works. Name files consistently: `[Control Area] - [Description] - [Date].pdf`.
