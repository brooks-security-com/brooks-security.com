# Backup Policy - Implementation Procedures

> **Companion to:** Backup Policy (Template.md)
> **Purpose:** These procedures describe how to implement the backup requirements set forth in the Backup Policy. The policy defines WHAT must be done; this document describes HOW to do it.

---

## Procedure 1: Backup Infrastructure Setup

### Standard Approach

This procedure covers the end-to-end configuration of backup infrastructure, including storage targets, encryption, scheduling, and monitoring.

#### 1.1 Backup Storage Provisioning

1. Provision **two distinct storage targets** for the 3-2-1 framework:
  - **Primary backup target:** `____` (e.g., AWS S3 with Object Lock, Azure Blob with immutable storage, GCP Cloud Storage with retention policies). Configure versioning and object lock / legal hold to prevent accidental or malicious deletion.
  - **Secondary backup target (off-site):** `____` - a separate cloud region or provider, geographically distant from the primary production region. Ensure it is in a different seismic zone, flood plain, and power grid.
2. For on-premises components, provision a local backup appliance (`____`, e.g., NAS with RAID-6, dedicated backup server) as an intermediate staging target before replication to cloud storage.
3. Configure network paths: backup traffic should traverse a dedicated management VLAN or VPN tunnel, not the public internet, unless encrypted at the transport layer.
4. Set storage quotas: `____` TB for production databases, `____` TB for file stores, `____` TB for source code and configuration. Configure capacity alerts at 80% and 90% utilization.

#### 1.2 Backup Encryption Configuration

1. Generate or procure a **customer-managed key (CMK)** in the organization's cloud key management service (`____`, e.g., AWS KMS, Azure Key Vault, GCP Cloud KMS).
2. Configure all backup storage targets to encrypt data at rest using AES-256-GCM with the CMK. Do NOT use provider-managed keys for backups containing Restricted or Confidential data.
3. For backup software that manages its own encryption (e.g., Veeam, Rubrik, BorgBackup), generate a strong encryption key:
   ```bash
   openssl rand -base64 32 > backup_encryption_key.bin
   ```
   Store this key in the KMS/HSM, not in configuration files or environment variables.
4. For backup data in transit between the staging server and cloud storage, enforce TLS 1.3 (or TLS 1.2 with approved cipher suites) for the transport layer.
5. Document key backup and recovery procedures: ensure at least two authorized individuals (dual control) can recover the backup encryption keys.

#### 1.3 Backup Scheduling Configuration

1. **Production Databases:**
  - **Full backup:** Daily at `____:00 UTC` (off-peak hours). Use `pg_dump` (PostgreSQL), `mysqldump` (MySQL), or native cloud database snapshot APIs. Ensure transactionally consistent backups - for PostgreSQL use `pg_dump -Fc` or `pg_basebackup`; for MySQL use `mysqldump --single-transaction`.
  - **Transaction log / WAL backup:** Continuous or at intervals no greater than `____` minutes (recommended: 5–15 minutes). Configure `archive_command` (PostgreSQL) or binary log streaming (MySQL). Test point-in-time recovery monthly.
  - **Retention:** `____` daily full backups (recommended: 30 days), `____` transaction log backups (recommended: 7 days), `____` monthly archives (recommended: 12 months for compliance).
2. **File Stores and Object Storage:**
  - **Full backup:** Daily at `____:00 UTC`. Use `rclone sync` with `--backup-dir` for incremental snapshot capability, or the cloud provider's native replication/cross-region copy with versioning.
  - **Continuous sync (critical paths):** Use `lsyncd` or cloud event-triggered replication for near-real-time sync of directories containing active work product.
3. **Configuration and Infrastructure-as-Code:**
  - Trigger backup on every `git push` to the main branch via CI/CD pipeline: push a tarball of the repository to the backup storage target.
  - Weekly full export of all IaC state files (Terraform state, Ansible inventories, Kubernetes manifests) and configuration databases.
4. **Source Code Repositories:**
  - Daily mirror to an organization-controlled location using `git clone --mirror` or the hosting provider's API export. Store in a separate cloud storage bucket from the primary backup target.
  - Verify that every commit is preserved: compare commit counts between the primary host and the mirror weekly. Any discrepancy triggers an alert.
  - For GitHub/GitLab: use the provider's migration/export API to download a full archive (including issues, PRs, wikis, and metadata) at least weekly.

#### 1.4 Source Code Backup - Independent Preservation

Source code must be preserved independently of the primary hosting provider. Configure:

1. **Automated Mirror Pipeline:**
   ```bash
   # Example: nightly cron job on a dedicated backup runner
   git clone --mirror https://github.com/org/repo.git /backup/repos/repo.git
   cd /backup/repos/repo.git && git fetch --all --prune
   ```
