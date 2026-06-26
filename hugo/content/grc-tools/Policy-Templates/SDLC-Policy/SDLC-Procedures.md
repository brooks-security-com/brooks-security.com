# SDLC Policy - Implementation Procedures

> **Companion to:** SDLC Policy (SDLC-Template.md)
> **Purpose:** These procedures describe how to execute the security activities required at each SDLC phase. The policy defines WHAT must be done; this document describes HOW.

---

## Procedure 1: Requirements Phase - Security Integration

### Standard Approach

This procedure covers Phase 1 (Determine System Need) and Phase 2 (Define System Requirements).

1. **Initial security impact assessment (Phase 1):**
  - The Product Manager or System Owner completes a Security Impact Assessment questionnaire in ____ (GRC tool / form).
  - Questions cover: Will the system process PII? Financial data? Health data? Credentials? Will it be internet-facing? Will it integrate with third-party services? What is the expected user base?
  - Based on answers, the assessment auto-generates:
    - Data classification level (per Data Classification Policy)
    - Applicable regulatory frameworks (GDPR, HIPAA, PCI DSS, SOC 2, etc.)
    - Required security review level (Standard, Enhanced, Comprehensive)
2. **Security requirements in business case (Phase 1):**
  - Document high-level security and privacy requirements in the project charter/business case.
  - Identify any external dependencies (third-party APIs, open-source libraries, cloud services) and their security posture.
  - Flag any supply-chain risks: does a dependency process sensitive data, have a history of breaches, or operate in a jurisdiction with conflicting legal requirements?
3. **Formal risk assessment (Phase 2):**
  - Conduct a structured risk assessment using the organizational methodology (per Risk Assessment Policy).
  - Identify threats, vulnerabilities, likelihood, impact, and proposed controls.
  - Document residual risk after controls - if residual risk exceeds the organizational risk appetite, the project must be re-scoped or additional controls required.
4. **Detailed security requirements specification (Phase 2):**
  - For each of the following domains, define specific, testable security requirements:
    - **Authentication:** MFA required? SSO integration? Session timeout? Password policy alignment?
    - **Authorization:** Role hierarchy? Attribute-based access? Tenant isolation?
    - **Data Protection:** Encryption at rest (algorithm, key management)? Encryption in transit (TLS version, mutual TLS)? Data masking/tokenization?
    - **Audit Logging:** What events must be logged? Log format? Retention period? SIEM integration?
    - **Input/Output:** Input validation rules? Output encoding? File upload restrictions?
    - **Session Management:** Session fixation prevention? Secure cookie flags? Token rotation?
    - **Error Handling:** Generic user-facing errors? Server-side detailed logging?
    - **API Security:** Authentication method? Rate limiting? Request validation? API gateway routing?
  - Document these in the system requirements specification (SRS) or equivalent artifact.
5. **Privacy review (Phase 2):**
  - If the system processes personal data, the Privacy Officer / DPO reviews the requirements.
  - Conduct a Data Protection Impact Assessment (DPIA) if required by GDPR or organizational policy.
  - Document lawful basis for processing, data minimization measures, and data subject rights handling.
6. **Security requirements sign-off:**
  - Security Officer reviews and approves the security requirements.
  - Any requirements that cannot be met must be documented as exceptions with compensating controls and risk acceptance.

### Alternative Approaches

> **💡 Why you might choose differently:** The depth of upfront security analysis depends on the project risk level. A minor internal tool with no sensitive data doesn't need the same rigor as a customer-facing payment system.

- **Alternative A - Lightweight Security Questionnaire:** For low-risk projects, replace the full risk assessment with a 10-question lightweight questionnaire. If any question triggers a "yes" for sensitive data/regulatory scope, escalate to full assessment. Faster for low-risk projects, but requires clear escalation criteria.
- **Alternative B - Security Requirements Catalog:** Maintain a pre-approved library of security requirements ("user stories") by system type (web app, mobile app, API, data pipeline). Teams select from the catalog rather than writing requirements from scratch. Faster and more consistent, but the catalog must be maintained.
- **Alternative C - Security Champion Model:** Embed a security-trained developer (Security Champion) in each product team. The champion conducts the initial assessment and writes requirements, with Security team review for high-risk systems. Scales security across many teams.

