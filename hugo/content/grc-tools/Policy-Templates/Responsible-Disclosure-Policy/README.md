# Responsible Disclosure Policy Template

## What This Is

The Responsible Disclosure Policy serves two important functions: (1) it establishes a formal channel and safe harbor for external security researchers to report vulnerabilities in the organization's products and systems, and (2) it provides whistleblower protections for internal Personnel who report information security policy violations. This policy is an essential trust-building document - it signals to the security research community that the organization takes vulnerabilities seriously and will not punish good-faith research.

## What It Covers

- Legal safe harbor for good-faith security researchers
- Scope of authorized testing (what can and cannot be tested)
- Vulnerability submission process with clear timelines
- Triage and prioritization criteria
- Recognition and credit for researchers
- Out-of-scope findings
- Internal whistleblower reporting channels (anonymous option)
- Good faith reporting requirements
- Protection from retaliation with concrete examples
- Confidentiality protections for reporters
- Investigation and corrective action process

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Vulnerability disclosure program and whistleblower protection. Defines authorized testing scope, submission process, safe harbor provisions, and protection from retaliation. This is the governance document reviewed by leadership and auditors.
- **`Disclosure-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Vulnerability report triage and remediation coordination procedures, researcher communication workflows, and whistleblower investigation processes. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. No vulnerability disclosure policy at all.** Many organizations, especially smaller ones, don't have a disclosure policy until a researcher finds a vulnerability and doesn't know how to report it. The researcher may then disclose publicly or on social media, creating a crisis. Having the policy in place - even if it's simple - channels reports into a managed process.

**2. Overly broad legal language.** A disclosure policy that says "we won't sue you" but then lists so many restrictions that almost any testing is out of scope undermines the safe harbor. The policy must strike a balance between protecting the organization and enabling genuine security research. If researchers feel the safe harbor is illusory, they won't use it.

**3. Not responding to reports.** Publishing a disclosure policy with a "security@" email address and then never responding to the inbox is worse than no policy - it signals that the organization doesn't actually care. The inbox must be monitored and the promised response timelines must be met. Start with realistic timelines (e.g., 2-5 business days for acknowledgment) that you can consistently hit.

**4. Weak whistleblower protections.** Stating "we prohibit retaliation" without concrete examples of what retaliation looks like and a clear reporting path for retaliation complaints creates a hollow protection. Personnel need to know what to do if they believe they are being retaliated against, and they need to see evidence that reports are taken seriously.

**5. Confusing confidentiality with anonymity.** Whistleblower protections often promise confidentiality, but confidentiality is not anonymity. In a small organization, a report about a specific incident may be traceable to the reporter simply through context. The policy should acknowledge this limitation honestly rather than making promises of absolute anonymity that cannot be kept.

## Implementation Advice

- **Set up and test the security reporting inbox before publishing the policy.** Create security@ (or equivalent), configure spam filtering, set up forwarding to the right people, and test the pipeline end-to-end with a simulated vulnerability report. Verify the acknowledgment response time against your published SLA.
- **Define scope clearly but start narrow.** It is better to scope the policy to your primary product and expand later than to scope it to "everything" and be overwhelmed. List specific URLs, applications, and IP ranges that are in scope. Provide a clear "out of scope" section. Update the scope as the program matures.
- **Establish a cross-functional vulnerability response team.** Include engineering, security, legal, and communications. Define who does what when a critical vulnerability is reported. The 3 AM critical vulnerability report is not the time to figure out who can authorize an emergency deploy.
- **Create a security acknowledgments page.** A public page listing researchers who have responsibly disclosed vulnerabilities (with their permission) serves as recognition for researchers and a trust signal for customers and prospects. Keep it updated - an acknowledgments page last updated in 2022 is worse than no page.
- **Train managers on whistleblower protections.** The policy says retaliation is prohibited, but managers need specific training on what retaliation looks like and how to handle reports. A well-intentioned manager who reassigns a whistleblower's project "to reduce their stress during the investigation" may be engaging in retaliation without realizing it.
