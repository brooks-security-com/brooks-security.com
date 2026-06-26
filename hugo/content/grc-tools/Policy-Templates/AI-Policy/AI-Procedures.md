# AI Usage Policy - Implementation Procedures

> **Companion to:** AI Usage Policy (AI-Template.md)
> **Purpose:** These procedures describe how to implement the AI usage requirements defined in the policy, including platform approval workflows, data handling safeguards, and detection of unauthorized AI use.

## Procedure: Managing the Approved AI Platform List

### Standard Approach

1. **Establish the approved list** as a living document (wiki page, policy management platform, or configuration management database). The list must include for each platform:
  - Platform name and vendor.
  - Approved use cases (e.g., "code completion in IDE," "customer support ticket summarization," "PII-redacted document analysis").
  - Data handling guarantees (contractual terms: no training on data, data residency, encryption commitments).
  - Approval date and approving authority.
  - Review date (next scheduled review).
2. **Platform evaluation criteria for new additions:**
  - Does the vendor contractually guarantee that organizational data is not used for model training?
  - Does the vendor offer data residency in approved jurisdictions?
  - Is the platform SOC 2 certified or equivalent?
  - Does the platform support SSO and access controls compatible with organizational standards?
  - Can the platform's data handling be audited (logs of data submitted, retention periods)?
3. **Approval workflow:**
  - Requester submits a business justification and intended use case to ____.
  - Security review: ____ evaluates data protection terms, encryption, and access controls.
  - Legal review: ____ evaluates contractual terms, data processing agreement, regulatory compliance.
  - Approved platforms are added to the approved list and communicated to all personnel.
4. **Review cadence:**
  - Review the entire approved list quarterly.
  - Check for: vendor policy changes, security incidents at the vendor, new features that change data handling scope.
  - Deprecate platforms that no longer meet requirements.

### Alternative Approaches

> **💡 Why you might choose differently:** A rigid approval process can create weeks of delay when teams need AI tools now.

- **Alternative A - Tiered approval:** Pre-approve a "green list" of well-known enterprise AI platforms (e.g., Microsoft Copilot with enterprise data protection, GitHub Copilot Business). These require no individual approval. Everything else goes through the full process.
- **Alternative B - Self-service with guardrails:** Allow teams to use any AI platform that meets published security criteria, with post-hoc audit rather than pre-approval. Higher risk but more agile.

### Common Pitfalls

> **⚠️ Watch out:** The approved list says "ChatGPT Enterprise" but doesn't specify whether the API, the web interface, or both are approved. The API has different data handling terms than the web interface in many cases. Be specific about which product tier and interface is approved.
>
> **⚠️ Watch out:** A platform that was approved for "non-sensitive data only" gradually becomes the default tool for everything, including customer data, because nobody remembers the restriction. Label approved platforms with their data classification ceiling.

---

## Procedure: Data Handling for AI Interactions

### Standard Approach

#### Before Submitting Data to Any AI Platform

1. **Verify the platform is on the approved list.** Check the specific use case and data classification ceiling for that platform.
2. **Classify the data you intend to submit:**
  - Is it Customer PII? → Only submit to platforms explicitly approved for Restricted data (typically production infrastructure AI services with contractual protections).
  - Is it internal business data (non-PII)? → Submit only to platforms approved for Internal/Confidential data.
  - Is it source code without embedded PII? → Approved AI development tools are permitted per the Development Tool Exception.
3. **Sanitize before submission:**
  - Remove or redact: names, email addresses, phone numbers, IP addresses, API keys, passwords, tokens, and session identifiers.
  - For source code: search for hardcoded credentials, customer identifiers in comments, or hardcoded PII in test fixtures.
  - Use automated scanning tools in the CI/CD pipeline to flag potential PII in code before it reaches AI tools.

#### When Using AI Development Tools

1. **Configure the tool to exclude sensitive files:**
  - Most AI code assistants allow `.ignore` files or configuration to exclude specific paths (e.g., `.env` files, configuration files with credentials, test fixtures with real data).
  - Add these exclusions to the repository's configuration and enforce them via CI checks.
2. **Review AI-generated code before committing:**
  - AI tools can hallucinate API keys, credentials, or URLs. Never commit AI-generated code without review.
  - AI tools trained on public code may suggest code with known vulnerabilities or incompatible licenses. Review for security and license compliance.

#### When Legacy PII Is Discovered in Code

1. **Do NOT panic or attempt to hide it.** The policy explicitly states that discovering and reporting legacy PII is encouraged and not a violation.
2. **Immediately stop submitting that code to any AI tool** (if you were doing so).
3. **Report the finding:**
  - Notify your manager or the security team via ____.
  - Include: file path, line numbers, type of PII found, and whether the code is in active use.
4. **Remediation:**
  - The security team will assess the scope (how many repos, how long has it been there).
  - Remove or redact the PII from the codebase.
  - If the code has been submitted to an AI platform, the security team will work with the vendor's data deletion process.
  - Update CI/CD scanning to prevent recurrence.

