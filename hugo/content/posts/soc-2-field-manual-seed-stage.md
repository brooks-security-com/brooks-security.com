+++
title = "SOC 2 Field Manual for Seed Stage SaaS"
description = "What you actually need to build before your first SOC 2 engagement, organized by platform and budget. No fluff, no vendor pitches, just the things that take real time."
tags = [
    "soc 2",
    "compliance",
    "aws",
    "azure",
    "gcp",
    "open source",
    "startup",
    "seed stage",
]
date = "2026-07-15"
categories = [
    "Security",
]
menu = "main"
+++

## Introduction

**This is a long piece. If you want to skip straight to a specific domain, use the table of contents on the right. Otherwise, start here.**

Most seed stage SOC 2 advice is a list of policies you should write. That is backwards. Policies are the easy part. You can draft an access control policy in an hour with Claude. You cannot stand up centralized logging in an hour. You cannot build a working backup and restore pipeline in an hour. You definitely cannot run a disaster recovery test from scratch in an hour.

There is a trap here with AI policy writing that nobody talks about. Claude will happily generate a complete set of SOC 2 policies for you. Access control, change management, incident response, the whole catalog. They will look polished. They will sound authoritative. And they will almost certainly contradict each other in ways you will not catch until the auditor does. The access control policy will reference a quarterly review process. The onboarding policy will describe a monthly cadence. The incident response policy will name a role that does not exist in your org chart. The policies will read like they belong to a different company, because they do. They were generated from patterns that assume a mature security program with dedicated headcount, not a seed stage team where the CTO is also the on-call engineer and the person who provisions laptops.

<img class="post-illustration" src="/undraw-policy.svg" alt="A person reading and organizing policy documents and compliance guidelines.">

AI can draft a policy faster than you can read one. But policies do not exist in isolation. They are an ecosystem. Each one makes promises the others have to keep. If you generate them without understanding how they interconnect, you are not saving time. You are writing yourself into a corner that takes longer to escape than it would have taken to write the policies yourself from first principles. Ask me how I know. I have made all these mistakes.

The stuff that actually takes time is operational. It is the infrastructure, the pipelines, the automation. It is the difference between having a policy that says "we review access quarterly" and having a system that actually does it, logs it, and proves it to an auditor.

This field manual is not exhaustive. SOC 2 covers roughly two dozen control domains depending on how you count. This post covers the ones that consume about 80% of the calendar time. There are things I will mention in passing, security awareness training, background checks, data classification, that matter but do not take weeks to implement. If you cover the domains here, the remaining 20% is mostly documentation and lightweight processes you can stand up in a day. The goal is to tell you where to spend your energy, not to list every criterion in the framework.

I have been through this on both sides. I have built compliance programs from zero. I have sat through the auditor walkthroughs. I have gotten SOC 2 Type II reports with zero exceptions. And I have watched seed stage teams burn months on the wrong things because nobody told them where the real effort lives.

This is not a policy checklist. It is a field manual. Organized by what takes the most calendar time, not by what looks good in a spreadsheet. For each domain I will tell you what auditors actually need to see, what the native cloud tools are by platform, and what open source alternatives are worth your attention. The goal is strategic spend. Every hour and every dollar should go to the work that moves you closest to audit readiness.

SOC 2 is not a security certification. It is not a technical assessment of your architecture. It is an audit of whether your company is well organized. Can you prove that you do what you say you do? Can you show that you protect customer data not by accident, but by design? The auditors are not grading your firewall rules. They are grading your consistency, your documentation, and your ability to produce evidence on demand. **SOC 2 is a test of organizational hygiene, and you pass it by running a tight ship, not by buying the right tools.**

### The Type 1 / Type 2 Timeline

SOC 2 comes in two flavors and the timeline matters if you have customers waiting. Type 1 is a point-in-time assessment. The auditor looks at your control design on a specific date and says whether it is suitable. No observation window. You can be audit-ready for Type 1 in two to three months if you move fast. Type 2 is where the report actually has teeth. The auditor observes your controls operating over a window, typically six months for a first audit, sometimes three. You need to have your controls running, your evidence collecting, and your cadences firing for the entire window before the auditor will issue the report. That means from the day you start building, you are realistically nine to twelve months from a Type 2 report in hand. Three months to build and run Type 1, six months of observation window, a month for the auditor to write the report.

Most seed stage companies do Type 1 first, get the report quickly to unblock sales, then roll straight into the Type 2 observation window. For your first Type 2, the observation window is almost always six months. After you have one clean Type 2 under your belt, most organizations move to a twelve-month window for subsequent reports. The shorter first window keeps the audit scope manageable while your program is still maturing. That is the right play. **Just know going in that the Type 1 is the starting line, not the finish.**

<p class="pull-quote">The Type 1 is the starting line, not the finish.</p>

Type 2 has a feature that confuses people the first time around. SOC 2 is retrospective by definition. The auditor is looking backward at a completed observation window. That means the report you receive in June covers the period from, say, October through March. A customer asking for your current SOC 2 report in September is going to receive a report that covers activity from six to twelve months ago. This is completely normal. Every company that has a SOC 2 report operates this way. If the gap bothers a customer, and occasionally it does, that is what a bridge letter is for. Your auditor issues a short letter stating that nothing material has changed in your control environment since the report period ended. It buys you a few months of coverage until the next report lands. Most auditors include a bridge letter as part of the engagement. Ask for one when your report is issued.

## 1. The Strategic Spend Principle

SOC 2 is not a feature you bolt on after the product ships. **It is operations.** The audit tests whether your operations are consistent, documented, and provable. If you treat compliance as a separate workstream from engineering, you will spend twice as long and hate every minute of it.

The principle is simple. For every domain, ask two questions.

First, what does the auditor actually need to see? Not what does the framework say. What evidence will the auditor ask for in the walkthrough? Usually it is surprisingly concrete. A screenshot of a terminated account. A log of a failed login. A ticket showing a vulnerability was patched within your SLA window. The auditor is not grading your architecture. They are verifying that you do what your policies say you do.

Second, what is the cheapest way to produce that evidence reliably? Note that cheapest is not the same as lowest sticker price. It means cheapest in total cost. Your time, your team's time, the tooling, the maintenance, the context switching. A free tool that takes forty hours to configure is more expensive than a paid tool that takes four.

This is where open source earns its place. Not on ideology. On economics. When a tool like OpenObserve gives you centralized logging at a fraction of what Datadog charges, and it is a single binary you can deploy in minutes, the math is not close. When Trivy plugs into your CI pipeline and scans every container image before it hits production, for free, there is no argument for leaving that gap open.

