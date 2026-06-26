# Risk Assessment - Implementation Procedures

> **Companion to:** Risk Assessment Policy (RA-Policy-Template.md)
> **Purpose:** These procedures describe how to execute the risk assessment and treatment process defined in the Risk Assessment Policy. The policy defines the methodology, impact/likelihood scales, and risk rating criteria; this document describes HOW to conduct assessments, facilitate workshops, populate the risk register, and manage the POA&M.

---

## Procedure 1: Risk Assessment Workshop Facilitation

### Standard Approach

This procedure covers how to plan and facilitate a risk assessment workshop or interview with asset owners and risk owners.

#### 1.1 Pre-Workshop Preparation

1. **Asset Inventory Collection:** `____` weeks before the workshop (recommended: 2 weeks):
  - Gather the current asset inventory from the centralized asset management system.
  - For each asset, identify: asset name, description, asset owner, data classification, system criticality, current controls.
  - Review previous risk assessments for these assets (if any).
2. **Threat Research:**
  - Review current threat intelligence feeds for threats relevant to the organization's industry and geography.
  - Review the Threat Assessment document (if maintained separately).
  - Prepare a list of likely threats for discussion: ransomware, phishing/social engineering, insider threat, third-party compromise, cloud misconfiguration, DDoS, physical disaster, supply chain attack.
3. **Workshop Logistics:**
  - Schedule a 2–4 hour session (depending on scope). For broad organizational assessments, plan multiple sessions by business unit or asset category.
  - Invite: asset owner(s), risk owner(s), Security Officer (or assessor/facilitator), and a scribe.
  - Distribute the asset inventory and threat list 1 week before. Ask participants to come prepared with their understanding of business impact.
4. **Workshop Agenda:**
  - Introduction (10 min): purpose, methodology, ground rules.
  - Asset review (30–60 min): review assets, confirm owners.
  - Threat and vulnerability identification (45–90 min): per asset, brainstorm threats and vulnerabilities.
  - Impact and likelihood scoring (30–60 min): score each risk.
  - Treatment discussion (30 min): initial treatment options for Critical/High risks.
  - Next steps (10 min): POA&M ownership, follow-up schedule.

#### 1.2 Facilitated Session Execution

1. **Asset Review:**
  - Walk through each asset in priority order (Critical assets first).
  - Confirm: is the asset still active? Is the owner correct? Has the business impact changed since last assessment?
  - For new assets: assign an owner and data classification before proceeding.
2. **Threat and Vulnerability Identification:**
  - For each asset, ask: "What could go wrong? Who or what could cause harm to this asset?"
  - Prompt with threat categories if participants get stuck:
    - **External actors:** hackers, nation-state, competitors, cybercriminals.
    - **Internal actors:** disgruntled employees, careless employees, contractors.
    - **Environmental:** natural disasters, power failure, ISP outage.
    - **Technical:** software bugs, hardware failure, cloud provider outage.
  - For each threat, ask: "What weakness (vulnerability) would allow this threat to succeed?"
  - Record each threat-vulnerability pair as a separate risk entry in the Risk Register.
3. **Impact and Likelihood Scoring:**
  - For each risk, guide participants through scoring using the policy's criteria tables.
  - **Impact scoring:** "If this risk materialized, what would be the worst-case scenario?" Reference the impact criteria table. Avoid the trap of "it depends" - score the most likely bad outcome, not the theoretical worst case.
  - **Likelihood scoring:** "How often would you expect this to happen?" Reference the likelihood criteria table. Consider: have similar events happened in the industry? Does the organization have compensating controls?
  - Calculate Risk Score = Impact × Likelihood. Assign risk level per the matrix.
  - **Facilitator tip:** If participants disagree on a score, have each person state their score and rationale, then converge. Do not average scores - reach consensus.
4. **Treatment Discussion (Initial):**
  - For Critical and High risks: discuss which treatment option is most appropriate.
  - Do not finalize treatment in the workshop - asset/risk owners need time to research costs and feasibility. Instead, capture initial direction and assign the owner to develop a treatment plan.

#### 1.3 Post-Workshop Deliverables

1. **Draft Risk Register:** Within `____` business days (recommended: 5 days), distribute a draft Risk Register to all participants for review.
2. **Treatment Plans:** Risk owners have `____` business days (recommended: 10 days) to submit treatment plans for Critical and High risks.
3. **Final Report:** Compile the Risk Assessment Report (see Procedure 3) and present to the Security Oversight Committee at the next scheduled meeting.

### Alternative Approaches

> **💡 Why you might choose differently:** Different organizational sizes and risk cultures benefit from different facilitation methods.

