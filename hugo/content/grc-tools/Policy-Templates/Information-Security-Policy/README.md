# Information Security Policy Template

## What This Is

The Information Security Policy (ISP-001) is the foundational policy document for any organization's Information Security Program. It establishes the high-level framework, objectives, and governance structure that all other security policies operate under. Think of it as the constitution - all other policies derive their authority from this one.

## What It Covers

- Scope of the information security program
- Information security objectives (CIA triad: Confidentiality, Integrity, Availability)
- Roles and responsibilities for security governance
- Training requirements
- Clean desk and clear screen policies
- Acceptable internet and intranet use
- Remote work security
- Mobile device and storage device security
- Intellectual property protection
- Security requirements analysis for projects
- Employment terms and conditions related to security
- Disciplinary processes for policy violations
- Policy review and exception handling

## Document Structure

This folder contains two documents:

- **`ISP-Template.md`** - The policy itself. Defines WHAT is required: scope, objectives, roles, and high-level requirements for training, clean desk, access, remote work, and disciplinary process. This is the document employees acknowledge and auditors review.
- **`ISP-Procedures.md`** - Companion implementation procedures for the three most operationally intensive areas: (1) Security Awareness Training Program, (2) Clean Desk and Clear Screen Enforcement, and (3) Disciplinary Process for Policy Violations. Each procedure includes standard approaches, alternative methods, and common pitfalls.

Separating policy from procedures keeps the ISP concise (readable by all employees) while giving HR, IT, and security teams the detailed how-to guidance they need to implement it.

## Gotchas People Get Wrong

**1. Writing it too long and too specific.** This is the overarching policy. It should set direction and principles - save the nitty-gritty controls for the subordinate policies. If your ISP is 50 pages, you're doing it wrong. Aim for ~10 pages.

**2. Naming the wrong policy owner.** The CISO or equivalent must own this. Don't put the IT Director or CTO here - they own implementation, not governance. This matters in an audit.

**3. Forgetting to list subordinate policies.** The "Background" section that lists all child policies is more important than it looks. Auditors use this as a checklist to ensure you have a complete program. Keep it current.

**4. Clean desk policy enforcement.** This is the most commonly violated section of any ISP. People leave laptops unlocked, papers on desks, passwords on sticky notes. If you have it in your policy, you need to actually enforce it or auditors will flag it.

**5. Progressive discipline without teeth.** The disciplinary process section needs to be credible. If you write "immediate termination for X" but never actually do it, it undermines the entire policy.

## Implementation Advice

- **Start here first.** Build this policy before the subordinate policies. It defines the structure everything else hangs on.
- **Keep the subordinate list realistic.** Only list policies you actually plan to write. A policy that exists on paper but not in practice is worse than no policy at all.
- **Train on this annually.** The ISP makes a great annual security awareness training module. It covers scope, expectations, and consequences all in one document.
- **Review cycle matters.** Annual review is the minimum expected by SOC 2 and ISO 27001. Actually do it - don't just change the date. Document what changed and why.
- **Make the policy accessible.** Store it somewhere every employee can find it without asking. If they have to hunt for it, auditors will notice.
