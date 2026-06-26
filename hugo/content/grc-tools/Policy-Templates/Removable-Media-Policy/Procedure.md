# Removable Media Policy - Implementation Procedures

> **Companion to:** Removable Media Policy (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Technical Enforcement (MDM/Endpoint Block)
### Standard Approach
1. Deploy endpoint management or Mobile Device Management (MDM) controls to enforce the default-deny posture for removable media:
   a. **Windows:** Configure Group Policy or Intune policy to block USB mass storage device installation. Set: `Computer Configuration > Administrative Templates > System > Device Installation > Device Installation Restrictions > Prevent installation of removable devices`. Allow only specifically authorized device instance IDs if exceptions are needed.
   b. **macOS:** Deploy a configuration profile via MDM (Jamf, Kandji, Mosyle) that restricts removable media. Use the `Restrictions` payload or a third-party kernel extension/DLP agent if granular control is required. Configure `com.apple.applicationaccess` to restrict external media mounting.
   c. **Linux:** Use udev rules to block USB storage devices by default. Configure: `SUBSYSTEM=="block", SUBSYSTEMS=="usb", ACTION=="add", OPTIONS:="ignore_device"`. Deploy via configuration management (Ansible, Puppet) to all managed Linux endpoints.
   d. **ChromeOS:** Configure Google Admin Console policy: `Device > Chrome > Settings > Users & browsers > USB device management > Block all USB devices`.
2. Implement allowlisting for specifically authorized devices:
   a. When an exception is approved (per Procedure 2), identify the device's hardware ID (VID/PID, device instance ID, or serial number).
   b. Add the device to the allowlist in the endpoint management platform.
   c. The allowlist entry must include an expiration date matching the exception approval.
   d. Configure the endpoint management platform to automatically remove the allowlist entry when the expiration date is reached.
3. Enable logging:
   a. Configure endpoint telemetry to log all removable media connection attempts - both allowed and blocked.
   b. Include in logs: device type, device ID, timestamp, hostname, username, and whether the connection was allowed or blocked.
   c. Forward logs to the SIEM or centralized logging platform.
4. Testing:
   a. After deploying the block policy, test on each OS platform: connect a USB drive and confirm it is blocked. Connect an SD card, external hard drive, and smartphone in USB mass storage mode - confirm all are blocked.
   b. Test an allowed device: confirm it connects and is accessible.
   c. Test that logging captures both blocked and allowed events.
5. Maintain a configuration baseline for endpoint media controls. Drift from this baseline (a device where the block policy is disabled) triggers a security alert.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **DLP agent instead of OS-level blocking:** Instead of OS-level block policies, deploy a Data Loss Prevention (DLP) agent that allows USB connections but monitors and blocks data transfer based on content sensitivity. This allows legitimate non-data uses (charging, peripherals) while preventing data exfiltration. This is more complex to manage but less disruptive to users.
> - **Physical USB port blockers:** For high-security environments (SCIFs, air-gapped networks), complement software controls with physical USB port blockers or epoxy-filled ports. Software controls can be bypassed with sufficient privilege; physical controls cannot.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Blocking USB storage but not other removable media types.** MDM policies that block "USB mass storage" don't necessarily block SD cards (often use a different device class), external DVD writers, smartphones in MTP/PTP mode, or Thunderbolt storage devices. Test every removable media form factor after deploying the block policy.
> - **Endpoint that falls off MDM management.** If an endpoint is unenrolled from MDM (user wipes the device, MDM profile expires), the removable media block policy is removed. The device can then connect USB drives freely. Monitor for MDM enrollment status and alert on unenrolled devices.
> - **Block policy disrupts legitimate non-storage USB devices.** Blocking all USB devices can disable keyboards, mice, headsets, and authentication tokens (YubiKeys). The block policy should target storage device classes specifically, not all USB devices.

## Procedure 2: Exception Handling
### Standard Approach
1. Exception request intake:
   a. The requestor submits a written exception request using the standardized form. The form requires: requestor name and department, detailed business need description (what data, why it must move via removable media, to/from whom), explanation of why approved alternatives (cloud storage, secure file transfer) cannot meet the need, data classification level of the data to be transferred, estimated duration of the exception (start and end dates), and planned security measures (encryption, malware scanning, physical security).
   b. The request is routed to the Security Officer (or designee) for review.
2. Review and decision:
   a. The Security Officer evaluates the request against the following criteria: (i) Is the business need legitimate and documented? (ii) Have all approved alternatives been genuinely evaluated and found unsuitable? (iii) Is the data classification appropriate? (iv) Are the proposed security measures adequate? (v) Is the duration reasonable?
   b. Decision: Approve, Approve with Conditions (e.g., additional security measures, shorter duration), Deny, or Request Additional Information.
   c. Decision communicated to the requestor within 5 business days.
3. Implementation:
   a. Upon approval, the Security Officer or IT creates an exception record in the exception register: requestor, business justification, data classification, approved duration (start and end dates), approved device(s), and any conditions.
   b. If the exception requires a specific device, IT adds the device to the endpoint allowlist with the same expiration date.
   c. The requestor is provided with the approved device (if organization-issued) and the required security measures (encryption software, malware scanning procedure, logging template).
4. Expiration and renewal:
   a. The exception automatically expires on the approved end date. The endpoint allowlist entry is automatically removed.
   b. If the business need continues beyond the expiration, the requestor must submit a new exception request BEFORE the current exception expires. Late renewals are treated as new requests and access is unavailable during the gap.
   c. Exceptions renewed more than twice (extending beyond the original duration by 2x or more) trigger an executive review: does this ongoing need indicate an approved alternative should be made available?
5. Quarterly audit:
   a. Review all active exceptions: verify the business need still exists, verify the exception hasn't exceeded its approved duration, verify the data classification is correct.
   b. Aggressively close exceptions where the business need is no longer valid or an approved alternative has become available.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Delegated exception authority for low-risk scenarios:** Allow department heads to approve exceptions for Internal data, short duration (< 7 days), and encrypted media without Security Officer review. Security Officer review is reserved for Confidential/Restricted data or extended durations. This reduces approval bottlenecks for low-risk use cases.
> - **No exceptions - provide a managed alternative:** Instead of granting USB exceptions, provide a managed secure file transfer service that replicates the workflow (transfer large files to an external party) without removable media. Eliminate the exception path by making the alternative better than the exception.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Exception log that's a spreadsheet on someone's desktop.** The exception register must be centralized, accessible to IT and Security, and tied to the technical enforcement (so allowlist entries have the same expiration dates). A disconnected spreadsheet leads to permanent exceptions.
> - **"Temporary" exceptions that become permanent.** A 90-day exception approved 2 years ago that nobody has reviewed since. Every exception must have an expiration date. Expiration must be technically enforced (remove from allowlist). The only path past expiration is a new, separately approved request.
> - **Exception granted for convenience, not necessity.** "Cloud storage is too slow" is not a valid justification if the organization provides a high-bandwidth, approved file transfer service. Challenge convenience-based requests. The exception process is for genuine business needs that CANNOT be met by approved alternatives, not for personal preference.

## Procedure 3: Approved-Use Logging
### Standard Approach
1. For every use of removable media under an approved exception, the authorized user must log:
   a. Date and time of use.
   b. Responsible individual (name and department).
   c. Description of data transferred (data type, not the data itself).
   d. Data classification level.
   e. Source system and destination (if applicable).
   f. Duration of use.
   g. Exception reference number.
2. Logging mechanism:
   a. **Automated logging (preferred):** Configure the endpoint DLP or monitoring agent to automatically capture media connection events, file transfer operations, and data classification tags. The user's responsibility is to confirm the automated log is accurate.
   b. **Manual logging (fallback):** Provide a digital logging form (web form, shared document, or ticket template) that the user completes at the time of use. The form is submitted to the Security team or logged in the GRC platform.
3. Log retention and review:
   a. Retain use logs for a minimum of 12 months (or as specified in the policy).
   b. Review logs quarterly: (i) verify that all approved exceptions have corresponding use logs (an exception with zero use logs suggests it wasn't needed), (ii) look for patterns - frequent use by one individual or department may indicate the approved alternatives are insufficient, (iii) flag any use outside the approved exception parameters (different data classification, different device).
4. Unauthorized use detection:
   a. Review endpoint telemetry for blocked removable media connection attempts.
   b. A blocked attempt is a near-miss: the user attempted to connect removable media that was blocked. Investigate: was this a policy violation, a training gap, or a legitimate need that should have gone through the exception process?
   c. Track blocked attempts as a metric. An increase in blocked attempts may indicate that approved alternatives are not meeting user needs.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Fully automated logging via DLP with classification tagging:** If the organization has deployed DLP with data classification capabilities, the DLP agent automatically logs every file transferred to removable media, tags it with the data classification, and generates an audit record. No manual logging required. This is the gold standard and eliminates the risk of incomplete or falsified manual logs.
> - **No logging for Internal data transfers under exception:** For exceptions involving only Internal (non-sensitive) data, reduce the logging burden to a simple confirmation ("transferred Internal data on [date]") rather than a detailed log. Detailed logging is reserved for Confidential and Restricted data exceptions.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Manual logs that are never completed.** Users complete the log for the first use, then stop because "it's the same as last time." If manual logging is the method, compliance must be audited: compare exception approvals to log entries. Missing logs are escalated to the user's manager.
> - **Logs that are not reviewed.** Collecting logs that nobody reads is compliance theater. The quarterly review must be a real activity with documented findings. A year of logs with zero anomalies suggests the review isn't thorough, not that everything is perfect.
> - **Logging that captures the data itself, not just the description.** A log entry that says "transferred customer PII including names, SSNs, and account numbers" is itself a data exposure risk. Log the data classification and type ("Restricted - customer PII"), not the actual PII values.

## Procedure 4: Incident Response for Lost or Stolen Removable Media
### Standard Approach
1. Reporting:
   a. Any Personnel who discover that removable media containing organizational data is lost or stolen must report it immediately - within 1 hour of discovery.
   b. Report to: the Security team (via incident hotline or ticketing system) and the individual's direct manager.
   c. The report must include: what media was lost/stolen, when and where the loss occurred, what data was on the media (classification and general description), whether the media was encrypted, and whether the encryption key/passphrase was stored separately from the media.
2. Triage:
   a. The Security team triages the report within 1 hour of receipt.
   b. Severity determination:
     - **Critical:** Media contained Restricted data (PII, PHI, payment card data, credentials) OR media was unencrypted AND contained Confidential data.
     - **High:** Media was encrypted AND contained Confidential data, OR media was unencrypted but contained only Internal data.
     - **Medium:** Media was encrypted AND contained only Internal data.
     - **Low:** Media contained only Public data, or media was blank.
   c. If the media was encrypted with strong encryption (AES-256 or equivalent) and the encryption key was NOT stored with the media, the risk of data exposure is low. This significantly reduces the incident severity.
3. Immediate actions:
   a. **Critical or High:** Declare a security incident per the Incident Response Policy. Activate the incident response team. Notify the Security Officer immediately.
   b. If the media was organization-managed and enrolled in MDM with remote wipe capability, issue a remote wipe command. Document the wipe attempt and result.
   c. If the media contained credentials, API keys, or authentication tokens, revoke and rotate all affected credentials immediately.
   d. Preserve all relevant logs: endpoint telemetry showing the last connection, badge access logs, physical security logs.
4. Investigation:
   a. Determine the circumstances: was this a theft (forced entry, snatch-and-grab) or a loss (left in a coffee shop, taxi, or conference room)?
   b. Determine the data scope: what specific data was on the media? Reconstruct from the exception log, approved-use logs, and last known file listings.
   c. Assess the risk of data exposure: if encrypted with a strong key stored separately, the practical risk of exposure is negligible. Document this assessment.
5. Notification:
   a. If the media contained PII, PHI, or other regulated data AND was unencrypted (or encryption status is unknown), consult Legal for breach notification obligations. Many jurisdictions require notification within 72 hours.
   b. If client or partner data was involved, notify the client/partner per contractual obligations.
   c. Notify the organization's cyber insurance carrier if the incident may trigger coverage.
6. Remediation and closure:
   a. Implement measures to prevent recurrence: additional training for the individual, review of exception approval (was the exception appropriate?), enhanced physical security requirements for media.
   b. Update the asset inventory: mark the media as lost/stolen.
   c. Document the incident in the incident management system. Include: timeline, data scope, risk assessment, notifications, and corrective actions.
   d. If the incident reveals a policy or process gap, create a remediation ticket to address it.
7. Post-incident review:
   a. Conduct a post-incident review within 14 days: what worked well, what didn't, what processes or controls should change.
   b. Present findings to the Security Oversight Committee if the incident was Critical or High severity.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated incident declaration from endpoint telemetry:** If the endpoint agent detects that an allowed removable media device has not been connected for a defined period (e.g., 72 hours beyond expected use), automatically generate a "potential lost media" ticket. This catches lost media before the user realizes it's lost.
> - **Kill-switch for high-risk media:** For media used in high-risk exceptions, issue devices with a built-in kill-switch: after a defined period without network connectivity, the device self-encrypts or self-wipes. This reduces the window of exposure for lost media.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Not reporting because "it was encrypted, so it's fine."** Personnel may rationalize that encrypted media doesn't need to be reported. This is wrong - the organization still needs to know what data was potentially exposed, even if the encryption makes actual exposure unlikely. Train Personnel: report ALL lost media, regardless of encryption status.
> - **Over-notifying when encryption makes exposure infeasible.** Conversely, declaring a breach and notifying 100,000 customers because an AES-256 encrypted USB drive with a 20-character random passphrase (stored separately) was lost is unnecessary and damages trust. The incident severity assessment must account for encryption effectiveness. If encryption makes data recovery computationally infeasible, notification may not be required. Let Legal make this determination.
> - **No pre-defined communication templates.** During a lost-media incident, the clock is ticking on regulatory notification deadlines. Pre-approved notification templates (customer notification, regulatory filing, press release skeleton) reduce the time to notification by days. Prepare templates for the most likely scenarios: lost encrypted media, lost unencrypted media containing PII, lost media with unknown contents.