### Common Pitfalls

> **⚠️ Watch out:** Security requirements that are vague ("the system must be secure") are untestable and unenforceable. Every requirement must be specific and verifiable: "The system must enforce MFA for all administrative functions using TOTP or FIDO2" is testable. "Must be secure" is not.

> **⚠️ Watch out:** Identifying regulatory requirements late (Phase 4 or 5) is catastrophically expensive. GDPR requires data minimization by design - you can't bolt it on after the database schema is built. Regulatory analysis must happen in Phase 1/2, before a single line of code is written.

> **⚠️ Watch out:** "We'll handle security in the next sprint" is how security debt accumulates. If security requirements aren't in the definition of done for every sprint, they'll be perpetually deprioritized in favor of features. Secure the MVP, not just the final release.

---

## Procedure 2: Design Phase - Threat Modeling and Secure Architecture

### Standard Approach

This procedure covers Phase 3 (Design System Components).

1. **Create architectural diagrams:**
  - Data flow diagrams (DFDs) showing all data flows between components, external systems, and users.
  - Clearly mark trust boundaries - any point where data crosses from a higher-trust to lower-trust zone (or vice versa).
  - Include authentication points, encryption points, and logging points.
2. **Conduct threat modeling:**
  - Use STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) - or PASTA, attack trees, or organizational standard.
  - For each element in the DFD, identify threats in each STRIDE category.
  - Document each threat: description, affected component, attack vector, likelihood, impact, proposed mitigation.
  - Use a threat modeling tool (Microsoft Threat Modeling Tool, OWASP Threat Dragon, IriusRisk) or a structured spreadsheet.
3. **Architecture risk analysis:**
  - Review the proposed architecture against the organizational security architecture standards.
  - Identify architectural anti-patterns: single points of failure, hardcoded trust, missing segmentation, cascading authentication.
  - Rate architectural risks and propose design changes or compensating controls.
