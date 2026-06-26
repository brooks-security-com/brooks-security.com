# Data Protection Policy - Implementation Procedures

> **Companion to:** Data Protection Policy (Template.md)
> **Purpose:** These procedures describe how to implement the technical and operational data protection controls. The policy defines WHAT must be done; this document describes HOW.

---

## Procedure 1: Customer Data Protection Implementation

### Standard Approach

1. Inventory all customer data repositories (databases, file stores, object storage, data warehouses, logs that may contain customer PII). Document: location, type, classification level, custodian.
2. Implement logical segmentation at the application layer:
  - Multi-tenant databases: enforce tenant isolation via row-level security, schema-per-tenant, or database-per-tenant architecture.
  - API layer: validate tenant context on every request via JWT claims, API key scoping, or OAuth resource indicators. Never trust client-supplied tenant IDs without server-side authorization.
  - Validate segmentation through automated tests: for each tenant, attempt to access another tenant's data through the API and confirm 403/404.
3. Enable encryption at rest for all customer data repositories:
  - Cloud: Enable provider-managed encryption (AWS KMS with CMK, Azure TDE, GCP CMEK).
  - On-prem: LUKS/dm-crypt for Linux, BitLocker for Windows, or database-native TDE.
  - Store encryption keys in a dedicated KMS/HSM (never on the same volume as the data).
4. Restrict key access: only the application service account and a break-glass admin role (with just-in-time access) may access KMS decrypt operations.
5. Enable access logging on all customer data repositories:
  - Database: Enable audit logging (PostgreSQL pgaudit, MySQL audit plugin, SQL Server audit).
  - Object storage: Enable access logs and ship to ____ (SIEM).
  - Application: Log every customer-data access event with user, action, timestamp, customer context.
6. Configure automated monitoring for anomaly detection:
  - Define a baseline of normal access patterns per customer/user.
  - Alert on deviations: unusual query volumes, off-hours access, data exports exceeding ____ rows, access from new IPs/geolocations.
7. Run a customer data segmentation audit quarterly: select a random sample of ____ customer accounts, and attempt cross-tenant data access from an automated test account.

### Alternative Approaches

> **💡 Why you might choose differently:** The "right" multi-tenancy architecture depends on your scale, isolation requirements, and customer expectations. Schema-per-tenant is operationally simpler but harder to scale; dedicated instances offer strongest isolation at highest cost.

- **Alternative A - Dedicated Infrastructure per Customer:** Each enterprise customer gets their own VPC/subscription with dedicated database instances. Strongest isolation, easiest to audit, hardest to scale and most expensive. Common for regulated industries (healthcare, finance).
- **Alternative B - Data Tokenization:** Instead of storing raw customer data, tokenize it at ingestion with a customer-specific token vault. The application operates on tokens; only the vault can detokenize. Reduces blast radius of a database compromise.
- **Alternative C - Customer-Managed Encryption Keys (CMEK/HYOK):** Allow customers to bring their own encryption keys (AWS KMS external key store, Azure BYOK, Hold Your Own Key). The provider cannot access the data even with root access. Highest customer trust, significant operational complexity.

### Common Pitfalls

> **⚠️ Watch out:** Row-level security in a multi-tenant database works until a developer runs an ad-hoc query without the tenant context filter. A single SELECT * FROM customers without the tenant_id WHERE clause exposes everyone's data. Use database views or row-level security policies that enforce the filter at the database layer, not the application layer.

> **⚠️ Watch out:** Customer segmentation testing that only tests happy-path access control misses the real risk: what happens when tenant A tries to access tenant B's API endpoint with tenant A's valid token? Automated cross-tenant tests must be part of every deployment pipeline.

> **⚠️ Watch out:** Encryption at rest with keys on the same server is security theater. An attacker who compromises the database server gets both the encrypted data and the decryption keys. Keys must be in a separate KMS with access logging and just-in-time retrieval.

---

## Procedure 2: Production Data Access Controls

### Standard Approach

1. Establish the default posture: no Personnel has routine production data access. Document this in your access control policy and enforce it technically.
2. Implement a temporary access request process:
  - Requester submits a ticket in ____ (ticketing system) with: business justification, specific data scope needed, time window required (max ____ hours), any data they expect to modify.
  - Ticket routed to ____ (system owner / Security Officer) for approval.
  - Approver verifies: legitimate need, least-privilege scope, time window is reasonable.
3. Configure just-in-time (JIT) access:
  - Integrate your IAM platform (Okta, Azure AD PIM, AWS IAM, HashiCorp Vault) with the ticketing system via ____ (webhook/API).
  - On approval, the IAM platform grants a temporary role or group membership with auto-expiration at the approved time.
  - Grant only the minimum permissions needed - never grant blanket admin/root.
