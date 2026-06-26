# Backup Policy Template

## What This Is

The Backup Policy defines the organization's requirements for protecting data through systematic backup processes. It establishes the 3-2-1 backup framework (three copies, two media types, one off-site) and sets standards for backup frequency, encryption, monitoring, and restore testing. This policy directly supports both operational resilience and audit readiness.

## What It Covers

- Data classification and retention requirements for backup scope
- The 3-2-1 backup framework and implementation standards
- Backup frequency requirements per data classification level
- Backup encryption and storage security
- Restore testing cadence and validation requirements
- Backup monitoring, alerting, and incident response for failures
- Roles and responsibilities for backup operations

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Backup and recovery requirements using the 3-2-1 framework. Defines backup frequency by data classification, encryption standards, restore testing cadence, and monitoring requirements. This is the governance document reviewed by leadership and auditors.
- **`Backup-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Backup job configuration, restore testing procedures, backup monitoring setup, and recovery validation workflows. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Backing up without testing restores.** A backup that has never been restored is not a backup - it's a hope. Auditors expect quarterly restore tests with documented evidence. The most common finding is "backups exist but restore testing does not."

**2. Forgetting SaaS data.** Organizations back up databases and file servers but forget that critical business data lives in Google Workspace, Microsoft 365, Salesforce, and other SaaS tools. These platforms require separate backup solutions. The shared responsibility model means the SaaS provider ensures availability of the platform, not recoverability of your data.

**3. Storing backups in the same region as production.** A single-region disaster (e.g., us-east-1 outage) takes out both production and backups. The "one off-site" in 3-2-1 means geographically separated - different region, different provider, or different facility.

**4. Undefined RPO and RTO.** Saying "daily backups" without defining Recovery Point Objective (RPO) means you've accepted losing up to 24 hours of data. If the business can't tolerate that, you need more frequent backups or continuous replication. Define RPO and RTO per system, not as a blanket statement.

**5. Backup encryption key management.** Encrypted backups are only as secure as the keys. If backup encryption keys are stored in the same place as the backups, you've defeated the purpose. Keys must be managed separately, with their own access controls and backup.

## Implementation Advice

- **Automate backup verification.** Manual restore testing is unsustainable. Use automated scripts that restore to an isolated environment, run integrity checks, and report results. Automate at least the database and file-level validation.
- **Adopt immutable backups.** Modern ransomware targets backup repositories. Use WORM (write-once-read-many) or object lock features in your backup storage to prevent backup deletion or modification for a defined retention window.
- **Define RPO and RTO per system.** Not all data is equal. A customer-facing database may need RPO of 15 minutes; internal wiki content may tolerate 24 hours. Document these decisions and ensure your backup schedule delivers on them.
- **Test the full recovery chain.** Don't just test that data can be extracted from a backup. Test that a restored database connects to the restored application, that DNS resolves, that certificates are valid, and that users can log in. An end-to-end recovery test finds gaps that point-in-time restore tests miss.
- **Monitor backup storage costs.** Cloud backup storage costs grow linearly with data volume and retention. Implement lifecycle policies to move older backups to cheaper storage tiers and enforce retention limits aligned with the Data Classification Policy.
