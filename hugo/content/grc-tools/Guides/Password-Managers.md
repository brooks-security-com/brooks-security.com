# Password Manager Tools

## What problem this solves

People reuse passwords. It does not matter how many times you tell them not to. When the average person has 100+ online accounts, unique strong passwords for each one is not achievable without a tool. A password manager generates, stores, and auto-fills unique passwords for every account.

From a security program perspective, a password manager is the single highest-impact tool you can deploy. It eliminates password reuse, enables strong unique passwords everywhere, and provides a secure mechanism for sharing credentials when necessary.

## Do you actually need this

Yes. If your organization has more than one person and more than one system, you need a password manager. The question is which one and whether to mandate it.

The only exception is an organization that has achieved full SSO coverage - every application authenticates through a single identity provider with phishing-resistant MFA, and no one ever types a password. Fewer than 1 percent of organizations meet this standard.

## Options by budget tier

### Free / Low Cost (under $5/user/month)

**Bitwarden**
- Open source. Core features are free for personal use. Teams plan starts at $4/user/month.
- Supports all major platforms, browser extensions, and CLI.
- Can be self-hosted if you want full control over your data.
- Good fit: Cost-conscious organizations. The self-host option appeals to teams with strict data residency requirements.
- Weak spot: The admin console and reporting are less polished than 1Password or Keeper. User provisioning is basic on lower tiers.

**Browser-native password managers (Chrome, Safari, Firefox)**
- Free. Already installed on every device.
- Good fit: Not recommended for organizational use. Mentioned here because it is what people default to.
- Weak spot: No admin controls. Cannot enforce MFA on the password store. Cannot audit who accessed what. Cannot revoke access when someone leaves. If an employee uses Chrome's password manager and their Google account is compromised, every saved password is compromised.

### Moderate Cost ($4-8/user/month)

**1Password**
- Strong user experience. Well-designed browser extension and mobile apps.
- Includes Watchtower (breach monitoring), travel mode (remove sensitive vaults when crossing borders), and SSH key management.
- Good fit: Organizations that want the best user experience and are willing to pay for it. Mac-heavy environments (1Password has deep macOS integration).
- Weak spot: No free tier. No self-host option. The SSH key management feature is useful but may overlap with existing SSH key infrastructure.

**Keeper**
- Enterprise-focused with extensive compliance reporting (FedRAMP, SOC 2, ISO 27001).
- Includes dark web monitoring, encrypted messaging, and advanced admin controls.
- Good fit: Organizations with strict compliance requirements or government contracts.
- Weak spot: User interface is less polished than 1Password. The extensive feature set can feel cluttered.

### Enterprise ($6-12/user/month)

**1Password Business, Keeper Enterprise**
- Adds advanced features: SSO integration, automated provisioning via SCIM, detailed activity logs, custom security policies.
- Good fit: Organizations with 100+ users that need automated provisioning and compliance reporting.
- Weak spot: At this tier, you are paying for features that many organizations never use, like advanced activity logging. If you need these features, the price is justified. If not, the Teams tier is sufficient.

## A note on SSO and password managers

Deploying a password manager and deploying SSO solve related but different problems.

SSO eliminates passwords for the applications that support it. When you log into your email, Slack, and HR system through Okta or Google Workspace, you never create a password for those applications. This is the ideal.

A password manager handles everything SSO does not cover: the application that does not support SAML, the shared vendor account, the database credential, the API key, the SSH key.

The password manager also stores your SSO credentials themselves. If your identity provider account is protected by a password (not passwordless), that password lives in your password manager.

The most secure approach deploys both: SSO for supported applications, password manager for everything else, and phishing-resistant MFA on both.

## How to evaluate

1. **Test the sharing experience.** Sharing a password with a coworker should take three clicks. If it takes more, people will share credentials over Slack instead.

2. **Verify the offboarding workflow.** When someone leaves, can you revoke their access to the password manager and all shared vaults in one step? Can you see what credentials they had access to?

3. **Check browser extension behavior.** The browser extension is where users spend most of their time. Test auto-fill accuracy on your actual internal tools. Poor auto-fill behavior is the number one user complaint.

4. **Evaluate the admin console.** Can you enforce MFA on all user accounts? Can you see who has access to which shared vaults? Can you generate a report of users who have not logged in recently? These are the questions auditors ask.

5. **Test the emergency access workflow.** If your password manager admin is hit by a bus, how does someone else gain administrative access? The platform should have a documented emergency access process.

## Common mistakes

**Deploying a password manager without training.** Handing someone a password manager and saying "use this" does not work. Schedule a 15-minute training session covering: generating strong passwords, using the browser extension, sharing credentials securely (not sharing the password itself), and never sharing the master password.

**Not mandating the password manager.** If the password manager is optional, people will not use it. Make it required. Provision accounts during onboarding. Follow up with anyone who has not activated their account within 30 days.

**Ignoring the master password problem.** The master password is the key to every credential in the organization. It must be strong. It must be memorable (the user will type it multiple times per day). It must never be shared. If your users are writing master passwords on sticky notes, your password manager deployment has failed. Train users on creating strong memorable passphrases and using the password manager's emergency kit feature.

**Allowing browser-native password managers alongside the corporate tool.** If users store some passwords in Chrome and some in 1Password, you have an unmanaged credential store that you cannot audit or revoke. Use MDM or Group Policy to disable browser password saving on corporate devices.

**Treating the password manager as optional because you have SSO.** SSO does not cover everything. Database credentials, API keys, shared vendor accounts, and infrastructure secrets all need a secure home. The password manager fills this gap. If you do not provide one, these credentials end up in Slack DMs, email drafts, and unencrypted spreadsheets.
