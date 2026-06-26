# Security Incident Response Process

Policy Title: Security Incident Response Process
Policy Number: ISP-____
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

## TL;DR - Immediate Action Required

As soon as you are made aware of a security incident (data loss, breach, knowledge of policy violations, etc.) or observe a vulnerability or anomalous behavior:

1. **Notify** the Security Officer (or IRT Lead) immediately through all available channels (messaging, SMS, phone).
2. **Complete** the Security Incident Response Form at ____ within 24 hours of discovery.
3. **Follow** the full process below when working through a security incident.

## Purpose

This document outlines the specific operational steps for handling security incidents at ____, ensuring a structured and thorough approach to identifying, managing, and resolving security threats while minimizing disruption to business operations. It operationalizes the Security Incident Response Policy.

## Scope

This process applies to all ____ employees, contractors, and vendors involved in responding to security incidents. It covers incidents related to data breaches, system vulnerabilities, unauthorized access, malware attacks, denial of service, and any other situations that compromise the confidentiality, integrity, or availability of ____'s information systems.

## Process Overview

The incident response process follows the NIST framework and consists of these phases:

**Detection → Reporting → Verification → Identification → Containment → Eradication → Recovery → Post-Incident Activities**

## Phase 1: Incident Detection and Reporting

### Detection Mechanisms

#### Centralized Monitoring and Alerting

The centralized log management and observability platform (recommended: OpenObserve) provides real-time monitoring and alerting for security-related events:

- Unusual API calls or access patterns.
- Resource utilization anomalies (CPU, memory, network spikes).
- Inappropriate privileged command execution (sudo, administrative actions).
- Significant network traffic deviations from baseline.
- Authentication failures and brute-force attempts.
- Service availability degradation.

Alerts are sent directly to the organizational messaging platform (e.g., Slack, Teams) and via SMS/pager to notify the IRT.

#### Cloud Threat Detection Service

A cloud-native threat detection service continuously analyzes audit logs, network flow logs, and DNS logs to detect:

- Unauthorized access attempts or successful unauthorized access.
- Malware activity, command-and-control communication.
- Reconnaissance activity by potential attackers.
- Account compromise indicators.
- Data exfiltration patterns.

Recommendation: Use the cloud provider's native threat detection service (e.g., AWS GuardDuty, Azure Defender, GCP Security Command Center).

#### Cloud Security Posture Management (CSPM)

A CSPM platform aggregates security findings from across cloud services and presents a unified view of potential security issues. Findings rated as "High" or "Critical" are automatically escalated to the IRT.

#### Manual Evaluation

Not all security incidents are caught by automated tools. Anomalies such as:

- Unusual system behaviors or unexpected configuration changes.
- Strange user actions or suspicious access patterns.
- Suspicious emails (phishing, business email compromise).
- Reports from customers or third parties about potential issues.

...must be manually reported to the Security Officer for evaluation and possible escalation.

### Reporting Process

**For All Personnel:**

- Any employee, contractor, or vendor who becomes aware of a potential security incident must report it **immediately** through all available channels:
  1. Send a message to the designated IRT communication channel (____).
  2. Send an SMS to the Security Officer at ____.
  3. Send an email to ____.
  4. Call the Security Officer at ____ if no response within 15 minutes.
- Complete the Security Incident Response Form at ____ within 24 hours of discovery.

**For the Security Officer (First Receiver):**

- Acknowledge receipt immediately upon notification.
- Perform initial triage to determine if the report represents a genuine incident.
- If confirmed or uncertain, begin IRT mobilization (Phase 2).

**Trigger Criteria:**

Incidents are triggered by security events such as:

- Breach of confidentiality, integrity, or availability of data.
- Security control failures or violations of security policy.
- Unauthorized access attempts or actual breaches.
- Malware infections or ransomware.
- Denial of service (DoS/DDoS) attacks.
- Hardware or software malfunctions with security implications.
- Physical security breaches.

**Incident Documentation:**

