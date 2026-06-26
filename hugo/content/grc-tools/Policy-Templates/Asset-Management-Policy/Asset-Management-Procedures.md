# Asset Management Policy - Implementation Procedures

> **Companion to:** Asset Management Policy (AMP-Template.md)
> **Purpose:** These procedures describe how to implement the asset lifecycle requirements. The policy defines WHAT must be done; this document describes HOW.

---

## Procedure 1: System Hardening

### Standard Approach

1. Identify the target system type (server, workstation, network device, cloud instance) and its operating system/version.
2. Retrieve the current CIS Benchmark or vendor hardening guide for that exact OS version from ____ (e.g., CIS WorkBench, vendor security portal).
3. Create a baseline configuration script or image (Packer, Ansible, cloud-init) that applies the Level 1 profile from the CIS benchmark, modified for your environment.
4. Change all vendor-supplied defaults: rename or disable default accounts, generate unique local admin passwords, store them in ____ (password manager).
5. Disable insecure protocols via registry/GPO/ansible: SMBv1, TLS < 1.2, SNMPv1/v2c, Telnet, FTP, HTTP where possible.
6. Enable logging: configure syslog/Windows Event Forwarding to ship to ____ (SIEM/central log platform).
7. Deploy and configure anti-malware: ensure auto-update signatures, scheduled full scans weekly, real-time protection enabled.
8. Enforce MFA for all interactive logins via ____ (SSO/IAM provider with MFA policy).
9. Apply the baseline to a staging/test instance first; validate with a CIS assessment tool (e.g., CIS-CAT, OpenSCAP).
10. Deploy to production; document the configuration in the CMDB under the asset record.

### Alternative Approaches

> **💡 Why you might choose differently:** CIS benchmarks can be overly restrictive for developer workstations or legacy systems. A "secure enough" stance may trade some hardening controls for productivity, provided compensating controls are in place (network segmentation, EDR, no local admin rights).

- **Alternative A - Vendor-Specific Guide Only:** If you're running a niche appliance or medical device, the manufacturer's hardening guide may be the only certifiable reference. Follow it verbatim and document any gaps against CIS.
- **Alternative B - Automated Drift Remediation:** Instead of one-time hardening, use a configuration management tool (Ansible, Chef, Puppet, DSC) to continually enforce the baseline. This catches configuration drift but requires mature infrastructure-as-code practices.
- **Alternative C - Pre-Hardened Gold Images:** Build and maintain a library of pre-hardened AMIs/VM templates. Teams launch from these and never touch the base OS config. Faster provisioning, but images must be patched and rebuilt regularly.

### Common Pitfalls

> **⚠️ Watch out:** Hardening guides often disable services that legitimate internal tools depend on (e.g., disabling WinRM breaks Ansible, disabling SSH breaks CI/CD agents). Always test in staging with your full toolchain running before rolling to production.

> **⚠️ Watch out:** Local admin password randomization without a secure retrieval mechanism creates "key under the doormat" scenarios where nobody can log in during a network outage. Ensure LAPS (Windows) or equivalent is deployed and tested.

> **⚠️ Watch out:** Applying CIS Level 2 profiles to production without evaluation can break applications - Level 2 is defense-in-depth for high-security environments, not a universal baseline.

---

## Procedure 2: Patch Management

### Standard Approach

1. Establish patch criticality tiers based on CVSS score and exploitability:
  - **Critical (CVSS ≥ 9.0 or actively exploited):** Deploy within ____ hours
  - **High (CVSS 7.0–8.9):** Deploy within ____ days
  - **Medium (CVSS 4.0–6.9):** Deploy within ____ days (next maintenance window)
  - **Low (CVSS < 4.0):** Next scheduled patch cycle