2. **Multi-Provider Strategy:** Store mirrors in at least two locations:
  - Cloud object storage (separate region from production).
  - A secondary Git host (e.g., if primary is GitHub, mirror to AWS CodeCommit, GitLab, or a self-hosted Gitea instance) as a hot standby.
3. **Metadata Preservation:** Beyond `git` data, export and backup:
  - Issues, pull requests, and comments (use provider API or tools like `github-issues-export`).
  - Wiki pages (clone the wiki repository).
  - CI/CD pipeline definitions (export as YAML/JSON).
  - Project boards and milestones.
4. **Integrity Verification:** After each mirror, run `git fsck` on the backup copy and log the result. Any corruption triggers an alert and re-mirror.

### Alternative Approaches

> **💡 Why you might choose differently:** Organizational size, data volume, and cloud maturity may favor different architectures.

- **Database-Native Replication Instead of Dumps:** For very large databases (>1 TB), nightly dumps become impractical. Use streaming replication to a read replica in a separate region, with point-in-time recovery enabled. The replica serves as the backup, and periodic snapshots of the replica provide long-term retention. Requires the replica to be in a separate account or subscription.
- **Deduplication Appliances for On-Prem:** Organizations with significant on-premises footprint may benefit from hardware or virtual deduplication appliances (e.g., Dell Data Domain, ExaGrid). These reduce storage costs but add complexity and a hardware dependency. Ensure the appliance itself is backed up.
- **SaaS Backup Platforms:** For SaaS-heavy organizations (Google Workspace, Microsoft 365, Salesforce), use a dedicated SaaS backup platform (e.g., Afi, Backupify, Spanning) rather than attempting to back up SaaS data with generic tools. Verify that the platform covers all relevant SaaS services and supports granular restore.

### Common Pitfalls

> **⚠️ Watch out:** Backups that are never tested. A backup that cannot be restored is not a backup - it's a placebo. Schedule restore tests on a recurring calendar with mandatory participation. The first restore test will almost always fail; fix the issues and retest.

> **⚠️ Watch out:** Cataloging the backup encryption key alongside the backup data. If the key is in the same storage account and an attacker compromises that account, they have both the lock and the key. Store encryption keys in a separate KMS/HSM with different access credentials and auditing.

> **⚠️ Watch out:** Source code that lives only in GitHub/GitLab. If the provider has an outage, suspends your account, or is compromised, you lose not just your code but your entire development history, issues, and CI/CD configuration. Always maintain an independent mirror.

> **⚠️ Watch out:** Backup job failures that go unnoticed for weeks. A monitoring dashboard showing green for "Last backup: 3 weeks ago" means no backups. Require daily verification of backup job completion and surface failures as P1 incidents.

> **⚠️ Watch out:** Immutable backups that are immutable to you too. Write-once-read-many (WORM) storage protects against ransomware but also prevents you from deleting data subject to GDPR erasure requests. Have a documented, audited process for authorized deletion of specific records from WORM backups when legally required.

---

## Procedure 2: Restore Testing

### Standard Approach

This procedure covers how to execute and document backup restore tests.

#### 2.1 Quarterly Restore Testing

1. **Test Selection:** Each quarter, select a random sample from the backup catalog:
  - 1 production database (rotate through all databases over the year).
  - 1 file store or object storage bucket.
  - 1 configuration repository or infrastructure-as-code state file.
  - 1 source code repository.
2. **Isolated Restore Environment:** Provision a temporary environment:
  - A separate cloud account / subscription or VPC with no network path to production.
  - Minimal compute resources matching the restore target's requirements.
  - Logging and monitoring enabled for audit trail.
3. **Restore Execution:**
  - Restore the selected backup to the isolated environment using the documented restore procedure.
  - Record the wall-clock time from restore initiation to data availability.
  - Compare restore time against the defined RTO for that data type. Flag any violation.
4. **Validation Checks:**
  - **Completeness:** Compare file counts, database row counts, and total data size between the backup and restored data.
  - **Consistency:** Run application-level integrity checks (`pg_dump` schema validation, checksum comparison on files, `git fsck` on source repos).
  - **Functionality:** For database restores, connect a test application instance and verify queries return expected results. For file restores, open a sample of files and verify they are not corrupted.
5. **Documentation:** Record results in the restore test log:
  - Date, tester name, backup source, restore target, time taken, validation results, any failures.
  - Store in `____` (shared document repository) and retain as audit evidence for minimum 7 years.
6. **Remediation:** Any test failure creates a tracked ticket in `____` with a remediation deadline of `____` business days. The ticket must be resolved before the next quarterly test cycle.

#### 2.2 Annual Application-Level Validation Test

