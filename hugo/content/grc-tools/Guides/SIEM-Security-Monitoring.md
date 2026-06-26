# SIEM and Security Monitoring Tools

## What problem this solves

Log management collects your logs. A SIEM (Security Information and Event Management) makes sense of them from a security perspective. It correlates events across systems - one failed login on a server might be nothing. Five thousand failed logins across ten servers in three minutes is a brute force attack. A SIEM detects that pattern and alerts you.

A SIEM also provides pre-built detection rules for common attack patterns, dashboards for security posture, and case management for investigating incidents.

## Do you actually need this

If you have compliance requirements (SOC 2, ISO 27001, PCI), yes. Auditors will ask how you monitor for security events.

If you have customer data and more than a handful of employees, the answer is still yes but you may be able to start with a lightweight option.

If you are a solo founder with no compliance requirements and no customer data, log management with basic alerting is enough. A full SIEM is overkill.

## Options by budget tier

### Free / Open Source (under $100/month infrastructure)

**Wazuh**
- Open source SIEM and XDR platform. Fork of OSSEC with a modern interface.
- Includes file integrity monitoring, vulnerability detection, configuration assessment, and compliance mapping (PCI DSS, GDPR, HIPAA).
- Agents deploy to Linux, Windows, and macOS.
- Good fit: Organizations that need SIEM capabilities on a budget and have someone who can manage Linux infrastructure.
- Rough infra cost: $30-100/month for a modest deployment plus agent deployment time.
- Weak spot: The web interface is functional but not polished. Rule tuning takes time. Community support is decent but you will be solving your own problems.

**Elastic Security (free tier)**
- The security module built on top of Elasticsearch. Includes SIEM detection rules, endpoint security integration, and case management.
- Good fit: Teams already running Elasticsearch for log management who want to add security monitoring.
- Weak spot: The free tier's detection rules are limited. Most useful features require a paid license. Resource requirements are significant if you are also using Elasticsearch for log management.

### Moderate Cost ($200-1,000/month)

**Elastic Security (paid tier)**
- Unlocks pre-built detection rules, machine learning anomaly detection, and endpoint security integration.
- Pricing: Per-resource or subscription tiers.
- Good fit: Organizations that want an integrated log management and SIEM platform.
- Weak spot: The pricing model is complex and changed multiple times in recent years. Verify total cost before committing.

**Cloud-native SIEM (AWS Security Hub, Google Chronicle, Azure Sentinel)**
- If your infrastructure is entirely in one cloud provider, their native SIEM may be sufficient.
- AWS Security Hub aggregates findings from GuardDuty, Inspector, Macie, IAM Access Analyzer into a single dashboard. Inexpensive at low volume.
- Google Chronicle (now Google Security Operations) provides a more traditional SIEM experience with big-data backend.
- Azure Sentinel is tightly integrated with Microsoft's security ecosystem.
- Good fit: Single-cloud organizations that want minimal additional tooling.
- Weak spot: Multi-cloud or hybrid environments create blind spots. Migrating off a cloud-native SIEM is difficult.

### Enterprise ($1,000+/month)

**Splunk Enterprise Security**
- The most widely deployed commercial SIEM. Extensive pre-built detection content, compliance frameworks, and threat intelligence integration.
- Pricing: On top of Splunk's already-expensive log ingestion pricing.
- Good fit: Organizations with compliance requirements, security operations teams, and significant budget.
- Weak spot: Total cost can exceed $100,000/year for moderate log volumes. Many organizations buy it for compliance and then underuse it.

**Managed SOC / MDR Services**
- A third party monitors your environment 24/7 and escalates real threats to you.
- Examples: Arctic Wolf, Red Canary, Expel, CrowdStrike Falcon Complete.
- Pricing: $5,000-20,000+/year depending on environment size and coverage.
- Good fit: Organizations that need 24/7 monitoring but cannot staff a security operations center.
- Weak spot: The service is only as good as the data you send them. If your log coverage is incomplete, their detection is incomplete. You still need someone internal to respond to their escalations.

## How to evaluate

1. **Ship real security events to it for a POC.** Generate a failed SSH login, a privilege escalation, a suspicious process execution. Does the SIEM detect these out of the box, or do you need to write custom rules?

2. **Test the alert noise level.** Run the SIEM for a week with out-of-the-box rules. How many alerts fired? How many were false positives? A SIEM that generates 500 alerts a day will be ignored by day three.

3. **Check compliance framework coverage.** If you need PCI DSS reporting, does the SIEM have pre-built PCI dashboards? If SOC 2, does it map to the CC criteria? Building compliance reports from scratch is time-consuming.

4. **Verify agent coverage.** Can the SIEM's agents deploy to all your operating systems and cloud environments? A detection gap exists wherever an agent cannot be installed.

5. **Test incident response workflow.** Can you escalate an alert to an investigation case, add notes, attach evidence, and track it to closure? If case management is weak, your team will revert to spreadsheets.

## Common mistakes

**Buying a SIEM before you have logs to feed it.** A SIEM without centralized logs is a dashboard with nothing on it. Build log management first, then add SIEM.

**Accepting default alert rules without tuning.** Every SIEM ships with rules that generate noise in your specific environment. Plan for at least a month of tuning after deployment. If you deploy and walk away, your team will develop alert fatigue and ignore everything.

**Underestimating the staffing requirement.** A SIEM detects threats. Someone still needs to investigate those threats. If you have no one to triage SIEM alerts, you bought a very expensive notification system that nobody reads. Entry-level managed SOC services start around $5,000/year and solve this problem for most small organizations.

**Assuming cloud-native means zero configuration.** AWS Security Hub aggregates findings automatically, but those findings still need to be reviewed and acted on. Turning on Security Hub without a process for handling findings is security theater.

**Overlooking agent deployment and maintenance.** A SIEM agent that crashes silently on 30 percent of your servers creates a 30 percent detection gap. Monitor agent health as carefully as you monitor security alerts. If you cannot maintain agents across your fleet, consider agentless collection methods or managed services.