2. Subscribe to vendor security bulletins and CVE feeds via ____ (e.g., mailing lists, RSS, threat intel platform).
3. Evaluate patches in a lab/staging environment before production: spin up a representative instance from the same image baseline, apply the patch, run smoke tests.
4. For workstations: configure the endpoint management platform (e.g., Intune, Jamf, WSUS) with auto-approval rings:
  - **Ring 1 (IT pilot):** Deploy immediately, test for 24 hours
  - **Ring 2 (Early adopters):** Deploy after 24 hours, soak for 48 hours
  - **Ring 3 (Broad deployment):** Deploy after 72 hours
5. For servers: schedule patching during the defined maintenance window (____, e.g., Saturday 02:00–06:00). For redundant systems, patch one node at a time, validate health between nodes.
6. After patching, validate: services are running, monitoring is green, no new alerts firing, dependent integrations work.
7. Document the patch run: which systems, which patches, any issues or rollbacks, in the change management log.

### Alternative Approaches

> **💡 Why you might choose differently:** Auto-patching workstations is low-risk and universally recommended. Auto-patching production servers is high-risk - a bad kernel update can take down a cluster. Choose based on your blast radius tolerance.

- **Alternative A - Canary Deployments:** Deploy patches to a single production node (the "canary"), monitor for ____ hours, then roll out to the rest of the fleet. Works well for homogeneous server fleets (Kubernetes nodes, web servers).
- **Alternative B - Immutable Infrastructure:** Instead of patching running instances, bake new patched AMIs/images and replace instances in a rolling deployment. Eliminates configuration drift and patch-in-place failures. Requires mature CI/CD and IaC.
- **Alternative C - Vendor-Managed Patching:** For SaaS/PaaS, rely on the vendor's SLA for patching. Validate via SOC 2 report or vendor attestation. For on-prem appliances, enable auto-update if the vendor supports staged rollouts.

### Common Pitfalls

> **⚠️ Watch out:** "Evaluate periodically" without a defined cadence means patches fall through the cracks. Set a recurring calendar invite - start with weekly - and hold someone accountable.

> **⚠️ Watch out:** Patching during "off-peak hours" works until you have a global team. Define maintenance windows in UTC and communicate to all regions. Someone's peak is always someone else's off-peak.

> **⚠️ Watch out:** Redundant-system patching (one node at a time) requires health checks between nodes. If you don't have automated health probes, you're patching blind - the second node may go down before you notice the first one failed.

---

## Procedure 3: Physical Media Transfer

### Standard Approach

1. Determine if electronic transfer (SFTP, managed file transfer platform, encrypted cloud storage) is feasible. If yes, use it instead of physical media. Physical transfer is the last resort.
2. Encrypt the data on the media using an approved tool:
  - External drives: VeraCrypt or BitLocker To Go with AES-256
  - USB flash drives: Hardware-encrypted drives (e.g., Kingston IronKey, Apricorn) preferred
  - Optical media: Encrypt the payload file (gpg, 7z with AES) before burning
3. Generate a unique encryption key/passphrase for this transfer. Do NOT reuse keys across transfers.
4. Transmit the decryption key to the recipient via an out-of-band channel (Signal, encrypted email, phone call - never the same courier as the media).
5. Select a courier from the approved list maintained by ____. Verify courier identity at pickup (ID check against the approved list).
6. Package the media: tamper-evident bags or seals, padding against physical shock, weather protection if applicable. Label with recipient and tracking number only - do NOT label with data classification.
7. Log the transfer in ____ (asset/transfer register) with:
  - Media identifier
  - Content description (classification level, not specifics)
  - Encryption method used
  - Date/time of handoff to courier
  - Expected delivery date/time
  - Recipient name and organization
8. Require recipient confirmation of receipt and successful decryption within ____ hours. Escalate if no confirmation.

### Alternative Approaches

> **💡 Why you might choose differently:** For extremely sensitive data (Restricted/Classified), encryption alone may not satisfy regulatory requirements. You may need chain-of-custody documentation, bonded couriers, or split-knowledge procedures.

