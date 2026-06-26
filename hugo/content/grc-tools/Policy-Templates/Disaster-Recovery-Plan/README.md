# Disaster Recovery Plan Template

## What This Is

The Disaster Recovery Plan (DRP) is the technical counterpart to the Business Continuity Plan. It defines the step-by-step procedures for recovering IT systems, infrastructure, and data after a disaster-level event. It covers the entire recovery lifecycle: detection and activation, recovery to an alternate site, and reconstitution back to normal operations. Paired with the BCP, it forms a complete organizational resilience framework.

## What It Covers

- System classification (Critical vs. Non-Critical) and prioritization for recovery
- RTO and RPO targets per system
- Threat and risk assessment methodology
- Testing requirements (annual tabletop, biennial technical)
- Three-phase recovery process: Notification/Activation, Recovery, Reconstitution
- Activation criteria and notification sequences
- Recovery environment provisioning and validation
- Plan deactivation and post-incident review

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: IT disaster recovery framework with system classification (Critical/Non-Critical), RTO/RPO targets, three-phase recovery (Notification/Activation, Recovery, Reconstitution), and testing requirements. This is the governance document reviewed by leadership and auditors.
- **`DR-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Phase-by-phase recovery execution procedures, failover configuration, platform-specific recovery steps, and plan deactivation workflows. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. DRP that only covers the primary data center.** If your entire infrastructure is in a single cloud region or single data center, your DRP is not credible. You must have the ability to recover in a different geographic region or with a different provider. A disaster that takes out us-east-1 doesn't care that you have backups in us-east-1.

**2. DRP testing that doesn't actually fail over.** A tabletop exercise where everyone says "we'd restore from backups and it would work" is not a test. A technical test means actually provisioning the recovery environment, restoring data, switching traffic, and validating that users can access the system. This is expensive and disruptive, but it's the only way to know the DRP works.

**3. RTO targets that don't account for DNS propagation.** You might restore your application in 4 hours, but if DNS TTL is set to 24 hours, users won't reach it for up to a day. DNS configuration is one of the most common overlooked dependencies in DR planning. Set appropriate TTLs or plan for DNS failover.

**4. DRP contact information of departed employees.** The DRP often references specific people by name and phone number. These rot quickly. Use role-based contact information ("Infrastructure Lead on call: 555-XXXX") rather than named individuals, and link to a maintained on-call rotation.

**5. Assuming cloud provider SLAs cover DR.** Cloud providers guarantee availability, not recoverability. They will restore a failed instance, but they won't restore your data if you accidentally delete it or if ransomware encrypts it. The shared responsibility model means DR is your responsibility. Your cloud provider's backups are for their infrastructure, not your data.

## Implementation Advice

- **Define RTO and RPO before writing DR procedures.** RTO tells you how fast you need to recover. RPO tells you how much data loss is acceptable. Without these numbers, you can't design appropriate recovery procedures. A 4-hour RTO requires a hot standby; a 72-hour RTO might allow restore-from-backup.
- **Use infrastructure-as-code as your DR asset.** If your entire production environment is defined in IaC (Terraform, CloudFormation, Pulumi), recovery means running the same templates in a different region. Manual recovery from documentation is error-prone and slow. IaC is faster and more reliable.
- **Test in production-like conditions.** A DR test that restores a single database to an empty VPC with no traffic proves that the backup file isn't corrupted. It doesn't prove that users can log in, that SSL certificates are valid, that API integrations work, or that the system handles real load. Test the full user journey.
- **Document decision points, not just procedures.** During a real disaster, you won't follow a script. Give people decision frameworks: "If damage assessment shows X, then choose recovery path Y. If Z is unavailable, escalate to..." rather than rigid step-by-step instructions.
- **Keep DR documentation accessible offline.** A DRP stored only on a wiki hosted in your production environment is useless when production is down. Maintain PDF copies on team members' devices and in a separate, always-available cloud location (e.g., a different provider's object storage).
