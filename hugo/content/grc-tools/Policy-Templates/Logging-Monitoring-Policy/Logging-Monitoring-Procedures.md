# Logging and Monitoring - Implementation Procedures

Document Title: Logging and Monitoring - Implementation Procedures
Parent Policy: Logging and Monitoring Policy (ISP-____)
Companion Process: Logging and Monitoring Process
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

---

## Purpose

This document provides practical, step-by-step implementation procedures for the Logging and Monitoring Policy. It covers how to configure logging on systems, set up a centralized alerting pipeline, protect audit logs, and establish monitoring routines. This document complements the Logging and Monitoring Process (which covers the centralized platform architecture). Use this document when you need to configure a new system for logging, set up alerts, or establish a log review cadence.

---

## Standard Approach - Configuring Logging from Scratch

### Phase 1: Determine What to Log

**Step 1 - Classify the System**

Before configuring logging, determine the system's role and data sensitivity:

- **Critical Security Control:** Firewall, IDS/IPS, authentication service, SIEM, logging platform itself - these directly affect the security posture.
- **Sensitive Data Handler:** Processes or stores Restricted or Confidential data.
- **Infrastructure Component:** Server, container, network device - foundational but not directly handling sensitive data in most cases.
- **End-User Device:** Workstation, laptop, mobile device.

Logging requirements increase with system criticality.

**Step 2 - Map Required Log Events**

Using the policy's "Logged Activities" section as a checklist, mark which event categories apply to this system. Create a logging specification document (or a row in the system's configuration record) listing each category and whether it's **Required**, **Recommended**, or **Not Applicable**:

| Event Category | Applies To | Required? |
|---|---|---|
| Authentication (login, logout, session) | All systems that authenticate users | REQUIRED |
| Failed access attempts | All systems that authenticate users | REQUIRED |
| MFA events | All systems with MFA | REQUIRED |
| Privileged account usage | All systems with admin/root access | REQUIRED |
| Data CRUD operations (sensitive data) | Sensitive Data Handlers | REQUIRED |
| Network connections | Infrastructure, servers | REQUIRED |
| Firewall rule changes | Network devices, cloud security groups | REQUIRED |
| Administrative actions | All managed systems | REQUIRED |
| Access to audit logs | Logging platform | REQUIRED |
| System startup/shutdown/restart | All systems | REQUIRED |
| Resource exhaustion | All production systems | REQUIRED |
| Security tool alerts | Security tools | REQUIRED |

Document this specification. It will guide both initial configuration and future reviews.

**Step 3 - Define Log Retention Tiers**

For this system's logs, define the retention tiers based on the Data Retention Policy:

| Tier | Duration | What Goes Here |
|---|---|---|
| Hot (live, queryable) | `____` days (recommended: 30) | All security-relevant logs for active investigation and alerting |
| Warm (queryable, slower) | `____` days (recommended: 90-365) | Extended operational and compliance logs |
| Cold (archive) | `____` months/years | Regulatory retention; restorable but not live |

---

### Phase 2: Configure Log Generation

**Step 4 - Enable OS-Level Audit Logging**

**Linux Systems:**

```bash
# Install and enable auditd
sudo apt-get install auditd    # Debian/Ubuntu
sudo yum install audit         # RHEL/CentOS/Amazon Linux

# Enable the auditd service
sudo systemctl enable auditd
sudo systemctl start auditd

# Add rules for critical events (example - customize for your environment)
# Log all commands run as root
sudo auditctl -a exit,always -F euid=0 -F arch=b64 -S execve
# Log changes to /etc/passwd and /etc/shadow
sudo auditctl -w /etc/passwd -p wa -k identity_changes
sudo auditctl -w /etc/shadow -p wa -k identity_changes
# Log changes to sudoers
sudo auditctl -w /etc/sudoers -p wa -k sudoers_changes

# Make rules persistent
sudo cp /etc/audit/rules.d/audit.rules /etc/audit/rules.d/audit.rules.backup
sudo sh -c 'auditctl -l >> /etc/audit/rules.d/audit.rules'
```

