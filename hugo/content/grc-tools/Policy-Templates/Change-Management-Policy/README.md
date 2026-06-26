# Change Management Policy Template

## What This Is

The Change Management Policy defines how the organization controls changes to production systems and software. It establishes a Change Advisory Board (CAB), defines change classifications by risk level, mandates separation of duties (developer cannot approve their own production change), and enforces testing in non-production environments before production deployment. This is one of the most heavily audited policies in any GRC program.

## What It Covers

- Change classification (Standard, Normal, Major, Emergency) and approval requirements
- The full change lifecycle: request → review → approval → testing → implementation → post-implementation review
- Software development change controls (peer review, automated testing, branch protection)
- Infrastructure and configuration change controls (IaC, environment separation, staging)
- Change Advisory Board (CAB) composition and responsibilities
- Separation of duties enforcement
- Emergency change procedures with post-implementation ratification

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Change control framework with CAB governance, change classifications (Standard/Normal/Major/Emergency), approval requirements, and the full change lifecycle. This is the governance document reviewed by leadership and auditors.
- **`Change-Management-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Software development change pipeline, infrastructure/IaC change workflows, emergency change process, and CAB meeting procedures. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. No separation of duties.** The most common audit finding in change management is that the same person develops, tests, approves, and deploys a change. This is especially common in startups. At minimum, a different person must approve the change. Ideally, a different person also deploys it. Developers must not have direct production access.

**2. Emergency changes bypass everything forever.** Emergency changes need an expedited path, but they must still be documented and retroactively reviewed. If your emergency change process has no post-implementation ratification by the CAB, auditors will treat every emergency change as an uncontrolled change.

**3. Staging that doesn't mirror production.** A staging environment with 2GB of RAM and 10 rows of test data tells you nothing about how the change will behave in production with 64GB of RAM and 10 million rows. Staging must be architecturally equivalent. Data volume doesn't need to match exactly, but schema, configuration, and infrastructure topology must.

**4. CAB that rubber-stamps everything.** A CAB that meets weekly and approves 100% of changes without discussion is not providing governance. Track CAB metrics: approval rate, changes rejected, changes sent back for revision. If rejection rate is 0%, the CAB isn't doing its job or changes aren't being submitted for things that should be.

**5. "Minor" changes that aren't minor.** Teams often classify database schema migrations, firewall rule changes, or SSL certificate renewals as "standard" or "minor" to avoid CAB review. These are some of the most dangerous changes. Define clear criteria for each classification level - don't let teams self-classify without objective thresholds.

## Implementation Advice

- **Integrate change management into your deployment pipeline.** The change request ticket ID should be referenced in the deployment pipeline configuration. If a deployment runs without a linked change request, it should be flagged or blocked. This closes the loop between process and execution.
- **Define your maintenance windows explicitly.** "Least disruptive time" is ambiguous and leads to 3 AM deployments that no one is awake to monitor. Define maintenance windows per system: e.g., Saturdays 2-6 AM UTC for customer-facing services, weekdays 10 PM-2 AM for internal tools.
- **Automate evidence collection.** Every code commit, peer review, automated test result, security scan result, staging validation, and approval should be automatically captured and linked to the change request. This makes audit evidence collection trivial and makes it impossible to "forget" a step.
- **Training for change requesters.** Most bad change requests aren't malicious - they're incomplete. Train anyone who submits change requests on what a complete request looks like: what's the rollback plan? What systems are affected? How do you verify success? Create a template and require all fields.
- **Measure and report.** Track change success rate (changes that didn't require rollback or cause incidents), mean time to approve, and emergency change rate. If emergency changes exceed 10% of total changes, your normal process is too slow or too bureaucratic and you're driving people to the emergency path.