All incidents, including associated logs, files, and other evidence, must be recorded in the designated ticketing system (e.g., Jira, ServiceNow). The ticket must include:

- Systems affected.
- Initial observations and symptoms.
- Actions taken to date.
- Timestamps of key events.
- Assigned severity.

## Phase 2: Incident Verification

### Alert Verification

The first person to receive an alert (or the Security Officer upon receiving a manual report) must verify whether it represents a true incident:

1. Review alert details, including affected systems, triggering conditions, and any supporting data.
2. Check for related alerts or correlated events that might indicate a broader pattern.
3. Consult with other IRT members if uncertain.
4. Determine: is this a false positive, a low-severity event, or a potential incident?

### Incident Confirmation

Once an alert or report has been confirmed as a valid security incident:

1. **Assemble the IRT Immediately.** Contact all team members via messaging platform, SMS, and phone calls until the full team is in communication.
2. **Declare the Incident.** The first available IRT member with authority (following chain of command) formally declares the incident and assigns initial severity.
3. **Create the Incident Ticket.** Document the incident in the ticketing system with all available information.

### Severity Assessment

Incidents are categorized based on their potential impact:

| Severity | Criteria | Response Timeline |
|----------|----------|-------------------|
| **Critical (Highest)** | Incidents that disrupt core business operations, involve significant data breach, or result in legal/regulatory violations. Active attacker in the environment. | Full IRT mobilization within 1 hour; containment within 4 hours. |
| **High** | Incidents that affect multiple business units, cause significant delays, or involve sensitive data exposure. | Full IRT mobilization within 4 hours; containment within 24 hours. |
| **Medium** | Violations of security policies with minimal business impact. Suspicious activity not yet confirmed as a breach. | IRT review within 24 hours. |
| **Low** | Minor incidents that do not affect business operations. Single events with no indicators of broader compromise. | Log and review; escalate if pattern emerges. |

## Phase 3: Incident Response Execution

### 3.1 Identification

**Scope Determination:** The Engineering Lead and Technical Support Engineers are responsible for identifying the scope and impact of the incident:

- Identify all compromised or affected systems.
- Determine the attack vector (how the attacker gained access).
- Determine the timeline (when did the compromise begin).
- Assess the potential damage (what data was accessed, modified, or exfiltrated).
- Identify whether the attacker still has active access.

**Evidence Collection:** All evidence must be preserved for future analysis:

- System logs (operating system, application, database, network).
- Memory captures and disk images (for forensic analysis).
- Network traffic captures.
- Screenshots and screen recordings of affected systems.
- Timeline of observed events and actions taken.

All evidence must be collected and handled in accordance with established chain of custody procedures to ensure admissibility in legal proceedings.

### 3.2 Containment

**Short-Term Containment:** The immediate goal is to limit the spread of the incident while preserving evidence where possible:

- Isolate affected systems from the network (disconnect, VLAN change, security group modification).
- Disable compromised user accounts and rotate credentials.
- Block malicious IP addresses, domains, or network traffic at the firewall/WAF.
- Suspend affected services if necessary to prevent further damage.
- Revoke active sessions and API keys associated with compromised accounts.

**Long-Term Containment:** Implement more durable controls while eradication is underway:

- Deploy additional security controls or monitoring on unaffected systems.
- Reconfigure network segmentation to limit lateral movement.
- Apply emergency patches to prevent exploitation of the same vulnerability on other systems.
- Implement enhanced logging and alerting on critical systems.

**Incident Impact Rating:** The Security Officer assesses the incident's impact on:

- Regulatory compliance (GDPR, CCPA, HIPAA, PCI DSS, etc.).
- Business operations and revenue.
- Customer data and relationships.
- Reputation and brand.

Based on this assessment, the Security Officer recommends actions such as:

- Reporting the incident to regulatory authorities within mandated timeframes.
- Engaging the cyber insurance incident response team.
- Notifying law enforcement.
- Initiating customer notification procedures.

### 3.3 Eradication

**Threat Removal:** Once containment is in place, the Engineering Lead is responsible for removing the root cause:

- Remove malware, backdoors, web shells, and attacker persistence mechanisms.
- Apply patches for exploited vulnerabilities.
- Reconfigure systems to secure baselines.
- Reset all credentials that may have been compromised.
- Rebuild compromised systems from known-good images or backups where necessary.

**Third-Party Assistance:** If the incident is severe, ____ may engage:

- The external incident response team provided through the cyber insurance policy.
- Third-party digital forensics and incident response (DFIR) firms.
- Law enforcement (FBI, CISA, local cybercrime units).

These external entities may assist in or take over eradication and recovery. The IRT Lead maintains overall command authority and coordinates between internal and external teams.

**Verification:** After eradication actions:

- Run vulnerability scans on affected systems to confirm patches are applied.
- Conduct integrity checks on critical files and configurations.
- Verify that attacker persistence mechanisms have been removed.
- Confirm no unauthorized accounts or access methods remain.

### 3.4 Recovery

**System Restoration:** The IRT begins the process of restoring affected systems to full functionality:

1. Restore data from clean backups (verify backup integrity before restoration).
2. Rebuild systems from trusted images if compromise was deep.
3. Restore services in priority order, starting with mission-critical functions.
4. Test restored systems thoroughly before bringing them back online.
5. Monitor restored systems closely for signs of re-compromise or instability.

**Data Validation:**

- Perform data integrity checks to ensure no data has been lost or tampered with.
- Compare restored data against known-good baselines.
- If data exfiltration occurred, identify what was taken and which customers/data subjects are affected.

**Service Recovery Coordination:**

- The Engineering Lead coordinates with business units to prioritize recovery efforts.
- Business stakeholders are consulted on acceptable recovery timeframes.
- Services are restored in stages to allow validation between each stage.

## Phase 4: Incident Communication

### 4.1 Internal Communication

**Real-Time Updates:** Throughout the incident, the IRT must maintain constant communication using:

- Dedicated incident channel in the messaging platform.
- SMS and phone calls for urgent matters or when messaging is unavailable.
- Incident ticket updates for structured documentation.

**Leadership Updates:** The IRT Lead (or Communications Officer) is responsible for providing periodic updates to senior management:

- Status of containment, eradication, and recovery efforts.
- Systems and data affected.
- Anticipated recovery timelines.
- Regulatory and legal implications.
- Resource needs or escalation requests.

### 4.2 Customer and Stakeholder Communication

**Notification Timelines:**

- Customers must be notified of Critical incidents (e.g., data breaches, significant outages) within ____ hours of confirmed detection, or as required by contractual SLAs and applicable regulations.
- The Communications Officer handles all customer notifications, ensuring they are accurate, timely, and compliant with contractual obligations.
- Notifications must include: what happened, what data was affected, what actions the organization is taking, and what steps customers should take.

**Public Communication:** If the incident is likely to attract media attention:

- The Communications Officer coordinates with the public relations team (internal or external).
- A prepared statement is issued within ____ hours of public awareness.
- All external communications are reviewed by Legal before release.

### 4.3 Regulatory Communication

**Compliance-Driven Notification:**

- If the incident involves sensitive personal data or violates regulatory requirements, the Security Officer must notify the relevant regulatory bodies within the mandated timeframes:
 - **GDPR:** Within 72 hours of becoming aware of the breach.
 - **CCPA/CPRA:** Without unreasonable delay.
 - **HIPAA:** Within 60 days of discovery.
 - **PCI DSS:** Per acquiring bank and card brand requirements.
 - **Other:** Per applicable state, federal, and international regulations.

**Law Enforcement:** If necessary, law enforcement agencies may be contacted to:

- Assist with investigation.
- Pursue legal action against attackers.
- Fulfill mandatory reporting requirements for specific types of incidents.

## Phase 5: Post-Incident Activities

### 5.1 Root Cause Analysis (RCA)

**Timing:** Initiate RCA as soon as the incident is contained and the immediate recovery is underway.

**Methodology:**

