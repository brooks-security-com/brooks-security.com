# Security Incident Response Policy Template

## What This Is

The Security Incident Response Policy is the governance document that defines how the organization detects, reports, responds to, and learns from security incidents. It establishes the Incident Response Team (IRT) structure, severity classification system, reporting timelines, and the NIST-aligned incident management lifecycle. This is the "who, what, and when" - the Incident Response Process provides the "how."

## What It Covers

- NIST Incident Response lifecycle (Preparation, Detection & Analysis, Containment/Eradication/Recovery, Post-Incident)
- Incident Response Team (IRT) roles, responsibilities, and chain of command
- Incident recognition criteria and detection mechanisms
- Incident trigger criteria and severity classification (Critical, High, Medium, Low)
- 24-hour mandatory reporting requirement
- Mobilization procedures for assembling the IRT
- Incident documentation and tracking requirements
- Containment, eradication, and recovery procedures
- Evidence preservation and chain of custody
- Post-incident activities: debriefings, lessons learned, root cause analysis
- Comprehensive Security Incident Report template (Appendix A)

## Document Structure

This folder contains two documents that work together:

- **`IR-Policy-Template.md`** - The policy itself. Defines WHAT is required: Incident response governance with IRT structure, chain of command, incident classification criteria, reporting requirements, and the NIST-aligned response lifecycle. This is the governance document reviewed by leadership and auditors.
- **`IR-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Incident detection and alerting configurations, IRT mobilization procedures, containment/eradication/recovery workflows, and post-incident lessons learned process. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. The 24-hour reporting clock starts at discovery, not confirmation.** The policy says "report within 24 hours of discovery." This means the moment anyone suspects something is wrong, the clock starts. Don't let employees wait until they're "sure" - report suspicion immediately. You can always downgrade later; you can't recover lost containment time.

**2. Chain of command on paper only.** If the IRT succession plan lists people who are never available, it's useless. Every person in the chain of command must know they're in it, must carry the contact information, and must have participated in at least one drill. Update the succession plan whenever anyone leaves or changes roles.

**3. The incident report template collects data you'll never actually have during an incident.** The Appendix A template is comprehensive - and that's the problem. During a live incident, nobody will fill out 40+ fields. Separate the "during-incident" documentation (essential facts: what, when, where, who discovered) from the "post-incident" documentation (detailed forensic details). Don't let documentation slow down response.

**4. Evidence preservation vs. containment tradeoff.** The policy says both "preserve all evidence" and "contain immediately." These conflict. Containing an incident often means pulling network cables, shutting down systems, or wiping compromised hosts - all of which destroy forensic evidence. Decide in advance: for each severity level, does containment or evidence preservation take priority? For Critical incidents involving active attackers, containment wins.

**5. "Lessons learned" that never get implemented.** Every organization holds post-mortems; few actually implement the corrective actions identified. Track lessons learned as formal action items in your ticketing system with owners and deadlines. Review open items at every Security Oversight Committee meeting until they're closed.

**6. Not defining "catastrophic" clearly.** The Critical severity rating says "potentially catastrophic." What does catastrophic mean for your organization? Define it in measurable terms: financial loss > $X, data breach affecting > N records, downtime exceeding Y hours. Without quantitative thresholds, severity classification becomes subjective guesswork during an incident.

**7. Forgetting external communication timelines.** The policy must specify timeframes for notifying customers, regulators, and the public. GDPR requires notification within 72 hours; various U.S. state laws have their own deadlines. If your policy doesn't specify these, your Communications Officer won't know what deadlines to meet during the chaos of an incident.

**8. Assuming the cyber insurance team replaces your IRT.** Cyber insurance policies often include access to an external incident response team. This team supplements, not replaces, your IRT. They need direction, context about your environment, and someone with authority to make decisions. Define the handoff and coordination model in advance.

## Implementation Advice

- **Run tabletop exercises before you need them.** At least annually, run a 2-3 hour tabletop exercise with the full IRT. Use a realistic scenario (ransomware, data breach, insider threat). The first exercise will reveal gaps in your contact lists, tools, and assumptions. Fix them before a real incident exposes them.
- **The IRT contact list must be available offline.** During a real incident, your collaboration tools may be compromised or unavailable. Maintain an offline, printed contact list with personal phone numbers for all IRT members. Update it quarterly.
- **Define "incident" vs. "event" clearly for your help desk.** Most incidents are first noticed by help desk or IT support, not the security team. Train frontline staff on what constitutes a security incident and who to call. A simple decision tree helps: "Is there evidence of unauthorized access? Data loss? Malware? If yes to any, call the Security Officer immediately."
- **Integrate alerting carefully.** The policy describes a comprehensive detection pipeline. In practice, start with high-signal alerts (Critical/High only) and tune from there. Alert fatigue from too many low-severity notifications will cause your IRT to ignore everything.
- **Pre-draft communication templates.** During an incident, you don't want to write customer notifications from scratch. Pre-draft templates for: initial notification ("we're investigating"), status update ("we've contained the issue"), and resolution ("what happened and what we're doing about it"). Legal should review these in advance.
- **Test the cyber insurance hotline.** If your policy references a cyber insurance incident response team, call their hotline once as a test. Verify the phone number works, understand what they'll ask for, and know their expected response time. Don't discover a dead number during a real incident.
- **Quarterly review is not optional.** Team members change roles, leave, or join. Contact information goes stale. Detection tools change. Every quarter, validate the IRT roster and contact information, verify alerting pipeline functionality, and update the policy based on any changes.
