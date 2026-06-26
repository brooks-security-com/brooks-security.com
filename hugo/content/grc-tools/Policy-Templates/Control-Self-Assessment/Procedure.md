# Control Self-Assessment - Implementation Procedures

> **Companion to:** Control Self-Assessment Process (CSA-Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Assessment Scheduling
### Standard Approach
1. At the start of each fiscal year, create the assessment calendar:
   a. **Annual Comprehensive Assessment:** Schedule one assessment period covering all in-scope controls. Allow at least 4 weeks for execution, plus 2 weeks for review and corrective action planning. Schedule it to complete no fewer than 60 days before any external audit.
   b. **Quarterly High-Risk Assessments:** Schedule four assessment periods (Q1–Q4). Each covers controls designated as high-risk, historically deficient, or compliance-critical.
   c. **Event-Driven Assessments:** No pre-scheduling. Triggered by: significant system/process changes, control failures, regulatory changes, or audit findings.
2. For each scheduled assessment period, publish the timeline at least 4 weeks in advance:
   a. Start date.
   b. Evidence submission deadline.
   c. Review completion date.
   d. Corrective action planning deadline.
3. Define the scope: list every control in scope for this assessment, its owner, and the expected evidence types.
4. Assign each control to a specific assessor (control owner or designated delegate). Confirm assignment acceptance in writing - an unacknowledged assignment is the leading cause of missed assessments.
5. Notify all assessors, control owners, and executive stakeholders of the upcoming assessment period. Include expectations, deadlines, evidence requirements, and links to the assessment platform or forms.
6. Publish a reminder at 2 weeks before the evidence deadline, at 1 week before, and at 48 hours before. Escalate non-respondents to their manager at the 48-hour mark.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Continuous assessment model:** Instead of periodic campaigns, assess controls on a rolling basis throughout the year. Each month, a subset of controls is assessed. This distributes workload and avoids the "assessment crunch" before audit season. Requires a GRC platform with automated scheduling and tracking.
> - **Assessment tied to control criticality tiering:** Not all controls need the same rigor. Tier 1 controls (high-risk) get deep assessment with multiple evidence types quarterly. Tier 2 (medium-risk) get standard assessment semi-annually. Tier 3 (low-risk, highly automated) get lightweight confirmation annually. This prevents assessment fatigue.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Assessment scheduled too close to the audit.** If your annual assessment wraps up 2 weeks before the SOC 2 auditor arrives, you have no time to remediate findings before they become audit findings. The assessment should complete with at least 60 days of runway before any external audit.
> - **Assessors who don't know they're assessors.** Control ownership must be defined and maintained before the assessment is scheduled. If the assessment announcement is the first time someone learns they "own" a control, the assessment quality will be poor and the timeline will slip.

## Procedure 2: Evidence Collection
### Standard Approach
1. For each control, pre-define acceptable evidence types and formats. This eliminates ambiguity and prevents assessors from submitting irrelevant documentation:
   a. **Operational controls:** System-generated reports, logs, dashboards, or automated exports (not screenshots - they're too easy to fake and don't prove ongoing operation).
   b. **Periodic controls:** Meeting minutes, signed attestations, approval records, with timestamps proving occurrence within the assessment period.
   c. **Design controls:** Architecture diagrams, policy documents, configuration standards with version history.
   d. **Training/awareness controls:** Training completion reports from the LMS or HRIS, showing completion rates and dates.
2. Assessors collect evidence for each assigned control during the assessment period. Evidence must:
   a. Cover the full assessment period, not a single point in time. A quarterly access review performed in January doesn't prove the control operated in February and March.
   b. Be attributable - the evidence must show who performed the control and when.
   c. Be relevant - evidence must demonstrate the control OPERATED, not just that the control EXISTS.
3. Upload or link evidence to the GRC platform or assessment tool. Tag each piece of evidence with the control ID, assessment period, and evidence type.
4. If evidence cannot be produced for a control, the assessor must document the reason (control not performed, evidence not retained, system issue) and this becomes a finding.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated evidence collection via API integrations:** Integrate the GRC platform with cloud providers, identity providers, HR systems, and ticketing systems to auto-collect evidence. No manual screenshots. The assessor's role shifts from "collect evidence" to "review auto-collected evidence and attest to its accuracy."
> - **Sampling-based evidence for high-frequency controls:** For controls that operate daily (e.g., log monitoring, backup verification), collect evidence for a representative sample (e.g., one week per month) rather than every single day. Document the sampling methodology.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Evidence that proves the wrong thing.** A screenshot of the policy that says "access reviews are performed quarterly" proves the policy exists - it does NOT prove the access review actually happened. Evidence must demonstrate execution, not existence.
> - **Evidence that is too old.** Evidence from outside the assessment period is rejected. If the assessment covers Q2 and the assessor uploads Q1 evidence because "nothing changed," that's a gap. The evidence must cover the assessment period.
> - **Evidence stored in personal email or local drives.** Evidence uploaded only to the GRC platform survives personnel changes. If the only copy of evidence is in a former employee's email, it's lost.

## Procedure 3: Rating Calibration
### Standard Approach
1. After evidence is collected, each assessor evaluates their assigned controls against the defined effectiveness scale:
  - **Operating Effectively:** Control design is adequate, control is functioning as intended, and evidence supports this conclusion without gaps.
  - **Needs Improvement:** Control is partially effective. Minor gaps or inconsistencies exist that can be remediated within one assessment cycle.
  - **Not Effective:** Control is not achieving its objective. Significant gaps or failures exist that require immediate corrective action.
2. To ensure consistent application of the rating scale across assessors and departments, conduct a calibration session before the assessment period begins:
   a. Present 3–5 anonymized scenarios from prior assessments (or constructed examples).
   b. Have all assessors independently rate each scenario.
   c. Discuss discrepancies. The goal is not unanimous agreement but shared understanding of what each rating means in practice.
   d. Document the calibration outcomes as guidance for the current assessment period.
3. During the assessment, the GRC team or Security Officer reviews a sample of ratings for consistency:
   a. If one department rates all controls "Operating Effectively" while another department with similar risk profile identifies multiple gaps, investigate the discrepancy.
   b. Control owners who rate controls as "Operating Effectively" without sufficient evidence are asked to provide additional evidence or re-rate.
4. Final ratings are locked in the GRC platform only after the Security Officer's review is complete.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Two-pass rating system:** The assessor provides an initial rating with evidence. A second reviewer (GRC team or peer from another department) independently reviews the evidence and rating. Discrepancies are resolved before the rating is final. This adds rigor for high-risk controls.
> - **Quantitative scoring supplement:** For controls with measurable outputs, supplement the qualitative rating with a quantitative score (e.g., percentage of systems compliant, number of exceptions). This provides a more objective basis for the qualitative rating.
### Common Pitfalls
> **⚠️ Watch out:**
> - **"Everything is operating effectively" syndrome.** If 100% of controls are rated "Operating Effectively" across multiple assessment cycles, either the organization has a perfect control environment (unlikely) or assessors are avoiding difficult ratings. Set an expectation that identifying gaps is valuable and not punitive.
> - **Inconsistent severity assignment.** One assessor rates an unencrypted backup as "Needs Improvement" while another rates the same finding as "Not Effective." Without calibration, the aggregate ratings are unreliable. Calibration sessions fix this.
> - **Rating based on effort, not effectiveness.** "We worked really hard on this control, so it must be Effective" is not how ratings work. A control is Effective if it achieves its objective, regardless of the effort expended.

## Procedure 4: Remediation Tracking
### Standard Approach
1. For every finding rated "Needs Improvement" or "Not Effective," create a remediation record in the ticketing system or GRC platform during the assessment close-out phase.
2. Each remediation record must contain:
   a. Finding description (what gap was identified).
   b. Severity (Critical, High, Medium, Low) based on compliance/security impact.
   c. Affected control(s) and control owner.
   d. Recommended corrective action.
   e. Assigned remediation owner (may differ from control owner for technical fixes).
   f. Target remediation date.
   g. Verification method (how will completion and effectiveness be confirmed).
3. For Critical and High severity findings:
   a. Action plans must be approved by the Security Officer or executive management within 10 business days of identification.
   b. These findings are added to the Oversight Body meeting agenda for visibility.
4. Track remediation status:
   a. **Open:** Identified, not yet started.
   b. **In Progress:** Remediation underway.
   c. **Resolved:** Remediation implemented; awaiting verification.
   d. **Verified Closed:** Remediation implemented and independently verified as effective.
   e. **Accepted:** Finding acknowledged and risk formally accepted per the Risk Assessment Policy.
5. At the next quarterly assessment cycle (or earlier for Critical findings), verify each resolved finding:
   a. Review updated control documentation.
   b. Collect evidence of the implemented change.
   c. Re-test the control if applicable.
   d. Update status to "Verified Closed" or re-open if verification fails.
6. Report remediation metrics to the Oversight Body at each meeting:
   a. Open findings by severity and age.
   b. Average time to remediation by severity.
   c. Findings exceeding their target remediation date.
7. Accepted risks must be reviewed at least quarterly. If the acceptance rationale no longer holds, the finding must be escalated back to active remediation.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Integrated with existing vulnerability/issue management:** If the organization already has a mature ticket-driven remediation process (e.g., from the Vulnerability Management program), fold CSA findings into that same workflow rather than creating a parallel tracking system.
> - **Automated verification for configuration-based findings:** For findings that can be verified through automated scanning (e.g., "encryption not enabled on S3 bucket"), configure the scanner to automatically re-test and close the finding when the configuration is remediated.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Remediation records that are wishes, not plans.** "Improve access review process" is not a remediation plan. The record must specify: what specific change will be made, who will make it, by when, and how verification will be performed.
> - **Accepted findings that never get re-reviewed.** Risk acceptance is a temporary disposition, not a permanent one. Accepted findings that haven't been reviewed in 12+ months indicate the acceptance process is being used to avoid remediation rather than to manage it.
> - **Remediation owner who leaves the organization.** If the remediation owner departs and the finding isn't reassigned, it will sit in "In Progress" indefinitely. During the offboarding process, check for open remediation assignments and reassign them.
