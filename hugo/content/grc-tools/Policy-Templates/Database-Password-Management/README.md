# Database Password Management Process Template

## What This Is

The Database Password Management Process defines the operational procedures for managing, rotating, and securing database credentials across all production and non-production database systems. It complements the Password Policy by providing the specific, tactical steps for credential rotation - both automated (via secrets management services) and manual (for legacy systems). Without this process, password rotation is a policy without a procedure.

## What It Covers

- Credential storage architecture (secrets management service, environment files)
- Connection patterns (direct secrets retrieval vs. environment variable injection)
- Automated and manual password rotation procedures
- Rotation schedules per environment tier
- Post-rotation verification steps
- Rotation failure response and rollback procedures
- Access control requirements for database credentials
- Multi-server coordination during rotations

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Gotchas People Get Wrong

**1. Rotating a password and breaking everything.** The most common rotation failure: update the database password, forget to update the application that connects to it, application goes down. This is why automated rotation built into a secrets management platform is superior - it coordinates both sides of the rotation. If you must rotate manually, always update the application last, not the database last.

**2. Hardcoding connection strings.** Applications with database credentials hardcoded in source code, compiled binaries, or unversioned configuration files cannot be rotated without a code change and redeployment. Every database-dependent application must retrieve credentials from a secrets management service or, at minimum, from environment variables externalized from the codebase.

**3. Shared database credentials.** If multiple applications share the same database user and password, rotating that credential requires coordinating all applications simultaneously. This is fragile and dangerous. Each application must have its own database user and credential. Shared credentials are a security antipattern and a rotation blocker.

**4. Not testing rotation before it's scheduled.** The first time you rotate a production database password should not be during the scheduled rotation window. Test the rotation procedure in a non-production environment first. Verify that the application handles the credential change gracefully - some applications cache connections and need a restart; others support live credential refresh.

**5. Forgetting connection pool behavior.** Database connection pools may hold connections open with the old password for minutes after rotation. If the database immediately invalidates the old password, all pooled connections fail simultaneously. Configure connection pools to test connections before use, set reasonable idle timeouts, and plan for a brief connection disruption during rotation.

## Implementation Advice

- **Standardize on a secrets management service.** AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, or GCP Secret Manager - pick one and use it for all database credentials. Include automatic rotation where supported. The goal is zero manual rotation procedures.
- **Inventory every database connection.** You can't rotate credentials you don't know about. Maintain a living inventory of every application-to-database connection: which app, which database, which credential storage method, which rotation method. Update this inventory whenever a new database or application is deployed.
- **Schedule rotations during maintenance windows and automate the calendar.** Create recurring calendar events for every manual rotation, with links to this process document and the specific application inventory entries. Calendar reminders prevent forgotten rotations. Even better: automate the entire rotation so the calendar event becomes a verification checkpoint, not a manual procedure.
- **Monitor for rotation failures in real time.** After a rotation, watch application error rates, database authentication failures, and connection pool metrics for at least 30 minutes. If you see a spike, the rotation may have failed silently. Set up monitoring dashboards that make rotation health visible.
- **Use break-glass credentials sparingly and log every use.** Break-glass or emergency credentials bypass normal rotation schedules and access controls. Every use must generate an alert and be reviewed within 24 hours. After use, the break-glass credential must be rotated immediately.
