# Database Password Management - Implementation Procedures

> **Companion to:** Database Password Management Process (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Password Rotation (Automated)
### Standard Approach
1. Confirm that the secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) is configured for the target database type and supports automated rotation.
2. For each database credential stored in the secrets management service:
   a. Configure a rotation schedule matching the policy requirements: 90 days for production, 180 days for non-production.
   b. Configure the rotation Lambda/function/hook that the secrets service will invoke to execute the rotation. This function must: (i) generate a new password meeting Password Policy complexity requirements, (ii) update the database instance with the new credential, (iii) update the stored secret value, and (iv) verify connectivity with the new credential.
   c. Test the rotation function in a non-production environment before enabling it in production. Verify that: the new password is applied, applications can connect with the new credential, and no connection errors appear in logs.
3. After rotation is configured and tested, enable automatic rotation. The secrets service handles the rotation on schedule.
4. Post-rotation verification (automated):
   a. Monitor application error rates for 30 minutes after each rotation window. A spike in database authentication errors indicates a failed rotation.
   b. Configure alerting: if a rotation fails (secret version not updated, error in rotation function logs), generate a P2 incident ticket.
   c. If applications do not support automatic secret refresh, schedule a service restart or redeployment to coincide with the rotation window. Coordinate with the application owner.
5. Maintain a rotation log: credential identifier, database, scheduled rotation date, actual rotation date, success/failure, and any actions taken.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Dynamic credentials (Vault-style):** Instead of rotating long-lived passwords, use a secrets management platform that generates short-lived, dynamic credentials per session. The application requests a credential, uses it for one connection, and the credential expires automatically. No rotation schedule needed - every connection uses a new password.
> - **Certificate-based authentication instead of passwords:** For databases that support it (e.g., PostgreSQL, MongoDB), replace password authentication with certificate-based mutual TLS. Certificates have built-in expiration, managed by a CA, and rotation becomes certificate renewal managed by the PKI infrastructure.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Rotation that succeeds on the database side but fails on the application side.** The secrets service updates the database password and the secret value, but the application holds a stale connection pool. Configure connection pools to test connections before use (validation query) and set reasonable idle timeouts. For critical applications, coordinate a brief service restart with the rotation window.
> - **Rotation function that hasn't been tested since it was created.** The rotation function was written 2 years ago, the database version has been upgraded twice since then, and nobody has tested the rotation function in the new version. Test rotation functions after every database version upgrade and at least annually.

## Procedure 2: Password Rotation (Manual)
### Standard Approach
1. For databases that cannot use automated rotation (legacy systems, unsupported database types, applications using environment files), follow this manual procedure.
2. Before rotation day:
   a. Verify you have administrative access to the database and application servers.
   b. Verify you have current credentials (in case rollback is needed).
   c. Schedule the rotation during the defined maintenance window.
   d. Notify affected teams at least 5 business days in advance.
   e. Prepare a rollback plan: if rotation fails, what steps revert to the previous credential?
3. During the maintenance window:
   a. Generate a new password that meets Password Policy complexity requirements. Use a password generator - do not create passwords manually.
   b. Update the database instance with the new credential: `ALTER USER 'app_user'@'host' IDENTIFIED BY '<new_password>';` (MySQL example; use the appropriate command for your database type).
   c. Verify the database accepts the new credential: connect from a test client using the new password.
   d. Update the application's credential storage:
     - **Secrets manager:** Update the secret value via console or CLI.
     - **Environment file:** SSH to the application server, edit the environment file, replace the password value, save.
     - **Configuration management:** Update the value in the configuration management system (Ansible, Chef, Puppet) and apply the change.
   e. Restart or reload the application to pick up the new credential.
   f. Verify application connectivity: check application health endpoints, database connection pool metrics, and application logs for authentication errors.
   g. For multi-server deployments, update and restart each server sequentially. Verify each server's connectivity before moving to the next.
4. Post-rotation:
   a. Monitor application error rates for a minimum of 30 minutes.
   b. Test a representative end-to-end transaction to confirm full functionality.
   c. Document the rotation: date, time, systems affected, rotation method, verification results, and any issues.
5. If rotation fails:
   a. Immediately revert to the previous credential if still valid.
   b. If the previous credential has been invalidated, use the emergency/break-glass procedure.
   c. Create an incident ticket documenting the failure.
   d. Do not leave the database in an unknown password state. Either the new password works or the old password is restored.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Configuration management orchestration:** Instead of manual SSH-to-each-server, use a configuration management tool (Ansible playbook, Chef recipe) to execute the rotation across all servers. The playbook updates the password, restarts services, and verifies - all automated and repeatable. This is still "manual" in the sense that it's not auto-scheduled, but it's far less error-prone than hand-editing files.
> - **Migrate to automated rotation:** Prioritize migrating manual-rotation databases to a secrets management service with automated rotation. Every manual rotation is a risk event. Track the number of manual-rotation databases as a metric and set a quarterly reduction target.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Updating the database first, forgetting the application.** The most common manual rotation failure: DBA updates the database password, confirms it works from the DBA's client, and closes the ticket. The application still has the old password and goes down. Always update the credential store and restart the application BEFORE closing the rotation.
> - **Environment file edited with the wrong permissions.** After editing the environment file, verify file ownership and permissions: owned by the application user, mode 600 or 400. A world-readable environment file exposes the password to every user on the system.
> - **Hardcoded connection strings.** If the application has the database password hardcoded in source code or compiled configuration, manual rotation requires a code change, build, and deploy - a multi-day process, not a maintenance window activity. Identify and remediate hardcoded credentials as a prerequisite to implementing password rotation.

