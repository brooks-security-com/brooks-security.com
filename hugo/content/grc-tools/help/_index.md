---
title: "GRC Tools Help"
bookHidden: true
---

<style>
.help-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}
.help-section:last-child { border-bottom: none; }
.help-section h2 { margin-top: 0; }
.help-section h3 { font-size: 1rem; margin-top: 1.25rem; }
.help-callout {
  background: var(--gray-100);
  border-left: 4px solid var(--color-link, #0a66c2);
  padding: 1rem 1.2rem;
  margin: 1rem 0;
  border-radius: 4px;
}
.help-back { margin-bottom: 2rem; }
</style>

<div class="help-back">
  <a href="/grc-tools/">← Back to GRC Tools</a>
</div>

# GRC Tools Help

<div class="help-section" id="getting-started">

## Getting started

The GRC Tools wizard walks you through building a customized information security program. Answer a few questions about your organization and we'll generate ready-to-use policy documents tailored to your size, compliance framework, and technology stack.

**How long does it take?** About 5 minutes to answer the questions. Policy generation takes a few seconds.

**What do I get?** Downloadable policy documents in PDF and DOCX format. Each policy is pre-filled with your company name, effective date, and relevant context.

**Is this free?** Yes. All policies are open-source. No account fees, no subscription.

**Can I edit the policies after downloading?** Yes — the DOCX format is fully editable in Microsoft Word or Google Docs. The PDF format is for distribution and signature.

<div class="help-callout">
<strong>Tip:</strong> Have your organization's basic information ready (legal name, approximate employee count, any existing compliance requirements). The wizard auto-saves your progress — you can come back anytime.
</div>

</div>

<div class="help-section" id="organization-size">

## Organization size

Your organization size determines which policy templates we recommend and the complexity of your program.

| Tier | Headcount | What you get |
|------|-----------|-------------|
| **Startup** | 1–20 people | 8 core policies covering essentials: security program, acceptable use, passwords, access control, data protection, encryption, incident response, vendor management |
| **Growth** | 20–200 people | 13+ policies adding risk assessment, change management, business continuity, logging, and SDLC requirements |
| **Enterprise** | 200+ people | Full suite of policies with more detailed controls, reporting, and oversight requirements |

**Pick the tier that matches your current size**, not your aspirational size. You can always come back and re-generate policies as you grow.

<div class="help-callout">
<strong>What if I'm small but need SOC 2?</strong> The wizard will recommend the full SOC 2 package regardless of your size. The tier determines your starting recommendation, but the framework you select overrides it where required.
</div>

</div>

<div class="help-section" id="compliance-frameworks">

## Compliance frameworks

We cross-reference every policy against these frameworks. Pick the one that matters most right now.

**SOC 2** — Service Organization Control 2. Required by many SaaS companies to demonstrate security controls to customers. Covers security, availability, processing integrity, confidentiality, and privacy.

**NIST 800-53** — National Institute of Standards and Technology Special Publication 800-53. Required for U.S. federal agencies and contractors. The most comprehensive framework — 400+ controls across 20 families.

**ISO 27001** — International standard for information security management systems (ISMS). Required by many enterprise customers, especially in Europe.

**Not sure?** Pick "Not sure yet / Multiple" and we'll recommend policies that cover the common ground across all three frameworks. You can narrow down later.

<div class="help-callout">
<strong>These are not mutually exclusive.</strong> If you need both SOC 2 and ISO 27001, the underlying policies are largely the same — the difference is in the evidence collection and auditing process, not the policy documents themselves.
</div>

</div>

<div class="help-section" id="company-name">

## Company name

Enter your organization's legal name as you want it to appear in policy documents. This will be used throughout every generated policy.

**Tips:**
- Use your full legal entity name (e.g., "Acme Corporation" not "Acme")
- This appears on the title page and in the "Approved By" field
- You can change it later and re-generate policies

</div>

<div class="help-section" id="software-and-tools">

## Software and tools

We ask about your software stack so we can:

1. **Auto-detect your identity provider** — if you select Google Workspace, we'll default to Google as your IDP. Same for Microsoft 365 → Microsoft Entra ID.
2. **Tailor policy recommendations** — if you use AWS, we'll recommend cloud-specific security controls. If you use GitHub, we'll recommend SDLC policies.
3. **Reduce irrelevant content** — policies won't mention tools you don't use.

Select everything that applies. You can always change selections and re-generate.

</div>

<div class="help-section" id="identity-provider">

## Identity provider

Your identity provider (IDP) is the system that manages user accounts, authentication, and single sign-on.

**Google** — Google Workspace / Cloud Identity. Common in startups and organizations that use Gmail, Google Drive, and Google Workspace for collaboration.

**Microsoft (Entra ID)** — Microsoft 365 / Azure AD / Entra ID. Common in enterprises and organizations standardized on Microsoft Office, Teams, and Azure.

**Okta** — Standalone identity platform. Common in mid-size to large organizations that need integration across multiple SaaS apps.

**Other** — On-prem Active Directory, Ping, OneLogin, or custom identity systems.

<div class="help-callout">
<strong>Auto-detection:</strong> If you selected Google Workspace in the previous step, we'll pre-select Google. Same for Microsoft 365 → Microsoft. You can override this if your identity stack doesn't match your productivity suite.
</div>

</div>

<div class="help-section" id="selecting-policies">

## Selecting policies

This is where you choose which policies to generate. We recommend a starting set based on your organization size and compliance framework, but you can customize freely.

**How it works:**
1. We show the recommended set pre-selected (checked)
2. Review each policy — uncheck any you don't need
3. Check additional policies your organization requires
4. The counter shows how many you've selected

**Required vs optional:**
- Some policies are foundational (Information Security Policy, Acceptable Use) — we recommend keeping them
- Others depend on your specific setup (SDLC Policy only needed if you develop software)
- You can always come back and generate additional policies later

<div class="help-callout">
<strong>Tip:</strong> Generate the recommended set first. If you find gaps during implementation, come back and add more. You don't need every policy on day one.
</div>

</div>

<div class="help-section" id="generating-policies">

## Generating policies

When you click "Generate my policies," the system:

1. Takes your company name, org size, framework, and software selections
2. Fills in each policy template with your specific information
3. Creates two versions of each policy: PDF (print-ready) and DOCX (editable)
4. Saves everything to your account

**What gets filled in:**
- Company name throughout the document
- Effective date (today's date)
- Identity provider references
- Organization size context

**What you still need to fill in manually:**
- Specific role names (CISO, Security Officer)
- Department names
- Vendor names and contact information
- System names and configurations
- Actual risk assessment results

<div class="help-callout">
<strong>These are templates, not finished products.</strong> Review each policy carefully before adopting. Have legal counsel review if required. Update annually or when your environment changes.
</div>

</div>

<div class="help-section" id="after-generation">

## After generation

**Download formats:**
- **PDF** — Best for distribution, signatures, and audit evidence. Not easily editable.
- **DOCX** — Best for editing in Microsoft Word or Google Docs. Customize before finalizing.
- **ZIP bundles** — Download all policies at once in your preferred format.

**What to do next:**
1. Review each policy for completeness and accuracy
2. Fill in any remaining blanks (role names, system details)
3. Have management approve the policies
4. Distribute to employees and conduct awareness training
5. Schedule annual review (set a calendar reminder)

**Coming back:**
- Your generated policies are saved to your account
- Return to `/grc-tools/` anytime — your progress is auto-saved
- Generate updated policies as your organization grows or requirements change

<div class="help-callout">
<strong>Annual review is not optional.</strong> Most compliance frameworks require policies to be reviewed and updated at least annually. Set a recurring calendar event now.
</div>

</div>