**Windows Systems:**
- Enable "Audit Policy" via Group Policy or Local Security Policy (`secpol.msc`).
- Required subcategories to enable: Logon/Logoff, Account Management, Privilege Use, Policy Change, System Integrity.
- Enable command-line process auditing (Group Policy → Administrative Templates → System → Audit Process Creation → Include command line in process creation events).

**Step 5 - Configure Application Logging**

For each application, configure logging output to include the required event categories. General principles:

- **Use structured logging (JSON) wherever possible.** Structured logs are easier to parse, query, and alert on than free-text logs.
- **Include correlation IDs.** Generate a unique request ID at the edge (load balancer or API gateway) and propagate it through all services so you can trace a single user action across distributed systems.
- **Log at appropriate levels:** ERROR for operational failures, WARN for near-threshold conditions, INFO for security-relevant events (authentication, authorization, data access), DEBUG only in troubleshooting scenarios and never in production for systems handling sensitive data.
- **Never log secrets.** Sanitize logs to remove passwords, tokens, API keys, session cookies, and PII unless explicitly required and justified for a specific investigation (and then with strict access controls).

**Example Application Logging Configuration (conceptual):**

```json
{
  "timestamp": "2026-06-26T14:30:00.000Z",
  "level": "INFO",
  "event_type": "user.login",
  "outcome": "success",
  "subject": {"user_id": "u-48291", "ip": "203.0.113.42"},
  "object": {"system": "auth-service", "mfa_method": "webauthn"},
  "correlation_id": "req-abc123",
  "geo": {"country": "US", "city": "Chicago"}
}
```

**Step 6 - Configure Network Device Logging**

For firewalls, routers, switches:

- Enable syslog output to the centralized logging platform's ingestion endpoint.
- Configure at minimum: ACL deny events, configuration changes, administrative login/logout, interface up/down, and system events (reboot, crash).
- For firewalls specifically: log all denied connections AND all allowed connections (the latter is essential for post-breach forensics).
- Set the syslog facility to a dedicated value (e.g., `local0` or `local1`) to distinguish network device logs from server logs.
- Ensure log messages include timestamps synchronized via NTP.

**Step 7 - Configure Cloud Resource Logging**

For cloud environments:

- **AWS:** Enable CloudTrail (management and data events for S3), VPC Flow Logs, Route 53 DNS query logs, and AWS Config. Forward all to the centralized platform via Kinesis Data Firehose or an S3 → Lambda → platform pipeline.
- **Azure:** Enable Activity Logs, Azure Monitor diagnostic settings for all resources (especially Key Vault, NSG flow logs, and Entra ID sign-in/audit logs). Forward to centralized platform via Event Hubs.
- **GCP:** Enable Cloud Audit Logs (Admin Read, Data Read, Data Write), VPC Flow Logs, and Cloud DNS logs. Forward via Pub/Sub to the centralized platform.

**Critical:** For all cloud providers, ensure the log forwarding pipeline is in a separate account/project from the monitored resources, with strict IAM preventing the workload admins from disabling or tampering with the forwarding configuration.

---

### Phase 3: Configure Log Forwarding and Protection

**Step 8 - Deploy the Log Forwarding Agent**

On each managed host:

1. Install the organization-approved logging agent (e.g., OpenObserve Otel-Collector, Vector, Fluentd, Filebeat).
2. Configure the agent to tail the relevant log files (e.g., `/var/log/auth.log`, `/var/log/syslog`, application logs in `/var/log/app/`).
3. Configure the agent to forward to the centralized platform's ingestion endpoint (URL: `____`) using TLS encryption.
4. Enable buffering: configure the agent to buffer logs locally (disk or memory) if the centralized platform is unreachable, with a maximum buffer size of `____` GB. This prevents log loss during network interruptions.
5. Configure the agent to monitor its own health and log forwarding status; forward these agent-health metrics to the platform so you're alerted if a host stops forwarding.

