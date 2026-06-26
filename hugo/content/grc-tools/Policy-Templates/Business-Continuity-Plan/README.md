# Business Continuity Plan Template

## What This Is

The Business Continuity Plan (BCP) is the organization's framework for maintaining critical operations during and after a significant disruption. It defines who is in charge (succession), what needs to recover first (RTO/RPO), who does what (team structure), and how the plan is validated (annual testing). It is the business-focused counterpart to the Disaster Recovery Plan, which covers technical system recovery.

## What It Covers

- Recovery Time Objective (RTO) and Recovery Point Objective (RPO) definitions per critical function
- Line of succession for decision-making authority during a crisis
- Response team structures and responsibilities
- Work site recovery procedures
- Critical service recovery and third-party dependency failure handling
- Annual testing requirements (tabletop and functional)
- Plan maintenance and update triggers

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Business continuity strategy including recovery objectives (RTO/RPO), line of succession, response team structure, and plan testing requirements. This is the governance document reviewed by leadership and auditors.
- **`BCP-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Work site recovery, critical service recovery, third-party dependency failure handling, and plan testing execution procedures. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Mixing up BCP and DRP.** The BCP is about business operations - people, facilities, communication, supply chain. The DRP is about IT systems - servers, databases, networks. They reference each other, but they are separate documents with separate owners. Auditors expect both.

**2. Undefined RTO and RPO.** "We'll recover as fast as we can" is not a plan. RTO and RPO must be specific numbers backed by business impact analysis. If the business hasn't defined them, the BCP is incomplete. The recovery procedures can't be validated without targets to measure against.

**3. Succession assumes everyone is available.** If your succession plan goes CEO → CTO → Head of Engineering and all three are on the same flight that goes down, you have no decision-maker. Build geographic diversity into your succession planning. At least one person in the succession chain should be in a different physical location.

**4. Annual testing that's just a checkbox.** A tabletop exercise where everyone agrees "looks good" without surfacing gaps is not a test. The test must simulate a realistic disruptive scenario, force decisions under ambiguity, and produce documented action items. If every annual test comes back clean, the testing isn't rigorous enough.

**5. Forgetting third-party dependencies.** Your BCP can be perfect, but if your payment processor, cloud provider, or logistics partner goes down and you have no contingency, you're still out of business. Every critical vendor must have a documented fallback plan or alternative provider.

## Implementation Advice

- **Perform a Business Impact Analysis (BIA) first.** Before writing RTO/RPO targets, you need to understand which business functions are critical, what the financial and reputational impact of downtime is, and what dependencies each function has. The BIA feeds the BCP. Without it, your RTO/RPO numbers are guesses.
- **Keep contact information current.** The BCP contact roster is useless if it lists people who left the company six months ago. Link the roster to the HR system or an always-updated directory. Review it quarterly - not just annually.
- **Test communications during the exercise.** Don't just test system recovery - test whether you can actually reach all team members. Send the notification through the actual channels you'd use in a real event (phone tree, Slack, email, SMS). Phone numbers change and people miss Slack messages.
- **Define "declaration" criteria explicitly.** When exactly does the CEO or designated authority declare a continuity event? "When things are really bad" is subjective and leads to delayed activation. Define objective triggers: e.g., office unusable for > 8 hours, customer-facing system down > 4 hours, 20% of workforce unavailable.
- **Store the plan where it can be accessed during an outage.** A BCP stored only on the corporate intranet is useless if the intranet is what's down. Maintain offline copies with team leads. Store it in a shared cloud drive, a printed binder, and personal devices.
