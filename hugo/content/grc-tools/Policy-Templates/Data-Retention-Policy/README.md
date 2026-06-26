# Data Retention Policy Template

## What This Is

The Data Retention Policy defines how long different categories of data must be kept - and, critically, when it must be deleted. It bridges legal and regulatory requirements with operational data management, ensuring the organization keeps what it needs and disposes of what it doesn't. This policy is a key control for minimizing data breach impact, managing storage costs, and complying with privacy regulations that mandate data minimization.

## What It Covers

- Retention schedules for customer data (active, closed, suspended accounts)
- Employee and personnel data retention by category
- Financial record retention periods
- Operational data and communications retention
- Security and compliance evidence retention
- Secure disposal methods per classification level
- Legal hold procedures that override standard retention
- Backup and archive data lifecycle management

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Data-Retention-Procedures.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Common Gotchas and Mistakes

**1. Retaining data "just in case" with no defined period.** The most common retention failure is indefinite retention. Every terabyte of data kept beyond its useful life is a terabyte you must protect, search during e-discovery, and notify about in a breach. Indefinite retention is a liability, not an asset.

**2. Forgetting about backups.** Deleting data from production systems is only half the battle. Backups, replicas, snapshots, and off-site archives all contain copies that must also be purged. If your backup rotation is 90 days and you delete data from production today, it remains recoverable from backups for 90 days. This must be addressed in the policy and in practice.

**3. Conflicting retention requirements.** Different jurisdictions impose different retention periods for the same data type. For example, tax records may require 3 years in one country and 10 in another. The policy must default to the longest applicable period and document the basis for each requirement.

**4. Inconsistent disposal verification.** Many organizations have a disposal policy but never verify it works. Deleted files recoverable from the recycle bin, database records that are soft-deleted, and cloud storage with versioning enabled all create gaps between policy and reality. Verify disposal through testing.

**5. Ignoring legal holds.** A legal hold must override normal retention schedules, but the process for issuing, tracking, and releasing holds is often ad hoc. Without a documented and enforced legal hold procedure, you risk spoliation of evidence and the associated legal consequences.

## Implementation Advice

- **Build deletion into system design.** Automated data lifecycle management is far more reliable than manual cleanup. Implement TTL (time-to-live) fields, automated archival jobs, and scheduled purging from day one. Retrofitting deletion into a system that was designed to keep everything forever is painful and error-prone.
- **Map retention requirements to regulations explicitly.** For each retention period in the policy, cite the specific regulation or business justification. This makes audits straightforward and helps when regulations change. A matrix mapping data category → retention period → regulatory citation → system of record is gold for auditors.
- **Start with the highest-risk data.** If you cannot implement full lifecycle management at once, prioritize customer data and employee PII. These categories carry the highest breach notification obligations and regulatory penalties. Operational logs can follow later.
- **Test legal hold procedures with a tabletop exercise.** Run a simulated litigation scenario where Legal issues a hold. Verify that IT can identify affected systems, suspend deletion, and confirm preservation. Most organizations discover gaps in their first exercise - finding them before a real litigation is invaluable.
- **Document what you delete.** For Restricted and Confidential data, maintain deletion logs showing what was deleted, by whom, when, and using what method. Some regulations require proof of deletion. A deletion log satisfies this and also provides evidence of policy compliance during audits.
