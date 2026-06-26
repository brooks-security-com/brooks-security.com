# Remediation Plan Template

## What This Is

The Remediation Plan is the operational document that defines the end-to-end workflow for addressing security findings - from discovery through prioritization, assignment, remediation, verification, and closure. It bridges the Vulnerability Management Policy (which defines SLAs and severity) and the Vulnerability Management Process (which defines detection and scanning) by focusing specifically on what happens after a finding is identified. This is the document that makes remediation accountable and measurable.

## What It Covers

- Six-step remediation workflow: Identification → Prioritization → Assignment → Remediation → Verification → Review
- Finding documentation requirements (what must be captured when a finding is created)
- Prioritization methodology (CVSS + asset criticality + exploitability + exposure)
- Assignment SLAs by severity (Critical: 4 hours, High: 24 hours)
- Four risk treatment options with detailed requirements: Resolve, Mitigate, Transfer, Accept
- Verification and closure procedures with closure SLAs
- Risk acceptance governance (approval thresholds by severity, quarterly review)
- Monthly/quarterly Security Oversight Committee review cadence
- Exception management process
- Roles and responsibilities across security, IT, development, and leadership

## Document Structure

This folder contains three files:

- **`Remediation-Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Gotchas People Get Wrong

**1. No distinction between "assigned" and "acknowledged."** An SLA that says "Critical findings must be assigned within 4 hours" is meaningless if the assignee doesn't look at their queue for 3 days. Define both an assignment SLA (ticket lands in someone's queue) and an acknowledgment SLA (assignee confirms they're working on it). The escalation path triggers on missed acknowledgments, not missed assignments.

**2. Mitigation as a permanent solution.** Mitigation (WAF rules, network segmentation, disabling features) is a temporary control, not a permanent fix. If your remediation plan allows mitigation to sit forever, you accumulate technical debt that eventually becomes a breach. Every mitigation must have a linked "eventual resolution" ticket with a target date; these must be reviewed quarterly.

**3. Risk acceptance without approval thresholds.** The plan says "acceptance must be approved," but doesn't specify by whom. A developer should not be able to accept a Critical risk on a production system. Define approval thresholds: Low → Security team, Medium → Asset owner + Security, High → CISO, Critical → Executive leadership. This creates accountability commensurate with risk.

**4. Verification that consists of "close the ticket."** The most common remediation failure mode is closing a ticket without actually verifying the fix worked. Re-scan the affected asset. For Critical findings, do a targeted manual test. "I applied the patch" is not verification - "I applied the patch AND re-scanned AND the vulnerability is no longer present" is verification.

**5. Closure SLAs vs. change management timelines.** A Critical vulnerability with a 7-day SLA goes through emergency change management (24-hour approval). A High vulnerability with a 30-day SLA goes through standard change management (5-10 business days for CAB review). If your change management process doesn't have an expedited path for security patches, you'll routinely miss High SLAs. Align your change management policy with your remediation SLAs.

**6. Counting "accepted" findings as "closed."** An accepted risk is not remediated and should not be reported as "closed" in metrics. Track acceptances separately: "X resolved, Y mitigated, Z transferred, A accepted." If you lump acceptances into "closed," you're misleading management and auditors about your actual remediation performance.

**7. No recurring vulnerability analysis.** If the same type of finding (e.g., "TLS 1.0 enabled") keeps appearing across different systems, it's not a remediation problem - it's a configuration standard or build pipeline problem. The review phase should identify patterns and trigger root cause fixes, not just individual ticket closure. This turns your remediation program from reactive to proactive.

## Implementation Advice

- **Integrate the ticketing system with your scanners.** Manual ticket creation from scanner reports doesn't scale. Your vulnerability scanner and CSPM tool should auto-create tickets via API. Human effort should go into triage and remediation, not data entry.
- **Build remediation dashboards that drive accountability.** Create a dashboard visible to the Security Oversight Committee and team leads showing: open findings by team, SLA breach count, aging findings (30/60/90+ days), and acceptance inventory. Public visibility drives action more effectively than email reminders.
- **Define ownership BEFORE findings appear.** Maintain an asset-to-team mapping so that when a scanner finds a vulnerability on "app-server-07," the ticket is auto-assigned to the correct team. If assignment requires manual routing, you'll burn SLA time on bureaucracy.
- **Patch management is a subset of remediation.** Some findings are fixed by patching; others require code changes, configuration updates, architecture modifications, or vendor coordination. Don't assume "remediation = patching." The plan must accommodate all treatment types.
- **Pre-approve standard mitigations.** For common finding types, pre-approve standard mitigation responses: "If WAF not deployed, deploy WAF rule X." This lets teams mitigate quickly without waiting for approval, while the resolution ticket tracks the permanent fix.
- **Test the closure workflow end-to-end quarterly.** Pick a recently closed Critical finding and walk it backwards: was it identified promptly? Assigned to the right team? Remediated within SLA? Verified effectively? Closed with proper documentation? This spot-check reveals process gaps better than any dashboard.
