# Security Incident Response Process Template

## What This Is

The Security Incident Response Process is the operational playbook that team members follow during a live security incident. Unlike the Incident Response Policy (which defines governance, roles, and requirements), this Process provides the step-by-step workflow: what to do, in what order, with what tools. This is the document pulled up at 2 AM when an alert fires.

## What It Covers

- TL;DR immediate action checklist for anyone discovering an incident
- Six-phase NIST-aligned incident response workflow: Detection → Verification → Identification → Containment → Eradication → Recovery
- Detailed detection mechanisms (centralized monitoring, cloud threat detection, CSPM, manual evaluation)
- Reporting procedures and trigger criteria for all personnel
- Severity assessment matrix with response timelines
- Containment strategies (short-term and long-term)
- Eradication and recovery procedures
- Communication protocols (internal, customer, regulatory, public)
- Root Cause Analysis methodology (Five Whys, Fishbone)
- Lessons learned and post-incident reporting
- Disaster Recovery escalation criteria
- Evidence collection and chain of custody requirements

## Document Structure

This folder contains two files:

- **`IR-Process-Template.md`** - The process document. Describes HOW to operationalize the related policy.
- **`README.md`** - This overview.

When updating the governing policy, ensure implementation changes flow into this process document.

## Gotchas People Get Wrong

**1. Writing the process for when everything is working.** During a real incident, your messaging platform might be down, your ticketing system might be compromised, and your monitoring tools might be the attack vector. The process must include offline fallbacks: phone numbers, printed contact lists, alternative communication channels. If the process assumes Slack/SMS/email will be available, it fails at the worst possible moment.

**2. "Immediately" without defining the escalation window.** The process says "notify immediately" and "assemble within 1 hour." But how long do you wait for a response before escalating to the next person in the chain of command? Define explicit timeouts: "If no response from the IRT Lead within 15 minutes, contact the Security Officer. If no response within 30 minutes, contact the CTO." Without timeouts, the chain of command is theoretical.

**3. Severity classification during a crisis is unreliable.** Under stress, people tend to over-classify severity (everything feels Critical). Provide concrete, yes/no threshold questions: "Is customer data confirmed exposed? Is the production environment down? Is an active attacker currently in the system?" If the answer is no to all three, it's probably not Critical.

**4. The RCA becomes a blame exercise.** Root Cause Analysis should identify systemic failures, not individual mistakes. If your RCA culture says "Bob clicked a phishing link," you'll never fix the problem (lack of email filtering, missing security awareness training, no MFA). "Five Whys" should end at a process or control gap, not a person.

**5. Customer notification delays that violate regulations.** GDPR requires notification within 72 hours of awareness. If your process says "the Communications Officer drafts a notification, Legal reviews it, and it goes out within 5 days," you're non-compliant. Map your notification timelines to specific regulatory requirements and pre-draft templates for common incident types.

**6. The Appendix links go to dead URLs.** The template includes placeholders for form links and repository URLs. These are often left as placeholders when the policy is adopted. Verify every link works, and set a quarterly reminder to check them. A broken incident report form during an actual incident is a serious audit finding.

**7. Evidence retention without storage planning.** The process says "retain evidence for 3 years," but forensic images can be hundreds of gigabytes per incident. Where is this evidence stored? Who pays for the storage? Is it encrypted and access-controlled? Define the evidence storage solution before you need it.

## Implementation Advice

- **Print this process.** Keep a printed copy in the Security Officer's desk and in the datacenter/server room. If systems are down, you can't access the digital copy. Include the IRT contact list with personal phone numbers.
- **Create a "break glass" runbook supplement.** This process is comprehensive - too comprehensive to read cover-to-cover during an incident. Create a one-page "Incident Response Quick Card" with just the essential steps: Who to call, first 5 actions, severity decision tree, and a checklist. The full process is the reference; the quick card is what you actually use.
- **Pre-create tickets for common incident types.** Have ticket templates pre-configured for: ransomware, data breach, DDoS, unauthorized access, and lost/stolen device. During an incident, the responder creates a ticket from template, not from scratch.
- **Define handoff points to external teams explicitly.** If you engage a cyber insurance IR team or a DFIR firm, what exactly do they take over? Investigation? Containment? Communication? Define the scope of authority and coordination model beforehand so there's no confusion during the incident.
- **Run a "communications-only" drill.** Tabletop exercises usually focus on technical response. Run a separate drill focused purely on communications: draft a customer notification, a regulatory filing, and a press statement, all within the 72-hour GDPR window. This is where organizations consistently fail - not because they can't contain the incident, but because they can't communicate about it competently.
- **Document the "who has authority to spend money" question.** During a Critical incident, you may need to engage an expensive DFIR firm, purchase emergency hardware, or authorize overtime. Who can approve unbudgeted spending up to what amount? Define this in advance. An incident that gets worse because someone was waiting for purchase approval is a preventable failure.
- **Review and update within 30 days of every real incident.** Every real incident reveals gaps in your process. Schedule a process review within 30 days of incident closure (not just a lessons learned meeting, but an actual update to this document). The process should improve with every incident.
