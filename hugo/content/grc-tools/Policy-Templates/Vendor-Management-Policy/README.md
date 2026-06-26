# Vendor Management Policy Template

## What This Is

The Vendor Management Policy (often called Third-Party Risk Management or TPRM policy) defines how the organization evaluates, onboards, monitors, and offboards vendors and service providers. Since most modern organizations depend heavily on third-party SaaS platforms, cloud infrastructure, and outsourced services, vendor risk is often the largest and least-controlled risk surface. This policy ensures that vendors are assessed before engagement and monitored continuously thereafter.

## What It Covers

- Three-tier vendor risk classification (High, Medium, Low) with criteria
- Risk assessment requirements per tier (SOC 2 / ISO 27001 for High-risk)
- Required contract provisions for data security, incident notification, audit rights, and data return
- Additional provisions for cloud service providers (shared responsibility, exit strategy)
- Centralized vendor inventory management
- Ongoing monitoring and re-assessment schedules
- Vendor access management and offboarding procedures
- Individual contractor requirements

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Third-party vendor risk management with three-tier risk classification. Defines assessment requirements, contract security provisions, ongoing monitoring, and offboarding standards. This is the governance document reviewed by leadership and auditors.
- **`Vendor-Management-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Vendor risk assessment execution, security questionnaire review, contract review workflows, and vendor access management procedures. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Treating all vendors equally.** Applying the same deep assessment to a critical cloud infrastructure provider and a vendor that provides office plants wastes resources and slows procurement. Risk-tiering is essential. But the opposite failure - treating High-risk vendors with a lightweight questionnaire - is even more dangerous. The tiering must be honest and enforced.

**2. Accepting outdated audit reports.** A SOC 2 report from 18 months ago is not current. The standard expectation is within the last 12 months. Vendors sometimes provide old reports hoping nobody checks the date. Someone must check the date, and if the report is stale, the assessment is incomplete until a current report is provided.

**3. Overlooking subcontractor risk.** Your vendor may have excellent security, but if they outsource critical functions to a subcontractor with poor security, you inherit that risk. The contract must require disclosure of subcontractors and flow-down of security requirements. This is especially important for SaaS platforms built on other SaaS platforms.

**4. No exit strategy.** What happens when you stop using a vendor? How do you get your data back, in what format, and within what timeframe? These questions are frequently unaddressed until the contract is already being terminated, at which point you have no leverage. The contract must specify data export formats, timelines, and any associated costs.

**5. Vendor inventory as a static document.** A vendor inventory maintained in a spreadsheet that was last updated six months ago is worse than no inventory - it provides false confidence. The inventory must be a living document, ideally maintained in a GRC platform or vendor risk management tool, with automated reminders for re-assessments and contract renewals.

## Implementation Advice

- **Start with the vendor inventory.** Before you can assess and monitor vendors, you need to know who they are. Begin with a discovery exercise: review accounts payable data, talk to department heads, scan SaaS management tools, and audit single sign-on integrations. You will find vendors you didn't know you had.
- **Define the risk tiering criteria in concrete terms.** Vague criteria like "significant impact" lead to inconsistent tiering. Define High risk as: "accesses Restricted data OR provides a service whose failure would cause > 24 hours of business downtime." Everyone should tier consistently.
- **Build a vendor risk assessment questionnaire once.** Create a single, comprehensive security questionnaire that covers all required domains. Use different sections for different risk tiers rather than maintaining separate questionnaires. Reuse the same questionnaire for periodic re-assessments to track changes over time.
- **Automate audit report collection.** For High-risk vendors that are required to provide SOC 2 or ISO 27001 reports, set calendar reminders for report expiration dates. If you have more than a handful of High-risk vendors, consider a GRC platform that can automate collection and track report currency.
- **Integrate vendor management with procurement.** Security review must be a required step in the procurement process - not an afterthought. If a vendor can be engaged with a corporate credit card without any security review, the policy has a bypass built in. Work with Finance to gate procurement on security approval for IT vendors.
