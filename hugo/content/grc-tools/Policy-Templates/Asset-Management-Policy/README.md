# Asset Management Policy Template

## What This Is

The Asset Management Policy defines how the organization tracks, manages, hardens, and disposes of its physical and virtual assets throughout their lifecycle. If you don't know what you have, you can't protect it - this policy is the foundation for every other security control.

## What It Covers

- Physical asset inventory requirements
- Digital/virtual asset inventory requirements
- Asset retirement and data migration
- System hardening standards (CIS benchmarks, patching)
- Infrastructure configuration and maintenance
- Endpoint security
- Physical media transfer
- Return of assets upon termination
- Media disposal and sanitization

## Document Structure

This folder contains two documents that work together:

- **`AMP-Template.md`** - The policy itself. Defines WHAT is required: Asset lifecycle management from acquisition to disposal. Defines inventory standards, system hardening requirements, media handling, and asset retirement procedures. This is the governance document reviewed by leadership and auditors.
- **`Asset-Management-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: System hardening steps, patching cadences, endpoint security configuration, physical media transfer, media disposal/sanitization, and return of assets workflows. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Asset inventory is always incomplete.** Everyone starts with good intentions, but within six months the inventory is stale. This is the #1 finding in SOC 2 audits. Automate or die - manual inventory maintenance doesn't scale past 20 employees.

**2. "Significant" is a weasel word.** If your policy says "all significant assets must be tracked," you need to define what "significant" means. Cost threshold? Data sensitivity? Regulatory impact? Without a definition, your team will exclude things they shouldn't.

**3. Cloud assets multiply like rabbits.** If you're on AWS/Azure/GCP, your digital asset inventory can change hundreds of times per day. Traditional annual inventory reconciliation doesn't work. You need continuous discovery.

**4. Sanitization standards matter.** "Securely wiped" means different things to different people. Reference a specific standard: NIST SP 800-88 for media sanitization, or at minimum specify "single-pass overwrite" vs "degaussing" vs "physical destruction" per classification level.

**5. Return of assets is the hardest enforcement point.** Ex-employees disappear with laptops, phones, and access tokens. If your offboarding process doesn't include asset tracking with HR, you'll lose equipment. Make HR responsible for the physical return, not IT.

## Implementation Advice

- **Pick an asset management tool that does discovery, not just tracking.** A spreadsheet is not an asset management system. Use a tool that can discover cloud assets, scan networks, and integrate with your MDM.
- **Tag everything.** Cloud providers let you tag resources. Use consistent tagging for owner, project, environment, and classification. Untagged resources should trigger alerts.
- **The system hardening section is your patch management SLO.** When you say "patches installed based on criticality," define what that means. Example: Critical patches within 7 days, High within 30 days, etc. Link to your vulnerability management SLAs.
- **Media disposal is an evidence problem.** If you can't prove you wiped a drive, assume the auditor won't believe you. Use tools that generate certificates of destruction/sanitization.
- **Endpoint security is not just anti-malware anymore.** Modern endpoint security includes EDR/XDR, application allowlisting, and DLP. Your policy should reflect your actual tooling, not generic "anti-malware" language.