<p class="pull-quote">SOC 2 is a test of organizational hygiene, and you pass it by running a tight ship, not by buying the right tools.</p>

The rest of this post applies that principle, domain by domain.

The cookbook sections below spend the most ink on AWS because that is where most seed stage SaaS companies run, and because the patterns are the same everywhere. IAM is IAM. Logging is logging. If you are on Azure or GCP, the tools change but the principles do not. I will call out the native services for all three platforms in each domain so you are not translating on the fly.

## 2. The Trust Services Categories

SOC 2 is organized around five [Trust Services Categories](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services). You will hear auditors refer to them as the TSCs, and you should know what each one covers because your report will specify which categories are in scope.

**Security, also called the Common Criteria.** This is the only category that is mandatory for every SOC 2 report. It covers the basic operational controls that protect your system. Access control, change management, logging, vulnerability management, incident response. If you only need SOC 2 to close enterprise deals, Security alone is often sufficient. This is the category that consumes roughly 90% of the preparation effort for most seed stage companies.

**Availability.** Whether your system is reachable and functioning according to your commitments. This is where disaster recovery, backup management, and monitoring live. You include Availability if your customers care about uptime, and they do.

**Confidentiality.** Protection of information designated as confidential. This means encryption at rest and in transit, data classification, and controls around who can see what. Include this if you handle customer data that is contractually protected.

**Processing Integrity.** Whether your system processes data completely, accurately, and in a timely manner. This is more relevant for financial platforms, payment processors, and analytics products. Most seed stage SaaS companies skip this one.

**Privacy.** Controls around the collection, use, retention, and disposal of personal information. If you collect PII and your customers care about privacy, include this. If you are also pursuing ISO 27701 or GDPR compliance, Privacy is the TSC that maps most directly.

For most seed stage SaaS companies, the starting point is Security + Availability. Add Confidentiality if you handle sensitive customer data. Add Privacy if you have a consumer-facing product or European customers. Skip Processing Integrity unless your product literally processes financial transactions. Every additional category you include adds audit scope, so be deliberate. You can always add categories in future reports.

<p class="pull-quote">Every additional category you include adds audit scope, so be deliberate.</p>

## 3. Selecting a SOC 2 Auditor

Most seed stage companies pick their SOC 2 auditor the same way they pick their office coffee. Whatever is cheapest and close by. That can work. But when it does not work, the damage is not a bad cup of coffee. It is a compliance program that takes two years and a lot of money to unwind.

The auditor you pick shapes your program, whether you realize it or not. Their interpretation of the Trust Services Criteria becomes your control design. Their expectations around evidence become your operational cadence. Their tolerance for policy language that is vague or contradictory becomes the difference between a clean report and a list of exceptions. **You are not buying an audit. You are buying a standard you will be measured against**, and you want that standard to be clear, reasonable, and applied by someone who understands what a seed stage company actually looks like.

<img class="post-illustration-left" src="/undraw-collaborating.svg" alt="Two people collaborating on a project, illustrating the partnership between a company and their SOC 2 auditor.">

You should not be building a SOC 2 compliance program in the first place. You should be building an organizational governance, risk, and compliance program that happens to satisfy SOC 2. If you build narrowly to the Trust Services Criteria, you get controls that are perfectly scoped for SOC 2 and useless for everything else. The day a customer asks about ISO 27001, or your board asks for enterprise risk reporting that spans beyond your SOC 2 system description, or an investor drops a diligence questionnaire that references frameworks you have never heard of, you discover you built a framework compliance program, not a compliance function. Retrofitting from there is slow, expensive, and demoralizing. Build a GRC program. Risk register. Control library mapped to multiple frameworks. Policies that describe how your company operates, not how SOC 2 wants you to operate. The SOC 2 audit becomes one consumer of that program, not the program itself.

<p class="pull-quote">The danger with the bad auditor is not that you fail Type 1. It is that you pass.</p>

### The Two Kinds of Audit Firms

There are compliance mills. Large firms that process hundreds of SOC 2 reports a year. Staffed mostly by junior auditors working through checklists. They are cheap, fast, and predictable. For a straightforward Type 1 with a simple cloud stack, they get the job done. But they will not help you design controls. They will not tell you when policy language will cause problems in a Type 2 window. They will audit what you hand them and issue the report.

Then there are boutique firms, often CPA-led, that treat SOC 2 as a consulting engagement as much as an audit. They are more expensive and slower to schedule. But they will review your control design before the audit starts. They will flag gaps during the readiness assessment that the mills would only catch in the final report. They will help you write policies that scale past fifty employees.

The Type 1 audit is where this difference becomes visible. A good auditor treats Type 1 as a collaborative design review. They look at your controls and tell you whether the program is sound going into the observation window for Type 2. A bad auditor treats it as a checklist. **The danger with the bad auditor is not that you fail Type 1. It is that you pass.** You get a clean report on a badly designed program, and you do not discover the problems until twelve months later when the Type 2 window closes and the findings pile up. By then the controls are embedded, the policies are published, and unwinding them costs more than doing it right the first time.

### The Third Option

There is a model that splits the difference, and it is the one I operate in with my own clients. Hire the cost-efficient mill auditor for the audit itself. Bring in a contractor separately to design the program. Someone who has built these before, who knows where the policies tend to contradict each other, who has sat through enough walkthroughs to know what evidence holds up and what gets picked apart. The contractor fills the gap the mill auditor leaves open. **The auditor audits. The contractor builds.** You get the lower audit fee and a properly designed program. The total spend is usually less than hiring a premium boutique firm, and you keep the relationship with the contractor after the audit closes, which the auditor cannot provide without independence concerns. It works better than either approach alone.

<p class="pull-quote">The auditor audits. The contractor builds. It works better than either approach alone.</p>

### How to Evaluate a Firm

Most audit firms publish their own SOC 2 report. Read a few before you sign anything. If every report from a firm looks identical, same language, same control descriptions, same structure, you are looking at a mill. That is not inherently bad. It means they are efficient. But if you see variation across their reports, custom control language tailored to different types of companies, assessments that read like someone actually understood the business they were auditing, that firm is doing real audit work. Those are the ones you want, whether you hire them directly or pair them with a contractor.

