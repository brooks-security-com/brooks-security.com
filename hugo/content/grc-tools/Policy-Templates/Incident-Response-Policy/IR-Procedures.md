# Incident Response - Implementation Procedures

> **Companion to:** Incident Response Policy (IR-Policy-Template.md) and Incident Response Process (../Incident-Response-Process/IR-Process-Template.md)
> **Purpose:** The IR Policy defines WHAT must be done; the IR Process defines the operational workflow. This Procedures document provides tactical, implementation-level guidance: HOW to configure detection mechanisms, set up alert rules, train the IR team, run tabletop exercises, and operationalize incident response. Use this document when you need step-by-step configuration and training instructions.

---

## Procedure 1: Detection Mechanism Configuration

### Standard Approach

This procedure covers the configuration of automated detection and alerting infrastructure.

#### 1.1 Centralized Monitoring Alert Rules

Configure the following alert rules in your centralized log management platform (`____`, e.g., OpenObserve, Elastic, Splunk):

**Authentication Monitoring:**
```
Alert: Multiple Failed Login Attempts
Query: count of authentication failure events by source IP, user, and target system > 10 in 5 minutes
Severity: High
Action: Notify IRT channel; auto-create ticket if > 50 failures
```
```
Alert: Successful Login After Failures
Query: successful authentication from same source IP that had >= 3 failures in preceding 10 minutes
Severity: Critical
Action: Immediate IRT notification + SMS/Pager
```
```
Alert: Login from Impossible Geography
Query: successful login from IP geolocation > 500 miles from previous login AND time delta < travel time
Severity: High
Action: Notify IRT channel; auto-create ticket
```
```
Alert: Off-Hours Administrative Activity
Query: sudo or admin-level activity between 22:00 and 06:00 local time (excluding maintenance windows)
Severity: Medium (High for Critical systems)
Action: Auto-create ticket; review next business day
```

**Network Monitoring:**
```
Alert: Unusual Outbound Traffic Volume
Query: outbound bytes from any host exceeding 3x the 30-day rolling average for that host and hour
Severity: High
Action: Notify IRT channel; potential data exfiltration
```
```
Alert: Connection to Known Malicious IP
Query: any connection to IPs in threat intelligence feed (update feed hourly)
Severity: Critical
Action: Immediate IRT notification + SMS/Pager + auto-isolate host if containment capable
```
```
Alert: Port Scanning Detected
Query: single internal source IP contacting >50 distinct destination ports in 5 minutes
Severity: High
Action: Notify IRT channel; potential lateral movement
```

**Cloud-Specific Monitoring:**
```
Alert: Unusual API Call Pattern
Query: cloud audit log showing API calls from a user that are outside their normal pattern (ML-based anomaly)
Severity: High
Action: Notify IRT channel
```
```
Alert: Security Group / Firewall Rule Modification
Query: any modification to security groups, NACLs, or firewall rules
Severity: Medium (High if modification opens sensitive ports to 0.0.0.0/0)
Action: Auto-create ticket; review within 1 hour
```
```
Alert: IAM Policy Change Granting Privileged Access
Query: IAM policy modification attaching AdministratorAccess or equivalent
Severity: Critical
Action: Immediate IRT notification + SMS/Pager
```

#### 1.2 Cloud Threat Detection Service Configuration

1. **Enable Cloud-Native Threat Detection:**
  - **AWS:** Enable GuardDuty in all regions. Enable all finding types (no filtering). Configure S3 protection and EKS protection.
  - **Azure:** Enable Microsoft Defender for Cloud (all plans including servers, containers, DNS, and resource manager).
  - **GCP:** Enable Security Command Center Premium tier. Enable Event Threat Detection and Container Threat Detection.
2. **Integrate Findings:** Stream all threat detection findings to the centralized logging platform. Configure a dedicated dashboard showing GuardDuty/Defender/SCC findings by severity and type.
3. **Automated Response (where safe):**
  - GuardDuty finding of type "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration" → auto-revoke the compromised instance profile via Lambda.
  - GuardDuty finding of type "Backdoor:EC2/C&CActivity" → auto-isolate the instance (remove from security groups, apply restrictive NACL).
  - For less confident detections, generate an alert for human review rather than taking automated action.

#### 1.3 Real-Time Alerting Configuration

1. **Messaging Platform Integration:**
  - Create a dedicated IRT channel (`#incident-response` or equivalent) in the organizational messaging platform.
  - Configure webhook integrations from all alerting sources to post to this channel.
  - Format alerts with: severity emoji (🔴 Critical, 🟠 High, 🟡 Medium), timestamp, affected system, alert description, and a link to the full alert/ticket.
  - Enable thread replies for incident discussion without cluttering the main feed.