1. Once per year, perform a full application stack restore:
  - Provision a complete but isolated replica of the production infrastructure using infrastructure-as-code.
  - Restore the most recent database and file store backups.
  - Deploy the application and run the full integration test suite.
  - Have `____` (QA / Engineering) sign off on functional completeness.
2. This test validates that backups are not just recoverable at the data level but that the entire system can be reconstituted and function correctly.

### Alternative Approaches

> **💡 Why you might choose differently:** Testing frequency and depth may vary by organizational maturity and regulatory requirements.

- **Automated Validation Pipelines:** For organizations with mature CI/CD, automate restore testing in a pipeline that runs weekly. Spin up a temporary environment, restore the latest backup, run a suite of validation queries, and tear down. Failures generate Jira tickets automatically. This catches restore issues within days, not months.
- **Chaos Engineering Approach:** Randomly "lose" a production dataset (in a controlled way) and require the operations team to restore from backup within the RTO. This tests both the backup integrity AND the team's muscle memory for executing restores under pressure.
- **Regulatory-Driven Testing:** For organizations subject to specific regulations (FFIEC, HIPAA, PCI DSS), align test cadence and scope with regulatory requirements. Some regulations require twice-annual testing or specific types of validation.

### Common Pitfalls

> **⚠️ Watch out:** Testing restores of the oldest backups but never the newest. Restore the most recent backup each test cycle - this is the one you'd actually use in a real disaster. Old backups may be intact while yesterday's backup is corrupted.

> **⚠️ Watch out:** Restore testing that doesn't cover dependencies. Restoring a database is not enough if the application needs that database plus a configuration file, plus an encryption key, plus a specific library version. Test the full dependency chain at least annually.

> **⚠️ Watch out:** Failing to account for backup storage egress costs. Restoring 10 TB from cloud storage to a test environment can incur hundreds of dollars in egress fees. Budget for test egress costs and use same-region restore targets where possible to minimize costs.

> **⚠️ Watch out:** "The restore worked" being the only recorded result. Document recovery time, validation checks passed/failed, and any errors. A restore that "mostly worked" (90% of files recovered) is a FAILURE - 10% data loss is likely above the RPO.

---

## Procedure 3: Backup Monitoring and Alerting

### Standard Approach

#### 3.1 Backup Job Monitoring

1. **Centralized Logging:** Configure all backup tools (database dump scripts, rclone, cloud backup services) to output structured logs (JSON preferred) shipped to the centralized log management platform (`____`, e.g., OpenObserve, Elastic, Splunk).
2. **Dashboard:** Create a backup status dashboard showing:
  - Last successful backup time for each data source (database, file store, config, source code).
  - Backup job status (success/failure/running) for the last 24 hours.
  - Backup duration trend (increasing duration may indicate growing data or performance issues).
  - Storage capacity utilization and trend.
3. **Alert Rules:**
  - Backup job failure: Alert immediately (P1) to `____` (Operations Team) via messaging platform and ticketing system.
  - Backup job exceeding expected duration by >50%: Alert (P3).
  - Storage capacity >80%: Alert (P3). >90%: Alert (P2). >95%: Alert (P1).
  - No successful backup for a data source in >`____` hours (recommended: 30 hours for daily backups): Alert (P1).

#### 3.2 Retention Compliance Monitoring

1. Run a monthly report comparing actual retained backups against the retention policy:
  - Count of daily backups retained vs. target.
  - Count of weekly/monthly archives vs. target.
  - Any gap in the backup chain (missing day, missing transaction log).
2. Automate retention cleanup: configure lifecycle policies on backup storage to automatically delete backups older than the retention period. Verify monthly that auto-cleanup is functioning.
3. For compliance purposes, generate a monthly backup compliance report. Archive for `____` years (minimum 7 years for security documentation).

### Common Pitfalls

> **⚠️ Watch out:** Alerting on backup failure but not on backup silence. If the backup script crashes silently (zero exit code due to a wrapper bug), you get no alert and no backup. Monitor for the *absence* of success, not just the *presence* of failure. Use a dead-man's-switch approach: if no success event is received in X hours, alert.

> **⚠️ Watch out:** Backup monitoring that depends on the same infrastructure being backed up. If your monitoring server is in the same cloud region that went down, you won't know backups are failing. Use an external monitoring service (e.g., Healthchecks.io, Better Uptime) or a cross-region monitoring deployment.

---

## Related Documents

- Backup Policy (Template.md)
- Disaster Recovery Plan (../Disaster-Recovery-Plan/Template.md)
- Disaster Recovery Process (../Disaster-Recovery-Process/Template.md)
- Backup Integrity Testing Process (../Backup-Integrity-Testing-Process/Template.md)
- Encryption Policy (../Encryption-Policy/Template.md)
- Asset Management Policy (../Asset-Management-Policy/AMP-Template.md)
