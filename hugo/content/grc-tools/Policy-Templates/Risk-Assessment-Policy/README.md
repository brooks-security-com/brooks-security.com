# Risk Assessment Policy Template

## What This Is

The Risk Assessment Policy defines how the organization identifies, analyzes, evaluates, and treats information security risks using a structured methodology. It includes the quantitative risk scoring model (Likelihood × Impact matrix), risk appetite definitions, treatment options, and the Plan of Action and Milestones (POA&M) framework. This is one of the most heavily audited policies in any GRC program.

## What It Covers

- Asset identification and threat/vulnerability assessment methodology
- Five-tier Impact scale (Incidental through Extreme) with definitions
- Five-tier Likelihood scale (Rare through Certain) with probability definitions
- Risk Score Matrix (Likelihood × Impact) producing Low / Medium / High / Critical ratings
- Risk appetite and tolerance thresholds
- Four risk treatment options (Controls, Transfer, Avoidance, Acceptance)
- Residual risk calculation after treatment
- Plan of Action and Milestones (POA&M) structure and maintenance requirements
- Annual risk assessment minimum cadence
- Threat assessment integration
- Reporting and governance requirements

## Document Structure

This folder contains two documents that work together:

- **`RA-Policy-Template.md`** - The policy itself. Defines WHAT is required: Risk assessment methodology with impact/likelihood scoring, risk rating matrix, risk appetite definition, treatment options, and POA&M requirements. This is the governance document reviewed by leadership and auditors.
- **`Risk-Assessment-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Risk assessment execution procedures, asset and threat identification workflows, risk register maintenance, and POA&M tracking processes. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Using this matrix for every type of risk.** The 5×5 Likelihood × Impact matrix works well for operational and information security risks. It does NOT work well for strategic risks, compliance risks (which are binary - you're either compliant or not), or financial risks (which have their own quantification methods). Don't try to force-fit every risk into this matrix.

**2. Not defining "over the life of the organization" clearly.** The likelihood criteria reference "chance of occurrence over the life of the organization." If your startup is 2 years old, "once in 50–100 years" is meaningless. Adapt the likelihood scale to a meaningful time horizon (e.g., "over the next 3 years" or "over the planning period").

**3. Risk scoring by committee without calibration.** When a group of people independently scores the same risk, you'll get wildly different results. One person's "Moderate (3.0)" is another's "Major (4.0)." Run a calibration exercise: have everyone score the same 5-10 risks, discuss the discrepancies, and align on what the impact levels mean for your specific organization.

**4. The POA&M becomes a graveyard.** Organizations create POA&M entries but never close them. A 6-month-old POA&M item with no status update is an audit finding. Assign owners, set real deadlines, and review POA&M status at every Security Oversight Committee meeting.

**5. Not distinguishing inherent risk from residual risk.** The initial risk score (before controls) is inherent risk. The score after controls are applied is residual risk. Auditors expect to see both. If you only report one number, they'll assume you're hiding something.

**6. "Accept" without documented approval.** Risk acceptance is a legitimate treatment, but every acceptance must have: (a) a documented business justification, (b) approval at the appropriate level (executive for Critical risks), (c) a review date, and (d) confirmation that the acceptance rationale still holds at each review. Undocumented acceptances are treated as control failures.

**7. Annual assessment becomes a checkbox exercise.** Copy-pasting last year's risk register and updating the date is the most common GRC failure mode. Auditors look for evidence of genuine re-assessment: new risks added, old risks retired, scores adjusted based on changes. If your register hasn't changed in 3 years, it's a red flag.

**8. Threat assessment is missing.** Many organizations have a risk assessment but no threat assessment. The threat assessment feeds the risk assessment - you can't properly assess likelihood without understanding the threat landscape. Include threat intelligence as an input to your annual risk assessment cycle.

## Implementation Advice

- **Start with a top-10 risks workshop.** Before building the full risk register, convene senior leadership for a 2-hour workshop to identify and score the top 10 information security risks. This gives you a calibrated baseline and executive buy-in.
- **Use a spreadsheet or GRC platform, not documents.** The risk register is a living spreadsheet, not a static document. Use a GRC platform (recommended: Drata, Vanta, or a shared spreadsheet with version control) that supports sorting, filtering, and status tracking.
- **Define risk appetite in business terms.** "We accept Medium risks" is vague. Better: "We accept risks where the expected annual loss is less than $____, or where treatment cost exceeds 3× the expected loss." Quantify wherever possible.
- **Integrate POA&M with the ticketing system.** POA&M items should be tracked as tickets or tasks, not just rows in a spreadsheet. This ensures ownership, deadlines, and completion tracking are enforced by workflow, not by hoping someone remembers.
- **Map risks to controls.** For each risk, document which existing controls mitigate it. This creates traceability between your risk assessment and your control framework (SOC 2, ISO 27001, NIST 800-53). Auditors love this.
- **Annual assessment minimum; trigger-based is better.** Annual is the baseline. Supplement with event-driven assessments: major system change, new regulation, significant incident, merger/acquisition, new product launch.
- **Don't overthink the math.** The 5×5 matrix is intentionally simple. Don't add decimal precision or complex formulas - they don't improve accuracy, they just make the process harder to explain to executives and auditors.