2. **SMS / Pager Configuration:**
  - Use PagerDuty, Opsgenie, or VictorOps for on-call management.
  - Configure escalation policies:
    - **Level 1:** Primary on-call engineer - acknowledge within 15 minutes.
    - **Level 2:** If not acknowledged in 15 minutes, escalate to secondary on-call.
    - **Level 3:** If not acknowledged in 30 minutes, escalate to IRT Lead.
    - **Level 4:** If not acknowledged in 45 minutes, escalate to CISO/CTO.
  - Configure "bypass quiet hours" for Critical alerts on IRT members' phones.
  - Test the pager rotation monthly: trigger a test alert and verify every IRT member receives it.

### Alternative Approaches

> **💡 Why you might choose differently:** Alerting architecture depends on team size, tooling maturity, and budget.

- **MSSP-Managed Detection:** Organizations without 24/7 security operations can outsource detection and initial triage to a Managed Security Service Provider (MSSP). The MSSP monitors alerts and escalates confirmed incidents to the internal IRT. Ensure the MSSP contract includes response SLAs, notification procedures, and defined escalation triggers.
- **SOAR Platform:** For mature security teams, a Security Orchestration, Automation, and Response (SOAR) platform (e.g., Splunk SOAR, Palo Alto XSOAR, Tines) can automate alert enrichment, false positive filtering, and initial response actions. Reduces analyst workload but requires significant investment to build and maintain playbooks.
- **Open-Source Alerting Stack:** Grafana + Prometheus + Alertmanager for metrics-based alerting; Elastic + ElastAlert for log-based alerting; Healthchecks.io for dead-man's-switch monitoring of critical processes. Lower cost but more integration work.

### Common Pitfalls

> **⚠️ Watch out:** Alerting rules that are too sensitive. A rule that fires 50 times a day for benign activity will be tuned out or ignored. When configuring a new alert rule, run it in "log-only" mode for 2 weeks and analyze the results. Adjust thresholds so that <5% of alerts are false positives.

> **⚠️ Watch out:** Alerting that depends on a single channel. If the messaging platform is down and SMS is the only alternative, but SMS numbers weren't updated when team members changed phones, alerts go nowhere. Test all alerting channels quarterly: trigger a test alert on each channel and verify receipt.

> **⚠️ Watch out:** Cloud threat detection disabled in unused regions. Attackers often operate in regions the organization doesn't use because they know detection is less likely. Enable GuardDuty/Defender in ALL regions, not just the ones you actively use.

---

## Procedure 2: IR Team Training Program

### Standard Approach

This procedure covers the ongoing training and readiness program for the Incident Response Team.

#### 2.1 Onboarding Training

Every new IRT member must complete the following within `____` days (recommended: 14 days) of joining:

1. **Policy and Process Familiarization:**
  - Read and acknowledge: IR Policy, IR Process, IR Procedures (this document).
  - Complete a 1-hour walkthrough with the IRT Lead covering: team structure, chain of command, communication channels, ticketing system, and escalation procedures.
2. **Tool Access and Familiarization:**
  - Obtain access to: centralized logging platform (`____`), cloud threat detection console (`____`), ticketing system (`____`), messaging platform IRT channel, PagerDuty/Opsgenie.
  - Complete hands-on lab: search for a known incident in logs, create a test ticket, acknowledge a test page.
  - Verify that MFA and access credentials work from mobile devices (test from phone).
3. **Contact Information Registration:**
  - Register mobile number, backup phone, and personal email in the IRT contact roster.
  - Verify that SMS and pager notifications are received.
  - Provide an offline contact method (e.g., Signal, WhatsApp) in case primary communication infrastructure is compromised.

#### 2.2 Ongoing Skills Development

1. **Monthly IR Drill:** (30 minutes)
  - IRT Lead presents a short scenario (single inject).
  - Team discusses: how would you detect this? What's your first action? What logs would you check?
  - Focus on one specific skill per month: log analysis, network forensics, malware triage, cloud incident response, communication coordination.
2. **Quarterly Technical Lab:** (2–4 hours)
  - Hands-on exercise in a sandbox environment.
  - Scenarios: analyze a compromised EC2 instance, investigate a phishing-related account takeover, trace lateral movement through cloud logs, perform memory forensics on a Linux system.
  - Use open-source training platforms (e.g., Blue Team Labs Online, CyberDefenders, TryHackMe) or build internal labs.
3. **Annual Tabletop Exercise:** (4–6 hours, coordinated with BCP testing)
  - See Procedure 3 below.

#### 2.3 Cross-Training and Succession

