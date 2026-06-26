# Acceptable Use Policy - Implementation Procedures

> **Companion to:** Acceptable Use Policy (AUP-Template.md)
> **Purpose:** These procedures describe how to implement the requirements set forth in the Acceptable Use Policy. The policy defines WHAT must be done; this document describes HOW to do it.

---

## Procedure 1: Malware Protection Program

### Standard Approach

This procedure covers the end-to-end deployment, configuration, and maintenance of anti-malware controls on organizational endpoints and servers.

#### 1.1 Anti-Malware Deployment

1. Select an enterprise anti-malware / EDR (Endpoint Detection and Response) platform. Approved platform: `____` (e.g., CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne).
2. Deploy agents to all endpoint systems - workstations, laptops, and servers - via the organization's device management tool (`____`, e.g., Jamf, Intune, SCCM, Ansible).
3. Configure deployment groups:
  - **Production Servers:** Agent installed in "detect-only" or "monitor" mode initially for a `____`-day observation period before moving to "protect" mode.
  - **Workstations/Laptops:** Agent installed in "protect" mode from Day 1.
  - **Legacy/Embedded Systems:** If agent cannot be installed, document a compensating control plan (network segmentation, application whitelisting).
4. Verify agent health dashboard shows >`____`% coverage within `____` days of deployment initiation. Escalate gaps to `____` (IT Operations).

#### 1.2 Signature and Engine Updates

1. Configure automatic update checks every `____` hours (recommended: 4 hours minimum, 1 hour for high-risk environments).
2. For air-gapped or restricted-network systems, establish an offline update relay server that fetches signatures from the vendor and distributes internally.
3. Monitor the update compliance dashboard daily. Systems more than `____` hours out of date trigger an automated alert to `____` (Security Operations).
4. Subscribe to vendor threat intelligence feeds and emergency signature update notifications. Designate `____` as the contact for vendor communications.

#### 1.3 Scheduled Scanning

1. **Full System Scans:** Schedule weekly on all endpoints during off-peak hours (e.g., Saturday 02:00–06:00 local time). Configure to scan all files, archives, and memory.
2. **Quick Scans:** Schedule daily during idle time. Focus on common malware persistence locations (registry, startup folders, browser extensions, temp directories).
3. **On-Access Scanning:** Enable real-time scanning for all file operations (open, save, execute). This is non-negotiable and must not be disabled by end users.
4. **Scan Exclusions:** Maintain a centrally managed exclusion list for known false positives. All exclusions must be:
  - Submitted via change request with business justification.
  - Approved by `____` (Security Engineering).
  - Reviewed quarterly for continued necessity.
  - Limited in scope - exclude specific file paths, never entire directories or drive volumes.

#### 1.4 Multi-Point Scanning Architecture

The following scan points must be configured:

| Scan Point | Location | Scope | Tool / Config |
|-----------|----------|-------|---------------|
| Email Gateway | `____` (e.g., Mimecast, Proofpoint, Microsoft 365 Defender) | All inbound/outbound email + attachments | Enable sandbox detonation for executables and Office docs |
| Web Proxy / DNS Filter | `____` (e.g., Zscaler, Cisco Umbrella) | All web traffic | Block known malware domains; enable SSL inspection where legally permissible |
| Endpoint | All workstations + servers | File system, memory, processes | Configure per 1.1–1.3 above |
| Cloud Storage / SaaS | `____` (e.g., CASB, Netskope) | Files uploaded to sanctioned cloud apps | Scan on upload; quarantine flagged files |
| Removable Media | Endpoints with USB ports | USB drives, external HDDs on insertion | Auto-scan on mount; block execution from removable media by default |

#### 1.5 Malware Incident Response

1. On detection, the EDR platform automatically:
  - Quarantines the affected file or process.
  - Isolates the endpoint from the network (if configured for automatic containment).
  - Generates a ticket in `____` (SIEM / ticketing system) with severity based on detection type.