## Procedure 3: Secrets Manager Integration and Verification Testing
### Standard Approach
1. Inventory all database connections: application name, database type and host, connection method (direct secrets retrieval, environment file, hardcoded), and rotation capability.
2. For applications not yet using the secrets management service:
   a. Integrate the application with the secrets manager SDK or API. The application retrieves credentials at startup and refreshes on a configurable interval or on credential change notification.
   b. Store the credential in the secrets manager. Remove the credential from environment files, configuration files, and source code.
   c. Test: restart the application, verify it retrieves credentials from the secrets manager and connects successfully.
3. Verification testing for all managed credentials:
   a. **Quarterly connectivity test:** For each database credential in the secrets manager, run an automated test that retrieves the credential, attempts a database connection, runs a lightweight query (`SELECT 1`), and reports success/failure. Failures generate an incident ticket.
   b. **Rotation dry-run:** Quarterly, perform a test rotation in a non-production environment for each rotation function. Verify that the rotation completes, applications reconnect, and no errors occur. Document results.
   c. **Break-glass credential test:** Quarterly, retrieve and use the break-glass/emergency credential in a non-production environment. Verify it works and that its use generates the required alert. Rotate the break-glass credential immediately after the test.
4. Access auditing:
   a. Enable access logging on the secrets management service. Every retrieval of a secret value must be logged (identity, secret, timestamp, source IP).
   b. Review access logs monthly. Investigate any retrieval by an unexpected identity, from an unexpected location, or at an unexpected time.
   c. Configure alerting for high-risk events: break-glass credential retrieval, secret value retrieval by a human (not service account), or retrieval from outside the production network.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Secrets injection via sidecar (Kubernetes):** For Kubernetes-based applications, use a secrets injection sidecar (e.g., Vault Agent Injector) that retrieves secrets from the vault and presents them to the application container as a file or environment variable. The application doesn't need to integrate with the secrets manager SDK directly.
> - **CI/CD pipeline integration:** Inject database credentials at deploy time via the CI/CD pipeline (e.g., GitHub Actions secrets, GitLab CI variables). The pipeline retrieves the credential from the secrets manager and injects it into the deployment. The application receives the credential as an environment variable at startup without runtime secrets manager integration.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Secrets manager credentials that are more privileged than needed.** The service account or IAM role that the application uses to retrieve secrets may have broader permissions than necessary. Apply least privilege: the application's IAM role should have `secretsmanager:GetSecretValue` on ONLY the specific secrets it needs, not on all secrets.
> - **Secrets cached locally and not refreshed.** Some applications cache credentials at startup and never refresh them. After a rotation, the application still uses the old cached credential until restarted. Test whether your application supports credential refresh without restart. If not, schedule restarts to align with rotation windows.

## Procedure 4: Rotation Failure Response
### Standard Approach
1. Detection: a rotation failure is detected through any of the following:
   a. Secrets management service reports rotation function error.
   b. Application monitoring shows spike in database authentication errors.
   c. Connectivity test fails.
   d. Application health check fails with database connection error.
2. Immediate response (first 15 minutes):
   a. Identify the affected database and applications.
   b. Determine whether the previous credential is still valid: (i) if the secrets manager maintains the previous version, retrieve it; (ii) check if the database still accepts the previous password.
   c. If the previous credential is still valid, revert the application to the previous credential: update the secret value to the previous version, restart affected applications, and verify connectivity.
   d. If the previous credential is NOT valid (database has been updated and previous password invalidated), escalate to the on-call DBA and use the break-glass procedure to set a known working password.
3. Stabilization (15–60 minutes):
   a. Once connectivity is restored, confirm all applications are healthy.
   b. Place a temporary moratorium on further automated rotations for this database until root cause is determined.
   c. Communicate status to affected teams and the Security Officer.
4. Root cause investigation (within 24 hours):
   a. Review rotation function logs: what step failed? Password generation? Database update? Secret value update? Application refresh?
   b. Common causes: database version incompatibility, rotation function timeout, network connectivity issue during rotation, application failed to pick up new credential.
   c. Document the root cause in the incident ticket.
5. Resolution:
   a. Fix the root cause.
   b. Test the fix in a non-production environment by performing a test rotation.
   c. Once verified, perform the rotation in production (manually, then re-enable automated rotation after confirming it works).
   d. Close the incident ticket.
6. Post-mortem: If the rotation failure caused a service disruption, conduct a post-mortem and identify preventive measures. Add monitoring for the specific failure mode that occurred.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated rollback:** Configure the secrets manager rotation function to automatically roll back to the previous credential version if post-rotation connectivity checks fail. This eliminates the manual response step and reduces Mean Time to Recovery (MTTR). Requires that the rotation function includes connectivity verification and that the previous credential is retained.
> - **Canary rotation:** For critical databases, rotate the password on a non-production replica first. If the replica rotation succeeds and applications connect, promote the change to production. If it fails, the production database is unaffected.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Incident response that assumes the DBA is available.** Password rotation failures at 2 AM on a Saturday. If the on-call DBA doesn't respond, who has the break-glass credentials and the knowledge to use them? Cross-train at least two people on the emergency recovery procedure, and ensure break-glass credentials are accessible to the on-call rotation, not just the DBA.
> - **Fixing the symptom but not the root cause.** Manually fixing the password and restoring service is not enough. If the root cause is not identified and fixed, the next rotation will fail the same way. The incident must remain open until root cause is determined and the fix is tested.
> - **No post-rotation verification for the emergency fix.** After using the break-glass procedure to set a known password, verify that ALL applications can connect - not just the one that triggered the alert. The break-glass password may work for one application but not another if they use different database users.
