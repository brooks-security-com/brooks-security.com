# Data Retention Policy - Implementation Procedures

> **Companion to:** Data Retention Policy (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Retention Schedule Management
### Standard Approach
1. Create and maintain a master retention schedule - a single source of truth documenting every data category, its retention period, the regulatory or business justification, and the system(s) of record where that data resides.
2. For each data category in the policy, populate the retention schedule with:
   a. Data category (matching the policy categories).
   b. Retention period (minimum and maximum, if applicable).
   c. Regulatory citation(s) that drive the retention period (e.g., "IRS requires 7-year retention of tax records per 26 CFR 1.6001-1").
   d. System(s) of record where this data is stored.
   e. Data owner responsible for authorizing disposal.
   f. Disposal method and verification.
3. When regulations change or new data categories are introduced:
   a. The Legal team notifies the Data Governance Officer or policy owner of the regulatory change.
   b. The retention schedule is updated within 30 days.
   c. Affected system configurations (automated deletion jobs, archival rules) are updated within 60 days.
   d. The update is communicated to data owners and system administrators.
4. Review the full retention schedule annually:
   a. Verify each retention period against current regulations. Laws change.
   b. Verify each system of record is still accurate. Systems are decommissioned, data migrates.
   c. Identify data categories with "indefinite" retention. Challenge the justification. Indefinite retention must have a documented, approved business or legal rationale.
5. Publish the retention schedule in a location accessible to Legal, IT, and data owners. Do not bury it in a policy document nobody reads.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Data catalog integration:** Instead of a standalone retention schedule, manage retention metadata in a data catalog (Alation, Collibra, Atlan) or data governance platform. Retention periods become properties of data assets, visible alongside ownership, quality, and lineage metadata.
> - **Jurisdiction-based schedule:** For multi-jurisdiction organizations, maintain the retention schedule segmented by legal jurisdiction. The same data category may have different retention periods in the EU (GDPR), US (various), and APAC. The effective retention period is the longest applicable period.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Retention schedule that conflicts with backup retention.** If the retention schedule says "delete customer data 90 days after account closure" but backups are kept for 12 months, the data survives in backups for 9 months beyond its deletion deadline. Align backup retention cycles with the retention schedule - or document the gap as an accepted risk.
> - **Retention period without a justification.** Every retention period needs a "why." If the only justification is "we've always kept it for 7 years," audit that. Undefined retention creates unnecessary liability. If there's no legal or business requirement, shorten it.

## Procedure 2: Automated Deletion
### Standard Approach
1. For each system of record, implement automated data lifecycle management:
   a. Identify data that can be programmatically associated with a retention trigger date (account closure date, record creation date, last access date, employment termination date).
   b. Implement a TTL (time-to-live) mechanism: a scheduled job or database task that identifies records past their retention period and executes deletion.
   c. The TTL job must calculate the effective deletion date as: trigger date + retention period + any active legal holds. If a legal hold exists for the data, deletion is suspended.
2. Before deploying automated deletion to production:
   a. Test in a non-production environment. Verify that the correct records are identified and that no records within their retention period are deleted.
   b. Implement a "soft delete" grace period (e.g., 30 days) where deleted records are recoverable before permanent deletion.
   c. Log every deletion: record identifier, data category, trigger date, calculated deletion date, actual deletion date, and job execution details.
3. Schedule deletion jobs during low-usage windows to minimize performance impact. Monitor job execution - a failed deletion job must generate an alert.
4. For systems where automated deletion is not technically feasible (legacy systems, third-party SaaS without API access), document the manual deletion process:
   a. Scheduled task with calendar reminder.
   b. Step-by-step procedure for the system administrator.
   c. Verification step to confirm deletion.
5. Document the gap for any system where neither automated nor manual deletion is feasible. Present this gap in the risk register with compensating controls.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Cloud-native lifecycle policies:** For cloud storage (S3, Azure Blob, GCS), use native lifecycle management policies instead of custom TTL jobs. Configure rules to automatically transition objects to cold storage, then delete after the retention period. This requires no custom code and is managed at the infrastructure layer.
> - **Database partitioning by retention window:** For large-scale databases, partition data by retention window (e.g., one partition per month). When a partition ages beyond the retention period, drop the entire partition. This is faster and more efficient than row-by-row deletion.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Deleting data that's still referenced.** If you delete a customer record but an open support ticket references that customer ID, the ticket becomes orphaned. Before deleting referenced data, verify that all references can handle the deletion gracefully (or cascade-delete them).
> - **Deletion that doesn't actually delete.** A DELETE in many databases is a soft delete - the record is flagged as deleted but remains physically recoverable. For Restricted and Confidential data, follow logical deletion with physical reclamation (database vacuum, secure overwrite, or cryptographic erasure).
> - **Automated deletion that runs silently for months with a bug.** Monitor deletion job logs. If a job that should delete thousands of records suddenly deletes zero records for weeks, something is broken. Set up anomaly detection on deletion job output volumes.

## Procedure 3: Legal Hold Process
### Standard Approach
1. Legal hold issuance:
   a. The Legal team identifies a matter requiring preservation (litigation, investigation, audit, regulatory inquiry).
   b. Legal issues a written legal hold notice containing: matter identifier, description of the matter, scope of data to be preserved (data categories, systems, custodians, date ranges), effective date, and Legal point of contact.
   c. The notice is distributed to all identified custodians (data owners, system administrators, and any Personnel whose data is within scope).
   d. Custodians must acknowledge receipt of the notice within 2 business days. Non-respondents are escalated to their manager and Legal.
2. Technical implementation of a legal hold:
   a. IT identifies all systems within the hold scope.
   b. For each system, implement preservation measures: suspend automated deletion jobs for the affected data, disable user-initiated deletion capabilities, preserve backup media for the retention period beyond normal rotation, and in litigation-support platforms, place a legal hold flag on custodians' data.
   c. Document technical actions taken: system, action, date, and responsible individual.
3. Legal hold management:
   a. Legal maintains a legal hold register: all active holds with scope, custodians, and status.
   b. Custodians receive quarterly reminders that the hold remains in effect. This prevents "I forgot about the hold and resumed normal deletion."
   c. When a custodian leaves the organization, their data covered by a hold is preserved and reassigned to a successor custodian.
4. Legal hold release:
   a. Legal issues a written release notice: matter identifier, confirmation that preservation is no longer required, effective date of release.
   b. IT removes technical preservation measures and normal retention/deletion processes resume.
   c. Data that was preserved beyond its normal retention period is now past retention and is disposed of through normal processes.
   d. The hold is closed in the legal hold register with the release date recorded.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Legal hold platform (e.g., Relativity, Exterro, Onna):** For organizations with frequent litigation, deploy a dedicated legal hold platform that automates custodian notifications, tracks acknowledgments, integrates with cloud and email systems for automated preservation, and provides auditable reporting.
> - **Preservation in place vs. collection:** For some matters, "preservation in place" (suspend deletion where data lives) is sufficient. For others, Legal may require collection - making a forensic copy of the data and storing it in a separate, secured repository. This procedure covers preservation in place; collection requires additional forensic procedures.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Legal hold that's an email with no tracking.** "Hey IT, don't delete anything related to Project Alpha" - sent 18 months ago, forgotten by everyone, and the only copy is in a departed employee's inbox. Legal holds must be formal tracked documents, not ad-hoc emails.
> - **Custodian who doesn't know they're a custodian.** The most common spoliation scenario: Legal sends a hold notice to a department head, who doesn't forward it to the individual contributor who actually manages the data. The individual continues normal deletion and data is lost. Legal must identify custodians at the individual level, not the department level.
> - **Releasing a hold without confirmation.** Legal issues a release notice on Friday afternoon. IT doesn't see it until Monday. Over the weekend, a custodian deletes data that was still under hold because they hadn't received the release. The release notice must be acknowledged by all custodians before preservation measures are lifted.

## Procedure 4: Backup Deletion
### Standard Approach
1. Align backup retention with the data retention schedule:
   a. Map each data category to the backup systems that contain copies of that data.
   b. Define the backup deletion timeline: when data is deleted from production, the corresponding backup copies must be purged within the backup rotation cycle (maximum 90 days, or as specified in the policy).
   c. Document the gap if backup retention exceeds production retention. Every gap requires a documented justification or compensating control.
2. For backup systems that support granular deletion (e.g., backup software with file-level restore capability):
   a. Implement a process to identify backup sets containing data past its retention period.
   b. Expire or delete those backup sets during the next backup maintenance window.
   c. Log the deletion: backup set identifier, data category, retention trigger date, deletion date.
3. For backup systems that do NOT support granular deletion (e.g., immutable backups, WORM storage, tape archives):
   a. Document the limitation. Immutable backups cannot be selectively deleted.
   b. Implement compensating controls: (i) encrypt backup media so that data is cryptographically inaccessible after the key is destroyed, or (ii) accept the extended retention as a documented risk, or (iii) exclude data with short retention periods from the backup scope.
   c. If encryption-key-destruction is used as the deletion method, the key destruction must be verified and logged, and the key must not exist in any backup or key management system replication.
4. Test backup deletion:
   a. Annually, select a sample of data deleted from production. Attempt to recover it from backups.
   b. If recovery is possible beyond the allowed retention period, the backup deletion process has failed. Remediate.
5. Include backup deletion status in the quarterly data governance review: number of backup sets expired, volume of data purged from backups, and any backups that could not be purged due to technical limitations.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Separate backup policies by data classification:** Store Restricted data backups on a shorter rotation cycle (e.g., 30 days) and Internal data backups on a longer cycle (e.g., 90 days). This minimizes the backup retention gap for the most sensitive data without requiring granular deletion capability on all backup systems.
> - **No backups for data with very short retention:** If certain data categories have a retention period of 30 days or less, evaluate whether backups are necessary. If the data can be regenerated or restored from source systems, excluding it from backup scope eliminates the backup deletion problem entirely.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Assuming the backup system deletes old backups automatically.** Backup systems retain data according to THEIR retention policies, which are independent of YOUR data retention policy. A backup system configured for "retain 12 monthly backups" will keep data for 12 months regardless of what the policy says. Align backup retention configuration with the data retention schedule.
> - **Off-site backups and disaster recovery replicas forgotten.** The primary backup system gets configured for appropriate retention, but the off-site copy (DR replica, tape archive in Iron Mountain, cloud backup copy) retains data on its own schedule. Every copy of backup data must be included in the backup deletion procedure.
> - **Key destruction that isn't verified.** If you use encryption key destruction as your deletion method for immutable backups, you must verify that NO copy of the key exists - not in the key management system, not in HSM backups, not in key replication to another region. A single surviving key copy makes the data recoverable and the deletion ineffective.