2. Security Operations acknowledges the alert within `____` minutes (Severity: Critical/High) or `____` hours (Medium/Low).
3. If the detection is confirmed as malicious:
  - Initiate the Incident Response Process (see IR-Process-Template.md).
  - Preserve forensic artifacts: memory dump, disk image, network flows from `____` hours before detection.
  - Determine scope of compromise - was data exfiltrated? Lateral movement?
  - After containment and remediation, validate that the system is clean before restoring network access.
4. Post-incident: update detection rules, exclusion lists, and user awareness training based on lessons learned.

### Alternative Approaches

> **💡 Why you might choose differently:** Different organizational sizes, threat profiles, and infrastructure constraints may favor different architectural choices.

- **Cloud-Native / No-Agent Approach:** For organizations running entirely on virtual desktops or browser-based workflows (e.g., Chromebooks, Amazon WorkSpaces, Windows 365), deploy network-based malware detection (NGFW with threat prevention, secure web gateway) and cloud workload protection rather than traditional endpoint agents.
- **Application Whitelisting-First:** In high-security environments (ICS/SCADA, financial trading systems), prefer application whitelisting (e.g., AppLocker, WDAC) as the primary control, with anti-malware as a secondary layer. This trades some operational overhead for stronger prevention against unknown malware.
- **MSSP / Managed Detection:** Organizations without in-house security operations can outsource malware monitoring and response to an MSSP (Managed Security Service Provider). Ensure the MSSP contract specifies response SLAs, notification procedures, and forensic evidence handling.

### Common Pitfalls

> **⚠️ Watch out:** Scan exclusions creeping over time. "Just exclude this folder for performance" becomes a gaping hole. Audit exclusions quarterly and require re-approval.

> **⚠️ Watch out:** Assuming anti-malware is sufficient. Modern adversaries use fileless malware, living-off-the-land binaries (LOLBins), and stolen credentials that bypass signature-based detection. Anti-malware is one layer - behavior-based EDR, network detection, and robust logging are essential complements.

> **⚠️ Watch out:** Alert fatigue from overly sensitive detection policies. If Security Operations receives 500 low-fidelity alerts daily, real incidents will be missed. Tune detection rules continuously; suppress known false positives aggressively; use alert correlation.

> **⚠️ Watch out:** Forgetting about Linux and macOS endpoints. Many organizations have excellent Windows coverage but gaping holes on developer MacBooks and Linux servers. Ensure your EDR platform covers all operating systems in your environment.

---

## Procedure 2: Software Installation Controls

### Standard Approach

This procedure governs how software is approved, installed, and maintained on organizational devices.

#### 2.1 Software Approval Process

1. **Request Submission:** Personnel submit software installation requests via `____` (IT service desk / procurement system). Request must include: software name, vendor, version, business purpose, license type/cost, and data the software will access or process.
2. **Security Review:** The Security team evaluates:
  - Vendor reputation and breach history.
  - Data access requirements - does it need access to Restricted or Confidential data?
  - Network communication patterns - does it phone home? To where?
  - Known vulnerabilities (check NVD, vendor advisories).
  - Privacy policy and data handling practices (for cloud-connected software).
  - Open-source license compatibility (for internally used tools).
3. **Architecture Review:** IT validates compatibility with the standard endpoint image, tests for conflicts with existing software, and verifies deployment packaging.
4. **Approval Decision:** `____` (IT Manager / Security Officer) approves or denies within `____` business days. Approved software is added to the Approved Software Catalog.
5. **Catalog Maintenance:** The catalog is published on the intranet and reviewed quarterly. Software that is no longer needed, reaches end-of-life, or has unresolved critical vulnerabilities is removed.

#### 2.2 Installation Enforcement

1. **Standard Users:** By default, personnel do not have local administrator rights and cannot install software. This is enforced via group policy / MDM.
2. **Self-Service Portal:** Approved software is available through a self-service portal (`____`, e.g., Company Portal for Intune, Self Service for Jamf, Software Center for SCCM). Users can install pre-approved software without an IT ticket.
3. **Privileged Access for Installation:** IT personnel with software deployment responsibilities receive elevated accounts used ONLY for installation tasks. These accounts are:
  - Separate from daily-driver accounts.
  - Subject to just-in-time (JIT) elevation with time-bound access.
  - Fully logged and reviewed monthly.
