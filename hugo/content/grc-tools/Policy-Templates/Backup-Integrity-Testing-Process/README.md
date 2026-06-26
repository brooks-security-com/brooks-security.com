# Backup Integrity Testing Process Template

## What This Is

The Backup Integrity Testing Process is an operational procedure document that defines exactly how the organization validates that its backups are restorable and contain uncorrupted data. It converts the Backup Policy's "quarterly restore tests" requirement into a repeatable, auditable process covering databases, file storage, SaaS platforms, and source code repositories.

## What It Covers

- Testing frequency and triggering conditions
- Database backup restore and validation procedures
- File/object storage item-level restore testing
- SaaS platform restore validation (email, files, calendar)
- Source code repository backup verification
- Acceptance criteria and pass/fail thresholds
- Documentation and reporting requirements for audit evidence

## Document Structure

This folder contains two files:

- **`Template.md`** - The process document. Describes HOW to operationalize the related policy.
- **`README.md`** - This overview.

When updating the governing policy, ensure implementation changes flow into this process document.

## Gotchas People Get Wrong

**1. Testing only that backup files exist, not that they restore.** Running `aws s3 ls` on your backup bucket proves the files are present but says nothing about whether they contain valid data or will restore successfully. The restore is the test.

**2. Restoring to production.** Never run integrity tests against production environments. Always restore to an isolated, scaled-down test environment. Production restore accidents are among the most common and most damaging backup-testing mistakes.

**3. Ignoring SaaS platforms.** Most organizations now store more critical data in SaaS tools (Google Workspace, Microsoft 365, Salesforce) than in self-managed databases. Few test their SaaS backups. If you can't restore a deleted shared drive or a compromised executive mailbox, you don't have a complete backup program.

**4. Not validating application-layer integrity.** A database backup may restore cleanly but return garbled data if the backup captured a mid-transaction state, or if the application expects data relationships that were broken during backup. Run application-level queries - not just `SELECT COUNT(*)` - against restored data.

**5. Skipping cleanup.** Test environments, restored databases, and cloned repositories cost money and create security exposure if left running. Every test procedure must include explicit cleanup steps. Automate cleanup to prevent "I forgot to delete the test RDS instance" surprises on the monthly cloud bill.

## Implementation Advice

- **Automate the entire test chain.** Build an automation playbook (Ansible, Terraform, custom scripts) that provisions a test environment, runs the restores, executes validation queries, documents results to a wiki or shared document, and tears down the environment. Run it on a quarterly schedule.
- **Pre-write the quarterly report template.** Create a Confluence page, Google Doc, or Notion template with all sections pre-populated. Each quarter, copy the template, run the tests, and fill in the results. This ensures consistent formatting and makes audit evidence collection trivial.
- **Start testing databases and SaaS first.** If you have limited resources, prioritize database backups (they hold the most structured, hard-to-recreate data) and SaaS backups (they're the most commonly overlooked). File storage testing can follow once those are solid.
- **Define clear acceptance criteria.** "Restore works" is not measurable. Define pass/fail in terms of: restore duration (must complete within X minutes), row count deviation (within Y%), checksum match rate (100%), and application test pass rate (Z%).
- **Link failures to your incident or ticketing system.** A test failure that sits in a quarterly report without a remediation ticket is a finding waiting to happen in an audit. Every failure should auto-create a tracked issue with a severity level and SLA.
