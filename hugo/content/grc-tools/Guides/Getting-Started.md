# Getting Started

If you are building an information security program from scratch, this guide tells you where to start, what to prioritize, and what tools you need at each stage.

## The three tiers

Security programs do not need to be built all at once. The tiers below reflect what makes sense at different organizational stages. Start at the tier that matches your current situation. As you grow, add the next tier.

### Tier 1: Startup (1-20 people, no compliance requirements)

**Goal:** Protect customer data and establish basic security hygiene.

**Policies to implement (8):**
1. Information Security Policy - overarching framework
2. Acceptable Use Policy - rules for using company devices and systems
3. Password Policy - password requirements and MFA
4. System Access Control Policy - who gets access to what
5. Data Classification Policy - what data is sensitive
6. Data Protection Policy - how sensitive data is protected
7. Incident Response Policy - what to do when something goes wrong
8. Code of Conduct - ethical expectations

**Tools to deploy:**
- Password manager for everyone. Bitwarden Teams is free for up to 2 users, $4/user/month beyond that.
- MFA on email, password manager, and any system containing customer data.
- Encrypted cloud storage. If you use Google Workspace or Microsoft 365, encryption is already enabled. Verify it.
- Full-disk encryption on all laptops. Built into macOS (FileVault) and Windows (BitLocker). Enable it.
- Your cloud provider's built-in security tools. AWS GuardDuty, Google Cloud Security Command Center, or Azure Defender. Enable them.

**Approximate cost:** $50-200/month, mostly for the password manager and any additional cloud security features.

**What you can skip for now:** SIEM, vulnerability scanning, GRC automation, vendor security reviews, backup testing, disaster recovery planning beyond basic cloud backups. These add value but the basics above prevent the most common breaches.

### Tier 2: Growth (20-200 people, pursuing first compliance certification)

**Goal:** Build a complete security program suitable for SOC 2 or ISO 27001 certification.

**Additional policies (add 14):**
9. AI Usage Policy
10. Asset Management Policy
11. Backup Policy
12. Business Continuity Plan
13. Change Management Policy
14. Data Retention Policy
15. Disaster Recovery Plan
16. Encryption Policy
17. Network Firewall Policy
18. Physical Security Policy
19. Removable Media Policy
20. Responsible Disclosure Policy
21. Risk Assessment Policy
22. Vendor Management Policy

**Additional tools to deploy:**
- Centralized log management. Start with OpenObserve or Grafana Loki if budget is constrained.
- Endpoint protection. Microsoft Defender for Business if you already have Microsoft 365. Bitdefender or similar if not.
- Mobile device management. Kandji/Jamf for Macs, Intune for Windows. Required for enforcing encryption and screen lock.
- Vulnerability scanning. Start with your cloud provider's scanner plus dependency scanning in CI/CD.
- Vendor security review process. A manual process with a questionnaire template works for under 50 vendors.

**New processes to establish:**
- Quarterly access reviews: review who has access to what
- Quarterly backup restore tests: prove you can recover from backups
- Annual risk assessment: identify and prioritize risks
- Annual policy review: update policies and collect employee acknowledgments
- Security awareness training for all employees at onboarding and annually

**Approximate cost:** $500-2,000/month for tools, plus staff time for ongoing process execution.

**Consider at this stage:** GRC automation if you are pursuing your first external audit. A platform like Drata or Vanta costs $5,000-15,000/year but saves 40-60 hours of audit preparation time.

### Tier 3: Enterprise (200+ people, multiple compliance frameworks)

**Goal:** Mature the security program with advanced monitoring, testing, and automation.

**Additional policies (add 10):**
23. Configuration Management Plan
24. Contractor Access and Confidentiality Agreement
25. Control Self Assessment Process
26. Database Password Management Process
27. Employee Access and Confidentiality Agreement
28. Logging and Monitoring Policy
29. Remediation Plan
30. SDLC Policy
31. Vulnerability Management Policy
32. Charter for Oversight Responsibility of Internal Control

**Additional tools to deploy:**
- SIEM. Wazuh (open source) or Elastic Security (paid) depending on budget and staffing.
- GRC automation platform. Drata or Vanta if not already deployed.
- Annual penetration testing. Budget $10,000-20,000 per test.
- Managed detection and response if you lack 24/7 security operations staff. Arctic Wolf or Red Canary.

**New processes to establish:**
- Continuous control monitoring through GRC platform
- Monthly or quarterly security oversight committee meetings
- Formal risk acceptance process for accepted risks
- Tabletop exercises for incident response and business continuity
- Regular penetration testing and remediation tracking

**Approximate cost:** $5,000-20,000/month depending on tools, staffing, and testing scope.

## How to use this repository

1. Read this guide and determine your tier.
2. Go to the [Policy-Templates](/grc-tools/policy-templates/) directory.
3. For each policy in your tier, read the README first. It explains what the policy does and common mistakes.
4. Copy the policy template and replace all `____` placeholders with your organization's details.
5. Copy the companion procedure document and adapt the implementation approaches to your environment.
6. Have legal review final policy documents before publishing.
7. See the [Guides](/grc-tools/guides/) directory when you need help selecting specific tools.

## How long does this take

| Tier | Policies | Approximate setup time |
|------|----------|----------------------|
| Tier 1 | 8 | 2-4 weeks, working part-time |
| Tier 2 | 22 total | 2-4 months, with dedicated effort |
| Tier 3 | 32 total | 6-12 months, with a security or compliance hire |

These estimates assume you are adapting the templates in this repository, not writing policies from scratch. Writing from scratch roughly doubles the time.

## When to bring in outside help

You can build a Tier 1 program yourself with these templates. For Tier 2 and above, consider outside help for:

- **Legal review of policies.** Employment law, data privacy regulations, and contractual obligations vary by jurisdiction. An employment attorney should review the Code of Conduct, Acceptable Use Policy, and any agreements.
- **First penetration test.** Hire a reputable firm. Expect to pay $10,000-20,000. Ask for a sample report before signing a contract.
- **First external audit.** A SOC 2 Type 1 audit for a small company typically costs $15,000-30,000. A Type 2 (which covers a period of time, not just a point in time) costs $25,000-50,000. ISO 27001 certification costs are similar.
- **Incident response retainers.** Some cybersecurity insurance policies include an incident response retainer. If yours does not, consider one. Firms like CrowdStrike, Mandiant, and Kroll offer retainer agreements that guarantee response within hours of a breach.