4. All production access sessions must be:
  - Logged in a session recording tool (e.g., Teleport, StrongDM, AWS SSM Session Manager).
  - Auditable with who, what data was accessed, what commands were run, when.
5. Emergency access (incident response, outage):
  - Use a break-glass account with pre-provisioned credentials stored in the password manager.
  - Breaking the glass triggers an immediate alert to the Security team.
  - Post-incident review within ____ hours: was the access appropriate, were credentials rotated, was the break-glass account re-secured?
6. Quarterly access review:
  - Generate a report of all production access grants from the IAM system.
  - System owners review: were grants appropriate, any expired grants still active, any unauthorized patterns.
  - Revoke any access that is no longer justified.
  - Document the review results in ____ (GRC tool or spreadsheet).

### Alternative Approaches

> **💡 Why you might choose differently:** JIT access requires IAM maturity that many organizations don't have. If your IAM platform doesn't support time-bound roles, manual time-bound grants with calendar reminders are better than standing access.

- **Alternative A - Break-Glass Only (No Routine JIT):** Instead of JIT for every access request, maintain permanent break-glass accounts that trigger alerts when used. All routine production access is denied. Simpler, but creates alert fatigue if break-glass use is frequent.
- **Alternative B - Read-Only Replicas:** Provision developers with access to read-only replicas that are sanitized (PII masked/redacted) for debugging. Production access is reserved for write operations only. Reduces the need for production access overall.
- **Alternative C - Bastion/Landing Zone with Approval Workflow:** Route all production access through a bastion host or privileged access workstation that enforces approval workflow, session recording, and command filtering. More infrastructure to maintain, but works with any backend system.

### Common Pitfalls

> **⚠️ Watch out:** "Temporary" access without an automatic expiration is not temporary - it's permanent access with a promise. A year later, that "one-time emergency access" grant is still active. JIT with auto-expiration is the only reliable enforcement mechanism.

> **⚠️ Watch out:** Granting sudo/root for a specific task like "restart a service" is unnecessary and dangerous. Define granular IAM roles that allow exactly restart-service and nothing else. The time to create these roles is before the emergency, not during it.

> **⚠️ Watch out:** Session recording generates a lot of data. Without a defined review process (spot-check ____% of sessions, automated anomaly detection), recordings provide a false sense of security - you'll only review them after a breach, not before.

---

## Procedure 3: Security Monitoring Setup

### Standard Approach

1. Catalog all production systems that must be monitored (servers, databases, containers, SaaS platforms, network devices).
2. For each system type, identify the applicable monitoring domains:
  - **Activity Monitoring:** Login/logout, privilege escalation, command execution, API calls
  - **File Integrity Monitoring (FIM):** Changes to system binaries, configuration files, certificates, cron jobs
  - **Vulnerability Scanning:** OS and application vulnerability detection
  - **Malware Detection:** Anti-malware with real-time protection and scheduled scans
  - **Data Access Monitoring:** Who accessed what customer data, when, from where
3. Configure monitoring agents/tools on each system:
  - Servers: Deploy ____ (EDR agent), configure syslog/auditd forwarding, install FIM agent (osquery, Tripwire, AIDE).
  - Databases: Enable native audit logging, deploy database activity monitoring (DAM) if required by classification.
  - Containers: Deploy runtime security agent (Falco, Aqua, Sysdig), enable Kubernetes audit logs.
  - SaaS: Enable API-based monitoring connectors (SaaS security posture management tools).
4. Configure your SIEM (____) to ingest all log sources. Set up parsing rules so that events are normalized (user, action, target, timestamp, outcome).
5. Define and implement alert rules:
  - Critical (P1): Multiple failed logins followed by success, privilege escalation without approved ticket, data exfiltration patterns, malware detection.
  - High (P2): FIM alerts on critical files, vulnerability with known exploit detected, unusual off-hours activity.
  - Medium (P3): New device joined without CMDB record, configuration drift detected.
6. Integrate alerts with your incident response platform (____). Critical alerts must page the on-call responder within ____ minutes.
7. Schedule a monthly monitoring health check: verify all agents are reporting, test a canary alert through the full pipeline (detection → alert → notification), review tuning to reduce false positives.

### Alternative Approaches

> **💡 Why you might choose differently:** Monitoring scope and tooling choice is driven by budget, team size, and compliance requirements. A 10-person startup doesn't need the same monitoring stack as a 500-person fintech.

