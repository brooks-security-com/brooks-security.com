# Disaster Recovery Plan - Implementation Procedures

> **Companion to:** Disaster Recovery Plan (Template.md)
> **Purpose:** These procedures describe how to execute the three phases of disaster recovery defined in the DRP. The DRP defines the strategic framework and WHAT must be done; this document describes HOW to execute each phase with tactical, platform-specific guidance.

---

## Procedure 1: Phase 1 - Notification and Activation

### Standard Approach

This procedure covers initial detection, damage assessment, and plan activation.

#### 1.1 Initial Detection and First Response

1. **First Responder Actions:** Whoever detects the disruption (automated alerting system, on-call engineer, or manual observation) must:
  - Immediately notify the DR authority (`____`, e.g., CTO / Head of Engineering) via all available channels (messaging platform, SMS, phone call).
  - Relay all known information: what system/service is affected, what symptoms are observed, when it started, any error messages or alert details.
  - If the first responder has the access and knowledge, perform a rapid triage: is this a localized issue (one server) or widespread (entire region/cloud provider)?
2. **DR Authority Acknowledgment:** The DR authority acknowledges receipt within `____` minutes (recommended: 15 minutes). If no acknowledgment within `____` minutes (recommended: 30), the notification escalates to the successor per the chain of command.

#### 1.2 Damage Assessment Execution

1. **Assemble Assessment Team:** The DR authority assembles a minimum damage assessment team: Infrastructure Lead, Engineering Lead, Security Officer. Conference bridge or dedicated messaging channel within `____` minutes.
2. **Assessment Checklist:**
  - [ ] Identify scope: which systems, services, and data are affected?
  - [ ] Determine if production infrastructure is salvageable or requires full rebuild.
    - **Salvageable:** Systems are intact but unavailable (network outage, configuration error). Recovery focuses on restoring connectivity/correcting configuration.
    - **Rebuild Required:** Systems are destroyed, corrupted, or the cloud region is down. Recovery focuses on provisioning a new environment from infrastructure-as-code.
  - [ ] Estimate time to recovery under best-case, expected, and worst-case scenarios.
  - [ ] Identify immediate safety or security concerns (exposed data, active attacker, physical danger to personnel).
  - [ ] Check backup integrity: are recent, verified backups accessible from the recovery site?
  - [ ] Assess if the alternate recovery site/region is operational.
3. **Documentation:** Record all assessment findings in a shared document (the event log). Timestamp every entry.

#### 1.3 Activation Decision and Execution

1. **Activation Criteria Check:** The DR authority determines if activation criteria are met:
  - [ ] Critical systems will be unavailable for >`____` hours.
  - [ ] A hosting facility or cloud region is damaged and will be unavailable for >`____` hours.
  - [ ] A cybersecurity incident has caused widespread data destruction or system compromise.
  - [ ] Other criteria per organizational leadership.
2. **Formal Activation:**
  - DR authority declares the plan activated. Record the declaration timestamp and rationale in the event log.
  - If DR authority is unavailable, the successor per chain of command makes the declaration.
3. **Notification Execution:**
  - [ ] Notify all recovery team members via all available channels (messaging, SMS, phone). Use pre-configured distribution lists. Confirm acknowledgment from each team lead.
  - [ ] Team leads notify their teams with applicable information and instructions.
  - [ ] Notify external partners: cloud provider(s) (`____`), hosting provider (`____`), critical vendors (`____`). Open Severity 1 tickets where applicable.
  - [ ] Notify executive leadership with initial status: what happened, what's affected, estimated recovery timeline, and immediate resource needs.
  - [ ] Notify customers and partners per the communications plan (Communications Lead executes).
  - [ ] Document all notifications with timestamps, recipients, and content in the event log.

### Common Pitfalls

> **⚠️ Watch out:** Delaying activation while waiting for "more information." The most common DR failure mode is analysis paralysis. The activation decision should be made based on what you know now, with a bias toward activation. It's easier to stand down from a false activation than to recover lost time from a delayed activation.

> **⚠️ Watch out:** The notification cascade breaking because one person is on vacation. Distribute notification responsibilities across at least three people for each team. Use a pager/on-call rotation service (e.g., PagerDuty, Opsgenie) to automate escalation rather than relying on a manual phone tree.

> **⚠️ Watch out:** Failing to notify the cloud provider early. Major cloud providers have support teams that can assist with region-wide issues, but they need to be engaged quickly. Open a support case immediately upon suspecting a provider-level issue - you can always close it if it turns out to be localized.

---

## Procedure 2: Phase 2 - Recovery

### Standard Approach

This procedure covers the technical recovery of IT systems at the designated recovery site.

#### 2.1 Recovery Environment Provisioning