**Step 9 - Protect Audit Logs on Source Systems**

Before logs leave the source system, protect them:

- Set file permissions on log files so only the logging agent and root/administrator can read them. Application users should write logs but not read or delete them.
- Enable file integrity monitoring (FIM) on log directories to detect unauthorized modification or deletion. Recommended tool: Wazuh (OSSEC-compatible, open source) or the FIM capability of your endpoint detection platform.
- Ensure the logging agent runs under a dedicated, low-privilege service account - not root. The agent needs only read access to log files and network egress to the centralized platform.

**Step 10 - Configure the Centralized Platform for Log Integrity**

On the centralized logging platform:

- Enable append-only or WORM (write-once-read-many) storage for audit logs to prevent deletion or modification by platform administrators.
- If the platform supports cryptographic integrity verification (hash chaining or blockchain-based), enable it.
- Configure the platform to log all access to audit logs, including who viewed or exported logs and when.
- Set up a separate "audit" account/project within the platform that receives a copy of all logs and is accessible only to a segregated audit team (separation of duties).

---

### Phase 4: Configure Alerting

**Step 11 - Define Alert Rules**

Translate the policy's alerting requirements into specific alert rules on the centralized platform.

**Authentication Alerts:**

| Alert Name | Trigger Condition | Severity |
|---|---|---|
| Brute Force - Single Source | >`____` failed logins from a single IP in `____` minutes | High |
| Brute Force - Distributed | >`____` failed logins against a single account from `____`+ IPs in `____` minutes | High |
| Impossible Travel | Successful login from location >`____` km from previous login, within <`____` minutes | High |
| Off-Hours Privileged Login | Privileged account login between `____:00` and `____:00` local time, outside approved maintenance windows | Medium |
| MFA Bypass / Failure | MFA challenge failed or bypassed for a sensitive system | High |
| New User Created | Any user creation event, especially if followed by privilege escalation within `____` minutes | Medium |

**Data Access Alerts:**

| Alert Name | Trigger Condition | Severity |
|---|---|---|
| Mass Data Export | >`____` records exported/downloaded in a single session or hour | High |
| Sensitive Data Access - Unusual Pattern | Access to Restricted data by a user/role that hasn't accessed it in the past `____` days | Medium |
| Database Dump | `mysqldump`, `pg_dump`, or equivalent command detected on a production database | Critical |

**Infrastructure Alerts:**

| Alert Name | Trigger Condition | Severity |
|---|---|---|
| Firewall Rule Change | Any firewall rule or security group modification | Medium |
| Audit Logging Disabled | Logging service stopped, agent uninstalled, or forwarding interrupted for >`____` minutes | Critical |
| Resource Exhaustion | CPU >`____`%, memory >`____`%, disk >`____`% for >`____` minutes | High |

**Step 12 - Configure Alert Routing**

Set up routing rules on the centralized platform:

- **Critical severity:** Send to dedicated security channel (`#security-critical` in Slack/Teams) with @channel mention, plus SMS/page to the on-call security engineer. Auto-create a ticket in the incident management system.
- **High severity:** Send to `#security-notifications` with @team mention. Auto-create a ticket.
- **Medium severity:** Send to `#security-notifications` without tagging.
- **Low severity:** Log only; visible on dashboards but no active notification.

**Step 13 - Configure Alert Suppression and Tuning**

Before enabling alerts in production:

- **Set up maintenance windows:** Suppress alerts during scheduled maintenance periods (documented in the change management system) to avoid false alarms during known-good changes.
- **Establish baselines:** Let the system collect data for `____` days before enabling anomaly-based alerts. Alerts like "impossible travel" or "unusual data access" need a baseline of normal behavior to avoid overwhelming false positives.
- **Tune thresholds iteratively:** Start with conservative thresholds (sensitive - might miss real events) and tighten them over the first `____` weeks based on the ratio of true positives to false positives. Goal: >`____`% true positive rate.

**Step 14 - Validate the Alert Pipeline End-to-End**

Run a controlled test:

1. Generate a known-bad event (e.g., perform `____` failed logins from a test IP, or temporarily stop the logging agent on a test host).
2. Verify the event appears in the centralized platform within `____` seconds.
3. Verify the alert fires within `____` seconds of the event arriving.
4. Verify the alert routes to the correct channel(s).
5. Verify a ticket is auto-created (if applicable).
6. Verify an on-call engineer can acknowledge and investigate the alert.

Document the test results. Repeat quarterly or after any major platform changes.

---

### Phase 5: Establish Log Review Cadence

**Step 15 - Configure Automated Review (Alerting)**

The automated alerting configured above provides continuous review for known patterns. This is the primary review mechanism. Ensure the alerting platform has full coverage of the required event categories from the policy.

**Step 16 - Schedule Manual Reviews**

Create a recurring calendar event for manual log review at the cadence specified in the policy (weekly or monthly). Prepare a standard review checklist covering:

- **Privileged User Activity:** Review all administrative/root actions from the past period. Cross-reference with change management tickets - any administrative action without a corresponding approved change is a finding.
- **Failed Authentication Patterns:** Review aggregate failed login statistics. Identify accounts with sustained high failure rates. Investigate any spike.
- **New Accounts and Privilege Escalations:** Review all new user accounts created and all privilege changes. Verify each has a corresponding access request ticket.
- **Security Group / Firewall Changes:** Review all network access changes. Verify each has a corresponding approved change ticket.
- **Audit Log Access:** Review who accessed audit logs and verify legitimate purpose.
- **Failed Log Forwarding:** Review any gaps in log ingestion (missing hosts, time gaps in data).

Assign the review to a named individual each period, with results documented in a shared location at `____`. Anomalies must be escalated via the incident response process.

**Step 17 - Configure Ad-Hoc Review Triggers**

Ensure the team knows that ad-hoc log review is required:
- During any security incident investigation
- When threat intelligence indicates a specific indicator of compromise (IOC) that should be searched across logs
- As preparation for compliance audits (have logs readily available for the audit period)

---

## Alternative Approaches

### 💡 Alternative 1 - Agentless Log Collection via Syslog

Instead of deploying a logging agent on every host, configure all systems to forward syslog directly to the centralized platform or an intermediate syslog server. This is simpler for homogeneous Linux environments and avoids agent management overhead.

**Implementation:** Configure `rsyslog` or `syslog-ng` on each host to forward to a central syslog relay. The relay then forwards structured data to the centralized platform.

**Trade-off:** Less flexibility than agents (no buffering, limited transformation capabilities, no easy metrics collection). You still need agents or separate tooling for Windows, containers, and platforms that don't use syslog. Best suited for small, homogeneous Linux environments.

### 💡 Alternative 2 - Cloud-Native Only (No Self-Hosted Platform)

For cloud-only organizations, skip the self-hosted centralized platform entirely and use the cloud provider's native services: AWS CloudWatch + GuardDuty + Security Hub, or Azure Monitor + Sentinel, or GCP Cloud Logging + Security Command Center.

**Trade-off:** Lower operational burden (no platform to manage), but higher cost at scale and potential vendor lock-in. Multi-cloud organizations will struggle with correlation across providers. Provider-native UIs are generally less powerful than dedicated platforms (Splunk, ELK, OpenObserve).

### 💡 Alternative 3 - SOAR Integration for Alert Enrichment

Enhance the alerting pipeline with a Security Orchestration, Automation, and Response (SOAR) platform between the centralized logging platform and the notification channels. The SOAR can:
- Automatically enrich alerts with threat intelligence (IP reputation, domain age, geolocation)
- Correlate multiple related alerts into a single incident
- Execute automated response playbooks (e.g., block an IP on the firewall when a brute force alert fires)

**Trade-off:** Additional cost and complexity. Most valuable when the alert volume is high enough that manual triage is becoming a bottleneck (typically >50 actionable alerts per day).

---

## Common Pitfalls

### ⚠️ Pitfall 1 - Logging Too Much, Too Noisy

