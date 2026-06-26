# Change Management Policy - Implementation Procedures

> **Companion to:** Change Management Policy (Template.md)
> **Purpose:** These procedures describe how to execute the change management process for software and infrastructure. The policy defines WHAT must be done; this document describes HOW.

---

## Procedure 1: Software Development Change Process

### Standard Approach

1. **Create a change ticket** in the issue tracking system (____). Every production change - no matter how small - starts with a ticket. The ticket must include:
  - Description of the change and the problem it solves
  - Link to the design document or RFC (if applicable)
  - Systems and services affected
  - Risk classification (Standard / Normal / Major / Emergency)
  - Proposed implementation date and maintenance window
2. **Create a feature branch** from the main/production branch. Branch naming: `change/____` or `feature/____` following the team convention.
3. **Implement the change** following secure coding standards:
  - All new code must pass linting and formatting checks.
  - No secrets, credentials, or keys in source code (use secrets manager).
  - Input validation on all external inputs.
  - Output encoding to prevent XSS/injection.
4. **Commit code early and often** with descriptive commit messages referencing the ticket ID.
5. **Open a pull request (PR)** against the production branch:
  - PR description must link the change ticket.
  - PR must include a summary of changes, testing performed, and any deployment considerations.
  - Assign at least one reviewer who is NOT the author.
6. **Automated pipeline checks must pass:**
  - **Unit tests:** All unit tests in the affected modules pass.
  - **Integration tests:** Integration tests covering the changed paths pass.
  - **End-to-end tests:** Critical-path E2E tests pass.
  - **SAST (Static Analysis):** No new High or Critical security findings. Existing findings acknowledged.
  - **SCA (Dependency Scanning):** No known CVEs with CVSS ≥ 7.0 in new or updated dependencies.
  - **Secret scanning:** No secrets detected in the code or commit history.
  - **Code coverage:** Coverage does not drop below the threshold (____%).
  - Pipeline is configured to **FAIL** the build on Critical/High findings - not just warn.
7. **Peer review:**
  - Reviewer examines code for: functional correctness, security vulnerabilities, performance implications, error handling, logging adequacy, adherence to coding standards.
  - Reviewer approves or requests changes - PR cannot be merged without approval.
  - Two-reviewer requirement for Major-risk changes or changes to authentication/authorization code.
8. **Merge to production branch** only after all checks pass and approval is granted. Use squash-merge or rebase-merge per team convention to maintain clean history.
9. **Deploy to staging environment:**
  - Staging deployment is automated from the production branch.
  - Run smoke tests and acceptance tests in staging.
  - Conduct any manual exploratory testing required.
  - Security team reviews staging deployment for Major-risk changes.
10. **Schedule production deployment** during the defined maintenance window (____). Send pre-deployment communication to stakeholders.
11. **Production deployment:**
   - Deployment is executed via the CI/CD pipeline with a manual approval gate.
   - The implementer monitors dashboards, logs, and alerts during the deployment.
   - If anomalies are detected, the implementer escalates per the rollback procedure (step 12).
   - Post-deployment: execute the health-check suite (smoke tests, synthetic transactions, monitoring probes).
12. **Rollback procedure** (if needed):
   - Decision to rollback: implementer + on-call engineer, within ____ minutes of detecting the issue.
   - Execute rollback: revert to the previous known-good deployment (blue/green swap, rolling downgrade, or database rollback if applicable).
   - Confirm restoration of service: health checks pass, monitoring returns to baseline.
   - Post-rollback: create an incident ticket, conduct a blameless post-mortem.
13. **Post-deployment monitoring:**
   - Monitor system health, error rates, latency, and security alerts for ____ hours after deployment.
   - If any metric deviates from baseline, investigate immediately.
14. **Change closure:**
   - Update the change ticket with: actual deployment time, any issues encountered, test results, monitoring confirmation.
   - Close the ticket only after the post-deployment monitoring period has elapsed without issues.
   - For Major and Emergency changes: prepare a post-implementation review for the CAB.

### Alternative Approaches

> **💡 Why you might choose differently:** The full 14-step process is designed for regulated, high-assurance environments. For low-risk changes or fast-moving teams, some steps can be streamlined - but never skip code review, automated testing, or the separation of duties between author and approver.