- Use the "Five Whys" technique: repeatedly ask "why" to drill down from the observable incident to the underlying root cause.
- Use "Fishbone (Ishikawa) Diagram" for complex incidents with multiple contributing factors.
- Consider: People, Process, Technology, and Environment factors.

**Documentation:** All findings from the RCA must be documented in the incident report, including:

- Root cause description.
- Contributing factors.
- Timeline of the root cause leading to the incident.
- Recommendations for prevention.

### 5.2 Lessons Learned

**Debriefing:** Within ____ days (recommended: 5 business days) of incident resolution, the IRT must conduct a post-incident debriefing session covering:

- What worked well during the response.
- What didn't work or could be improved.
- Were response timelines met (containment, eradication, recovery).
- Communication effectiveness (internal and external).
- Tools and resources: were they sufficient and functional.
- External support: was it effective and well-coordinated.

**Documenting Insights:** Lessons learned must be summarized in a formal document accessible to all relevant team members and stakeholders. This document should be reviewed during quarterly Security Oversight Committee meetings.

**Corrective Actions:** Identified corrective actions must be:

- Documented as formal action items in the ticketing system.
- Assigned to accountable owners with deadlines.
- Tracked to completion.
- Verified for effectiveness after implementation.

### 5.3 Incident Report

**Detailed Report:** After the incident is resolved, a comprehensive incident report must be generated within ____ days (recommended: 10 business days). The report must include:

- Incident description and timeline.
- Root cause analysis and contributing factors.
- Steps taken during identification, containment, eradication, and recovery.
- Evidence collected and handling procedures.
- Communication timeline (internal, customer, regulatory, public).
- Lessons learned and corrective actions.
- Recommendations for future prevention.

### 5.4 Evidence Retention

All incident-related evidence must be retained for a minimum of ____ years (recommended: 3 years, longer if required by regulation or pending litigation). Evidence includes:

- Incident tickets and associated documentation.
- System logs, network captures, and forensic images.
- Communication records.
- Incident reports and RCA documents.

## Phase 6: Disaster Recovery Escalation

In the event of severe outages or breaches that require significant recovery efforts beyond standard incident response:

- Refer to the Disaster Recovery Plan and Disaster Recovery Process for full environment restoration procedures.
- The Disaster Recovery Plan must be invoked if standard recovery procedures are insufficient to restore critical services within the defined RTO (Recovery Time Objective) and RPO (Recovery Point Objective).

## Evidence Collection and Chain of Custody

### Documentation of Actions

All actions taken during the incident must be documented in detail:

- Who performed each action.
- What action was performed.
- When it was performed (timestamp).
- What systems were affected.
- What the result was.

### Chain of Custody

If the incident involves legal or regulatory implications, all evidence must be collected and handled in accordance with established chain of custody procedures:

- Document who collected the evidence, when, and from where.
- Document everyone who has handled the evidence and for what purpose.
- Store evidence in a secure, access-controlled location.
- Maintain integrity of evidence (hash verification, write-blockers for forensic imaging).

### Forensic Analysis

In cases of major incidents, forensic analysis may be required to understand the scope and source of the attack. The Engineering Lead coordinates the forensic analysis, which may be performed by:

- Internal security team (for incidents within internal capabilities).
- External DFIR firm (for severe incidents or when independent analysis is required).
- Law enforcement (if criminal activity is suspected).

## Appendices

### Appendix A: Security Incident Report Form

Link to the Security Incident Report Form: ____

This form must be completed for every security incident within 24 hours of discovery.

### Appendix B: Incident Reports Repository

Link to the incident reports repository (document management system, wiki, or shared drive): ____

### Appendix C: Root Cause Analysis Form

Link to the Root Cause Analysis Form: ____

### Appendix D: Root Cause Analysis Reports Repository

Link to the RCA reports repository: ____

## Related Documents

- Security Incident Response Policy
- Information Security Policy (ISP-001)
- Disaster Recovery Plan
- Disaster Recovery Process
- Vulnerability Management Policy
- Business Continuity Plan
- Risk Assessment Policy

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version |
