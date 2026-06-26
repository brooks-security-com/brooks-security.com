# Disaster Recovery Process Template

## What This Is

The Disaster Recovery Process is the operational companion to the Disaster Recovery Plan. While the DRP defines the strategy and phases, the DR Process defines the specific platforms, tools, failover paths, and team-level procedures. It answers the question "What do I actually do when X platform goes down?" with specific platform-by-platform continuity instructions.

## What It Covers

- Named team roles with specific DR responsibilities
- Platform-by-platform failover plans (CRM, financial operations, project management, communication)
- Data backup locations and restore testing status per data category
- Remote access and connectivity during DR operations
- Security controls maintenance during recovery
- Infrastructure failover strategy and mechanisms
- Annual testing cadence and cross-platform dependency testing
- Post-incident documentation and review requirements

## Document Structure

This folder contains two files:

- **`Template.md`** - The process document. Describes HOW to operationalize the related policy.
- **`README.md`** - This overview.

When updating the governing policy, ensure implementation changes flow into this process document.

## Gotchas People Get Wrong

**1. Platform-specific procedures that go stale.** SaaS platforms change their UIs, APIs, and features frequently. A DR process that says "click the Recover button on the Services tab" may be wrong within months. Review platform-specific procedures quarterly, not just annually.

**2. Assuming communication tools will be available.** If Slack/Teams is your primary communication channel and it's part of the outage, how does the team coordinate? Define an out-of-band communication channel (phone tree, Signal group, SMS) that doesn't depend on the same infrastructure as your production systems.

**3. Forgetting financial operations.** Disaster recovery plans often focus on servers and databases while ignoring that the organization can't pay employees, receive payments, or process invoices during an outage. Billing, accounts payable, and payroll continuity are business-critical and must be in the DR process.

**4. Single-vendor dependency for backups and DR.** If your production is on AWS, your backups are in S3, and your DR site is also on AWS (different region), a credential compromise or account-level issue could affect all three simultaneously. Consider a second cloud provider or on-premises infrastructure for your most critical recovery capability.

**5. Offline contact lists that don't exist.** The DR process says "maintain paper copies of client contacts" but nobody actually does it. During a real outage, your CRM is down and you can't reach customers. Assign one person to maintain and quarterly-verify the offline contact list. Make it part of their job description, not a DR-only task.

## Implementation Advice

- **Build a DR runbook per platform.** The master DR process document references platform-specific runbooks. Each runbook is a short, actionable document: "If [Platform X] is down, do [Steps 1-5] by [Person/Team] within [Timeframe]." This modular approach makes the process easier to maintain and execute.
- **Test the full dependency chain.** Don't test platforms in isolation. If your CRM fails over to platform B, but platform B requires authentication from your identity provider which is also down, you haven't tested the real failure scenario. Map dependencies between platforms and test the chains.
- **Define trigger conditions clearly.** When exactly does a platform switch from "degraded" to "failed over"? "When it's been down for a while" leads to decision paralysis. Define: "If [Platform X] is unavailable for > [N] minutes during business hours, initiate failover."
- **Document credential access for DR.** During a disaster, the person who knows the root AWS account password might be unreachable. Define a secure break-glass procedure for DR credential access, with appropriate logging and post-incident review.
- **Maintain a DR contact card.** A single-page card with: DR Coordinator phone, backup contact, primary bridge/conference line, out-of-band chat channel, and links to DR documentation (hosted somewhere that works when production is down). Distribute to all team leads quarterly.
