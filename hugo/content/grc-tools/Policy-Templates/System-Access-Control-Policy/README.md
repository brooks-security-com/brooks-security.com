# System Access Control Policy Template

## What This Is

The System Access Control Policy governs the entire lifecycle of user access: how it is requested, approved, provisioned, reviewed, and revoked. It operationalizes the principle of least privilege and is the policy most directly responsible for preventing unauthorized access to systems and data. This policy works in close coordination with the Password Policy (authentication) and the Data Classification Policy (authorization levels).

## What It Covers

- Access principles: least privilege, need to know, separation of duties, individual accountability
- Access provisioning process (request, approval, identity verification, acknowledgment)
- Role-Based Access Control (RBAC) requirements
- Privileged access controls, including just-in-time access
- Third-party and contractor access requirements
- Quarterly access review process
- Unique user identification and shared account prohibitions
- Workstation and endpoint access controls (auto-lock, firewalls, local admin restrictions)
- Offboarding and access revocation (voluntary, involuntary, role change, inactivity)
- Customer data access controls

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Access control governance with least privilege and separation of duties principles. Defines provisioning, access reviews, privileged access, offboarding, and customer data access controls. This is the governance document reviewed by leadership and auditors.
- **`System-Access-Control-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Access provisioning workflows, RBAC design, access review execution, offboarding procedures, and third-party access management. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Access accumulation over time.** The most common access control failure is not granting access improperly - it's failing to remove it. People change roles, move departments, and accumulate permissions from every previous position. Without rigorous access reviews that actively revoke old access, the organization drifts toward a state where long-tenured employees have far more access than their current role requires.

**2. Shared admin accounts.** "The root password is in a shared document" or "everyone on the DevOps team knows the admin password" is a pervasive anti-pattern. Shared accounts destroy accountability and make access reviews impossible. Every administrative action must be attributable to an individual. If a system doesn't support this, it needs to be replaced or wrapped with an identity-aware proxy.

**3. Delayed offboarding.** The gap between an employee's last day and access revocation is the most dangerous window for insider threat and accidental exposure. The goal should be same-day revocation for voluntary departures and immediate revocation for involuntary ones. Manual processes that depend on a manager remembering to file a ticket will fail.

**4. Contractor access that outlives the contract.** Contractors and vendors often retain access long after their engagement ends because the contract expiration doesn't automatically trigger access revocation. Every third-party access grant must have a hard expiration date enforced by the identity system - not left to a manual process.

**5. Treating access reviews as a checkbox exercise.** Managers clicking "approve" on a list of 200 users without actually reviewing them is worse than no review at all - it creates a false sense of security with audit evidence that looks compliant. Reviews must be scoped so they can be done properly (small batches, clear expectations) and sampled for quality assurance.

## Implementation Advice

- **Automate access reviews in the identity provider.** Manual spreadsheet-based reviews don't scale. Use the identity governance features of your IdP to automate campaign-based reviews with clear UI that shows what access a user has and what they've actually used. Managers should be able to revoke with one click.
- **Implement just-in-time privileged access from the start.** Even a simple manual JIT process (request → approval → temporary elevation → auto-revoke) is vastly better than standing administrative access. Tools exist for every major platform (cloud IAM, PAM solutions, sudo wrappers). Start early; retrofitting is politically difficult.
- **Build the birthright role first.** Define what every employee gets by default (email, SSO, core applications) as a "birthright" role provisioned automatically from the HR system. This eliminates the most common access request tickets and ensures consistent baseline access.
- **Integrate HRIS and identity system.** When HR records a new hire, role change, or termination, the identity system should respond automatically. Manual data transfer between HR and IT is a guaranteed source of errors. If direct integration isn't possible, at minimum implement a daily reconciliation report.
- **Log and alert on customer data access.** Customer data access should be treated as a high-severity event. Every access should generate a log entry that is reviewed (manually or automatically) for anomalies. Unexplained access, access at unusual times, or access by users who haven't accessed customer data before should trigger an alert.
