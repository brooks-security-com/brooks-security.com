# AI Usage Policy Template

## What This Is

The AI Usage Policy defines what AI tools and platforms employees can use, what data they can submit to them, and the boundaries between permitted and prohibited AI use. It's a rapidly evolving policy area - what was cutting edge six months ago is now table stakes, and what's risky today may be standard practice tomorrow.

## What It Covers

- Approved AI platforms and their permitted use cases
- Exceptions for AI-enabled development tools (Copilot, etc.)
- Exceptions for production infrastructure AI services
- Financial compliance for AI subscriptions
- Prohibited activities (submitting PII to unauthorized platforms)
- Data handling requirements for AI systems
- Legacy code PII discovery

## Document Structure

This folder contains three files:

- **`AI-Template.md`** - The policy. Defines WHAT is required: approved platforms, prohibited activities, and data handling rules. This is what all employees read and acknowledge. Contains no implementation guidance.
- **`AI-Procedures.md`** - Companion procedures. Describes HOW to operationalize the policy: platform approval workflow, data handling implementation (pre-submission PII scanning, monitoring, incident response), and AI tool offboarding. This is what the security and IT teams use.
- **`README.md`** - This overview (what you're reading now).

**How to use them together:** Start with the policy to understand requirements and scope. When you need to actually implement something - approving a new AI platform, setting up data handling controls, offboarding a tool - follow the companion procedures. The policy tells you what must be done; the procedures tell you how to do it.

## Gotchas People Get Wrong

**1. "Free" AI tools are never free.** ChatGPT Free, Claude Free, etc. train on your data by default. If employees paste customer data into a free AI tool, you have a data breach. Your policy must be explicit about this. The business-friendly way to handle it is to provide an approved, contractually-protected enterprise AI platform.

**2. Code review AI tools see everything.** When you enable AI code review on private repos, those tools ingest your entire codebase. Make sure your vendor contract covers this. If your codebase contains hardcoded secrets, API keys, or PII in comments, the AI vendor now has them.

**3. The "development tool exception" needs boundaries.** Saying "Copilot is OK for code" is not enough. Define what "code" means - does it include configuration files with database connection strings? Infrastructure-as-code with IP addresses? Test fixtures with sample PII? Draw clear lines.

**4. This policy ages in months, not years.** Review it quarterly, not annually. New AI tools launch constantly, and employees will find and use them before you know they exist.

**5. Shadow AI is the biggest risk.** Most employees don't think of ChatGPT as "an AI platform" - they think of it as Google. Your policy needs to reach people who don't self-identify as "AI users."

## Implementation Advice

- **Provide an approved enterprise AI platform first, then write the policy.** If you say "don't use ChatGPT" without providing an alternative, employees will use it anyway and just not tell you.
- **Integrate AI policy into security awareness training.** Make it a standalone module, not a footnote. Show specific examples: "Here's what happens when you paste customer data into a free AI tool."
- **Watch the development tools space.** GitHub Copilot, Cursor, CodeRabbit, Amazon Q - the list grows monthly. Your approved list needs a fast-track review process.
- **The procurement team needs this policy.** AI tools are often expensed as "SaaS" subscriptions. Train your finance team to flag AI-related purchases for security review.
- **Legacy PII in code is more common than you think.** Before rolling out AI dev tools, scan your codebase for PII. Discovering it through an AI tool's training dataset is a bad look.