1. **Target Selection:** Determine the recovery site:
  - **Same provider, different region:** If the primary region is down but the provider is operational. Use the pre-designated recovery region: `____`.
  - **Different cloud provider:** If the primary provider is experiencing a widespread outage. Fail over to: `____` (e.g., AWS → Azure, GCP → AWS).
  - **On-premises:** If cloud providers are unavailable or the organization maintains on-premises infrastructure.
2. **Provisioning Execution:**
  - Execute infrastructure-as-code (IaC) deployment against the recovery target:
     ```bash
     # Example: Terraform with separate state file for recovery environment
     terraform init -backend-config="bucket=dr-state-bucket"
     terraform apply -var="environment=dr" -var="region=${DR_REGION}"
     ```
  - Deploy container orchestration (Kubernetes) cluster if applicable, using the same configuration as production.
  - Verify that IaC execution completes successfully. Any failures are documented and escalated to the Infrastructure Lead.
3. **Network Configuration:**
  - Provision networking: VPC/VNet, subnets, security groups, load balancers.
  - Configure DNS (initially internal-only for validation).
  - Establish VPN or interconnect if hybrid architecture is required.
  - Verify connectivity between all recovery environment components.

#### 2.2 Data Restoration

1. **Identify Restore Source:**
  - Check the backup catalog for the most recent verified backup of each data store.
  - For databases, determine the recovery point: most recent full backup + transaction logs to the latest available point.
2. **Restore Execution (Ordered by Dependency):**
  - **First:** Encryption keys and secrets. Retrieve from KMS/HSM (`____`). Verify accessibility.
  - **Second:** Databases (the most dependency-heavy layer). Restore full backup, then apply transaction logs to reach the desired recovery point. Verify row counts and schema integrity.
  - **Third:** File stores and object storage. Sync from backup storage to the recovery environment.
  - **Fourth:** Configuration data (service discovery, feature flags, application config). Restore from configuration-as-code repository.
3. **Restore Validation:**
  - Run database integrity checks (`pg_dump` schema validation, checksum verification).
  - Compare file counts and sizes against the backup manifest.
  - Verify that all required secrets are accessible to applications.

#### 2.3 System Validation and Hardening

1. **Functional Validation:**
  - Deploy applications to the recovery environment.
  - Run smoke tests: can the application start? Can it connect to the database? Can it serve requests?
  - Run a subset of integration tests to validate critical paths.
  - Have `____` (QA / Engineering) sign off on functional readiness.
2. **Security Hardening:**
  - Verify encryption at rest is enabled on all data stores.
  - Verify TLS certificates are deployed and valid.
  - Verify access controls (IAM roles, security groups) match production policies.
  - Deploy monitoring agents and verify they are reporting to the central monitoring platform.
  - Deploy EDR/anti-malware agents.
  - Verify alerting rules are active for the recovery environment.
  - **Do NOT** cut over to the recovery environment until security controls are confirmed operational.
3. **Patch Verification:**
  - Check that all systems are running the latest approved patches.
  - Run a vulnerability scan against the recovery environment. Any Critical or High findings must be remediated before cutover.
4. **Performance Validation (if time permits):**
  - If the recovery environment has different specifications than production, run a performance smoke test to verify it can handle expected load.
  - If recovery environment is undersized, provision additional resources.

#### 2.4 Cutover to Recovery Environment

1. **Pre-Cutover Checklist:**
  - [ ] All critical services operational in recovery environment.
  - [ ] Functional validation passed.
  - [ ] Security controls verified.
  - [ ] Monitoring and alerting active.
  - [ ] Communications team prepared with customer notification.
2. **DNS Cutover:**
  - Update DNS records to point to the recovery environment's endpoints. Reduce TTL to `____` seconds (recommended: 60 seconds) 24 hours before planned cutover (if planning ahead). For emergency cutover, accept that propagation may take up to the current TTL.
  - Monitor DNS propagation using a tool like `dig` or `whatsmydns.net`.
3. **Traffic Verification:**
  - Monitor incoming traffic to the recovery environment. Verify that user traffic is arriving.
  - Check error rates, latency, and throughput against baseline.
  - Keep the damaged production environment isolated but do not destroy it - it may contain forensic evidence.
4. **Declaration:** The DR authority declares the recovery environment as the active production environment. Record the timestamp in the event log.

### Alternative Approaches

> **💡 Why you might choose differently:** Recovery strategy should match your RTO and RPO targets.