- **Alternative A - Cloud-Native Monitoring Only:** For cloud-only deployments, use the cloud provider's native monitoring stack (AWS GuardDuty + Security Hub, Azure Sentinel + Defender, GCP Security Command Center). Lower operational overhead, but may lack cross-cloud visibility.
- **Alternative B - Managed SOC Service:** Outsource 24/7 monitoring to a Managed Security Service Provider (MSSP) or Managed Detection and Response (MDR) provider. They tune alerts and triage, you only handle confirmed incidents. Good for teams without 24/7 staffing.
- **Alternative C - Open-Source Stack:** Build on open-source tools (Wazuh + Elastic, OSSEC, osquery + Kolide, Suricata). Lower cost, higher engineering effort. Requires a dedicated security engineering team.

### Common Pitfalls

> **⚠️ Watch out:** "Monitoring enabled" doesn't mean "monitoring working." Agents crash, log sources get misconfigured, disk fills up and logging silently stops. Without automated health checks that alert you when agents stop reporting, you're flying blind.

> **⚠️ Watch out:** Alert fatigue from overly broad rules causes responders to ignore all alerts, even the real ones. Start with high-signal rules (known-bad patterns, correlation rules) and tune before adding medium-signal rules. A rule that generates 500 alerts/day that nobody looks at is worse than no rule at all.

> **⚠️ Watch out:** File integrity monitoring on dynamic systems (containers, auto-scaling groups) generates massive noise because files change constantly as part of normal operations. Tune FIM rules to only flag changes to static configuration files, or use a deployment-based baseline that updates with every release.

---

## Procedure 4: Secure Data Deletion

### Standard Approach

1. Identify all data repositories and their classification levels. Maintain a register mapping repositories to deletion methods.
2. When data reaches end of retention (per Data Retention Policy), initiate the deletion workflow:
  - The data custodian receives an automated notification that retention has expired.
  - Custodian verifies no active legal hold, no outstanding business need.
  - Custodian approves deletion in ____ (ticketing/GRC system).
3. Select the deletion method based on classification:
  - **Restricted:** Cryptographic erasure (destroy KMS key, verify data is unrecoverable) OR verified multi-pass overwrite per NIST SP 800-88 Purge.
  - **Confidential:** Secure deletion utility (shred, srm, DB purge command) OR cryptographic erasure.
  - **Internal/Public:** Standard delete (rm, DROP TABLE, object lifecycle policy).
4. Execute the deletion:
  - Cloud object storage: Delete the KMS key (if using customer-managed keys), then run an S3/Blob/GCS delete lifecycle policy.
  - Database rows: For individual records, use the database's native DELETE with transaction logging. For full database decommission, drop the database and overwrite the storage volume.
  - Physical media: See Asset Management Procedures for physical media disposal.
5. Verify deletion:
  - Attempt to retrieve the data through normal access paths - confirm it's unrecoverable.
  - For cryptographic erasure, confirm the key has been destroyed and key material is unrecoverable (KMS key deletion has a waiting period - factor this in).
  - For overwrite, sample a subset of blocks/files and confirm they contain overwritten data, not original data.
6. Log the deletion event:
  - What data was deleted (repository, record range, classification)
  - Method used
  - Date/time
  - Who approved
  - Who executed
  - Verification result
7. Retain the deletion log per the Logging and Monitoring Policy retention period.

### Alternative Approaches

> **💡 Why you might choose differently:** Deletion method choice is a trade-off between assurance level, cost, and operational complexity. Cryptographic erasure is fast and auditable but requires KMS maturity. Physical destruction is highest assurance but slowest.

- **Alternative A - Deletion by Overwrite:** For structured databases where cryptographic erasure isn't feasible (e.g., a single row in a multi-tenant DB), overwrite the target data with random bytes ____ times before deleting. Slower but higher assurance for individual records.
- **Alternative B - Secure Deletion Automation:** Build deletion workflows into your CI/CD or infrastructure-as-code lifecycle. When a test environment is torn down via Terraform destroy, automatically trigger a secure overwrite of the underlying volumes before they're released. Prevents orphaned data on decommissioned infrastructure.
- **Alternative C - Third-Party Data Destruction Service:** For large-scale data center decommissioning, engage a specialized data destruction vendor with on-site shredding. They handle chain of custody, certificates, and regulatory compliance reporting.

### Common Pitfalls

> **⚠️ Watch out:** Database DELETE doesn't actually erase data from disk - it marks rows as deleted in the database's internal structures. The data remains on the storage volume and can be recovered with forensic tools. For Restricted data, always follow DELETE with a storage-level action (overwrite, TRUNCATE with VACUUM FULL, or volume destruction).

> **⚠️ Watch out:** Cloud KMS key deletion has a mandatory waiting period (7-30 days depending on the provider) before the key is actually destroyed. During this window, the data is still recoverable. If you need immediate cryptographic erasure, plan for this waiting period in your deletion SLA or use a different method.