- **Survey-Based Assessment:** For organizations with many distributed assets, send a structured risk assessment survey to asset owners. The Security team compiles responses, identifies gaps, and follows up with 1:1 interviews only where survey responses indicate High/Critical risks. More efficient but risks lower-quality input since it lacks workshop discussion.
- **Continuous Risk Assessment (CRQ):** Mature organizations may adopt a continuous risk quantification approach using automated data feeds (vulnerability scan results, threat intelligence, asset inventory changes) to dynamically update risk scores. This reduces the reliance on periodic workshops but requires significant tooling investment and well-maintained data sources.
- **FAIR Methodology:** Organizations seeking quantitative risk analysis can adopt the FAIR (Factor Analysis of Information Risk) methodology, which models risk in financial terms (annualized loss expectancy). More rigorous but requires specialized training and more time per risk. Appropriate for high-stakes risks where financial justification is needed for treatment investment.

### Common Pitfalls

> **⚠️ Watch out:** Risk workshops that turn into "security wish list" sessions. "We need a new firewall, a SIEM, and three more security engineers." Separate risk identification from solution identification. First, identify and score the risk; later, evaluate which treatment option (including new tools) is appropriate.

> **⚠️ Watch out:** Scoring inflation. If every risk comes out "Critical," the scoring is broken. Review the distribution: a healthy risk register has a pyramid shape - many Low/Medium risks, fewer High risks, very few Critical risks. If the distribution is skewed, recalibrate with the participants.

> **⚠️ Watch out:** Forgetting to document risks that are already well-controlled. A risk that's mitigated by existing controls should still be recorded, with the current controls noted and a lower residual risk score. This documents due diligence and prevents the control from being inadvertently removed later.

---

## Procedure 2: Risk Register Management

### Standard Approach

This procedure covers the setup, population, and maintenance of the Risk Assessment Register.

#### 2.1 Risk Register Setup

1. **Tool Selection:** Use a dedicated risk management tool or a structured spreadsheet/document. Recommended tools:
  - **GRC Platforms:** SimpleRisk (open-source), Eramba (open-source), or commercial platforms (Archer, ServiceNow GRC, OneTrust).
  - **Spreadsheet (interim):** For organizations not yet using a GRC platform, maintain the register in a governed spreadsheet with version control.
2. **Register Fields (minimum):**
   | Field | Description |
   |-------|-------------|
   | Risk ID | Unique identifier (e.g., RISK-YYYY-001) |
   | Asset Name/ID | The asset the risk applies to |
   | Asset Owner | Person responsible for the asset |
   | Risk Owner | Person accountable for managing this risk |
   | Threat | Description of the threat |
   | Vulnerability | Description of the vulnerability |
   | Impact Score (1.0–5.0) | Per policy impact criteria |
   | Likelihood Score (1.0–5.0) | Per policy likelihood criteria |
   | Inherent Risk Score | Impact × Likelihood (before treatment) |
   | Inherent Risk Level | Low / Medium / High / Critical |
   | Treatment Option | Implement Controls / Transfer / Avoid / Accept |
   | Treatment Description | What will be done |
   | Residual Impact Score | Impact after treatment |
   | Residual Likelihood Score | Likelihood after treatment |
   | Residual Risk Score | Residual Impact × Residual Likelihood |
   | Residual Risk Level | Low / Medium / High / Critical |
   | Treatment Status | Not Started / In Progress / Implemented / Accepted |
   | Target Completion Date | When treatment should be complete |
   | Actual Completion Date | When treatment was completed |
   | Last Review Date | When the risk was last reviewed |
   | Next Review Date | When the risk should be reviewed next |

#### 2.2 Ongoing Maintenance

1. **New Risk Addition:**
  - Any employee can submit a risk via `____` (service desk, dedicated form, or direct communication to the Security Officer).
  - The Security Officer reviews the submission within `____` business days. If valid, assigns a Risk Owner and adds to the register.
2. **Risk Review Cadence:**
  - Critical risks: reviewed quarterly.
  - High risks: reviewed semi-annually.
  - Medium risks: reviewed annually.
  - Low risks: reviewed annually or at next formal assessment.
3. **Risk Closure:**
  - A risk may be closed when: treatment has been fully implemented and residual risk is within risk appetite, OR the asset has been decommissioned.
  - Closure requires risk owner approval and Security Officer review.
  - Closed risks are moved to an "Archived" section of the register, not deleted.

### Common Pitfalls

> **⚠️ Watch out:** The Risk Register becoming a "write-only" document. Risks are added but never reviewed or updated. Schedule recurring calendar events for risk reviews. Use automated reminders: if a risk's "Next Review Date" passes without a review, escalate to the risk owner's manager.

> **⚠️ Watch out:** Treating the Risk Register as secret. While detailed risk information is sensitive, the risk management process should be transparent. Share aggregated/summarized risk information with leadership and relevant stakeholders. A secret risk register is a governance failure.

---

## Procedure 3: Plan of Action and Milestones (POA&M) Management