- **Pilot Light:** Maintain a minimal version of the environment always running in the recovery region (core services only, no data). In a disaster, scale up and restore data. Lower cost than full hot standby but slower to recover (typically hours).
- **Warm Standby:** Maintain a scaled-down but fully functional environment in the recovery region. In a disaster, scale up and redirect traffic. Higher cost but faster recovery (typically minutes to an hour).
- **Multi-Region Active-Active:** Run production across multiple regions simultaneously. If one region fails, traffic is automatically routed to the other. Highest cost and operational complexity, but near-zero RTO. Appropriate for services that cannot tolerate any downtime.
- **Backup and Restore Only:** For non-critical systems with long RTO, maintain only backups (no pre-provisioned infrastructure). Restoration time depends on IaC execution + data transfer time. Lowest cost, slowest recovery (typically hours to days).

### Common Pitfalls

> **⚠️ Watch out:** Infrastructure-as-code that doesn't actually work in the recovery region. AMIs, managed service availability, and instance types vary by region. Test IaC deployment in the recovery region at least quarterly - don't wait for a disaster to discover that a critical service isn't available there.

> **⚠️ Watch out:** DNS changes that take hours to propagate because the TTL was set to 86400 seconds. For critical domains, maintain a low TTL (60-300 seconds) at all times. Accept the slightly higher DNS query cost as insurance.

> **⚠️ Watch out:** TLS certificate issues. If you use a different domain or CDN endpoint for the recovery environment, ensure certificates are pre-provisioned and not expired. Automate certificate renewal for recovery domains even if they're rarely used.

> **⚠️ Watch out:** Restoring data that has been corrupted but not yet detected. If a database corruption occurred 3 days ago and all backups since then contain the corruption, restoration won't help. Maintain point-in-time recovery with enough history to restore to a point before corruption was introduced. Use replication delay on read replicas as an additional safety net.

---

## Procedure 3: Phase 3 - Reconstitution

### Standard Approach

This procedure covers restoration of normal operations at the original or a new permanent site.

#### 3.1 Permanent Environment Preparation

1. **Original Site Assessment (if returning):**
  - Verify the original site/region is fully operational and stable.
  - Verify that the root cause of the original disruption has been resolved.
  - Provision the permanent environment using the SAME infrastructure-as-code as the recovery environment (ensuring any fixes applied during recovery are captured).
2. **New Permanent Site (if original is abandoned):**
  - Provision the new permanent environment per organizational standards.
  - Update all documentation to reflect the new production location.

#### 3.2 Data Synchronization

1. **Establish Data Replication:**
  - Set up replication from the recovery environment to the permanent environment.
  - For databases: configure streaming replication or log shipping.
  - For file stores: use `rclone sync` or cloud-native cross-region replication.
2. **Verify Data Consistency:**
  - Compare data in both environments. Row counts, checksums, file manifests.
  - Resolve any discrepancies before proceeding.

#### 3.3 Validation and Cutback

1. **Validation:** Execute the same validation checklist as Phase 2 (functional, security, performance).
2. **Cutback Window:** Schedule the cutback during a maintenance window. Notify customers in advance.
3. **DNS Update:** Redirect traffic from the recovery environment to the permanent environment.
4. **Monitoring:** Monitor the permanent environment for stability for `____` hours (recommended: 24 hours) before decommissioning the recovery environment.
5. **Deactivation Declaration:** DR authority declares the DRP deactivated. Record timestamp.

#### 3.4 Recovery Environment Decommissioning

1. **Sanitization:** Securely wipe all data from the recovery environment. For cloud resources, delete storage volumes and object storage buckets. For on-premises hardware, follow the media sanitization policy.
2. **Resource Deallocation:** Terminate compute resources to stop billing. Do NOT delete infrastructure-as-code templates or configuration - they may be needed again.
3. **Event Log Closure:** Compile all event logs, decisions, and actions into the incident record. Archive per retention requirements.

### Common Pitfalls

> **⚠️ Watch out:** Rushing reconstitution. The recovery environment is working; there's no urgency to move back. Take the time to do reconstitution properly. A botched reconstitution can cause a second outage, which is far worse than staying on the recovery environment for an extra week.

> **⚠️ Watch out:** Forgetting to apply lessons learned to the permanent environment. If you fixed configuration issues or applied patches during recovery, those fixes must be backported to the permanent environment's IaC so they aren't lost when you provision the next permanent environment.

---

## Related Documents

- Disaster Recovery Plan (Template.md)
- Disaster Recovery Process (../Disaster-Recovery-Process/Template.md)
- Business Continuity Plan (../Business-Continuity-Plan/Template.md)
- Backup Policy (../Backup-Policy/Template.md)
- Backup Procedures (../Backup-Policy/Backup-Procedures.md)
- Incident Response Policy (../Incident-Response-Policy/IR-Policy-Template.md)
- Encryption Policy (../Encryption-Policy/Template.md)
