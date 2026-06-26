# Password Policy Template

## What This Is

The Password Policy defines how authentication credentials must be created, managed, and protected. It reflects modern best practices - specifically NIST SP 800-63B - which deprecate many traditional password rules (complexity requirements, mandatory periodic rotation) in favor of length, uniqueness, password managers, and multi-factor authentication. This is one of the policies that affects every person in the organization daily.

## What It Covers

- Password construction (minimum 12 characters, no mandatory complexity, passphrases encouraged)
- Banned password lists (breach corpora, dictionary words, patterns)
- Mandatory use of an organization-approved password manager
- Single Sign-On (SSO) requirements
- Multi-Factor Authentication (MFA) requirements and approved methods
- Credential distribution and identity verification for new accounts
- Password storage requirements (approved hashing algorithms: bcrypt, scrypt, Argon2id)
- Prohibition on mandatory periodic password rotation (NIST-aligned)
- Compromise response procedures
- Service account and machine credential requirements

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Authentication credential requirements aligned with NIST SP 800-63B. Defines password construction, password manager requirements, MFA standards, credential storage, and compromise response. This is the governance document reviewed by leadership and auditors.
- **`Password-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Secure credential distribution procedures, password manager deployment, MFA enrollment workflows, and credential compromise response execution. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Keeping mandatory complexity rules.** "Must contain uppercase, lowercase, digit, and special character" is the most persistent bad practice in password policies. It has been explicitly deprecated by NIST since 2017. Users respond to complexity rules with predictable substitutions (Password1!) that are easy for attackers to guess. Replace complexity rules with minimum length (12+ characters) and banned password checks.

**2. Mandating periodic password rotation.** Forcing users to change passwords every 90 days was standard advice for decades - and it is now known to be counterproductive. Users make minimal changes (Password1! → Password2!), reuse passwords across systems, or write them down. NIST SP 800-63B explicitly advises against periodic rotation without evidence of compromise.

**3. Allowing SMS as the only MFA method.** SMS-based MFA is vulnerable to SIM swapping, SS7 attacks, and social engineering. While SMS is better than no MFA, the policy should prioritize FIDO2 security keys and TOTP authenticator apps. SMS should be deprecated for privileged accounts and listed as a last-resort option.

**4. Storing passwords with weak hashing.** Unsalted SHA-256 is not a password hashing algorithm. bcrypt, scrypt, and Argon2id are designed to be slow and memory-hard, making brute-force attacks expensive. If your applications are using general-purpose hash functions for passwords, they need to be updated. The work factor should be calibrated and re-calibrated as hardware improves.

**5. Not requiring a password manager.** Expecting Personnel to memorize dozens of unique, long passwords is unrealistic. Without a password manager, password reuse is inevitable. Making a password manager mandatory - and providing it to all Personnel - is the single highest-impact change you can make to improve authentication security.

## Implementation Advice

- **Adopt passkeys/FIDO2 as the strategic direction.** Passkeys eliminate passwords entirely for supported services, providing phishing-resistant authentication. Set the policy to prefer passkeys where available and plan a migration path from passwords to passkeys over time.
- **Implement banned password checking at account creation and password change.** Use the Have I Been Pwned API or a similar breach corpus. Prevent users from setting passwords that are known to be compromised. This single check stops credential stuffing attacks dead.
- **Make the password manager a core IT service.** Pre-install it on all managed devices, configure SSO integration, provide training during onboarding, and designate champions in each department. Treat the password manager with the same operational priority as email or the SSO provider.
- **Audit MFA coverage quarterly.** Run reports from the identity provider, SSO, and critical applications to verify MFA enrollment rates. Chase down the holdouts. A system without MFA that supports it is an audit finding waiting to happen.
- **Test service account rotation in production.** Many organizations have service accounts with passwords that haven't changed in years because everyone is afraid of breaking something. Automate rotation with secrets management tools and test the process in a staging environment. Document the dependencies so you know what breaks if a credential changes.
