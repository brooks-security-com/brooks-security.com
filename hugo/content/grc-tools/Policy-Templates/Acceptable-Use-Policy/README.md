# Acceptable Use Policy Template

## What This Is

The Acceptable Use Policy (AUP) defines what employees can and cannot do with company equipment, networks, and data. It's the "rules of the road" document that every employee should read on day one.

## What It Covers

- Employee onboarding and offboarding security requirements
- Acceptable use of computing devices
- Remote work and public-space device security
- Device encryption requirements
- Data handling in emails and public forums
- Software installation restrictions
- Malware protection requirements
- Malware detection and scanning procedures

## Document Structure

This folder contains two documents that work together:

- **`AUP-Template.md`** - The policy itself. Defines WHAT is required: Acceptable use of organizational computing devices, networks, and data. Defines onboarding/offboarding requirements, device security, malware protection, and prohibited activities. This is the governance document reviewed by leadership and auditors.
- **`AUP-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Malware protection program implementation, endpoint security deployment, software installation controls, and security monitoring configuration. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. BYOD is a trap if not explicit.** If you allow personal devices, you need to define exactly what controls apply (MDM enrollment, encryption, remote wipe capability). Vague BYOD language is worse than no BYOD policy - it creates a grey area that auditors and incident responders both hate.

**2. "Reasonable measures" is not measurable.** If your AUP says "employees will take reasonable measures to protect data," replace it with specific, testable requirements. "Reasonable" gets you a finding in an audit.

**3. The malware section is often copy-pasted and forgotten.** Malware protection has changed dramatically. If your AUP talks about scanning "CDs and floppy disks" but doesn't mention browser-based threats or supply chain attacks, it's outdated. Keep this section modern.

**4. Monitoring language needs legal review.** If you say you "may monitor all activity" without specifying scope, you could run afoul of privacy laws in jurisdictions with strong employee privacy protections. Have legal review the monitoring language.

**5. Enforcement asymmetry.** If your AUP says "no personal use of company equipment" but everyone uses their work laptop for personal email, you're enforcing selectively. Audit findings come from selective enforcement.

## Implementation Advice

- **Pair this with the Employee Access and Confidentiality Agreement.** The AUP says what's allowed; the agreement makes it legally binding. Both should be signed at onboarding.
- **Don't over-restrict.** If you ban all personal use, people will ignore it. Be realistic about what you can enforce.
- **The malware section dates quickly.** Review it at least annually and update as your endpoint protection strategy evolves.
- **This is the policy people actually read.** Most employees never look at the ISP, but they'll read the AUP because it directly affects their daily work. Make it clear and actionable.
- **Screen lock timeout.** Add a specific screen lock timeout (e.g., 15 minutes of inactivity). "Workstations must be locked when unattended" without a timeout is unenforceable.
