# Information Security Program - Implementation Procedures

> **Companion to:** [Information Security Policy](/grc-tools/policy-templates/information-security-policy/isp-template/)  
> **Purpose:** These procedures describe how to implement key operational requirements of the Information Security Policy. The policy defines WHAT the organization requires; this document describes HOW to operationalize those requirements.

---

## Procedure 1: Security Awareness Training Program

### Standard Approach

1. **New hire onboarding training.** Within ____ days of hire (recommended: 30 days), all new Personnel must complete:
  - Information security awareness training covering the ISP, acceptable use, data handling, and incident reporting.
  - A signed acknowledgment of the Information Security Program and Code of Conduct.
  - Training delivery: ____ (e.g., LMS platform, live session, recorded video with quiz).

2. **Annual refresher training.** All Personnel must complete annual security awareness training, covering:
  - Updates to security policies and procedures.
  - Current threat landscape highlights (phishing trends, common attack patterns relevant to the organization).
  - Role-specific content (e.g., secure coding for developers, data handling for customer-facing teams).
  - Annual policy acknowledgment (electronic signature tracked in ____).

3. **Incident response training.** Personnel assigned incident response roles must complete:
  - Initial training within ____ days of assuming the role (recommended: 90 days).
  - Annual refresher training.
  - Tabletop exercise participation at least ____ per year.

4. **Training records.** Maintain records of all training completion in ____ (e.g., HR system, LMS, compliance platform). Records must include: employee name, training module, completion date, and score (if applicable).

5. **Non-compliance tracking.** Generate a monthly report of personnel who have not completed required training. Escalate to managers after ____ days past due.

> **💡 Alternative approaches:**
> - **Phishing simulation-first approach:** Run monthly simulated phishing campaigns and use the results to drive training content. People who click get immediate remedial training. More engaging than annual slide decks but requires a phishing simulation tool (KnowBe4, Proofpoint, etc.).
> - **Micro-learning approach:** 5-minute monthly security tips (Slack bot, email newsletter) instead of a 2-hour annual marathon. Higher retention but harder to prove to auditors that full coverage was achieved.
> - **Manager-driven approach:** Department managers deliver security training to their teams using provided materials. Builds manager accountability but depends on manager engagement.
>
> **⚠️ Watch out:**
> - **Completion ≠ comprehension.** Annual training with 100% completion rate is meaningless if everyone clicked through at 4x speed. Include quiz questions that require actual understanding, and track scores over time.
> - **Contractors are often forgotten.** Your LMS might only auto-enroll employees. Contractors, interns, and vendors with system access need the same training. Have a manual enrollment process or separate contractor track.
> - **The 30-day new-hire window is short.** If onboarding is already packed, security training gets deprioritized. Build it into the HR onboarding checklist so it blocks other access (no laptop, no accounts until training is done).

---

## Procedure 2: Clean Desk and Clear Screen Enforcement

### Standard Approach

1. **Policy communication.** During onboarding and annual training, demonstrate the clean desk policy with photos of compliant and non-compliant workspaces. Abstract policy language is less effective than visual examples.

2. **Technical enforcement:**
  - Configure automatic screen lock via MDM/Group Policy: lock after ____ minutes of inactivity (recommended: 5-15 minutes).
  - Require password or biometric re-authentication to unlock.
  - For shared spaces (conference rooms, hot desks), configure shorter timeouts.

3. **Physical enforcement:**
  - Provide locking storage (cabinets, desk drawers) for confidential documents.
  - Place shredding bins in visible, convenient locations - if the bin is across the office, documents go in the regular trash.
  - For printer areas: post signage reminding staff to collect printouts immediately. Consider secure print release (badge-to-print) for printers in shared areas.

4. **Periodic checks:**
  - Conduct quarterly clean desk walkthroughs (announced or unannounced).
  - Document findings: unlocked workstations, visible confidential documents, passwords on sticky notes.
  - Trend results over time - improvement means training is working; stagnation means enforcement is lacking.