> **⚠️ Watch out:** Backups, replicas, snapshots, and caches all retain copies of "deleted" data. A customer requests deletion of their data from the primary database, but it lives on in: nightly backups (____ days retention), read replicas, CDN cache, log files, and data warehouse ETL extracts. Build a comprehensive deletion checklist that covers all copies.

---

## Procedure 5: Data Transfer Authorization and Encryption

### Standard Approach

1. All external data transfers must be formally authorized before initiation. Maintain a data transfer register in ____ (GRC tool / spreadsheet).
2. For each transfer request, the data owner evaluates:
  - Nature and sensitivity of the data
  - Volume of data
  - Impact of loss or interception
  - Recipient's security posture (do they have a valid NDA? recent security review?)
3. Approved transfers must use one of the following encrypted channels, in order of preference:
  - **Managed File Transfer (MFT) platform:** SFTP with key-based auth, TLS 1.3, automated transfers with logging.
  - **Encrypted cloud sharing:** Provider with customer-managed encryption keys, access expiry, download tracking.
  - **API-based transfer:** HTTPS/TLS 1.2+, mutual TLS if both parties support it, API key or OAuth authentication.
  - **Email (last resort):** End-to-end encrypted (S/MIME, PGP) - Restricted data must never go via email.
4. For internal transfers across trust boundaries (e.g., VPC to VPC, on-prem to cloud):
  - Use encrypted tunnels (VPN, AWS PrivateLink, Azure Private Endpoint).
  - Even within trusted networks, encrypt Restricted and Confidential data at the application layer (TLS between services).
5. Configure TLS properly:
  - Minimum TLS 1.2, prefer TLS 1.3
  - Disable weak cipher suites (no RC4, no 3DES, no NULL ciphers, no EXPORT ciphers)
  - Use strong key exchange (ECDHE) and authentication (RSA 2048+ or ECDSA)
  - Certificates managed via automated renewal (Let's Encrypt, ACME protocol, or cloud certificate manager)
6. For third-party/vendor data transfers:
  - Ensure the Information Exchange Agreement is current and signed.
  - Validate the vendor's encryption endpoint (check certificate, protocol version, cipher suite).
  - Log the transfer with: date, data classification, volume, method, recipient, authorization reference.
7. Audit data transfers quarterly: review the transfer register, verify all external transfers had valid authorizations and encryption.

### Alternative Approaches

> **💡 Why you might choose differently:** MFT platforms require infrastructure and licensing. For occasional transfers, simpler approaches may be adequate if compensating controls are in place.

- **Alternative A - Email with Secure Portal Link:** Instead of emailing data directly, upload it to a secure portal (SharePoint, Box, encrypted cloud storage) and email only the access link. The link requires recipient authentication. Avoids data-in-email entirely.
- **Alternative B - Pull Model:** Instead of pushing data to the recipient, grant them time-bound, read-only access to a secure location where they can pull the data themselves. You control the access window and logging.
- **Alternative C - Data Clean Room:** For highly sensitive data sharing (e.g., between companies for joint analysis), use a data clean room environment where the recipient can run queries against the data without ever extracting raw records.

### Common Pitfalls

> **⚠️ Watch out:** TLS 1.2 is the floor, not the ceiling. If your endpoint accepts TLS 1.0 for "compatibility," an attacker can downgrade the connection. Test your endpoints with tools like testssl.sh or Qualys SSL Labs to confirm only strong protocols and ciphers are accepted.

> **⚠️ Watch out:** Automated certificate renewal sounds great until it fails silently. A Let's Encrypt certificate that doesn't renew takes down your encrypted endpoint - and someone decides to "temporarily disable TLS to restore service." Monitor certificate expiry and test the renewal process quarterly.

> **⚠️ Watch out:** "The vendor handles encryption" is not a due diligence answer. Validate: what protocol, what cipher suites, where do keys live, who has access to them? If the vendor can decrypt your data in transit (e.g., they terminate TLS at their load balancer and backhaul over HTTP), it's not end-to-end encrypted.

---

## Procedure Quick Reference

| Procedure | Owner | Cadence | Key Artifact |
|-----------|-------|---------|-------------|
| Customer Data Protection | ____ / Engineering | Continuous + quarterly audit | Segmentation test results |
| Production Access Controls | ____ / Security | Per access request + quarterly review | Access grant log, review report |
| Security Monitoring Setup | ____ / Security Engineering | Continuous + monthly health check | SIEM alert configuration, health check report |
| Secure Data Deletion | ____ / Data Custodians | Per deletion event | Deletion log entry |
| Data Transfer Authorization | ____ / Data Owners | Per transfer + quarterly audit | Transfer register, authorization records |