- **Alternative A - Hardware-Encrypted Drives Only:** Mandate that all physical media transfers use FIPS 140-2 Level 3 validated hardware-encrypted drives. No software encryption permitted. Higher cost, much lower risk of misconfiguration.
- **Alternative B - Split Shipment:** For high-sensitivity transfers, split the encrypted payload and key material onto two separate physical media, shipped via two different couriers on different days. Neither package is useful without the other.
- **Alternative C - Escrow Handoff:** Instead of courier shipment, use a secure data escrow facility where both parties physically exchange media in a controlled environment with witness verification. Highest assurance, highest cost.

### Common Pitfalls

> **⚠️ Watch out:** Sending the encryption password in the same package as the drive is the most common physical-media security failure. It's the physical equivalent of emailing a password alongside a password-protected ZIP. Use out-of-band key exchange, always.

> **⚠️ Watch out:** "Reliable courier" is subjective. Without an approved list and ID verification, anyone with a uniform can claim to be from your courier service. Social-engineering physical pickups are a real attack vector.

> **⚠️ Watch out:** Logging the transfer is a compliance requirement, but if the log sits in someone's email inbox, it's not discoverable during an audit. Use a centralized register - even a shared spreadsheet is better than scattered emails.

---

## Procedure 4: Media Disposal

### Standard Approach

1. Identify media slated for disposal (end-of-life, repurposing, decommissioned systems). Cross-reference against the asset inventory to ensure no assets are missed.
2. Determine the data classification stored on the media. If classification cannot be confirmed, treat as Restricted (highest standard).
3. Select the disposal method based on classification:
  - **Restricted/Confidential:** Engage an approved third-party disposal vendor with NAID AAA certification. Require on-site shredding witnessed by ____, or secure chain-of-custody transport with certificate of destruction.
  - **Internal:** Cryptographic erasure (if full-disk encryption was enabled) followed by a multi-pass wipe (NIST SP 800-88 Purge).
  - **Public:** Factory reset or single-pass overwrite.
4. For in-house disposal (non-third-party):
  - HDDs/SSDs: Use DBAN (HDD) or manufacturer secure erase utility (SSD). Verify wipe with a read-back pass.
  - Tapes: Degauss using an approved degausser rated for the tape's coercivity.
  - Optical media: Cross-cut shred to particles ≤ ____ mm².
5. For third-party disposal: verify vendor certifications before engagement. Obtain and file the certificate of destruction within ____ days.
6. Log the disposal in the asset inventory: date, method, vendor (if used), certificate reference, personnel performing/approving.
7. Remove the asset from the inventory and any monitoring/management tools.

### Alternative Approaches

> **💡 Why you might choose differently:** Cost and logistics vary dramatically. Shredding 10,000 decommissioned drives in a data center is a different problem than disposing of a single failed laptop SSD.

- **Alternative A - Full-Disk Encryption as a Disposal Control:** If all media was encrypted at provisioning (FDE enforced via MDM), cryptographically erase by securely destroying the encryption keys. The media is irrecoverable even if physically lost. No physical destruction needed - dramatically cheaper at scale.
- **Alternative B - In-House Destruction:** Purchase an industrial shredder for in-house HDD/SSD destruction. Eliminates third-party risk and chain-of-custody concerns. Higher upfront cost, lower per-unit cost at volume. Requires safety training and dust management.
- **Alternative C - Media Retention (Legal Hold):** If the media is subject to litigation hold, DO NOT dispose. Tag it in the inventory as "Legal Hold - Do Not Destroy" and store in a secure, access-controlled location until released by ____ (Legal).

### Common Pitfalls

> **⚠️ Watch out:** SSD secure erase is fundamentally different from HDD wipe. DBAN/overwrite tools do NOT reliably sanitize SSDs due to wear leveling and over-provisioning. Always use the manufacturer's ATA Secure Erase command or NVMe Format NVM command.