**Symptom:** Every system is configured to log DEBUG-level events. The centralized platform ingest rate is 10× what was planned. Storage costs balloon. Alert queries time out. The security team ignores alerts because 95% are false positives.

**Why It's Dangerous:** A noisy logging environment is only marginally better than no logging. Real security events are buried in the noise. Alert fatigue causes missed incidents.

**How to Avoid:** Log only what the policy requires in production. Use INFO as the default level for security-relevant events, WARN/ERROR for operational issues, and DEBUG only in non-production or temporarily during troubleshooting. Review ingest volumes monthly and identify noisy sources to tune.

### ⚠️ Pitfall 2 - Alert Rules Without Maintenance

**Symptom:** Alerts were configured during initial setup and haven't been reviewed since. New systems have been deployed that generate events that should trigger alerts but don't. Old alerts fire for deprecated systems. Thresholds set a year ago are now wrong for current traffic patterns.

**Why It's Dangerous:** Alert coverage decays over time as the environment changes. Threats that should be detected are missed because no alert was ever configured for the new system or service.

**How to Avoid:** Schedule quarterly alert rule reviews. For each rule, ask: (1) Does this still fire? (2) When it fires, is it actionable? (3) Do we have equivalent coverage for new systems? Use the "alert rule inventory" as a living document, not a one-time setup.

### ⚠️ Pitfall 3 - Logs Without Timestamps, or Wrong Timestamps

**Symptom:** Some systems log in local time, some in UTC, some with no timezone at all. A forensic investigation finds that Event A appears to happen after Event B, but the actual timeline is the reverse because the clocks are 4 hours apart.

**Why It's Dangerous:** Corrupted timelines make root cause analysis impossible and can compromise the admissibility of logs as legal evidence. Attackers exploit time gaps and inconsistencies to hide their tracks.

**How to Avoid:** Enforce NTP synchronization on all systems. All logs must use UTC and ISO 8601 format (`2026-06-26T14:30:00.000Z`). Reject or flag logs without valid timestamps at the centralized platform ingestion layer. Test NTP synchronization quarterly.

### ⚠️ Pitfall 4 - Administrators Can Delete Their Own Logs

**Symptom:** System administrators have the ability to delete or modify log files on the systems they manage. During an investigation of potential insider threat, the logs for the suspect's administrative session are missing - conveniently.

**Why It's Dangerous:** An administrator with malicious intent (or whose credentials have been compromised) can erase evidence of their actions. You lose visibility into the most dangerous class of activity - privileged misuse.

**How to Avoid:** Logs must leave the source system as quickly as possible (near real-time forwarding). Once on the centralized platform, logs must be append-only or WORM-protected. The centralized platform must be in a separate trust boundary that source-system administrators cannot access. Separation of duties: the team managing the logging platform must be different from the team managing the source systems.

### ⚠️ Pitfall 5 - Alerting on the Logging Platform, But Not on the Logging Platform Itself

**Symptom:** Every critical system is monitored, but nobody monitors whether the centralized logging platform is healthy. One day, ingestion stops due to a disk-full condition. Nobody notices for a week. All alerts during that week are silently dropped.

**Why It's Dangerous:** The logging platform is a critical security control. Its failure means you're blind to everything else. A sophisticated attacker might deliberately degrade the logging platform as a first step.

**How to Avoid:** Monitor the logging platform's own health: ingestion rate (alert on sudden drops), storage capacity (alert at 75% and 90%), query performance, alert pipeline health, and platform error rates. Consider a lightweight "canary" check: a separate service generates a synthetic security event every `____` minutes and verifies it reaches the platform and triggers an alert - if the canary dies, the platform is down.

---

## Related Documents

- Logging and Monitoring Policy (ISP-____)
- Logging and Monitoring Process
- Incident Response Policy and Process
- Data Retention Policy
- Data Classification Policy
- System Access Control Policy
- Configuration Management Plan
- Vulnerability Management Policy

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version - extracted implementation procedures from Logging and Monitoring Policy. |
