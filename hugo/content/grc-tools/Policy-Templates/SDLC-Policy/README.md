# Software Development Life Cycle (SDLC) Policy Template

## What This Is

The SDLC Policy defines how information security is integrated into every phase of software development - from initial concept through requirements, design, coding, testing, deployment, and maintenance. It establishes the "security-by-design" and "shift-left" principles that ensure security is not bolted on after development is complete. This policy is critical for any organization that builds or customizes software.

## What It Covers

- Six-phase SDLC with security activities defined for each phase (Determine Need → Requirements → Design → Build → Evaluate → Deploy)
- Secure design principles (defense in depth, least privilege, secure by default, fail secure, etc.)
- Threat modeling requirements (STRIDE, PASTA)
- Secure coding standards aligned with OWASP Top 10
- Developer security training requirements (annual, role-specific)
- Automated security testing in CI/CD: SAST, SCA, container scanning, IaC scanning
- Code review requirements (peer review, security review, independent review)
- Secrets management (no hardcoded credentials)
- Environment separation (dev/test/prod)
- Production data protection in non-production environments
- Third-party and outsourced development requirements
- Error handling and encryption requirements
- Change control and deployment approval

## Document Structure

This folder contains two documents that work together:

- **`SDLC-Template.md`** - The policy itself. Defines WHAT is required: Secure software development lifecycle requirements across six phases. Defines security activities for each phase including threat modeling, secure coding, security testing, and deployment controls. This is the governance document reviewed by leadership and auditors.
- **`SDLC-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Security requirements definition, threat modeling execution, secure coding and code review workflows, security testing procedures, and production data handling in non-production environments. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Gotchas People Get Wrong

**1. Security requirements defined after design is complete.** By the time the architecture is finalized, adding security controls means expensive rework. Security requirements must be defined in Phase 2 (Requirements) and security architecture must be designed in Phase 3 (Design). Retro-fitting authentication, encryption, or audit logging into a completed design is a common and costly failure.

**2. Threat modeling is skipped because "it takes too long."** Threat modeling doesn't have to be a multi-week exercise. For an Agile team, a 2-hour threat modeling session during sprint planning is sufficient to identify the top 5-10 threats. Not doing any threat modeling means you're building without understanding what you're defending against.

**3. SAST tools deployed but findings ignored.** Running SAST in the CI/CD pipeline generates findings, but if the pipeline doesn't block merges for Critical/High findings, the tool provides zero security value. The policy must require that the pipeline fails builds for defined severity thresholds. Without enforcement, SAST is expensive noise.

**4. "We don't use production data in test" but everyone does.** Developers copy production databases to their local environments because test data is stale, incomplete, or doesn't reproduce the bug. The policy must accommodate this reality with controls (anonymization, access logging, secure erasure after testing) rather than just prohibiting it and looking the other way.

**5. Code review that only looks at logic, not security.** "LGTM" (Looks Good To Me) code reviews that check for functional correctness but not security vulnerabilities are a missed control. Reviewers must be trained to look for OWASP Top 10 issues: injection flaws, broken authentication, sensitive data exposure, XXE, broken access control, security misconfiguration, XSS, insecure deserialization, vulnerable components, and insufficient logging.

**6. Developer security training that's a checkbox video.** "Watch this 30-minute OWASP Top 10 video and click Complete" satisfies the policy requirement but produces developers who can't recognize a SQL injection or an IDOR vulnerability. Training should be role-specific (frontend devs focus on XSS/CSRF, backend devs on injection/auth), hands-on (CTF-style exercises, code review of vulnerable examples), and tested (assessments that require actually finding vulnerabilities).

**7. No secrets scanning in pre-commit hooks and CI/CD.** If a developer accidentally commits an AWS access key or database password to a Git repository, that secret is compromised and must be rotated immediately. Pre-commit hooks (client-side) and CI/CD pipeline scanning (server-side) together provide defense in depth against secret exposure. The policy must require both.

**8. Third-party code treated as trusted.** When you import an npm package, a Python library, or a Docker base image, you're importing the security posture of that dependency's maintainers. Log4Shell, SolarWinds, and the xz backdoor all exploited this trust. SCA scanning in CI/CD and an SBOM (Software Bill of Materials) are minimum requirements for third-party code.

**9. Production data protection only applies to test environments, not developer laptops.** The policy says "production data must not be used in test environments," but developers copying production data to their laptops for debugging is often overlooked. Developer workstations are typically less hardened than test environments. The policy must explicitly cover all non-production locations, including local development environments.

## Implementation Advice

- **Start with SAST and SCA in CI/CD.** These are the highest-value, lowest-effort security controls. Integrate a SAST tool (e.g., Semgrep, SonarQube, Checkmarx) and an SCA tool (e.g., Snyk, Dependabot, OWASP Dependency-Check) into your build pipeline. Configure them to fail builds on Critical/High findings. This catches the most common vulnerabilities before they reach production.
- **Threat modeling for new features, not entire systems.** Don't try to threat-model your entire application portfolio at once. Require threat modeling for any new feature that involves: authentication/authorization changes, new data flows crossing trust boundaries, new third-party integrations, or handling of sensitive data.
- **Create a security champions program.** Having one security person review all code doesn't scale. Train a developer on each team to be the "security champion" - their go-to person for security questions, code review for security, and liaison to the central security team. This distributes security knowledge across the organization.
- **OWASP Top 10 updates annually; your training should too.** The OWASP Top 10 is updated every few years. Ensure your training references the current version and that your testing tools and code review checklists are updated accordingly. A policy referencing OWASP Top 10 2017 in 2026 is a finding.
- **Pre-approve common production data use cases.** Rather than forcing developers to request approval every time they need to debug a production issue, pre-approve a standard process: (1) request a time-limited, read-only copy of the specific data needed, (2) data is automatically anonymized, (3) access is logged, (4) data is automatically deleted after 48 hours. This is more secure than developers doing ad-hoc copies and forgetting to delete them.
- **Secrets management is operational, not just developmental.** The SDLC policy covers secrets in code. Ensure your operational team has a process for rotating secrets that may have been exposed, and for auditing what secrets exist (secrets sprawl is a common finding in cloud security assessments).
