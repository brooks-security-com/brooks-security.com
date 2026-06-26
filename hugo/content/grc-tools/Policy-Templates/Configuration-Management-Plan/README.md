# Configuration Management Plan Template

## What This Is

The Configuration Management Plan (CMP) is a detailed operational document that defines how an organization identifies, controls, tracks, and audits configuration items (CIs) across the system development lifecycle. It establishes the Change Control Board (CCB), baselines at each lifecycle phase (functional, design, development, product), and the processes for change classification, impact analysis, and release management.

## What It Covers

- Configuration item identification and categorization
- Baseline management at each lifecycle phase (functional, design, development, product)
- Change Control Board (CCB) composition, authority, and operating procedures
- Change classification by severity (Critical, High, Medium, Low)
- Change control forms and workflow (needs statement, change request, impact analysis, authorization)
- Configuration Status Accounting (CSA) and audit trail requirements
- CM library structure (development, staging, production)
- Release management process
- CM metrics and measurement

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Gotchas People Get Wrong

**1. Confusing CM with change management.** Configuration Management is about knowing what you have and controlling its state. Change Management is about controlling how it changes. They overlap heavily, but CM defines the baselines and CIs that change management operates on. If you only have a change management policy without a CM plan, you don't know what you're changing.

**2. Baselines that exist only on paper.** A baseline isn't a document - it's a known, tested, approved state of the system that can be reproduced. If you can't rebuild the system from the items in your production library, you don't have a baseline. Every baseline must be reproducible from version-controlled artifacts.

**3. CMDB rot.** Configuration management databases go stale fast if they're manually maintained. Within six months, the CMDB and reality diverge. Use discovery tools, infrastructure-as-code, and automated inventory to keep CM data current. Manual updates don't scale.

**4. Release management without rollback.** If your release process doesn't include a tested rollback procedure, you're not doing release management - you're gambling. Every release must have a documented, tested rollback plan that can return the system to the prior baseline within the defined RTO.

**5. Skipping the Functional Configuration Audit (FCA) and Physical Configuration Audit (PCA).** These audits verify that the system as built matches the system as specified and that the documentation matches reality. Skipping them means accepting configuration drift as normal. For high-assurance systems, FCAs and PCAs are mandatory.

## Implementation Advice

- **Make your CMDB a byproduct, not a project.** If maintaining the CMDB is a separate manual activity, it will fail. Use infrastructure-as-code, cloud resource tagging, and automated discovery to generate CM data as a byproduct of normal operations. The CMDB should be a view, not a database people fill out.
- **Version everything.** Source code is obvious, but also version: database migration scripts, infrastructure-as-code, CI/CD pipeline definitions, monitoring configurations, documentation. If it's not versioned, it's not under configuration control.
- **Define baselines at meaningful points.** Don't baseline just because the process says so. Baseline before major changes, after successful releases, and at the completion of each lifecycle phase. A baseline is a known-good checkpoint you can return to.
- **Automate baseline comparisons.** Use tools that can compare the current running state of a system to its defined baseline and flag drift. Open security group ports, modified configuration files, and unapproved software packages are all drift that automated tools can detect.
- **Link CM to incident management.** When an incident occurs, one of the first questions should be: what changed? If your CM process captures all changes with timestamps, you can answer this in seconds instead of spending hours hunting through logs.