- **Alternative A - Trunk-Based Development with Feature Flags:** Instead of long-lived feature branches, developers commit small changes directly to trunk behind feature flags. Deployment is decoupled from release - code is deployed continuously but only activated when the flag is toggled. Faster feedback, but requires discipline in flag management and cleanup.
- **Alternative B - GitFlow with Release Branches:** For products with versioned releases (not continuous delivery), use GitFlow: develop branch → release branch → hotfix branches. Each release branch goes through a formal QA and security sign-off before production. Better for packaged software; overhead is high for SaaS.
- **Alternative C - ChatOps-Driven Deployment:** Deployments are triggered and monitored entirely through chat (Slack, Teams) with bot commands. The bot executes the pipeline, posts results, and requires emoji-reaction approvals. Auditable, transparent, and visible to the whole team. Works well for DevOps-mature teams.

### Common Pitfalls

> **⚠️ Watch out:** "The tests pass in CI but fail in staging/production" is the most common deployment failure mode. It usually means your CI environment doesn't match staging. Common culprits: different dependency versions, missing environment variables, database schema drift, and "it works on my machine" configuration differences. Invest in environment parity.

> **⚠️ Watch out:** SAST tools without tuning generate hundreds of false positives. If developers are trained to "just mark it as false positive and move on," they'll do the same for real positives. Dedicate time to tune SAST rules, suppress known false positives at the rule level, and require security team review for High/Critical findings that are waived.

> **⚠️ Watch out:** "We'll write the rollback plan later" is the siren song of deployment failure. A rollback plan written during an outage at 3 AM will be worse than no plan at all - it adds false confidence. The rollback plan MUST be written, reviewed, and tested BEFORE the deployment window opens. Practice rollbacks in staging quarterly.

> **⚠️ Watch out:** Code reviews that focus only on style and formatting are security theater. Reviewers must actively look for: authentication bypass, authorization flaws, injection points, hardcoded secrets, missing error handling, and data exposure. Provide reviewers with a security checklist; don't assume they'll think of it on their own.

---

## Procedure 2: Infrastructure and Configuration Change Management

### Standard Approach

1. **All production infrastructure must be defined as code:**
  - Use Terraform, Pulumi, CDK, or CloudFormation for cloud infrastructure.
  - Use Ansible, Chef, Puppet, or Salt for server configuration.
  - Use Kubernetes manifests, Helm charts, or Kustomize for container orchestration.
  - Store all IaC/config in version control in a dedicated repository, separate from application code.
2. **Manage infrastructure code with the same discipline as application code:**
  - Branch, PR, review, and merge infrastructure changes - no direct commits to main.
  - Run `terraform plan` / `pulumi preview` / `cdk diff` in CI and attach the output to the PR.
  - Require approval from at least one Infrastructure team member who is not the author.
3. **Environment separation must be enforced in code:**
  - Each environment (dev, staging, production) must have its own state file, configuration, and credentials.
  - Staging must mirror production in: instance types/sizes, database versions, networking topology, IAM roles, security group rules.
  - Use separate cloud accounts/subscriptions for production - never share an account between staging and production.
4. **Infrastructure change workflow - Normal/Major changes:**
   a. Engineer creates a branch from main with the proposed infrastructure change.
   b. Engineer runs validation locally (`terraform validate`, `ansible --syntax-check`, linters).
   c. Engineer opens a PR; CI pipeline runs:
     - Syntax validation and linting
     - `terraform plan` against the staging environment
     - IaC security scanning (Checkov, tfsec, Terrascan, cfn-nag) - must pass with no Critical/High findings
     - Policy-as-code checks (OPA, Sentinel) - must pass
   d. Infrastructure team reviews the PR and the plan output, approves.
   e. Merge to main; CI pipeline automatically applies to staging first.
   f. Infrastructure team validates staging: resources created, services healthy, monitoring green.
   g. Security team reviews the change for network/firewall/security-group modifications.
   h. CI pipeline holds for manual approval before applying to production.
   i. Authorized infrastructure engineer approves and applies to production during maintenance window.
   j. Post-apply validation: confirm resources, test connectivity, check monitoring.