### Standard Approach

#### 3.1 POA&M Entry Creation

For each risk with a treatment plan, create a POA&M entry with:

1. **Unique Identifier:** e.g., POAM-YYYY-NNN.
2. **Milestone Description:** Specific, measurable steps to implement the treatment.
3. **Responsible Entity:** Individual or team accountable for completing the milestone.
4. **Resource Estimate:** Funded (budget approved), Unfunded (budget needed), or Reallocation (using existing resources).
5. **Creation Date:** When the POA&M entry was created.
6. **Deficiency/Risk Name and Description:** Link to the Risk Register entry.
7. **Source:** Risk Assessment, Audit Finding, Penetration Test, Incident Post-Mortem, etc.
8. **Severity Level:** Low, Medium, High, Critical.
9. **Scheduled Completion Date:** When the milestone should be complete.

#### 3.2 POA&M Tracking and Status Updates

1. **Update Frequency:** POA&M must be updated at least monthly. Risk owners report status to the Security Officer.
2. **Status Values:**
  - **Ongoing:** Work is in progress and on track.
  - **Delayed:** Work is behind schedule. Must include a revised completion date and reason for delay.
  - **Complete:** Milestone achieved. Must include the actual completion date and evidence of completion.
  - **Cancelled:** Milestone is no longer required (e.g., risk accepted, asset decommissioned). Include rationale.
3. **Escalation:**
  - Delayed items: escalated to Security Officer. If delay exceeds one reporting cycle (e.g., two monthly reviews), escalate to CISO.
  - Unfunded items: included in the annual budget planning cycle.

#### 3.3 POA&M Reporting

1. **Monthly Status Report:** Summary of POA&M entries by status: number of Ongoing, Delayed, Completed, Cancelled. Aging of Delayed items.
2. **Quarterly Leadership Report:** Included in the Risk Assessment Report to the Security Oversight Committee. Highlights: top 5 risks by severity, overdue POA&M items, budget requests.

### Common Pitfalls

> **⚠️ Watch out:** POA&M items that are perpetually "Ongoing" with no end date. "Implementing SIEM" with a completion date of "ongoing" is not a POA&M milestone - it's a program. Break large initiatives into specific, time-bound milestones: "Deploy log agents to all servers (Q1)," "Configure alert rules for Critical events (Q2)," "Complete tuning and handoff to SOC (Q3)."

> **⚠️ Watch out:** POA&M entries that reference a person who left the organization. When personnel change, reassign POA&M ownership immediately. Include POA&M ownership in the offboarding checklist: "Reassign all POA&M items owned by departing employee to [successor]."

---

## Procedure 4: Risk Acceptance Process

### Standard Approach

#### 4.1 Acceptance Criteria

Risk acceptance is permitted only when:
- The risk level is within the organization's risk appetite (Low, and some Medium risks), OR
- The cost of treatment demonstrably exceeds the potential impact, AND no feasible mitigation or transfer option exists.

#### 4.2 Acceptance Documentation

A Risk Acceptance Form must be completed and include:
- Risk ID and description.
- Why treatment is not being pursued (cost-benefit analysis summary).
- Compensating controls in place (if any).
- Acceptance duration (risk acceptances are time-bound - typically 12 months).
- Approvals:
 - **Low/Medium risks:** Risk Owner approval.
 - **High risks:** Risk Owner + Security Officer approval.
 - **Critical risks:** Risk Owner + Security Officer + Executive Leadership approval.

#### 4.3 Acceptance Review

All accepted risks must be reviewed at least annually. At review:
- Is the acceptance rationale still valid?
- Have new treatment options become available?
- Has the risk level changed?
- If rationale is no longer valid, the risk must be treated.

### Common Pitfalls

> **⚠️ Watch out:** Risk acceptance as the default path. "It's too expensive to fix, so we'll accept it." Acceptance should be the LAST resort after genuinely evaluating treatment, mitigation, and transfer options. If >20% of risks are accepted, the risk appetite may be too permissive.

> **⚠️ Watch out:** Forever acceptances. "Accepted indefinitely" is not a valid risk state. Risk acceptances must have an expiration date. The business, threat landscape, and available controls change; what was acceptable 3 years ago may not be today.

---

## Related Documents

- Risk Assessment Policy (RA-Policy-Template.md)
- Vulnerability Management Policy (../Vulnerability-Management-Policy/VM-Policy-Template.md)
- Incident Response Policy (../Incident-Response-Policy/IR-Policy-Template.md)
- Asset Management Policy (../Asset-Management-Policy/AMP-Template.md)
- Business Continuity Plan (../Business-Continuity-Plan/Template.md)
- Disaster Recovery Plan (../Disaster-Recovery-Plan/Template.md)
- Vendor Management Policy (../Vendor-Management-Policy/Template.md)