There is another signal most people do not know about. The AICPA runs a [peer review program](https://peerreview.aicpa.org) for CPA firms. You can look up any firm and see whether they have undergone peer review, and whether they passed. It is not a perfect system. Peer review is retrospective, it looks at past engagements, not the one you are about to sign. But a firm that has never submitted to peer review, or that has a pattern of failing reviews, is a red flag you should not ignore. If they will not subject their own work to outside scrutiny, why would you trust them with yours?

<p class="pull-quote">If they will not subject their own work to outside scrutiny, why would you trust them with yours?</p>

If you want the best in class from the boutique side, [Troy Fine](https://www.linkedin.com/in/troyjfine/) at Fine Assurance is who I would call. His firm is a licensed CPA practice that specializes in SOC 2, ISO 27001, and the surrounding frameworks. He taught me about the AICPA peer review system, and he has been one of the louder voices calling out low-quality audit work on LinkedIn for years. Follow him regardless of whether you hire him. You will learn more about how SOC 2 audits actually work from his posts than from most paid courses.

The one thing I will tell you plainly is that this is not the place to optimize for sticker price. If you are a seed stage company that plans to grow, the cleanup cost of fixing a badly designed compliance program two years in is orders of magnitude larger than the audit fee difference between the cheapest option and the right one. Pick the right auditor. Or pick the right contractor and pair them with a cheap auditor. Either path works. The only path that does not work is picking the cheapest option and hoping your program designs itself.

## 4. The Compliance Calendar

Before you touch a single tool, create a shared calendar. Give access to managers, the C-suite, and whoever owns security. This calendar is your compliance skeleton. It holds every recurring obligation your program commits to.

<img class="post-illustration-center" src="/undraw-shared-goals.svg" alt="People organizing a schedule, representing the compliance cadences described in this section.">

What goes in it:

- Quarterly access reviews. Fixed date, same week every quarter. You will not do these if they float.
- Quarterly backup validation. Pick a day. Restore something. Document the result.
- Annual disaster recovery test. Block a full day. Invite engineering leads, not just security.
- Vulnerability scan cadence. Weekly scans happen automatically via your cloud tooling. The calendar entry is the monthly review of findings to confirm your SLA windows are being met.
- Policy review anniversaries. Every policy gets a yearly review date. Stagger them across the calendar so you are not reviewing all twelve at once.
- Certificate and domain renewals. This is not strictly SOC 2, but expired certificates have killed more audit evidence pipelines than anything else.

SOC 2 is deliberately vague about how often you need to do most things. The framework says "periodically." It does not say monthly, quarterly, or annually. That ambiguity trips people up. The de facto standard that most audit firms and GRC platforms have settled on is quarterly for review and evidence cycles, and yearly for policy reviews and static infrastructure samples. Your access reviews happen quarterly. Your backup validation happens quarterly. Your vulnerability scan review happens monthly because scans run weekly and you need to show you are staying on top of findings. Your policy reviews and your DR test happen annually. And every year you take a fresh screenshot of your WAF configuration, your security group rules, your IAM policies. One and done. Those artifacts go in the evidence folder and they sit there until next year. You do not need to over-engineer this. Pick the industry default cadence and stick to it.

I made a specific mistake here that I want to save you from. When I was building my first compliance program, I thought faster cadences meant a stronger program. Monthly access reviews. Quarterly DR tests. Weekly patching compliance. If quarterly is good, monthly must be better. **Nobody told me that the auditor grades you against your own policies, not against some external benchmark.** If your policy says you review access monthly and you miss a month because the team was shipping a release, that is a finding. Even though nobody else in the industry reviews access monthly. Even though quarterly would have been perfectly fine. You wrote it down, so you are on the hook for it.

I review SOC 2 reports regularly as part of vendor security assessments. I do not care how often a vendor tests their backups. I care that their auditor found zero exceptions. **The report is binary. Clean opinion or qualified opinion.** The cadence you pick should be sustainable, not impressive. If you are patching vulnerabilities weekly because your tooling makes that easy, great. That is a gold star. But still write quarterly into your policy. Because the day your CI pipeline breaks and you miss a week, you want the auditor measuring you against quarterly, not weekly. **The policy is the yardstick. Make it one you can hit every time.**

The calendar does two things. First, it makes the cadences visible to leadership so compliance does not become a ghost operation run by one person in a corner. Second, it gives auditors a single artifact that shows you planned the program, not just executed it reactively. That distinction matters.

Your governance platform can handle a lot of this scheduling for you. Vanta and Drata both provide compliance roadmaps with due dates, automated reminders, and task views that show what is due when across your control set. So while you absolutely need a compliance calendar, it does not necessarily live in Outlook. These platforms give you the same cadence visibility natively.

I keep my compliance calendar separate from my governance platform. I want the cadences visible to leadership without them having to log into a tool they do not otherwise use. A shared Google Calendar or Outlook calendar that the C-suite and managers can see at a glance does more for organizational buy-in than a task list buried in a compliance dashboard. Your mileage may vary. Either way, the calendar needs to exist somewhere visible to more people than just the person running compliance.

<p class="pull-quote">The policy is the yardstick. Make it one you can hit every time.</p>

## 5. Drata, Vanta, Secureframe, Excel

The next dollar you spend should be on a compliance automation platform. Not a spreadsheet. These platforms handle three things. First, it connects to your infrastructure, your IdP, your HR system, your code repos, and it pulls evidence automatically. User accounts from Okta. Security group configurations from AWS. Laptop enrollment status from your MDM. Instead of screenshots, you get live API connections that refresh on a schedule. Second, it maps that evidence to control requirements. You tell the platform which framework you are targeting, SOC 2, ISO 27001, HIPAA, and it tells you which controls are covered by which integrations and which ones need manual evidence. Third, it gives your auditor a read-only portal where they can review everything without you emailing zip files back and forth.

That third one matters more than you would think. Auditors trust platforms they have seen before. When you hand them a Drata or Vanta portal, they know the evidence collection pipeline. They know the control mappings have been reviewed. It shortcuts a lot of the skepticism they bring to a first-time audit.

### The Big Three

**Drata.** The current market leader by most measures. [4.7 stars on G2](https://www.g2.com/products/drata/reviews) with over 1,300 reviews. Strongest in the mid-market. Their differentiator is breadth. They support more frameworks out of the box than anyone else, SOC 2, ISO 27001, HIPAA, PCI, GDPR, CMMC. Their integration library is the largest. If you are on AWS and Okta and GitHub and you want the fewest gaps, Drata covers the most ground without manual evidence. The downside is that breadth comes with complexity. Their interface has more knobs than Vanta or Secureframe, and the setup takes longer. Expect a couple weeks of configuration work, not hours.

**Vanta.** The UX play. [4.6 stars on G2](https://www.g2.com/products/vanta/reviews) with over 2,600 reviews, the most reviews of the three. Vanta is the easiest to get started with. Their onboarding wizard is genuinely good. The dashboard is cleaner. For a seed stage team where the CTO is running compliance alongside everything else, Vanta is the path of least resistance. The tradeoff is that their integration depth on some platforms is shallower than Drata. You will hit more tests that require manual evidence. That is fine at fifty employees. It gets annoying at two hundred.

**Secureframe.** The quiet third option that wins on price. [4.7 stars on G2](https://www.g2.com/products/secureframe/reviews) with over 800 reviews. Secureframe is heavily weighted toward small business, nearly 68% of their reviewers are small business users. They are cheaper than Drata and Vanta at the entry tier. Their AWS and GitHub integrations are solid. Their HRIS integrations are more limited. If your stack is pure AWS and you are under thirty employees, Secureframe is the most cost-effective path to a clean audit.

### A Warning About Open Source

This is the one domain where standardizing on open source for the rest of your security program can quietly backfire. These governance platforms have extensive integration libraries, but almost all of those integrations are with paid commercial tools. They pull evidence from AWS, from Okta, from GitHub, from Jira, from Datadog. They do not pull evidence from OpenObserve. They do not pull evidence from Trivy. They do not pull evidence from your self-hosted Grafana instance.

This does not mean you should abandon open source tooling. It means you need to be realistic about how much evidence will be collected automatically versus how much you will be uploading screenshots for. If your stack is heavily open source, expect to spend more time on manual evidence. The platform still provides value, control mapping, auditor portal, task tracking. But the automatic evidence collection, which is the main pitch these platforms make in their demos, will cover less of your program than it would if you were on Datadog and Jira and Okta. Budget for that.

Here is the paradox I want you to sit with. You should use open source tooling. It saves real money and avoids vendor lock-in. You should also expect it to create manual evidence work in your governance platform. Both are true. The strategic win is that the money you save on tools pays for the contractor time to manage the manual evidence gap. If you are spending three thousand dollars a month on Datadog and Jira and Okta, switching to OpenObserve and a self-hosted alternative saves you roughly thirty thousand dollars a year. That buys a lot of contractor hours to upload screenshots and manage evidence. Run the numbers for your specific stack and see if the tradeoff works.

### Why Not Excel

I see this pattern constantly. A founder reads the SOC 2 Trust Services Criteria, opens a spreadsheet, and starts mapping controls to evidence manually. Six months later the spreadsheet has forty tabs, three people have edited it in incompatible ways, and nobody can tell you which version is current.

<p class="pull-quote">Six months later the spreadsheet has forty tabs, three people have edited it in incompatible ways, and nobody can tell you which version is current.</p>

Excel fails at compliance management for three reasons. First, there is no live evidence. Every screenshot, every policy export, every access review sign-off is a static file that you have to manually update next quarter. You will fall behind. Everyone does. Second, there is no audit trail within the spreadsheet itself. You cannot prove that the access review tab was last updated on March 15th and not the night before the auditor asked for it. A compliance platform timestamps every piece of evidence. Third, auditors do not trust spreadsheets. They will still accept them, technically, but they will scrutinize every cell. A platform they recognize shortcuts that skepticism and saves you days of back and forth.

If you genuinely cannot afford a platform, if you are pre-revenue and bootstrapped and every dollar counts, a spreadsheet is better than nothing. But the moment you have paying customers asking for a SOC 2 report, the platform pays for itself in saved engineering hours. Pick one, sign up, and start connecting integrations. That is your first real compliance milestone.

## 6. Controls

The rest of this post walks through the operational domains that satisfy the Trust Services Categories above. Each one includes what the auditor needs to see, the platform-specific tools, the open source alternatives, and what actually takes time.

<img class="post-illustration" src="/undraw-checklist.svg" alt="A person completing items on a checklist, representing the operational controls audit requirements.">

### 6.1 Onboarding and Offboarding

This one surprises people. It should not. In my experience, and from talking to the auditors who have reviewed my programs, this is one of the most common places they find issues. It comes up constantly.

What they need to see: a documented process for granting and revoking access, evidence that the process is followed every time, and periodic access reviews that prove nobody has permissions they should not have. If you are using shared accounts for individual contributor work, stop. Fix that before anything else. Shared accounts make it impossible to prove who did what, and SOC 2 cares deeply about attribution.

<p class="pull-quote">Shared accounts make it impossible to prove who did what, and SOC 2 cares deeply about attribution.</p>

#### 6.1.1 The Cookbook

**AWS.** Use IAM Identity Center with your IdP of choice, Okta, Entra ID, Google Workspace. Assign permissions through groups, not directly to users. Every onboarding is adding a user to the right groups. Every offboarding is removing them. Both actions are logged in CloudTrail. Run a quarterly access review. The native tool for this is IAM Access Analyzer. It will tell you which principals have access to what and flag anything externally accessible. Free. Use it.

**Azure.** Entra ID (formerly Azure AD) is the center of gravity. Same pattern. Groups, not direct assignments. Privileged Identity Management for anything with elevated access. Just-in-time elevation with approval workflows. When an auditor asks "who had production access last Tuesday" you can answer with a log, not a shrug. Entra ID also has Access Reviews built in, which automates the quarterly review process. You define a review, assign reviewers, and it generates a report showing who approved what. That is your audit evidence with almost no effort.

**GCP.** Cloud Identity plus IAM. Same group-based model. Use IAM Recommender to identify over-privileged principals. It watches actual usage and tells you which permissions nobody has touched in 90 days. That is gold in an audit. GCP's Policy Analyzer answers the question "who can access what" across your entire org, which is the exact question auditors ask during walkthroughs. Run it quarterly and save the output.

**The open source play.** Terraform, Pulumi, or any infrastructure-as-code tool is the secret weapon here. When your access controls live in code, every change has a git commit. Who requested it, who approved it, when it was applied. The audit trail writes itself. Combine this with an IdP that supports SCIM provisioning and you can automate the whole joiners and leavers pipeline.

**Signed documents and HR evidence.** Auditors will ask for proof that every employee signed their NDA, their offer letter, and their policy acknowledgments. For a five person startup this is a folder in Google Drive. For a thirty person company it is a liability. Use your HRIS, Rippling, Gusto, BambooHR, or a dedicated document management tool to store signed documents with timestamps and version history. If your HRIS integrates with your compliance platform, those signatures flow into the audit evidence automatically. That is the goal. Manual collection of signed PDFs from individual email threads is the thing you want to eliminate before the Type 2 window opens, because doing it retroactively for twelve months of hires is miserable.

**What takes time.** The access review cadence. It sounds trivial. Should be, which is why surprisingly few orgs actually get this right. Set a recurring calendar invite now. First of the quarter, every quarter. Pull the list of users and permissions from your IdP. Have managers sign off. Save the evidence. This is thirty minutes of work four times a year. If you skip even one quarter, the auditor will notice.

### 6.2 Endpoint Management and Security Awareness

This is two small domains that naturally sit together because they both touch every employee. Neither takes long to set up. Both will come up in your audit.

What auditors need to see for endpoints: every company device has disk encryption enabled, a screen lock policy that triggers after a reasonable idle period, and some form of malware protection. They also want to see that you can remotely wipe a lost or stolen device. If your engineering team is using personal laptops, stop. Get them on company hardware. You cannot enforce security controls on a machine you do not own. If you are fully remote, this matters even more. The auditor is not going to come to your office and inspect laptops. They are going to ask for an MDM report that shows encryption status and screen lock policy across your fleet.

#### 6.2.1 The Cookbook

**Jamf** is the gold standard for macOS shops. It is not cheap but it is comprehensive. **Kandji** is the newer competitor with a cleaner interface and lower price point. Both do the same core things: enforce disk encryption, push configuration profiles, report compliance status, and enable remote wipe. **Microsoft Intune** is the answer for Windows or mixed environments, and it is included with most Microsoft 365 business licenses, which means you may already be paying for it.

**The open source play.** There is no great open source MDM. Fleet and MicroMDM exist but they require real administration overhead. This is one domain where paying for a commercial tool is the strategic move. The time you save not managing an open source MDM will exceed the license cost within the first quarter.

#### 6.2.2 Security Awareness Training

This is quick. You need to prove that every employee receives security training at least annually, and that new hires receive it during onboarding. **KnowBe4** is the incumbent. **Curricula** is the newer option with a less corporate feel. Both give you a library of training modules, automated phishing simulations, and completion reports. Hook your training platform into your HRIS or SSO so completion is tracked automatically. Budget two hours to set up and an hour per employee per year. That is it.

**What takes time.** Rolling out MDM to an existing fleet. If your team has been running unmanaged laptops for two years, enrolling them without disrupting work takes planning. Do it in cohorts. Communicate the timeline. Expect at least one person to be running an OS version so old that the MDM agent will not install.

### 6.3 Change Management

Change management is where auditors catch teams that move fast and document nothing. If you are a seed stage company deploying to production ten times a day, the auditor does not expect a change advisory board meeting for every merge. They expect a process that ensures changes are reviewed, tested, and traceable.

What auditors need to see: code changes are peer reviewed before merging, production deployments are logged and attributable to a specific person, and there is a separation between the person who writes the code and the person who approves the merge. They also want to see that infrastructure changes follow the same process. A Terraform apply from someone's laptop with no review is a finding waiting to happen.

<p class="pull-quote">A Terraform apply from someone's laptop with no review is a finding waiting to happen.</p>

#### 6.3.1 The Cookbook

The good news is that if you are already using GitHub or GitLab with branch protection rules, you are 80% of the way there. Require pull requests for all merges to main. Require at least one approving review from someone other than the author. Enable branch protection so nobody can push directly to production branches. Your CI pipeline becomes the evidence trail. Every deployment is traceable to a specific commit, which is traceable to a specific PR, which is traceable to specific reviewers.

For infrastructure changes, apply the same rules. Terraform and Pulumi changes go through PR review. Apply access is restricted to a CI service account, not individual engineers. Nobody runs `terraform apply` from their laptop against production. If you are doing GitOps with something like ArgoCD or Flux, the audit trail is even cleaner.

**What takes time.** Fixing the deployment pipeline if you have been pushing to main directly. Also, defining what constitutes an emergency change, a change that can bypass the normal review process, and making sure that emergency changes still get documented retroactively. Every auditor will ask about the emergency change procedure. Have one written down.

#### 6.3.2 Separation of Duties for Small Teams

A common auditor question: "How do you ensure separation of duties with a three person engineering team?" The answer is that the PR review requirement provides it. The author and the approver are different people. The CI system deploys, not an individual. That is a defensible separation of duties even at very small scale.

### 6.4 Incident Response

Incident response is the domain where the gap between policy and reality is usually widest. Most seed stage companies have no formal IR process. When something breaks, someone notices, someone fixes it, and everyone moves on. That is fine for operations. It is not fine for SOC 2.

What auditors need to see: a documented incident response plan that defines roles, communication protocols, and escalation paths. Evidence that the plan was tested, typically through a tabletop exercise. Evidence that actual incidents were documented, including what happened, what was done, and what was learned. A post-mortem process.

#### 6.4.1 The Cookbook

Write the IR plan first. It does not need to be long. Define who is on the incident response team, usually the CTO plus engineering leads. Define what constitutes a security incident versus an operational outage. Define the communication channels. Slack for internal coordination. A dedicated incident channel is standard. Define who communicates with customers and when. Define the post-mortem template. That is maybe four pages.

Run a tabletop exercise before your Type 1 audit. Pick a scenario, a production database accidentally exposed to the public internet, a critical vulnerability in a dependency, a compromised employee laptop. Walk through the response. Who gets paged? Who makes the call to notify customers? Who fixes the issue? Who writes the post-mortem? Document the exercise. The auditor will ask to see it.

For actual incidents, open a ticket. Document the timeline. Write a post-mortem that identifies root cause and preventive measures. Link to any code changes or infrastructure changes that resulted. This is not complicated. It just requires that you stop treating incidents as things that happen and start treating them as things that are recorded.

<p class="pull-quote">Stop treating incidents as things that happen and start treating them as things that are recorded.</p>

#### 6.4.2 Detection Mechanisms

You need to show that you can detect incidents, not just respond to them. At minimum, set up alerts for failed logins, unusual API activity, and infrastructure changes outside your normal deployment pipeline. Your log management tooling from the Log Management section below feeds directly into this. If you have OpenObserve or CloudWatch or Azure Monitor collecting logs, configure a handful of alerts that would surface a real problem. The auditor wants to see that you are watching, not just logging.

**What takes time.** The tabletop exercise. Schedule it for two hours. Invite the full engineering team plus whoever handles customer communication. Do not skip it. The first time you run one, you will discover that half the team does not know who to call and the other half does not know what constitutes an incident. That is normal. That is why you run the exercise.

### 6.5 Vendor Risk Management

As you grow, you will hand customer data to other companies. Cloud providers, analytics platforms, payment processors, AI APIs. SOC 2 requires you to assess the risk those vendors introduce and monitor them over time.

What auditors need to see: a list of your subprocessors and vendors who have access to customer data or production systems. For each one, a basic risk assessment. Do they have their own SOC 2 report? Are they SOC 2 compliant or ISO 27001 certified? If not, how do you know they are secure? You also need to show that you review this list periodically and re-assess when a vendor's status changes.

<img class="post-illustration" src="/undraw-handshake.svg" alt="Two people shaking hands, representing vendor relationships and third-party risk management.">

#### 6.5.1 The Cookbook

Start with a spreadsheet. List every vendor that touches customer data or production. For each one, document: what data they have access to, whether they have a SOC 2 report or equivalent certification, when you last reviewed them, and what residual risk you accept. Update it quarterly. This takes an hour once you have the list built.

Your compliance platform likely has a vendor risk module. Drata, Vanta, and Secureframe all include basic vendor management. They can pull SOC 2 reports automatically from vendors that publish them and alert you when certifications expire. Use that if you have it. The spreadsheet is the fallback.

For vendors that do not have their own SOC 2 report, send them a lightweight security questionnaire. The [VSA (Vendor Security Alliance) questionnaire](https://www.vendorsecurityalliance.org) is a standard starting point. If they will not fill it out, document that and note the accepted risk. You are not expected to reject every vendor that lacks a SOC 2 report. You are expected to make a conscious decision and record it.

**What takes time.** Building the initial vendor inventory. Nobody has one the first time they look. You will discover SaaS tools you forgot you subscribed to. Budget an afternoon to go through your credit card statements and your SSO logs and build the full list.

### 6.6 Log Management

This is the backbone. Almost every other control domain depends on logs. Access reviews reference logs. Incident response references logs. Change management references logs. If your logging is fragmented or unreliable, the whole program gets shaky.

What auditors need to see: centralized logs from your production systems, retained for a defined period (usually 90 days minimum, often a year), with integrity protection so you cannot have tampered with them. They also need to see that someone actually looks at the logs. Collection without review is not a control. It is storage.

#### 6.6.1 The Cookbook

**AWS.** CloudWatch Logs is the default. It works. It is also expensive at scale. The smarter play for a seed stage company is to ship everything to S3 with a lifecycle policy, then index whatever you actually need to query. CloudTrail is non-negotiable. Turn it on in every region, create a trail that writes to an S3 bucket with versioning enabled, and set up a CloudWatch alarm for any `StopLogging` or `DeleteTrail` API call. If someone turns off your audit logging, you need to know immediately.

**Azure.** Azure Monitor and Log Analytics. Diagnostic settings on every resource. Ship to a Log Analytics workspace with a retention policy. Enable Azure Activity Logs. Same deal as CloudTrail. Those are your audit records. Protect them. Azure Sentinel sits on top of Log Analytics and adds SIEM capabilities if you need them later, but for SOC 2 the base logging is sufficient.

**GCP.** Cloud Logging plus log sinks to Cloud Storage. Audit Logs are on by default. That is a genuine advantage, you get admin activity logs, data access logs, and system event logs without additional configuration. Set retention on the storage bucket. GCP's Log Explorer lets you query across all your logs with a SQL-like syntax, which means you can answer auditor questions without exporting to another tool.

**The open source play.** At AvatarFleet we run OpenObserve. It is a single Rust binary. It ingests logs, metrics, and traces. It stores data in Parquet on S3. It queries with SQL and PromQL. The storage cost is roughly 140 times lower than Elasticsearch for equivalent volumes. It deploys in minutes. If you are on a tight budget and do not want to hand Datadog thirty percent of your cloud bill, this is the move.

OpenObserve is OpenTelemetry native, so you are not locking yourself into a proprietary agent. Ship from any source that speaks OTLP. Grafana Loki is the other major open source contender. I have run both. Loki integrates beautifully with the Grafana ecosystem if you are already using it for dashboards. OpenObserve is better if you want one tool that handles logs, metrics, and traces without stitching components together.

**What takes time.** Getting your log sources centralized. Every service, every container, every serverless function needs to ship its logs somewhere. That means updating deployment templates, modifying launch configurations, testing that nothing breaks. It is tedious. Budget a week. Also budget time to define what normal looks like so your alerts are not just noise. A log full of unread warnings is not compliance. It is a liability.

### 6.7 Vulnerability Management

This is the domain where cloud native tools shine brightest and cost the least. The big three all have competent vulnerability scanners built into their platforms. You do not need to buy Tenable on day one.

What auditors need to see: regular vulnerability scanning (typically weekly or at least monthly), a defined SLA for remediation based on severity, and evidence that patches are applied or risks are formally accepted. They also want to see that you scan your containers and dependencies, not just your running hosts.

#### 6.7.1 The Cookbook

**AWS.** Inspector is the native vulnerability scanner. It covers EC2 instances, ECR container images, and Lambda functions. It integrates with Security Hub, which aggregates findings across Inspector, GuardDuty, IAM Access Analyzer, and a dozen other services into a single dashboard. Security Hub also maps findings to compliance frameworks, including SOC 2. If you are on AWS and not running Security Hub, you are giving away free compliance evidence.

Set up Inspector to scan weekly. Configure Security Hub to ingest those findings. Create a Jira ticket or Slack alert for anything Critical or High. Set your SLA. Critical: 72 hours. High: 7 days. Medium: 30 days. Write it down. Follow it.

**Azure.** Microsoft Defender for Cloud. It covers VMs, containers, and SQL. It also does a CIS benchmark assessment out of the box. That is relevant because many auditors use the [CIS benchmarks](https://www.cisecurity.org/cis-benchmarks) as a reference standard. Defender's Secure Score gives you a single number to track over time. Auditors love trends.

**GCP.** Security Command Center. It scans for vulnerabilities in Compute Engine, GKE, Cloud Run, and Container Registry. The Premium tier adds event threat detection and compliance reporting. The Standard tier covers basic vulnerability scanning and is included at no additional cost.

**The open source play.** Trivy is the standout. It scans container images, filesystems, and git repositories. Run it in CI. Block images with Critical vulnerabilities from reaching production. Grype from Anchore does the same thing with a slightly different signature database. Both are free and fast.

For host-level scanning, [Wazuh](https://wazuh.com) is the open source SIEM and vulnerability detection platform. It is heavier to run than Trivy. But if you need an agent on every host that does file integrity monitoring, vulnerability detection, and log collection in one package, it is the most mature option.

**What takes time.** The first scan will be ugly. Hundreds of findings. Do not panic. Triage by severity. Fix the Criticals. Accept the Lows with a note. The remediation pipeline is what matters. Being able to show the auditor that you went from 47 Critical findings to zero in two weeks is stronger than having zero findings on day one. They want to see that the process works, not that you were never vulnerable.

<p class="pull-quote">They want to see that the process works, not that you were never vulnerable.</p>

### 6.8 Backup Management

Backups are one of those things that everyone agrees are important and almost nobody tests. SOC 2 forces you to test them. That is the part that takes time.

What auditors need to see: documented backup schedules, evidence that backups complete successfully, defined retention periods, and periodic restore tests. The restore test is the part most teams skip, and the part auditors ask about first.

<img class="post-illustration-left" src="/undraw-backup.svg" alt="Files being synchronized to the cloud, representing backup and restore operations.">

#### 6.8.1 The Cookbook

**AWS.** AWS Backup is the native service. It covers EC2, EBS, RDS, DynamoDB, EFS, and S3. Define a backup plan with a schedule and retention policy. Assign resources by tag so new resources are automatically included. The backup vault supports immutable backups with WORM (write once, read many) compliance. That means even an administrator cannot delete a backup before its retention period expires. Auditors love that.

For RDS specifically, automated snapshots are included with the service. Set the retention window to at least 30 days. Enable deletion protection on production databases. Nothing worse than explaining to an auditor that someone accidentally dropped the production database and your most recent usable backup was from three days ago.

**Azure.** Azure Backup. Recovery Services Vault. Same model. Backup policies applied to VMs, SQL, and file shares. Soft delete is built in. Even if someone deletes a backup, it is retained for 14 days by default. Bump that to 30.

**GCP.** Cloud Backup and DR (formerly Actifio). It covers Compute Engine, VMware Engine, databases, and file systems. The native simpler option is Compute Engine snapshots plus Cloud Storage with object versioning and retention policies.

**The open source play.** For databases, `pg_dump` and `mysqldump` wrapped in a cron job with an S3 sync is the minimum viable backup. It works. Restic is a modern backup tool with encryption, deduplication, and S3-compatible backends. Use it for filesystem-level backups. For Kubernetes, Velero backs up cluster state and persistent volumes to S3. It also handles restore and migration. If you are on EKS, AKS, or GKE, Velero is effectively standard.

**What takes time.** The restore test. Schedule it quarterly. Pick a production database. Restore it to a sandbox environment. Verify the data is intact. Document the result. If the restore fails, fix the backup pipeline and test again. This is one of those exercises that takes half a day but buys you enormous credibility in the audit. The first time you do it, you will find something broken. That is normal. Better to find it during a test than during an incident.

<p class="pull-quote">Better to find it during a test than during an incident.</p>

### 6.9 Disaster Recovery Testing

DR is the heavyweight. It is the domain most likely to reveal gaps in your architecture, and it is the one auditors scrutinize hardest because the blast radius of failure is the largest.

What auditors need to see: a documented DR plan, defined RTO and RPO targets, and evidence of annual testing. The test does not need to be a full production failover. A tabletop exercise counts if you document the walkthrough and any findings. But a technical test is stronger evidence, and it is where you find out whether your plan would actually work.

#### 6.9.1 The Cookbook

**AWS.** Resilience Hub is the native DR assessment tool. You define your application, set your RTO and RPO targets, and it evaluates your architecture against them. It flags single points of failure, missing cross-zone replication, and configuration gaps. It also generates a compliance report mapped to SOC 2 controls.

For actual DR execution, the pattern for seed stage is usually multi-AZ with cross-region backups. If you are running on ECS or EKS, make sure your container images are in ECR in the DR region. If you are using RDS, enable multi-AZ and configure cross-region read replicas or automated cross-region snapshots. For serverless, DynamoDB global tables and S3 cross-region replication cover the data layer.

**Azure.** Azure Site Recovery orchestrates replication and failover. Pair it with Azure Traffic Manager for DNS-level failover. The equivalent of Resilience Hub is the Well-Architected Framework assessment in the Azure Advisor dashboard.

**GCP.** The DR building blocks are live migration (automatic for Compute Engine), regional persistent disks, and multi-regional Cloud Storage buckets. Cloud DNS with health checks handles traffic failover.

**The open source play.** Chaos Mesh and LitmusChaos are Kubernetes-native chaos engineering tools. They let you inject failures, network partitions, pod kills, and resource starvation into a test environment and observe whether your system degrades gracefully. This is more advanced than what most seed stage companies need for their first SOC 2, but if you are already on Kubernetes, a basic chaos test is one of the strongest pieces of DR evidence you can present.

**What takes time.** The architecture work. Multi-AZ deployment is not a checkbox. It means your application has to handle connection drops, stale DNS, and eventual consistency. If you built the whole thing on a single RDS instance without thinking about failover, fixing that takes real engineering time. Start early. The DR conversation should happen during architecture design, not three months before the audit.

### 6.10 Network Security

Network security for seed stage SaaS usually means two things. Securing your cloud network, and securing access to your corporate tools.

What auditors need to see: network segmentation, firewall rules that follow least privilege, encrypted traffic, and monitoring for network anomalies. If your production database accepts connections from any IP address, that is going to be a finding. Fix it now.

<img class="post-illustration-left" src="/undraw-firewall.svg" alt="A firewall protecting a network, representing network security controls and segmentation.">

#### 6.10.1 The Cookbook

**AWS.** Security Groups and NACLs are your primary controls. Security Groups are stateful and apply at the instance level. NACLs are stateless and apply at the subnet level. The pattern is simple. Production resources in private subnets. Only load balancers and bastion hosts in public subnets. Security Groups that allow only the specific ports and sources required. No `0.0.0.0/0` on anything except your public load balancer.

VPC Flow Logs capture metadata about every network connection in your VPC. Ship them to your log platform. Set up alerts for traffic to known-bad IPs, unexpected outbound connections, or traffic on ports that should not be open. AWS Network Firewall adds stateful inspection and domain filtering if you need deeper controls.

**Azure.** Network Security Groups and Azure Firewall. Same model. NSGs at the subnet and NIC level. Flow logs to a storage account. Azure DDoS Protection Standard on your public endpoints. It is not cheap (roughly $3,000 per month) but it covers all your public IPs and includes cost protection against scaling during an attack.

**GCP.** VPC firewall rules. Hierarchical firewall policies let you enforce rules at the organization or folder level, which is useful if you have multiple projects. VPC Flow Logs to Cloud Logging. Cloud Armor for web application firewall and DDoS protection at the edge.

**The open source play.** WireGuard is the modern VPN. It is fast, the codebase is small enough to audit, and it is built into the Linux kernel. Tailscale builds on WireGuard and adds a mesh overlay with identity-aware access. For a seed stage team, Tailscale is probably the right answer. It gives you a zero-trust network without managing VPN servers.

For web application firewall at the edge, [ModSecurity](https://owasp.org/www-project-modsecurity-core-rule-set/) with the OWASP Core Rule Set is the open source standard. It runs as an Apache or Nginx module. Pair it with Fail2ban for brute force protection.

**What takes time.** Cleaning up the security groups. Every AWS account that has been running for more than six months has cruft. Rules that were opened for a test and never closed. Ports that are wider than they need to be. The audit prep is not creating rules. It is reviewing the two hundred rules you already have and documenting why each one exists. Budget a full day.

## 7. The Open Source Advantage

I keep coming back to open source in this field manual for two reasons. Control, and economics.

When you are seed stage, your infrastructure bill is already one of your largest line items. Adding a commercial observability platform, a commercial vulnerability scanner, and a commercial SIEM can double it. Before you have revenue that justifies it. Before you have headcount to manage it. Before you know whether your architecture is even stable enough to instrument properly.

Open source tools let you build the compliance pipeline without betting the runway on it. OpenObserve instead of Datadog. Trivy instead of Snyk. Velero instead of a managed backup service. The tradeoff is that you have to configure them and maintain them. But at seed stage, your team is probably already comfortable with infrastructure. That is your comparative advantage. Use it.

At AvatarFleet we run OpenObserve in production. It handles our logs, metrics, and traces. The deployment is ECS Fargate with an S3 backend. It cost us an afternoon to set up and roughly nothing per month beyond the S3 storage. If we were running a commercial equivalent at our ingestion volume, we would be spending real money. Not hobby money. Real money.

<p class="pull-quote">Open source where the commercial alternatives are expensive. Cloud native where the integration matters.</p>

Cloud native tools fill the rest of the stack. Security Hub. Inspector. AWS Backup. These are included with your cloud bill. They are not as flexible as the open source alternatives, but they are deeply integrated and they generate audit evidence without additional configuration. That is the right division of labor. Open source where the commercial alternatives are expensive and the open source tools are mature. Cloud native where the integration matters and the cost is already sunk.

One last thing. Compliance is not a project. There is no done. The cadences in your calendar will run forever. The evidence will need updating every quarter. The platform will need maintenance. The access reviews will need sign-offs. The backup tests will need running. The policies will need annual review. If the person running compliance leaves your company, someone else needs to know how all of this works. Budget for this as a permanent operational line item, not a one-time build. The companies that struggle with SOC 2 renewal are not the ones that had a bad first audit. They are the ones that treated compliance as a project, declared victory after the Type 2 report landed, and let everything quietly decay for eleven months until the next audit window opened and nothing was ready.

## In Summary

This field manual is not comprehensive. No two companies will implement SOC 2 exactly the same way. Your industry, your architecture, your team size, and your auditor will all shape the specifics. But across every seed stage SaaS company I have worked with, the same domains consume the same 80% of the effort. Get these right and you are most of the way to a clean report.

Here is the order of operations.

1. **Onboarding and offboarding.** Shared accounts and manual processes will poison every other control. Fix this first.
2. **Endpoint management and security awareness training.** Get your fleet under management and your people trained before the Type 2 window opens.
3. **Change management.** PR reviews and branch protection are free and the auditor will ask about them regardless.
4. **Logging.** Everything else depends on having evidence. A control without a log is a claim, not a control.
5. **Vulnerability management.** The scanners are free and the findings are actionable. Turn them on this week.
6. **Incident response.** Write the plan. Run a tabletop exercise. Document actual incidents.
7. **Backups.** Test the restore. The first test will find something broken. Better now than during an incident.
8. **Vendor risk management.** Know who has your data before the auditor asks.
9. **Disaster recovery.** Start with a tabletop exercise. Graduate to a technical failover once your architecture supports it.
10. **Network security.** The cloud defaults are already reasonable. You are mostly cleaning up drift.

<img class="post-illustration-center" src="/undraw-informed-decision.svg" alt="A person making a decision at a crossroads, representing the strategic choices involved in building a SOC 2 program.">

On the tooling side, the strategic spend answer for seed stage is boring in the best way. Use the native cloud tools first. Security Hub on AWS. Defender for Cloud on Azure. Security Command Center on GCP. They are included, they are integrated, and they generate audit evidence automatically. Fill the gaps with open source where the commercial alternatives would cost more than they are worth. OpenObserve for logging. Trivy for container scanning. Velero for Kubernetes backups. These are not hobby projects. They are production tools with large communities and active development.

SOC 2 is not a mystery. It is a set of operational practices that any competent engineering team can implement. The part that hurts is not the complexity. It is the calendar time. Start early, start with the work that takes the longest, and treat every control as something you would want to have even if there were no audit. Because honestly, you should.

## References

[OpenObserve](https://github.com/openobserve/openobserve)

[Trivy](https://github.com/aquasecurity/trivy)

[Velero](https://github.com/vmware-tanzu/velero)

[Restic](https://github.com/restic/restic)

[Wazuh](https://github.com/wazuh/wazuh)

[Tailscale](https://tailscale.com)

[AWS Security Hub](https://aws.amazon.com/security-hub/)

[AWS Resilience Hub](https://aws.amazon.com/resilience-hub/)

[Azure Defender for Cloud](https://azure.microsoft.com/en-us/products/defender-for-cloud/)

[GCP Security Command Center](https://cloud.google.com/security-command-center)

[AICPA SOC Suite of Services](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)

[AICPA Peer Review Program](https://peerreview.aicpa.org)

[Vendor Security Alliance](https://www.vendorsecurityalliance.org)

[CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)

[OWASP ModSecurity Core Rule Set](https://owasp.org/www-project-modsecurity-core-rule-set/)

[Drata on G2](https://www.g2.com/products/drata/reviews)

[Vanta on G2](https://www.g2.com/products/vanta/reviews)

[Secureframe on G2](https://www.g2.com/products/secureframe/reviews)

[Troy Fine on LinkedIn](https://www.linkedin.com/in/troyjfine/)
