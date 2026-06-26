# Logging and Monitoring Policy Template

## What This Is

The Logging and Monitoring Policy defines what must be logged, how logs must be protected, how long logs must be retained, and how monitoring must be conducted across the organization's entire technology estate. It is a foundational control - without comprehensive logging, you cannot detect incidents, investigate breaches, or prove control effectiveness to auditors. This policy is referenced by nearly every other security policy in the ISP.

## What It Covers

- Comprehensive list of activities that must be logged (access, data changes, network, admin actions, security events)
- Required log elements (what, who, where, when, how, outcome)
- Clock synchronization requirements (NTP, UTC)
- Log integrity protection (FIM, centralized forwarding, append-only storage, access restrictions)
- Separation of duties for log management (admins cannot delete their own logs)
- Log retention minimums (90 days active recommended, 365 days for compliance)
- Critical security control monitoring and failure response procedures
- Alerting requirements for security events

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Audit logging and monitoring requirements. Defines logged activities, log elements, clock synchronization, log protection controls, retention periods, and monitoring/alerting requirements. This is the governance document reviewed by leadership and auditors.
- **`Logging-Monitoring-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Log collection and forwarding configuration, SIEM integration, alert rule setup, log retention lifecycle management, and monitoring dashboard configuration. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Logging everything but never reviewing.** Enabling verbose logging on all systems and then never looking at the logs provides zero security value and wastes storage. The policy must require both logging AND review (automated alerting + scheduled manual review of privileged activity). Auditors will check whether log review actually happens.

**2. "Retain logs for 30 days" is too short for almost any compliance framework.** PCI DSS requires 12 months. HIPAA requires 6 years. SOC 2 auditors typically expect at least 90 days of live, queryable logs. 30 days is a common default that fails every compliance check. Recommend 90 days active minimum.

**3. Administrators can delete their own activity logs.** If your system administrators have the ability to clear logs on systems they manage, you have zero accountability for privileged actions. The policy must require centralized log forwarding to a system outside admin control, and FIM on log files to detect tampering.

**4. Clock sync is boring until it's catastrophic.** During an incident investigation, if your servers are 5 minutes out of sync, you cannot reliably correlate events across systems to reconstruct the attack timeline. NTP configuration is one of the most commonly missed controls. Every system, including cloud resources, network devices, and containers, must sync to a trusted time source.

**5. Log elements that are useful for operations but not for security.** An access log that records "user X accessed record Y" is useful for debugging. But for security, you also need: was it a success or failure? From what IP? Using what authentication method? At what exact time (with timezone)? Define log elements with forensic investigation in mind.

**6. Not logging the logging system itself.** If your centralized logging platform goes down, how do you know? The policy must require monitoring of the logging infrastructure: log generation rate anomalies, forwarding failures, storage capacity thresholds, and unauthorized access to the logging platform itself.

**7. PII in logs creating a compliance nightmare.** Logs often contain usernames, email addresses, IP addresses, and sometimes full request bodies that include customer PII. These logs are now "personal data" under GDPR/CCPA and subject to the same protection, retention, and data subject access request requirements. Consider log pseudonymization or separate PII-free log streams for third-party sharing (auditors, SIEM providers).

**8. Retention vs. storage cost tradeoff left unaddressed.** 365 days of verbose logs from a production Kubernetes cluster can cost more in storage than the cluster itself. The policy must balance retention requirements with practical storage limits. Define what gets retained for how long: verbose debug logs → 30 days, security-relevant audit logs → 365 days, compliance-mandated logs → per regulation.

## Implementation Advice

- **Centralize before you scale.** Implement a centralized logging platform (recommended: OpenObserve for cost efficiency, or ELK/Splunk/Datadog for larger budgets) before you have more than a handful of servers. Retroactively centralizing logs from 50+ systems is painful. Forward logs in real-time; don't batch.
- **Start with privileged access logging.** If you can only log one thing well, log everything that root/administrator accounts do. This is the highest-value logging for both security investigations and compliance audits. Everything else can be layered on.
- **Use Wazuh for file integrity monitoring.** Wazuh is an open-source, actively maintained OSSEC fork that provides FIM, configuration assessment, and compliance monitoring. It integrates well with centralized logging platforms and is substantially easier to deploy than legacy OSSEC.
- **Automate log review, don't assign it.** "Review logs weekly" assigned to an overworked security engineer means logs never get reviewed. Build automated alerting rules for the patterns you care about (privileged access, authentication failures, security control failures) and alert on anomalies. Manual review should be exception-based, not exhaustive.
- **Log retention is a data lifecycle problem, not just a security problem.** Work with your infrastructure team to implement automated log lifecycle management: hot storage (live, queryable) → warm storage (compressed, slower queries) → cold storage (archival, restore-to-query) → deletion. The centralized logging platform should manage this automatically.
- **Document log sources in an inventory.** Maintain a list of all systems that generate logs, what they log, where logs are forwarded, and retention periods. This inventory is audit gold and essential for incident response. Without it, you'll discover during an investigation that some critical system hasn't been logging for 6 months.
- **Test log completeness quarterly.** Pick a random 24-hour window each quarter and verify that logs from all critical systems are present and complete in the centralized platform. Missing log data is the most common undetected control failure.
