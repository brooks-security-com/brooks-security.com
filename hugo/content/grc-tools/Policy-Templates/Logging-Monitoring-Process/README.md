# Logging and Monitoring Process Template

## What This Is

The Logging and Monitoring Process is the operational guide for how logs and metrics are collected, stored, retained, and monitored. While the Logging and Monitoring Policy defines what must be logged and protected, this Process defines how it happens: collection architecture, storage tiers, access controls, specific log sources, alert configurations, and review procedures. This is the document your infrastructure and security engineering teams will implement from.

## What It Covers

- Centralized logging platform architecture and data flow
- Agent-based host collection and cloud-native streaming collection methods
- Three-tier storage model: hot (30 days queryable), warm (90-365 days), cold (archival)
- Role-based access control for the logging platform
- Comprehensive catalog of tracked logs (OS, application, database, cloud, security tools)
- Tracked metrics (host and infrastructure level)
- Alert categories: service-level, authentication, utilization, security
- Alert routing by severity (messaging, SMS, ticketing)
- Scheduled manual log review procedures
- Platform health monitoring

## Document Structure

This folder contains two files:

- **`Template.md`** - The process document. Describes HOW to operationalize the related policy.
- **`README.md`** - This overview.

When updating the governing policy, ensure implementation changes flow into this process document.

## Gotchas People Get Wrong

**1. Not defining the collection tier for each log source.** The process describes both agent-based and cloud-streaming collection. Every log source needs an explicit assignment: "PostgreSQL logs → Otel-Collector agent → OpenObserve." Vague "logs are forwarded" language means logs get forgotten. Maintain a log source inventory that maps each source to its collection method and destination.

**2. "We'll configure alerts later."** The hard part of logging isn't collection - it's building useful alerts that fire on real problems without flooding the team with noise. Start alerting on day one with conservative thresholds (high sensitivity, expect false positives), then tune down. Starting with no alerts means you're collecting logs with no monitoring, which is the same as not collecting logs at all.

**3. Storage tier transitions that never get tested.** The process defines hot → warm → cold storage transitions. Have you tested what happens when you need to restore cold storage logs for an investigation that's 18 months old? Restoration time, cost, and data completeness should be validated before you need them for real.

**4. OpenObserve (self-hosted) requires operational care.** If you self-host OpenObserve, you need to manage: storage scaling, backup of the OpenObserve data (it's now a critical system), upgrades, and high availability. If you don't have the operational capacity, consider OpenObserve Cloud or a SaaS alternative.

**5. Logging agent deployment is a configuration management problem.** The process assumes a logging agent is deployed on all hosts. If you don't have configuration management (Ansible, Puppet, Chef, Terraform), you'll have hosts with outdated, broken, or missing agents. Automate agent deployment, configuration, and health checks through your infrastructure-as-code pipeline.

**6. Alerting on "unusual" without defining baseline.** "Network throughput anomalies" and "authentication from unusual locations" require a baseline of normal behavior to detect anomalies. Without at least 2-4 weeks of baseline data and a defined threshold (e.g., "3 standard deviations above the 30-day moving average"), "anomaly" alerts are either uselessly vague or generate constant false positives.

**7. Missing cloud data event logging.** Cloud audit logs (AWS CloudTrail, Azure Activity Log) capture management events by default. But data events - reading S3 objects, querying DynamoDB tables, accessing KMS keys - are often NOT enabled by default and are a separate configuration. If you don't explicitly enable data event logging, you'll have no visibility into data access patterns.

## Implementation Advice

- **Start with authentication logs and privileged access.** If you're building logging incrementally, start with: SSH/RDP authentication logs, sudo/administrator command logs, and IAM/cloud audit logs. These give you the highest security value per engineering hour invested.
- **OpenObserve is genuinely cost-efficient.** Compared to Splunk (expensive per GB), Datadog (expensive at scale), or self-hosted ELK (high operational overhead), OpenObserve provides a good balance. It supports logs, metrics, and traces; has a built-in query engine and alerting; and can be self-hosted in your own cloud environment for data sovereignty.
- **Template your alert configurations.** Create reusable alert templates for each log source type: "NGINX error rate alert," "SSH brute force alert," "Database connection failure alert." When you add a new NGINX server, the alerts are pre-configured, not manually recreated.
- **The manual review requirement needs a checklist.** "Review privileged user activity weekly" is too vague. Create a specific checklist: check all root/sudo actions on production servers, verify all new user creations had tickets, review firewall rule changes against change management records. Without a checklist, manual review becomes skimming.
- **Alert on what stopped working, not just what happened.** The most important alerts aren't "someone did X" - they're "logging from system Y has stopped" and "the centralized platform's disk is 90% full." Silent failures are the most dangerous. Monitor the monitoring system.
- **Align storage tiers with your compliance framework.** SOC 2 auditors typically want 90 days of hot queryable logs for control testing. PCI DSS requires 12 months. GDPR/CCPA may limit how long you can keep PII-containing logs. Map each log source type to its retention requirement and implement lifecycle policies accordingly.