> **⚠️ Watch out:** Third-party disposal vendors provide a "certificate of destruction" but that certificate is only as trustworthy as the vendor. Verify NAID AAA certification annually, not just at contract signing. Drop-in audits of the destruction facility are a strong signal.

> **⚠️ Watch out:** Media can sit in a "to be disposed" closet for years. Without a defined SLA from identification to destruction (e.g., 30 days), physical media becomes an unmonitored data store in your own office.

---

## Procedure 5: Media Sanitization Validation

### Standard Approach

1. Define the sanitization standard for your organization: NIST SP 800-88 Rev. 1 (Clear / Purge / Destroy) or equivalent.
2. For each media type in your environment (HDD, SSD, NVMe, tape, optical, NVRAM), document the approved sanitization method per the standard:
  - **Clear:** Single-pass overwrite (HDD), ATA Security Erase (SSD)
  - **Purge:** Cryptographic erase (if FDE), block erase (NVMe Format), degauss (tapes)
  - **Destroy:** Shred, incinerate, pulverize
3. For verification, select a sampling methodology:
  - **Routine:** Random sample of ____% of sanitized media per quarter
  - **High-risk:** 100% verification for media that held Restricted data
4. Verification method: For overwritten/erased media, attempt data recovery using forensic tools (e.g., dd, FTK Imager). If no filesystem or recoverable data is found, sanitization is confirmed.
5. Maintain a sanitization log: asset ID, media type, sanitization method, date, verifying personnel, verification result.
6. Conduct an annual review of sanitization procedures and equipment:
  - Test degausser field strength with a gaussmeter or test tape
  - Verify shredder particle size with a test run and caliper measurement
  - Review forensic recovery attempts - has any sanitization method failed?
7. Document the annual review results and update procedures if gaps are found.

### Alternative Approaches

> **💡 Why you might choose differently:** The level of verification rigor should scale with data sensitivity. Verifying every wiped laptop for a 10,000-employee company is impractical; sampling catches systemic failures without overwhelming the team.

- **Alternative A - Certificate-Only Verification:** Accept the sanitization tool's completion certificate without forensic verification. Trust but verify annually via sampling. Appropriate for low and medium sensitivity environments.
- **Alternative B - Full Forensic Audit:** Engage a third-party forensic firm to attempt recovery on a sample of sanitized media annually. Provides independent, defensible evidence for audits. Higher cost, highest assurance.
- **Alternative C - Physical Destruction as Default:** For Restricted data, skip sanitization entirely - physically destroy all media. Eliminates verification burden but increases e-waste and cost.

### Common Pitfalls

> **⚠️ Watch out:** Sanitization procedures that are never tested are just documents. Annual review means actually attempting recovery, not just reading the procedure. You'll only discover your degausser is underpowered when someone actually tries to read a degaussed tape.

> **⚠️ Watch out:** Modern NVMe drives with hardware encryption can be cryptographically erased in seconds by rotating the media encryption key (MEK). But if you didn't enable hardware encryption at provisioning, you can't use this method at disposal. Plan sanitization at provisioning time.

> **⚠️ Watch out:** "Cannot be retrieved or reconstructed" is the standard, but SSDs with damaged controllers may prevent any sanitization command from completing. These must be physically destroyed - don't let them pile up as "can't sanitize" exceptions.

---

## Procedure Quick Reference

| Procedure | Owner | Cadence | Key Artifact |
|-----------|-------|---------|-------------|
| System Hardening | ____ | Per deployment + annual review | CIS assessment report |
| Patch Management | ____ | Continuous (critical), scheduled (non-critical) | Patch run log |
| Media Transfer | ____ | As needed | Transfer log entry |
| Media Disposal | ____ | Within ____ days of decommissioning | Certificate of destruction |
| Sanitization Validation | ____ | Quarterly (sampling), annually (full review) | Sanitization verification log |