1. **Role Redundancy:** Each IRT role must have at least 2 trained alternates. The primary and alternates must train together at least quarterly.
2. **Documentation:** All IRT members must be capable of performing the basic functions of every other role:
  - Every member: can acknowledge and triage an alert.
  - Every member: can create and update an incident ticket.
  - Every member: can initiate the notification cascade.
3. **Vacation/Leave Coverage:** No more than 50% of the primary+alternate pool for any role may be on leave simultaneously. Track in the team calendar.

### Alternative Approaches

> **💡 Why you might choose differently:** Team size and budget drive different training approaches.

- **External Training Providers:** Small teams may benefit from SANS courses (FOR508, SEC504), Black Hills Information Security training, or cloud provider security workshops. Higher cost per person but deeper coverage.
- **Capture-the-Flag (CTF) Integration:** Gamify training by participating in blue-team CTF competitions (e.g., HackTheBox defensive tracks). Creates engagement and camaraderie. Rotate which team members participate to spread knowledge.
- **Vendor-Supplied Training:** If using a managed security service or specific security products, leverage vendor-provided training (often included in enterprise licenses).

### Common Pitfalls

> **⚠️ Watch out:** Training that only covers the happy path. Every drill should include at least one complication: the primary tool is down, a key person is unreachable, the logs are incomplete, the attacker is still active. Real incidents are messy; training must prepare the team for mess.

> **⚠️ Watch out:** IRT members who never practice with the actual tools. A training environment that's perfectly set up teaches you to respond in a perfectly set up environment. Use the production tools (with read-only access to non-production data) for training whenever possible so that muscle memory transfers.

> **⚠️ Watch out:** Forgetting about soft skills. Technical IRT members must also practice: communicating with non-technical executives, writing customer-facing incident notifications, and managing stress during prolonged incidents. Include communication exercises in training.

---

## Procedure 3: Tabletop Exercise Execution

### Standard Approach

This procedure provides a facilitator's guide for running effective IR tabletop exercises. (For BCP-focused tabletops, see BCP-Procedures.md.)

#### 3.1 Pre-Exercise Preparation (4 Weeks Before)

1. **Define Objectives:**
  - What specific capabilities are being tested? (Detection? Containment? Communication? Decision-making?)
  - Example objectives: "Test the IRT's ability to detect and contain a ransomware incident within 4 hours" or "Test the notification cascade when the IRT Lead is unreachable."
2. **Design the Scenario:**
  - Choose a realistic threat scenario relevant to the organization's industry and threat profile.
  - Prepare a scenario narrative: an opening description of the situation as it presents to the first responder.
  - Prepare 5–8 injects: new pieces of information introduced at planned intervals that escalate or change the scenario.
  - Example scenario: "Ransomware detected on a file server" → Inject 1: "The ransomware note demands payment in bitcoin" → Inject 2: "Backup logs show that the last 3 nightly backups failed silently" → Inject 3: "A customer reports that their data is also appearing on a leak site" → Inject 4: "Legal advises that this is a reportable breach under GDPR."
3. **Assemble Materials:**
  - Scenario document (facilitator only - contains all injects and timing).
  - Participant briefing (distributed 48 hours before - scenario background only, no injects).
  - Note-taking template for the scribe.
  - Metrics capture sheet: timeline of decisions, notification times, escalation triggers.

#### 3.2 Exercise Execution

1. **Setup (15 minutes):**
  - Facilitator reviews ground rules: this is a learning exercise, not a test. No blame. Think out loud. Document decisions.
  - Confirm all participants have access to their tools, contact lists, and documentation.
  - Start the clock.
2. **Scenario Delivery:**
  - Facilitator reads the opening scenario. "It's Tuesday at 10:00 AM. The SOC receives an alert that..."
  - Participants respond as they would in a real incident: who do they notify? What do they check? What decisions do they make?
  - Facilitator introduces injects at planned intervals (or when discussion stalls).
  - Scribe records all decisions, actions, questions, and timestamps.
3. **Facilitator Tips:**
  - Don't correct participants during the exercise. If they make a mistake, let it play out - it will be discussed in the debrief.
  - If participants go down a rabbit hole, use an inject to redirect.
  - If a key decision point is avoided, force it with an inject. "The CEO is asking for an update NOW - what do you say?"
  - Keep time. A tabletop that runs over 3 hours loses energy. Be willing to fast-forward.

#### 3.3 Hot Wash and Debrief (30-60 minutes)

Immediately after the exercise ends:

1. **Go around the room:** Each participant shares one thing that went well and one thing to improve.
2. **Facilitator observations:** Share what you observed without judgment. "I noticed that it took 20 minutes before anyone checked the backups."
3. **Capture all feedback** in the debrief notes. Do not problem-solve now - just collect.

#### 3.4 Post-Exercise Deliverables

