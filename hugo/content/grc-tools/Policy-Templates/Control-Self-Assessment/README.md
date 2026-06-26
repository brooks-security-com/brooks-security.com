# Control Self-Assessment Process Template

## What This Is

The Control Self-Assessment Process defines how the organization evaluates its own internal controls for design adequacy and operating effectiveness. It's the mechanism by which control owners attest that their controls are working, collect evidence to prove it, and identify gaps that need remediation. This process is the backbone of any SOC 2, ISO 27001, or similar compliance program - auditors rely on it to validate that you know whether your controls are effective.

## What It Covers

- Control self-assessment cadence (annual comprehensive, quarterly high-risk, event-driven)
- Six-step assessment procedure: Planning → Assessment → Reporting → Review → Follow-Up → Close-Out
- Control effectiveness ratings (Operating Effectively, Needs Improvement, Not Effective)
- Evidence collection requirements and acceptable evidence types
- Issue identification, severity classification, and corrective action planning
- Follow-up verification of corrective actions
- Documentation and evidence retention requirements
- Roles and responsibilities (Security Officer, control owners, GRC team, executive management)
- Recommended GRC tools (Drata, Vanta, or equivalent)

## Document Structure

This folder contains three files:

- **`CSA-Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Gotchas People Get Wrong

**1. "Self-assessment" means "mark everything as effective."** The most common failure mode is control owners attesting that everything is working perfectly because they don't want to create work for themselves. This is why external auditors test controls independently - and why discrepancies between self-assessments and audit findings are a major red flag. Create a culture where identifying issues is rewarded, not punished. "We found and fixed 5 control gaps this quarter" is a better narrative than "Everything is perfect."

**2. Evidence that proves the wrong thing.** A control that says "Access reviews are performed quarterly" needs evidence of the actual review - meeting minutes, a signed attestation, system-generated access review reports - not just a screenshot of the policy that says reviews should happen. Evidence must demonstrate that the control *operated*, not just that it *exists*.

**3. Quarterly vs. annual assessment confusion.** The process defines multiple assessment cadences. Control owners often conflate them - they think the annual assessment covers them for the year and skip quarterly high-risk assessments. Make clear assignments: "Control A (quarterly) → assessed by Jane in Q1, Q2, Q3, Q4. Control B (annual) → assessed by Jane in Q4." Track compliance with cadence separately from control effectiveness.

**4. Corrective actions with no owner or no deadline.** "We should improve our access review process" is a wish, not a corrective action. Every identified issue needs: specific action description, assigned owner, target completion date, and verification method. Without these four elements, it won't get done.

**5. Evidence retention that assumes the GRC platform will be around forever.** If you switch GRC platforms (from Drata to Vanta, or from a spreadsheet to a platform), you need to migrate or retain historical evidence. SOC 2 audits look at evidence across the entire audit period, which could be 12 months. A platform migration in month 6 that loses the first 6 months of evidence is a failed audit.

**6. Control owners who don't understand their controls.** When a control is assigned to "Head of Engineering," but the Head of Engineering delegates the assessment to someone who doesn't actually own the control, the assessment quality plummets. Control owners must be the people who actually perform or directly oversee the control. If your control ownership doesn't match operational reality, fix the ownership first.

**7. Annual assessment that only happens right before the audit.** If your annual assessment is scheduled for the same month as your SOC 2 audit, you're doing it wrong. The assessment should be completed with enough time to remediate issues BEFORE the auditor arrives. Auditor-found issues that you could have found and fixed yourself are the most frustrating type of audit finding.

**8. Not trending assessment results over time.** Individual assessments tell you about a point in time. Trends tell you whether your control environment is improving or degrading. Track: number of controls rated "Needs Improvement" or "Not Effective" over time, average time to remediate issues, and recurring issue types. Present these trends to executive management.

## Implementation Advice

- **Use a GRC platform from day one.** Manual assessments via spreadsheets and shared drives don't scale. A GRC platform (Drata, Vanta, Secureframe, or similar) provides: control-to-framework mapping, automated evidence collection (API integrations with your cloud, HR, and ticketing systems), assessment workflow, and audit-ready reporting. The platform pays for itself in reduced audit preparation time.
- **Automate evidence collection wherever possible.** Integrate your GRC platform with your cloud provider (auto-collects configuration evidence), identity provider (auto-collects access review and MFA evidence), HR system (auto-collects background check and termination evidence), and ticketing system (auto-collects change management evidence). Manual screenshots are error-prone and time-consuming.
- **Pre-define evidence requirements for each control.** For every control in your framework, define: what specific evidence proves it's working, what format the evidence should be in, where/how it should be collected, and how frequently. Without pre-defined evidence requirements, control owners will submit whatever's easiest, not what's most probative.
- **Tier your controls by risk for assessment depth.** Not every control needs the same rigor. Tier 1 controls (high-risk, compliance-critical, historically problematic) get deep assessment with multiple evidence types. Tier 2 controls (medium-risk) get standard assessment. Tier 3 controls (low-risk, highly automated) get lightweight confirmation. This prevents assessment fatigue.
- **The Security Oversight Committee should review assessment results.** Control assessment outcomes, not just vulnerability and incident metrics, should be on the Security Oversight Committee agenda. This creates executive visibility into control gaps and forces accountability for remediation.
- **Test the process on one department first.** Before rolling out organization-wide, run the assessment process with one department (e.g., Engineering) for one quarter. Identify pain points in the workflow, evidence collection, and reporting. Refine the process, then expand.