> **💡 Alternative approaches:**
> - **Self-assessment approach:** Teams self-audit using a simple checklist and report results. Less confrontational but may produce rosier results than reality.
> - **Peer auditing:** Designated "security champions" in each department conduct walkthroughs. Builds security culture but requires champion training and time commitment.
>
> **⚠️ Watch out:**
> - **Remote workers.** Clean desk policy applies to home offices if sensitive data is present. At minimum: lock your computer when stepping away, don't leave printed sensitive documents visible on video calls, secure physical documents in a locked drawer or cabinet.
> - **The sticky note problem.** Passwords on sticky notes are the #1 clean desk violation. The fix is not stricter enforcement - it's making the password manager easier to use. If people resort to sticky notes, your password manager UX is broken.
> - **Whiteboards.** Post-meeting whiteboards often contain architecture diagrams, IP addresses, and project names. Require whiteboards to be erased after meetings that discuss sensitive topics. Photograph and digitize if the content needs to be preserved.

---

## Procedure 3: Disciplinary Process for Policy Violations

### Standard Approach

The progressive discipline process escalates as follows. The organization reserves the right to combine or skip steps based on the severity and circumstances of the violation.

**Step 1 - Verbal Warning and Counseling:**
- Immediate supervisor schedules a private meeting with the employee.
- Discuss the nature of the violation, the specific policy that was violated, and expectations for corrective action.
- Document: date of conversation, topics discussed, and agreed-upon corrective actions. This documentation stays with the supervisor (not yet in HR file unless pattern emerges).
- Set a follow-up check-in within ____ days.

**Step 2 - Formal Written Warning:**
- If the behavior continues or a separate violation occurs, the supervisor and ____ (HR representative) meet with the employee.
- A formal written warning is issued, documenting: policy violated, dates of prior verbal warning, current incident details, required corrective actions, and consequences of continued non-compliance.
- Employee signs to acknowledge receipt (signature = receipt, not necessarily agreement).
- A Performance Improvement Plan (PIP) may be issued if the violation relates to ongoing performance issues.
- The written warning is placed in the employee's HR file.

**Step 3 - Suspension and Final Written Warning:**
- For serious violations, or after Step 2 has been exhausted:
 - Employee may be suspended pending investigation (paid or unpaid per applicable law and policy).
 - A final written warning is issued, stating that further violations will result in termination.
- Suspension requires approval from the supervisor's manager and HR.

**Step 4 - Recommendation for Termination:**
- The supervisor, in coordination with HR, recommends termination.
- Approval required from: ____ (manager's manager, HR Director, and/or CEO depending on level).
- Termination is executed per standard HR offboarding procedures, including immediate access revocation per the System Access Control Policy.

**Immediate Termination (Progressive Discipline Bypass):**
The following are grounds for immediate termination without progressive discipline:
- Theft, fraud, or embezzlement.
- Workplace violence or threats of violence.
- Substance abuse or intoxication at work.
- Illegal activity.
- Intentional destruction of organizational data or systems.
- Sexual harassment or assault.

> **💡 Alternative approaches:**
> - **Restorative justice model:** For lower-severity policy violations (e.g., first-offense AUP violation), use a facilitated conversation between the employee and affected parties rather than punitive measures. Builds culture but requires skilled facilitation and may not satisfy regulatory requirements for certain violation types.
> - **Zero-tolerance for specific categories:** Some orgs skip progressive discipline entirely for data breaches involving customer PII. Policy states: "Any unauthorized disclosure of customer PII results in immediate termination." Clear deterrent but removes manager discretion for edge cases.
>
> **⚠️ Watch out:**
> - **Document everything contemporaneously.** In a wrongful termination claim, the organization's best defense is contemporaneous documentation. Notes written 6 months after the fact carry no weight. Document verbal warnings the same day they occur.
> - **Consistency is legally important.** If one employee gets a verbal warning for sharing credentials and another gets terminated for the same thing, you have a discrimination claim. Apply the disciplinary process consistently or document why the circumstances differed.
> - **Security violations ≠ HR violations.** A security incident (e.g., clicking a phishing link) is usually a training issue, not a disciplinary one. Don't default to punishment for honest mistakes - it destroys the psychological safety needed for incident reporting. Reserve disciplinary action for willful or negligent violations.
> - **Legal hold on terminations.** If the employee is a witness in ongoing litigation or an internal investigation, consult legal before proceeding with termination.