5. **Infrastructure change workflow - Emergency changes:**
   a. For critical outages, the on-call infrastructure engineer may apply changes directly to production.
   b. Changes must still be committed to IaC - manual console changes must be documented and imported/backfilled into IaC within ____ hours.
   c. Post-change review by the infrastructure team within ____ hours: was the change appropriate, is IaC now in sync, are there any security implications?
   d. Emergency change must be ratified at the next CAB meeting.
6. **Network and firewall changes - additional requirements:**
  - All changes to firewalls, security groups, NACLs, and network ACLs must be reviewed by the Security Team before production deployment.
  - Firewall rule changes must include justification (ticket reference, requester, expiration if temporary).
  - Quarterly firewall rule review: identify and remove unused or overly permissive rules.
  - Network diagrams must be updated within ____ days of topology changes.
7. **Configuration drift detection:**
  - Run a drift detection tool (e.g., `terraform plan` against production, AWS Config, Azure Policy) daily.
  - Alert on any production configuration that differs from the IaC definition.
  - Remediate drift: either update IaC to match (if the manual change was intentional and approved) or revert the production change to match IaC.
8. **Clock synchronization:**
  - All systems must sync to a single authoritative NTP source (____.pool.ntp.org, cloud provider NTP, or on-prem GPS-synced NTP appliances).
  - Configure NTP on all OS images at provisioning; verify sync in health checks.
  - Monitor NTP offset and alert if any system drifts beyond ____ ms.
  - System time changes must be logged (who, what, when, why) and require privileged access.

### Alternative Approaches

> **💡 Why you might choose differently:** Full infrastructure-as-code with CI/CD gating is the ideal, but some organizations have legacy hardware (appliances, mainframes, industrial controllers) that can't be managed as code. Document manual procedures for those systems with compensating controls (dual-approval, session recording).

- **Alternative A - GitOps Model (Pull-Based Deployment):** Instead of CI/CD pushing changes to environments, use a GitOps operator (ArgoCD, Flux) that continuously reconciles the desired state in Git with the actual state in the environment. Any manual console change is automatically reverted. Strongest drift prevention, requires Kubernetes or Kubernetes-like APIs.
- **Alternative B - Immutable Infrastructure:** Never change running infrastructure - replace it. Every change results in a new AMI/container image, and the old infrastructure is terminated. Eliminates configuration drift by design. Works well for stateless and containerized workloads; harder for databases and stateful systems.
- **Alternative C - Manual with Checklist (Legacy Systems):** For systems that cannot be managed as code, maintain a documented checklist procedure with required screenshots or command logs. Every manual change must be peer-reviewed in real-time (screen sharing or pair operations) and logged. Higher risk, but better than undocumented ad-hoc changes.

### Common Pitfalls

> **⚠️ Watch out:** "We'll fix the console change in IaC later" is the primary source of configuration drift. If you don't enforce a strict SLA (backfill within 24 hours, alert on drift, block future changes until drift is resolved), the IaC repository becomes a work of fiction.

> **⚠️ Watch out:** Staging that "mirrors production" but runs on t2.micros while production runs on r5.4xlarges isn't a mirror - it's a caricature. Performance issues, memory pressure, and scaling bugs will only surface in production. Staging should use the same instance families, database versions, and network topology, even if scaled down.

> **⚠️ Watch out:** NTP failure is a silent killer. When clocks drift, distributed systems experience split-brain scenarios, certificates appear invalid due to time skew, logs become impossible to correlate, and security incident timelines become unreliable. Monitor NTP offset as a critical infrastructure metric - if NTP is down, treat it as a P2 incident.

> **⚠️ Watch out:** Firewall rule reviews that just re-approve all existing rules miss the point. Rules accumulate over years - "allow all from office subnet" was reasonable when the office was 5 people, but now it's 500 people including contractors and visitors. Every rule must be re-justified at review time.

---

## Procedure 3: Change Advisory Board (CAB) Operations

### Standard Approach