### Alternative Approaches

> **💡 Why you might choose differently:** Manual data classification before every AI interaction is unrealistic at scale.

- **Alternative A - DLP integration:** Deploy a Data Loss Prevention (DLP) tool that scans data in transit to AI platforms and blocks or warns on PII. Automated enforcement at the network or endpoint level.
- **Alternative B - AI gateway:** Route all AI platform traffic through a gateway that inspects, logs, and optionally redacts sensitive data before it reaches the AI provider. Products exist for this (e.g., AI proxy services).

### Common Pitfalls

> **⚠️ Watch out:** Sending "anonymized" data by just removing the name column doesn't work if the data contains quasi-identifiers (zip code + date of birth + gender can re-identify 87% of the US population). Proper anonymization requires statistical techniques, not just column deletion.
>
> **⚠️ Watch out:** AI code completion tools that "learn from your codebase" may propagate PII from one file to suggestions in another. The tool doesn't understand that `customer_email = "real@email.com"` is sensitive - it's just a pattern to replicate.
>
> **⚠️ Watch out:** Pasting a stack trace or error log into an AI tool for debugging help often includes file paths, usernames, IP addresses, and sometimes partial data. Sanitize error outputs before submitting them.

---

## Procedure: Detecting and Responding to Unauthorized AI Use

### Standard Approach

1. **Monitor for unauthorized AI platforms:**
  - Review corporate credit card statements for charges from AI platform vendors. Cross-reference against the approved list.
  - Monitor network traffic (if using a corporate network or VPN) for connections to known AI platform domains.
  - Review SSO application logs for authentication attempts to unapproved AI platforms using corporate credentials.
2. **Browser/endpoint monitoring (where deployed):**
  - Browser extensions or endpoint agents can detect when users visit known AI platform URLs and warn if the platform is not approved.
  - This is a DLP function - configure it to warn on AI platform access rather than block outright (to allow legitimate use of non-AI features on the same domain).
3. **Responding to unauthorized use:**
  - **Accidental or mistaken use** (e.g., employee used the wrong AI tool once): Educate the employee on the approved list. No disciplinary action if reported promptly.
  - **Knowing, repeated unauthorized use:** Follow the disciplinary process in the Acceptable Use Policy. Escalate to the employee's manager and HR.
  - **Data submitted to unauthorized platform:** Security team assesses what data was exposed. If Customer PII was involved, initiate incident response (notification, regulatory assessment) per the Incident Response Policy.
4. **Financial reconciliation:** Charges from unauthorized AI vendors on corporate cards are flagged in the expense system. Finance notifies Security for investigation.

### Alternative Approaches

> **💡 Why you might choose differently:** Heavy monitoring can feel invasive and damage trust.

- **Alternative A - Trust-but-verify:** Focus on training and clear policy, with annual audits of corporate card statements and a self-attestation process. Less intrusive but catches misuse slowly.
- **Alternative B - Technical enforcement:** Block all AI platform domains at the network level except those on the approved list. Strongest control but risks blocking legitimate non-AI content and creates friction.

### Common Pitfalls

> **⚠️ Watch out:** Employees will use personal devices and accounts to access unapproved AI tools if corporate tools are too restrictive. This creates shadow IT that's invisible to monitoring. Make approved tools easy to access and better than the alternatives.
>
> **⚠️ Watch out:** Domain-based blocking of AI platforms is a cat-and-mouse game. New AI services launch weekly, and many are accessed through CDNs or shared domains that can't be blanket-blocked.

---

## Procedure: AI-Specific Security Awareness Training

### Standard Approach

1. **Integrate AI safety into annual security awareness training:**
  - Module covering: what is and isn't approved, how to check the approved list, what constitutes Customer PII, and real examples of AI-related data exposure incidents.
  - Interactive quiz component: "Would you submit this to an AI tool?" with realistic data examples.
2. **Developer-specific training:**
  - Secure use of AI code assistants.
  - How to configure `.ignore` files for AI tools.
  - Recognizing and handling legacy PII in code.
  - Reviewing AI-generated code for security issues.
3. **Onboarding training:**
  - All new personnel must complete AI safety training before being granted access to any AI tools.
4. **Track completion:**
  - Training completion must be tracked in the LMS or HR system.
  - Non-completion within ____ days of assignment is escalated to the employee's manager.

### Common Pitfalls

> **⚠️ Watch out:** AI safety training that's just a checkbox exercise ("click through, take the quiz, forget it") doesn't change behavior. Use real examples from actual incidents (anonymized) to make it concrete.
>
> **⚠️ Watch out:** Training that says "never put anything in AI tools" while the organization provides AI tools for daily work sends a mixed message. Be specific: "Here's what you CAN put in these tools, here's what you can NEVER put in."

## Related Documents

- AI Usage Policy (AI-Template.md)
- Data Protection Policy
- Data Classification Policy
- Encryption Policy
- Acceptable Use Policy
- Vendor Management Policy

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version |