1. **After-Action Report:** Within `____` business days (recommended: 10 days), produce a report with:
  - Scenario summary and objectives.
  - Timeline of key actions and decisions.
  - Metrics: time to detect, time to notify IRT, time to containment decision, etc.
  - What worked well.
  - What needs improvement.
  - Specific remediation items with owners and due dates.
2. **Remediation Tracking:** All items entered into `____` (ticketing system). Tracked to resolution. Items unresolved before next exercise are escalated.

### Common Pitfalls

> **⚠️ Watch out:** The facilitator participating in the response. The facilitator must remain neutral. If the facilitator says "What about checking the logs?" they're feeding answers. Instead, use an inject: "An engineer notices unusual entries in the auth logs - what do you do with this information?"

> **⚠️ Watch out:** Tabletop that goes perfectly. A tabletop with zero problems found is either too easy or participants aren't being honest. Design the scenario to stress the team and uncover gaps. Celebrate finding gaps - that's the whole point.

---

## Procedure 4: Post-Incident Process

### Standard Approach

#### 4.1 Root Cause Analysis Execution

1. **Timing:** Initiate RCA within `____` business days of incident containment. Do not wait for full resolution - start the analysis while information is fresh.
2. **Five Whys Technique:**
  - Start with the incident's observable effect: "Customer data was exposed."
  - Ask "Why?" → "An S3 bucket was publicly accessible."
  - Ask "Why?" → "The bucket policy was changed during deployment."
  - Ask "Why?" → "The Terraform module had an incorrect default."
  - Ask "Why?" → "The module was written by a contractor without security review."
  - Ask "Why?" → "There was no automated policy checking in the CI/CD pipeline."
  - Root cause: Lack of automated security validation in deployment pipeline.
3. **Fishbone Diagram (for complex incidents):**
  - Categories: People, Process, Technology, Environment.
  - Under each, list contributing factors.
  - Identify the most impactful factors (not everything is equally important).
4. **Corrective Actions:**
  - Each identified root cause and significant contributing factor must have at least one corrective action.
  - Actions must be: Specific, Measurable, Achievable, Relevant, Time-bound (SMART).
  - Example: "Implement Terraform policy validation using Checkov in CI/CD pipeline by [date]. Owner: [name]."

#### 4.2 Lessons Learned Facilitation

1. **Meeting Structure:**
  - **5 min:** Review incident summary (everyone should have read the incident report beforehand).
  - **15 min:** What went well? (Start positive - reinforces good practices.)
  - **20 min:** What could be improved? (Focus on process, not people.)
  - **15 min:** Identify 3–5 specific action items.
  - **5 min:** Assign owners and due dates.
2. **Ground Rules:**
  - Blameless post-mortem. The goal is to improve the system, not assign blame.
  - "We" language: "We didn't have monitoring for this" vs. "Alice didn't set up monitoring."
  - Focus on the future: "How do we prevent this next time?" not "Who caused this?"

#### 4.3 Evidence Retention

1. **Evidence Package:** Compile all incident evidence into a structured archive:
  - `/incidents/YYYY/YYYY-MM-DD-Brief-Title/`
    - `incident_report.md`
    - `rca_report.md`
    - `lessons_learned.md`
    - `timeline.csv`
    - `logs/` (sanitized if necessary)
    - `communications/` (internal and external notifications)
    - `forensic_artifacts/` (if applicable)
2. **Retention:** `____` years (recommended: 3 years minimum, longer if regulatory requirement or pending litigation).
3. **Access Control:** Limit access to incident evidence to the IRT and designated legal/compliance personnel. Evidence may contain sensitive or legally privileged information.

### Common Pitfalls

> **⚠️ Watch out:** RCA that stops at "human error." Human error is almost always a symptom of a process or technology failure. Why was the human able to make that error? Was there insufficient training? Lack of guardrails? Fatigue from being on call for 72 hours? Always dig deeper.

> **⚠️ Watch out:** Lessons learned that produce a long list of action items with no prioritization. A list of 50 improvements, of which 48 are never implemented, is worse than a list of 3 impactful changes that are actually completed. Prioritize by impact and feasibility. Track the top 3 per incident to completion.

---

## Related Documents

- Incident Response Policy (IR-Policy-Template.md)
- Incident Response Process (../Incident-Response-Process/IR-Process-Template.md)
- Business Continuity Plan (../Business-Continuity-Plan/Template.md)
- Disaster Recovery Plan (../Disaster-Recovery-Plan/Template.md)
- Vulnerability Management Policy (../Vulnerability-Management-Policy/VM-Policy-Template.md)
- Risk Assessment Policy (../Risk-Assessment-Policy/RA-Policy-Template.md)