1. **CAB membership** must include, at minimum, representatives from:
  - Engineering / Development
  - IT Operations / Infrastructure
  - Security
  - Product Management or Business Owner
  - Quality Assurance
   Document CAB membership in ____, reviewed and updated quarterly.
2. **Meeting cadence:** ____ (e.g., weekly), with emergency meetings convened as needed. Standing meetings should have a published agenda deadline (____ hours before meeting).
3. **Pre-meeting preparation:**
  - Change Owners submit Normal and Major change requests at least ____ business days before the meeting.
  - CAB chair (____) compiles the change agenda and distributes to members ____ hours before the meeting.
  - CAB members review changes independently before the meeting - come prepared with questions, not reading RFCs for the first time.
4. **Meeting agenda:**
   a. Review of emergency changes since last meeting - ratification.
   b. Review of post-implementation reports from Major changes - any lessons learned?
   c. Review of new Normal change requests - discussion and approval/rejection.
   d. Review of new Major change requests - deeper discussion, risk assessment, approval/rejection with conditions.
   e. Review of upcoming change calendar - conflict resolution, resource contention.
   f. Forward-looking: any major initiatives, maintenance windows, or policy changes on the horizon?
5. **Decision criteria:**
  - Risk assessment (impact × likelihood)
  - Rollback feasibility
  - Resource availability (are the right people on call?)
  - Competing changes (is another change touching the same systems in the same window?)
  - Business impact (does this align with current business priorities?)
  - Security implications
6. **Decision outcomes:**
  - **Approved:** Change proceeds to implementation as scheduled.
  - **Approved with conditions:** Change proceeds only if specified conditions are met (additional testing, security review, specific approver, modified window).
  - **Deferred:** Change is not rejected but needs more information or should wait for a less risky window.
  - **Rejected:** Change is denied; rationale documented.
7. **Post-meeting:**
  - CAB chair publishes meeting minutes within ____ hours: decisions, conditions, action items.
  - Change Owners update change tickets with CAB decision and any conditions.
  - Action items tracked to completion.

### Alternative Approaches

> **💡 Why you might choose differently:** Traditional CAB meetings with weekly standing sessions slow down delivery. High-performing DevOps organizations replace the CAB with automated change approvals for Standard changes and lightweight async review for Normal changes.

- **Alternative A - Async CAB (No Meeting):** Normal changes are reviewed asynchronously via a change management tool or chat channel. CAB members have ____ hours to review and vote (approve/reject/needs discussion). If no objections within the window, the change is auto-approved. Only Major changes and contested changes go to a synchronous meeting. Reduces meeting overhead significantly.
- **Alternative B - Automated Change Approval:** Standard changes (pre-approved, low-risk, documented procedure) are auto-approved by the pipeline. The CAB only reviews Normal and Major changes. This is the target state for mature DevOps organizations.
- **Alternative C - Change-Specific Review Board:** Instead of a standing CAB, form a review board specific to each Major change, composed of stakeholders from the affected systems. More targeted, but requires more coordination to assemble.

### Common Pitfalls

> **⚠️ Watch out:** CAB meetings that become "change theater" - where every change is approved without meaningful discussion - waste everyone's time. If the CAB hasn't rejected or conditioned a change in the last quarter, either your risk threshold is too low or the CAB isn't doing its job.

> **⚠️ Watch out:** CAB membership that's only engineering and IT misses the business perspective. A change that's technically sound but disrupts month-end financial close is a bad change. Product/business representation in the CAB ensures technical changes align with business priorities.

> **⚠️ Watch out:** Emergency change "ratification" that rubber-stamps the change after the fact incentivizes declaring everything an emergency. Track the ratio of emergency to planned changes - if emergency changes exceed ____% of total changes, your change process is broken or your change classification is being gamed.

---

## Procedure Quick Reference

| Procedure | Owner | Cadence | Key Artifact |
|-----------|-------|---------|-------------|
| Software Change Process | ____ / Engineering | Per change | Change ticket, PR, pipeline results |
| Infrastructure Change Mgmt | ____ / Infrastructure | Per change + daily drift check | IaC repo PR, drift report |
| CAB Operations | ____ / CAB Chair | Weekly (or defined cadence) | CAB minutes, change decisions |
