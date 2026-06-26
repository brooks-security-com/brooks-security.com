# Removable Media Policy Template

## What This Is

The Removable Media Policy establishes a default-deny posture for USB drives, external hard drives, SD cards, and other portable storage. It shifts the burden of proof from "why shouldn't I use a USB drive?" to "why must I use a USB drive, and what compensating controls will I apply?" This is a high-impact, low-effort policy that addresses data exfiltration, malware introduction, and lost device scenarios simultaneously.

## What It Covers

- Default prohibition of all removable media on organizational equipment
- Approved alternatives (cloud storage, secure file transfer, collaboration platforms)
- Structured exception request process with required business justification
- Mandatory security controls for approved exceptions (encryption, malware scanning, logging, physical security)
- Technical enforcement through endpoint management (block USB by default, allowlist exceptions)
- Exemptions for IT recovery media and backup media
- Secure disposal requirements for media that is no longer needed

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Removable-Media-Procedures.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Common Gotchas and Mistakes

**1. Policy without technical enforcement.** A written prohibition with no endpoint controls is a suggestion, not a policy. If USB ports work by default, people will use them - especially when they're in a hurry. Deploy endpoint management to block USB mass storage at the OS level and only allow specific devices through a formal exception process.

**2. Exceptions becoming the norm.** Once an exception is granted, there's a strong tendency for it to become permanent. Every exception must have an expiration date. When the exception expires, the person must justify continued need - not just receive an automatic renewal. Exception drift (permanent exceptions that accumulate over years) undermines the entire policy.

**3. Ignoring alternative media types.** People focus on USB drives and forget about SD cards, smartphones in USB mass storage mode, external DVD writers, and even legacy interfaces. A determined user with a prohibited USB policy may simply use a different port or device. The policy must cover all portable storage form factors.

**4. Encrypting the media but not the key management.** Encrypting a USB drive satisfies one control but creates another problem: where is the encryption key? If the passphrase is written on a sticky note attached to the drive (it happens), the control is meaningless. Key management for removable media is harder than for centralized systems because the key necessarily travels with the user.

**5. Not testing malware scanning workflows.** The policy requires scanning removable media for malware before connection - but if the scanning workstation is separate from the target system, users may skip this step. Design the workflow so that malware scanning is the path of least resistance, not an extra step that people bypass.

## Implementation Advice

- **Deploy USB blocking via MDM first, policy second.** Write the policy, but don't announce it until the technical controls are ready to deploy simultaneously. Announcing a USB ban and then taking weeks to implement controls creates a window where people know the rule but nothing prevents them from violating it.
- **Provide a frictionless alternative.** The most effective way to stop USB drive use is to make the approved alternative easier. If the cloud storage platform syncs automatically, has a simple drag-and-drop interface, and integrates with all tools people already use, they won't miss USB drives.
- **Build incident detection into endpoint telemetry.** Log all removable media connection attempts - both allowed and blocked. A blocked attempt is a near-miss that may indicate a policy violation, a training gap, or an attempted data exfiltration. Feed these events into the SIEM and review them.
- **Audit the exception log quarterly.** Review all active exceptions. Ask: does this business need still exist? Could it now be met by an approved alternative? Has the exception been renewed more than twice? Aggressively close exceptions that no longer have a strong justification.
- **Include removable media in tabletop exercises.** Simulate a scenario where an employee loses an encrypted USB drive containing Confidential data. Walk through the response: was it reported? Was the key separate? Do you know what data was on it? The answers often reveal gaps that the policy should address.