4. **Developer Exception:** Developers who require compilers, SDKs, containers, or tools may receive a secondary local admin account on their development machine ONLY. This machine must not store production data. See SDLC Policy for environment separation requirements.

#### 2.3 Software Inventory and License Compliance

1. **Automated Discovery:** Deploy a software inventory agent (`____`) on all endpoints to detect installed software. Run discovery scans weekly.
2. **Reconciliation:** Compare discovered software against the Approved Software Catalog. Flag discrepancies:
  - **Unapproved software:** Generate a ticket for IT to investigate and remove.
  - **Unlicensed software:** Escalate to Procurement/Legal for license compliance.
  - **End-of-life software:** Flag for upgrade or removal with a deadline based on severity.
3. **License Management:** Maintain a license register tracking purchased licenses vs. actual installations. True-up with vendors on `____` (annual/semi-annual) basis.
4. **Vulnerability Correlation:** Cross-reference the software inventory against vulnerability databases (CVE/NVD). Automatically flag software with known Critical/High CVEs for patching.

#### 2.4 Prohibited Software Categories

The following software categories are explicitly prohibited on organizational devices:
- Peer-to-peer file sharing applications (BitTorrent, LimeWire, etc.).
- Unauthorized remote access tools (TeamViewer personal edition, AnyDesk personal, etc. - only the corporate-licensed version is permitted).
- Cryptocurrency miners.
- Unlicensed or pirated software of any kind.
- Software that circumvents security controls (proxies, VPNs for bypassing organizational filtering, keyloggers).
- Personal cloud sync clients not on the approved list (approved: `____`).

Detection of prohibited software triggers an automatic ticket to Security and may initiate the disciplinary process.

### Alternative Approaches

> **💡 Why you might choose differently:** Highly technical organizations (software companies, research labs) may find strict whitelisting too restrictive. BYOD environments require different controls.

- **Allow-List with Fast-Track Approval:** Maintain a "pre-approved" category for widely used developer tools (VS Code, Docker, Homebrew packages) that can be installed without individual review. New tools follow an expedited 24-hour review. Balances agility with control.
- **BYOD / Contractor Devices:** Instead of controlling installations on personal devices, enforce access via VDI or browser-based applications that don't require local software installation. Use conditional access policies to block access from devices that don't meet compliance requirements (no EDR, no disk encryption).
- **Zero-Trust Application Model:** Move away from device-level software control toward application-level access control. Users can install any software, but applications can only access organizational data if explicitly authorized via API gateways and conditional access policies. Requires mature identity and data protection infrastructure.

### Common Pitfalls

> **⚠️ Watch out:** "Shadow IT" where users subscribe to SaaS tools with a corporate credit card, bypassing the software approval process entirely. This is often the biggest gap. Monitor expense reports, browser extensions, and SSO logins for unauthorized SaaS adoption.

> **⚠️ Watch out:** Overly restrictive policies that drive users to workarounds. If a developer needs a tool and approval takes 3 weeks, they'll find a way. Measure approval turnaround time as a KPI and keep it under `____` business days.

> **⚠️ Watch out:** Failing to account for browser extensions and plugins, which can have extensive access to browser data including passwords, session tokens, and page content. Deploy browser extension management (e.g., Chrome Browser Cloud Management) to control extensions.

> **⚠️ Watch out:** Open-source license compliance. MIT/Apache licenses seem harmless, but GPL/copyleft licenses can create legal obligations. Run automated license scanning (e.g., FOSSA, Snyk, Black Duck) as part of the approval process for any software that will be distributed or embedded in products.

---

## Related Documents

- Acceptable Use Policy (AUP-Template.md)
- Information Security Policy (ISP-Template.md)
- Asset Management Policy (AMP-Template.md)
- System Access Control Policy
- SDLC Policy
- Incident Response Process (IR-Process-Template.md)
