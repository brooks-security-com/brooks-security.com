# Configuration Management Plan - Implementation Procedures

> **Companion to:** Configuration Management Plan (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Baseline Management
### Standard Approach
1. Identify all configuration items (CIs) that require baselines: software, hardware, documentation, network configurations, and infrastructure-as-code artifacts.
2. For each CI type, define the baseline content (what artifacts constitute the baseline) and the baseline type (functional, design, development, or product) based on the system lifecycle phase.
3. Establish baselines at each lifecycle transition point:
   a. **Functional Baseline:** After requirements are approved. Freeze the requirements document set and assign a version identifier.
   b. **Design Baseline:** After design review and approval. Freeze design specifications, interface definitions, and test criteria.
   c. **Development Baseline:** At the start of the build phase. Freeze the codebase, build configurations, and draft documentation at the initial build tag.
   d. **Product Baseline:** After successful Functional Configuration Audit (FCA) and Physical Configuration Audit (PCA). Freeze the production-ready artifacts.
4. Store each baseline in the appropriate Configuration Management library (Development, Staging/Test, or Production) with strict access controls.
5. Tag or label the baseline in the version control system with a naming convention: `baseline/<type>-<version>-<date>` (e.g., `baseline/product-v2.1-20250115`).
6. Verify baseline integrity after creation: confirm that all declared artifacts are present, all version references are correct, and the baseline can be reproduced from version-controlled sources.
7. Maintain a baseline register documenting each baseline: identifier, CI coverage, date established, approving authority, and storage location.
8. Protect baselines from unauthorized modification. Only the Configuration Manager or authorized designee may update a baseline, and only through a CCB-approved change request.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Continuous baseline for CI/CD pipelines:** In environments with continuous deployment, traditional lifecycle-phase baselines may be too slow. Instead, treat every successful production deployment as a baseline - automatically tagged in version control and recorded in the CMDB. The "product baseline" becomes the most recent successful deployment.
> - **Infrastructure-as-Code as the baseline:** For cloud-native environments, the baseline is the IaC repository at a specific commit hash. The CMDB becomes a view generated from the IaC state, not a separate manually maintained database.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Baselines that can't be reproduced.** A baseline is only valid if you can rebuild the system from the artifacts stored in it. Test this: pick a random baseline, provision a clean environment, and attempt to deploy from the baseline artifacts. If it fails, your baseline integrity is compromised.
> - **Baseline proliferation.** Creating a baseline for every minor change defeats the purpose. Baselines should represent known-good, auditable states. If you have more than one baseline per week for the same system, your baseline threshold is too low.
> - **FCA/PCA that are checklist exercises.** A Functional Configuration Audit must verify that the system as built matches the system as specified. A Physical Configuration Audit must verify that the documentation matches reality. If these audits are paper exercises without actual system inspection, they provide false assurance.

## Procedure 2: Change Control Board (CCB) Operations
### Standard Approach
1. Establish a recurring CCB meeting cadence (e.g., weekly) with a fixed day, time, and virtual/physical location. Publish the schedule for the full quarter.
2. Set a change request submission deadline (e.g., 48 hours before the meeting). Requests submitted after the deadline are deferred to the following meeting unless classified as Critical/Emergency.
3. Prepare and distribute the CCB agenda at least 24 hours before the meeting, listing all change requests for review with links to the full request details.
4. During the CCB meeting:
   a. Review each change request: CI affected, change description, impact assessment, implementation plan, test plan, and rollback plan.
   b. Each CCB member assesses the change against their domain (engineering feasibility, operational impact, security risk, business priority).
   c. Vote or reach consensus on each request. Record the disposition: Approved, Approved with Conditions, Rejected, or Deferred.
   d. For approved changes, assign an implementation window and confirm the rollback plan is documented and tested.
5. Publish CCB minutes within 1 business day: attendance, requests reviewed, dispositions, conditions, and action items.
6. For emergency changes (Critical severity, cannot wait for the next CCB meeting):
   a. The requestor contacts the CCB Chair or Security Representative directly.
   b. The Chair convenes an emergency review (email, chat, or ad-hoc call) with at least the Chair, Security Representative, and Operations Representative.
   c. If approved, the change proceeds immediately with heightened monitoring.
   d. The emergency change is retroactively reviewed at the next scheduled CCB meeting and documented in the minutes.
7. Maintain a CCB decision log: all change requests, dispositions, date of decision, conditions, and authority. Retain per the Data Retention Policy.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Delegated approval tiers:** Not every change needs full CCB review. Delegate Low and Medium changes to a subset (e.g., Engineering + Operations) with the full CCB reviewing only High and Critical changes. This prevents CCB meeting bloat.
> - **Asynchronous CCB via ticketing platform:** For organizations with distributed teams, run the CCB asynchronously in the ticketing platform. Change requests are tagged for CCB review, members comment and vote within a defined window (e.g., 48 hours), and the Chair tallies votes and publishes the decision.
### Common Pitfalls
> **⚠️ Watch out:**
> - **CCB meetings that review changes already implemented.** If changes are routinely deployed before CCB approval and the CCB is just rubber-stamping, the CCB has failed. The CCB must be in the path of change, not a post-hoc review body.
> - **CCB meetings with no quorum.** Define a minimum quorum in the Charter or CMP. If the Security Representative routinely misses CCB meetings and security-impacting changes are approved without security review, that's a governance failure auditors will flag.
> - **Emergency change process abused.** If emergency changes become routine (more than 10% of all changes), the CCB cadence or approval thresholds are wrong. Investigate why changes can't wait for standard review and fix the root cause.

## Procedure 3: Release Management
### Standard Approach
1. For each planned release:
   a. Identify the release candidate from the Staging/Test library. Confirm all changes included have CCB approval.
   b. Prepare release notes: version identifier, changes included (linked to change requests), known issues, installation/upgrade instructions, and rollback procedure.
   c. Schedule the release during the defined maintenance window. Notify affected stakeholders at least 5 business days in advance.
   d. Obtain final release approval from the CCB or designated release authority.
2. Execute the release:
   a. Follow the documented deployment procedure. All steps must be pre-scripted - no ad-hoc commands.
   b. Monitor deployment progress in real time through logging and observability dashboards.
   c. After deployment, run the defined smoke test suite to verify core functionality.
   d. If smoke tests pass, promote the release to full production traffic.
3. Post-release verification:
   a. Monitor error rates, latency, and business metrics for a defined stabilization period (e.g., 60 minutes for standard releases, 24 hours for major releases).
   b. If anomalies are detected, execute the rollback plan within the defined Recovery Time Objective (RTO).
4. Upon successful release:
   a. Tag the release in version control and update the production baseline.
   b. Move the release artifacts to the Production library.
   c. Archive the prior baseline version for the retention period specified in the CMP.
   d. Close all associated change requests in the ticketing system with the release version noted.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Canary and blue-green deployments:** Instead of a single maintenance window with cutover, use progressive delivery patterns (canary, blue-green) that allow gradual traffic shifting and instant rollback. The release management process adapts: the "maintenance window" becomes the verification period, and rollback is automated.
> - **Continuous deployment for Low-risk changes:** For Low-severity changes (documentation, cosmetic fixes), automated deployment without manual CCB gate may be appropriate if the change management policy permits it. The release process still requires post-deploy verification but skips the manual approval step.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Rollback plan that exists only in theory.** The rollback plan must be tested - ideally in a staging environment - before every major release. An untested rollback plan is not a plan; it's a hope. If you cannot roll back within the defined RTO, do not proceed with the release.
> - **Release notes that don't mention what's NOT included.** If a change request was approved but deferred from this release, the release notes should call this out. Stakeholders who expected a fix and don't see it will assume it was delivered unless explicitly told otherwise.
> - **Old baselines deleted to save space.** Archived baselines are your rollback safety net. Do not delete them before the retention period expires, even if storage is tight. The cost of storage is always less than the cost of unrecoverable production state.

## Procedure 4: Configuration Item (CI) Auditing
### Standard Approach
1. Schedule CI audits on a recurring basis:
  - **Quarterly:** Automated drift detection against defined baselines for all production systems.
  - **Annually:** Full Functional Configuration Audit (FCA) and Physical Configuration Audit (PCA) for each major system.
  - **Event-driven:** After major releases, incident recovery, or significant infrastructure changes.
2. For automated drift detection:
   a. Configure the configuration management or infrastructure monitoring tool to compare the running state of each CI against its defined baseline.
   b. Flag any deviation: open network ports, modified configuration files, unapproved software packages, changed firewall rules, altered IAM policies.
   c. For each flagged deviation, determine: (i) authorized change with missing CCB record - update the CMDB and close the gap, or (ii) unauthorized change - create an incident ticket and initiate investigation.
   d. Report drift metrics to the CCB: total CIs audited, deviations found, authorized vs. unauthorized, remediation status.
3. For annual FCA/PCA:
   a. FCA: Verify that system functionality matches the functional and design baselines. Review test results, user acceptance records, and requirements traceability.
   b. PCA: Verify that the physical system configuration (hardware, software versions, network topology) matches the documented configuration. Perform a physical inspection of CM libraries.
   c. Document findings: discrepancies, their cause, and corrective actions.
   d. Present FCA/PCA results to the CCB and System Owner for acceptance.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Continuous compliance monitoring:** Instead of periodic audits, deploy tools that continuously monitor configuration state and alert on drift in near-real-time. The "quarterly audit" becomes a review of continuous monitoring exceptions rather than a point-in-time scan.
> - **Risk-based audit frequency:** Audit critical systems (customer-facing, containing Restricted data) quarterly and non-critical systems annually. This focuses audit effort where risk is highest.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Drift that accumulates between audits.** If quarterly audits find 50+ deviations every time, your change control process is broken. Investigate why changes are happening outside the CCB process - it's usually because the CCB process is too slow or burdensome for routine operational changes.
> - **FCA/PCA findings with no corrective action.** An audit finding without a linked remediation ticket is an open risk. Every discrepancy must generate a corrective action in the POA&M or ticketing system with an owner and target date.
> - **Auditing the CMDB, not the system.** The auditor should compare the live system to the baseline, not the CMDB to the baseline. A CMDB that says "port 443 open" is irrelevant if the actual system has port 22 open. Validate against reality, not against the database that may itself be stale.