4. **Apply secure design principles - verify each one:**
  - **Defense in Depth:** What happens if the WAF fails? If the API gateway is bypassed? If the database auth is compromised? Document the layered controls.
  - **Least Privilege:** Does any component have more access than it needs? Can the web server read all database tables even though it only needs 3?
  - **Secure by Default:** If an admin forgets to configure a setting, does the system default to secure or to permissive? Document all defaults.
  - **Fail Secure:** If a security control fails (e.g., auth service is down), does the system deny access or grant it?
  - **Economy of Mechanism:** Can the design be simplified? Complexity is the enemy of security - every feature is a potential vulnerability.
  - **Complete Mediation:** Is every access to every object checked for authorization? Even cached objects? Even batch processes?
  - **Open Design:** Would the system still be secure if an attacker had the full source code and architecture diagrams? (If not, you're relying on security through obscurity.)
  - **Separation of Duties:** Can a single person deploy malicious code to production without detection? If yes, add a gate.
  - **Psychological Acceptability:** Will users work around security controls because they're too burdensome? (If MFA requires 5 steps, users will find a way to disable it.)
5. **Design security controls into the architecture:**
  - **Authentication & Authorization:** Specify auth protocol (OAuth 2.0/OIDC, SAML), token format, authorization model (RBAC, ABAC, ReBAC), session management.
  - **Encryption Architecture:** What is encrypted? Where do keys live? How are keys rotated? How are certificates managed and renewed?
  - **Network Segmentation:** Which components talk to which? What ports/protocols? What network policies or security groups enforce this?
  - **Logging & Monitoring Architecture:** What events are logged? Where do logs go? How are they parsed, stored, alerted on?
6. **Review data flows for sensitivity at trust boundaries:**
  - At each trust boundary, verify: is data encrypted? Is authentication required? Is authorization checked? Is the connection authenticated (mTLS)?
  - Document any data that crosses boundaries in plaintext or with insufficient protection - these are findings that must be remediated.
7. **Design review sign-off:**
  - Security team reviews the threat model, architecture, and security controls.
  - Any unresolved architectural risks must be documented and accepted by the System Owner.
  - Sign-off stored in ____ (document repository / GRC tool) as evidence.

### Alternative Approaches

> **💡 Why you might choose differently:** Full STRIDE threat modeling for every microservice in a 200-service architecture is impractical. Risk-tier your threat modeling effort: comprehensive for high-risk systems, lightweight for low-risk, and automated where possible.

- **Alternative A - Lightweight Threat Modeling (Security Cards / Elevation of Privilege Card Game):** For low-to-medium risk systems, use card-game-based threat modeling where the team collaboratively identifies threats. Faster, more engaging, less formal. Document threats in a simple spreadsheet rather than a full tool.
- **Alternative B - Automated Threat Modeling:** Use tools that generate initial threat models from IaC or architecture diagrams (e.g., drawing tool plugins that auto-identify threats at trust boundaries). The team then reviews and augments the automated output. Faster initial pass, but requires human judgment for context-specific threats.
- **Alternative C - Security Architecture Review Board:** Instead of per-project threat modeling, maintain a standing architecture review board that reviews all designs against a standard set of architectural patterns and anti-patterns. Faster for standard designs, requires maintaining the pattern library.

### Common Pitfalls

> **⚠️ Watch out:** Threat models that are created, reviewed once, and never updated are worse than no threat model - they create false confidence. The threat model must be a living document, updated when the architecture changes, when new features are added, or when new threats emerge. Schedule quarterly threat model reviews for actively developed systems.

> **⚠️ Watch out:** Designing for defense in depth without testing each layer independently is security theater. If you have a WAF, API gateway auth, and application auth, but the application trusts the API gateway's authentication header without validating it, you have one layer, not three. Test each layer as if the others don't exist.

> **⚠️ Watch out:** "We'll use [cloud provider]'s managed service, so security is handled" is a misunderstanding of the shared responsibility model. The provider secures the infrastructure; you secure your configuration, access controls, data, and application logic. A misconfigured S3 bucket is your responsibility, not AWS's.

---

## Procedure 3: Build Phase - Secure Coding Implementation

### Standard Approach

This procedure covers Phase 4 (Build System Components).

1. **Developer security training:**
  - All developers complete annual secure coding training covering:
    - OWASP Top 10 (current version) - with language-specific examples
    - Common vulnerability patterns: injection, XSS, CSRF, SSRF, path traversal, insecure deserialization, IDOR
    - Secure use of cryptography (don't invent your own, use vetted libraries, manage keys properly)
    - Secrets management (never in code, never in config, never in logs)
  - Developers working on internet-facing applications receive additional training on:
    - OWASP API Security Top 10
    - Authentication and session management pitfalls
    - Rate limiting, brute force protection, and credential stuffing defenses
  - Training must be completed BEFORE a developer writes or supports production code.
  - Track training completion in ____ (LMS / spreadsheet) - non-completion is a gate for production access.
2. **Set up the CI/CD pipeline with security gates:**
  - Integrate the following tools into the pipeline (fail the build on Critical/High findings):
    - **SAST:** ____ (e.g., SonarQube, Semgrep, Checkmarx, Fortify, CodeQL)
    - **SCA:** ____ (e.g., Snyk, Dependabot, OWASP Dependency-Check, Black Duck)
    - **Secret Scanning:** ____ (e.g., GitGuardian, truffleHog, GitHub secret scanning)
    - **Container Scanning:** ____ (e.g., Trivy, Anchore, Snyk Container, Aqua)
    - **IaC Scanning:** ____ (e.g., Checkov, tfsec, Terrascan, cfn-nag)
  - Configure each tool: scan on every PR, fail on Critical/High, warn on Medium, document findings in the PR.
  - Establish an exception process: High/Critical findings that cannot be fixed must have a documented waiver with compensating controls, approved by the Security Officer, with an expiration date.
3. **Secrets management:**
  - Identify all secrets needed by the application: database credentials, API keys, encryption keys, signing keys, OAuth client secrets, TLS private keys.
  - Store all secrets in a dedicated secrets manager (____: HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager).
  - Application retrieves secrets at runtime - never at build time, never baked into images.
  - Configure credential scanning in CI to block any commit containing patterns that match common secret formats (AWS keys, private keys, JWT secrets, connection strings with passwords).
  - Rotate secrets on a schedule (____ days) and on suspected compromise.
4. **Code review for security:**
  - All code changes must be reviewed by at least one person other than the author.
  - Reviewer must use a security-focused review checklist:
    - [ ] Is any user input used without validation?
    - [ ] Are there any SQL queries built with string concatenation?
    - [ ] Are there any hardcoded credentials, keys, or secrets?
    - [ ] Does error handling expose sensitive information?
    - [ ] Are authorization checks performed on every protected endpoint?
    - [ ] Is sensitive data being logged?
    - [ ] Are file uploads restricted by type, size, and scanned for malware?
    - [ ] Are external API calls validated (no SSRF)?
    - [ ] Are cryptographic functions using approved algorithms and key lengths?
  - Overrides of security checks, approvals bypasses, and changes to sensitive transactions must be reviewed by a second person and documented.
5. **Environment separation:**
  - Maintain physically or logically separate environments: Development, Testing/QA, Staging, Production.
  - Developers must NOT have direct access to production environments. All production changes go through the CI/CD pipeline with approval gates.
  - Development and testing must never occur in production. (Exception: canary testing and production-synthetic monitoring are allowed with explicit approval.)
  - Non-production environments must NEVER contain production data unless formally approved, tokenized/anonymized, and subject to the same access controls as production.
6. **Dependency management:**
  - Maintain a software bill of materials (SBOM) for each application, listing all direct and transitive dependencies with versions.
  - Subscribe to vulnerability notifications for all dependencies (GitHub Advisory Database, NVD, vendor-specific feeds).
  - SLAs for dependency vulnerability remediation:
    - Critical (CVSS ≥ 9.0): ____ hours
    - High (CVSS 7.0–8.9): ____ days
    - Medium (CVSS 4.0–6.9): ____ days (next sprint)
  - Regularly remove unused dependencies - they're unmonitored attack surface.

### Alternative Approaches

> **💡 Why you might choose differently:** Security tooling choice should match your tech stack, team size, and budget. Start with free/open-source tools that provide 80% of the value, then invest in commercial tools for the remaining 20% (false positive reduction, compliance reporting, developer experience).

- **Alternative A - Security-as-Code (Policy-as-Code):** Instead of configuring SAST/SCA rules in each tool's UI, define security policies as code (OPA, Sentinel, custom CI scripts) in the repository. Policies are versioned, reviewed, and tested like any other code. More engineering effort, more consistent enforcement.
- **Alternative B - Developer-First Security Tools:** Use tools designed for developer experience (Snyk, Semgrep, GitHub Advanced Security) that integrate natively into the IDE, provide fix suggestions in PRs, and have low false-positive rates. Higher adoption, but may have gaps compared to enterprise SAST.
- **Alternative C - Bug Bounty as a Safety Net:** Instead of heavy upfront security testing, run a continuous bug bounty program where external researchers test your production application. Catches what automated tools miss. Requires a mature vulnerability disclosure and triage process.

### Common Pitfalls

> **⚠️ Watch out:** SAST in CI that "warns but doesn't fail" is invisible to developers. They merge, deploy, and never look at the SAST report. The pipeline must fail on High/Critical findings - with a clear, documented exception path - or the tool is just generating audit evidence, not preventing vulnerabilities.

> **⚠️ Watch out:** Secret scanning only catches secrets that match known patterns. A developer who base64-encodes an API key to "hide" it from scanners is creating a secret that scanners won't find but attackers will. Train developers that encoding ≠ encryption, and that any approach to "hide" a secret in code is a security failure.

> **⚠️ Watch out:** Annual secure coding training without reinforcement is ineffective. Developers complete the training, pass the quiz, and go back to old habits. Reinforce with: lunch-and-learn sessions, gamified security challenges (capture-the-flag), real-world breach post-mortems, and continuous feedback from code review and SAST findings.

---

## Procedure 4: Testing Phase - Security Validation

### Standard Approach

This procedure covers Phase 5 (Evaluate System Readiness).

1. **Pre-testing preparation:**
  - Verify that all security requirements from Phase 2 are mapped to specific test cases.
  - Ensure the testing environment is representative of production (same configurations, security controls enabled, realistic data volumes without production data).
  - Verify that test accounts exist for all roles/permission levels to enable authorization testing.
2. **Static Analysis (SAST) - already run in Phase 4, re-verify:**
  - Confirm that all Critical/High findings have been remediated.
  - Confirm that any waived findings have current, approved waivers with documented compensating controls.
  - Generate a final SAST report for the release candidate.
3. **Dynamic Application Security Testing (DAST):**
  - Run an automated DAST scanner (____: OWASP ZAP, Burp Suite Enterprise, Acunetix, Netsparker) against the staging deployment.
  - Configure the scanner with authentication credentials to test authenticated endpoints.
  - DAST scan must cover: all public endpoints, all authenticated endpoints, all API endpoints.
  - Review all findings: Critical/High findings must be fixed before production deployment.
  - Medium findings documented with fix timeline (not blocking deployment unless cumulative risk is high).
4. **API security testing:**
  - Test API authentication: unauthenticated access rejected (401), invalid tokens rejected, expired tokens rejected, tokens with insufficient scope rejected (403).
  - Test authorization: user A cannot access user B's resources (IDOR testing), role escalation attempts, horizontal and vertical privilege escalation.
  - Test input validation: SQL injection, NoSQL injection, command injection, XXE, mass assignment, parameter pollution.
  - Test rate limiting: is there a rate limit? Does it actually block after the threshold? Does it reset properly?
  - Test data exposure: do API responses include more data than the client needs (over-fetching)? Are sensitive fields leaking (password hashes, internal IDs, stack traces)?
5. **Penetration testing (for high-risk or internet-facing applications):**
  - Engage qualified penetration testers - internal red team or external firm.
  - Scope: the entire application including authentication, authorization, business logic, APIs, and infrastructure configuration.
  - Testers must have context: threat model, architecture diagrams, user roles, business logic flows.
  - Testing methodology: OWASP Testing Guide, PTES, or organizational standard.
  - Deliverable: penetration test report with findings ranked by severity, steps to reproduce, and remediation recommendations.
  - All Critical/High findings must be remediated before production deployment (or formally accepted with documented compensating controls).
6. **Fuzz testing (where applicable):**
  - Identify components that parse complex input: file upload parsers, image processors, protocol parsers, serialization/deserialization endpoints.
  - Run fuzz testing with ____ (AFL, libFuzzer, OSS-Fuzz, Radamsa) to discover crashes, hangs, or unexpected behavior.
  - Triage findings: crashes are potential RCE vulnerabilities and must be fixed before deployment.
7. **Quality assurance - security-focused testing:**
  - QA test cases must include negative testing: what happens with invalid input, unexpected workflows, concurrent operations, edge cases, boundary conditions?
  - QA must test access control for ALL user roles - not just the primary user persona.
  - QA must test session management: session timeout, concurrent sessions, session fixation, logout invalidation.
8. **Security acceptance sign-off:**
  - Security Officer or designated security tester reviews all test results:
    - SAST report (clean or with accepted waivers)
    - DAST report (Critical/High findings resolved)
    - Penetration test report (if applicable, all findings addressed)
    - API test results
    - QA sign-off including security test cases
  - Security acceptance decision: Go (all requirements met), Conditional Go (specific conditions must be met post-deployment), or No-Go (remediate and retest).
  - Document sign-off in ____ (GRC tool / release management system).
9. **Independent testing verification:**
  - Where possible, security testing is performed by testers independent of the development team.
  - If team size prevents full independence, at minimum, the authorization and authentication testing must be conducted by someone who did not implement those features.

### Alternative Approaches

> **💡 Why you might choose differently:** Full penetration testing for every release is impractical for teams deploying daily. Risk-tier your testing: comprehensive pen testing for major releases and high-risk changes; automated DAST for every deployment; continuous bug bounty for ongoing coverage.

- **Alternative A - Continuous Automated Security Testing:** Instead of periodic pen tests, run automated DAST and API security tests on every deployment in staging. Reserve manual penetration testing for major releases (quarterly) and high-risk changes. Catches regressions continuously.
- **Alternative B - Crowdsourced Security Testing (Bug Bounty Platform):** Run a private bug bounty program on your staging environment, inviting vetted researchers to test before release. Broader coverage than internal testing, but requires triage capacity to handle incoming reports.
- **Alternative C - Chaos Engineering for Security:** Inject security faults into the system (expired certificates, compromised credentials, network partitions) and verify that security controls respond correctly. Tests security resilience, not just absence of known vulnerabilities.

### Common Pitfalls

> **⚠️ Watch out:** DAST scanners without authentication configuration only test the login page. If you don't give the scanner valid credentials and session handling, it tests nothing beyond public endpoints. Authenticated scanning is harder to configure but essential.

> **⚠️ Watch out:** Penetration testing that finds the same OWASP Top 10 issues that SAST already found is wasted money. Provide penetration testers with SAST results and ask them to focus on business logic flaws that automated tools can't find: workflow bypass, race conditions, authorization logic errors, pricing manipulation.

> **⚠️ Watch out:** "We'll fix it after launch" is how security debt accumulates. If a High finding isn't important enough to block deployment, is it important enough to fix later when the team has moved on to the next feature? Security acceptance must be a genuine gate, not a rubber stamp. Track post-deployment remediation SLAs and escalate overdue items.

---

## Procedure 5: Deployment Phase - Production Readiness

### Standard Approach

This procedure covers Phase 6 (System Deployment).

1. **Pre-deployment security checklist - complete and sign off on every item before production deployment:**
  - [ ] All Critical and High security findings from SAST, DAST, SCA, and penetration testing are resolved or formally accepted.
  - [ ] Security configuration is hardened per organizational baselines (CIS benchmarks, vendor hardening guides).
  - [ ] All default accounts and passwords have been changed or removed.
  - [ ] Test data, test accounts, debug endpoints, and debug functionality have been removed.
  - [ ] No production data is present in deployment artifacts (code, configuration, container images).
  - [ ] Encryption is configured and verified: TLS certificates are valid and not expiring within ____ days, database encryption is enabled, secrets are in the secrets manager (not in config).
  - [ ] Logging is configured: all security-relevant events are logged, logs are shipping to the centralized logging platform (____), log format is verified.
  - [ ] Monitoring and alerting are configured: health checks, error rate alerts, security event alerts are set up and tested.
  - [ ] Backup and restore procedures are documented and tested (per Backup Policy).
  - [ ] Rollback procedure is documented and tested - can the deployment be reverted within the RTO?
  - [ ] Access controls are verified: only authorized service accounts can deploy, production access is restricted.
  - [ ] Network security groups/firewall rules are reviewed and correct.
2. **Deployment automation - all deployments must follow a defined, repeatable process:**
  - Deployment is executed through the CI/CD pipeline, not manual steps.
  - Production deployment requires a manual approval gate (human approval, not automated).
  - Approval is granted by an authorized approver who is not the implementer (separation of duties).
  - The deployment pipeline must be immutable - if the pipeline definition changes, that change must be reviewed independently.
3. **Production deployment execution:**
  - Deploy during the defined maintenance window (communicated to stakeholders in advance).
  - Use deployment strategies that minimize risk:
    - **Blue/Green:** Deploy new version alongside old, switch traffic after validation.
    - **Canary:** Deploy to a small subset of instances/users, monitor, expand gradually.
    - **Rolling:** Update instances one at a time with health checks between each.
  - Monitor dashboards, logs, and alerts during and after deployment.
  - The implementer and an on-call engineer must be available for the entire deployment window.
4. **Post-deployment validation:**
  - Execute automated smoke tests and synthetic transactions.
  - Verify: application is serving traffic, error rates are at baseline, latency is within acceptable range, all endpoints are responding.
  - Verify security controls: attempt unauthenticated access (expect 401), attempt unauthorized access (expect 403), verify TLS is properly configured.
  - Check logging: confirm security events are appearing in the SIEM.
  - Check monitoring: confirm health probes and alerts are green.
5. **Post-deployment monitoring:**
  - Monitor the system closely for at least ____ days (minimum 24 hours, longer for high-risk changes).
  - Watch for: error rate spikes, latency degradation, unusual security events, failed logins, new vulnerabilities disclosed.
  - If any metric deviates from baseline, the implementing team investigates within ____ minutes.
6. **User training and communication:**
  - Provide security training to users of the new system covering: appropriate use, data handling requirements, phishing awareness, incident reporting procedures.
  - Publish user-facing security documentation: how to enable MFA, how to report security issues, how to recognize legitimate communications from the system.
7. **Change closure:**
  - Update the change ticket with deployment results, validation evidence, and any issues.
  - For Major and Emergency changes: schedule post-implementation review with CAB.
  - Archive deployment evidence for audit purposes.
8. **Production data in non-production - if production data was used for testing (exception basis only):**
  - Verify formal approval was obtained from the Information Resource Owner.
  - Verify data was tokenized, anonymized, or pseudonymized.
  - Verify a separate copy was used (not the production live data).
  - Verify test data has been securely erased upon testing completion.
  - Verify test accounts and credentials have been removed from production deployment.

### Alternative Approaches

> **💡 Why you might choose differently:** Deployment frequency drives process complexity. A team deploying weekly can afford a comprehensive checklist; a team deploying 10x/day needs automation that embeds checklist checks into the pipeline.

- **Alternative A - Continuous Deployment (No Human Gate):** For mature teams with comprehensive automated testing, remove the manual approval gate for Standard changes. Every commit that passes all automated checks is deployed automatically. Requires exceptional test coverage and monitoring. Not recommended for regulated industries without compensating controls.
- **Alternative B - Phased Rollout with Automated Rollback:** Deploy gradually (10% → 25% → 50% → 100%) with automated monitoring checks at each phase. If error rate or latency exceeds threshold, the pipeline automatically rolls back. Reduces blast radius without manual intervention.
- **Alternative C - Immutable Deployments with Traffic Shifting:** Every deployment creates new infrastructure (new instances, new containers). Traffic is shifted from old to new. No in-place updates. Rollback is instant - shift traffic back to the previous version. Eliminates deployment state issues but requires stateless application design.

### Common Pitfalls

> **⚠️ Watch out:** The pre-deployment checklist is only as good as the person completing it. If it becomes a ritual of checking boxes without verification ("TLS? Probably fine."), it's worse than useless - it creates a paper trail that says everything was checked. Random audits of checklist items by the Security team keep it honest.

> **⚠️ Watch out:** Debug functionality left in production is a goldmine for attackers. Debug endpoints (/debug, /trace, /phpinfo, Swagger UI, GraphQL introspection), verbose error messages, and development-only backdoors must be removed or disabled in production. Automated checks in the pipeline (e.g., scanning for debug routes) catch what humans miss.

> **⚠️ Watch out:** Monitoring that wasn't tested before deployment is monitoring that doesn't work. At minimum, trigger a test alert from the new system and verify it appears in the SIEM, generates the expected notification, and reaches the right on-call channel. Do this before you need it.

---

## Procedure Quick Reference

| Procedure | Phase | Owner | Key Artifact |
|-----------|-------|-------|-------------|
| Requirements & Risk Assessment | 1–2 | Product Manager / Security | Security requirements specification, risk assessment |
| Threat Modeling & Architecture | 3 | Tech Lead / Security | Threat model, architecture review sign-off |
| Secure Coding & Build | 4 | Developers / DevSecOps | CI/CD pipeline configuration, SBOM |
| Security Testing | 5 | QA / Security Testers | SAST/DAST/pen test reports, security acceptance |
| Deployment & Production Readiness | 6 | DevOps / Release Manager | Pre-deployment checklist, deployment evidence |
