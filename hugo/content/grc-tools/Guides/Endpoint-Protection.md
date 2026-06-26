# Endpoint Protection Tools

## What problem this solves

Every laptop, desktop, and server in your organization is an endpoint. Endpoints run software, receive email, browse the web, and connect to networks. They are the most common entry point for attackers. Endpoint protection detects and blocks malware, ransomware, and suspicious behavior on these devices.

Modern endpoint protection goes beyond traditional antivirus. It includes behavioral analysis (detecting unusual patterns, not just known malware signatures), device control (blocking USB drives), and often integrates with your mobile device management (MDM) platform.

## Do you actually need this

Yes. Every organization with more than one device needs endpoint protection. The question is what tier.

A solo founder on a single MacBook with automatic OS updates and built-in malware protection (XProtect on macOS, Windows Defender on Windows) may be adequately protected without additional tools.

Everyone else needs at minimum a managed endpoint protection platform.

## Options by budget tier

### Free / Built-in

**Windows Defender (built into Windows)**
- Included with Windows 10/11. No additional cost.
- Decent detection rates in independent tests. Has improved significantly since the Windows 7 era.
- Centralized management requires Microsoft Intune or Group Policy. The free, standalone version has no admin console.
- Good fit: Very small Windows-only shops with no compliance requirements.
- Weak spot: No cross-platform support. No central visibility without additional Microsoft licensing.

**macOS XProtect and Gatekeeper (built into macOS)**
- Included with macOS. Provides baseline malware detection and app notarization checks.
- No centralized management, no alerting, no reporting. You cannot prove to an auditor that it is running.
- Good fit: Acceptable as a secondary layer. Not sufficient as your only endpoint protection.

### Low Cost ($2-10/device/month)

**Bitdefender GravityZone, Malwarebytes, Webroot**
- Traditional antivirus vendors with cloud management consoles.
- Signature-based detection plus some behavioral analysis.
- Good fit: Organizations that need basic malware protection with central visibility and reporting.
- Weak spot: These are antivirus products, not full EDR platforms. They detect known malware but provide limited investigation capabilities when something is found.

### Moderate Cost ($5-15/device/month)

**Microsoft Defender for Business / Defender for Endpoint**
- The managed, enterprise version of Windows Defender. Adds behavioral detection, threat hunting, vulnerability management, and centralized reporting.
- Included with Microsoft 365 Business Premium licensing, which many organizations already have.
- Cross-platform: supports Windows, macOS, Linux, iOS, Android.
- Good fit: Organizations already invested in Microsoft 365. The bundling makes it one of the most cost-effective options.
- Weak spot: The admin experience is complex. Microsoft's security portal has dozens of menus. Tuning alerts takes effort.

**CrowdStrike Falcon (entry tier)**
- Cloud-native EDR. Lightweight agent. Strong detection capabilities.
- Good fit: Organizations that want best-in-class detection without on-premise infrastructure.
- Weak spot: Pricing adds up quickly across a large fleet. Some features require higher tiers.

**SentinelOne (entry tier)**
- Competitor to CrowdStrike with similar architecture. Includes automated remediation (rollback of ransomware changes).
- Good fit: Organizations that want automated response capabilities.
- Weak spot: The management console is powerful but complex. Smaller teams may find it overwhelming.

### Enterprise ($10-25+/device/month)

**CrowdStrike Falcon Complete, SentinelOne Vigilance**
- Managed detection and response bundled with the EDR platform. The vendor's SOC team monitors your endpoints and escalates real threats.
- Good fit: Organizations that want EDR capabilities without building an internal security operations team.
- Weak spot: Cost. At $15-25/device/month, a 100-person organization spends $18,000-30,000/year on endpoint protection alone.

## What MDM adds

Endpoint protection stops malware. MDM (Mobile Device Management) enforces security configuration: full-disk encryption, screen lock timeout, software update policies, and the ability to remotely wipe a lost device.

An endpoint protection tool without MDM leaves configuration gaps. An MDM without endpoint protection leaves detection gaps. Most organizations need both.

Common MDM platforms:
- **Apple Business Manager + MDM** (Kandji, Jamf, Mosyle): Required for managing macOS and iOS devices at scale. Prices range from $3-10/device/month.
- **Microsoft Intune**: Included with Microsoft 365 Business Premium and higher tiers. Manages Windows, macOS, iOS, and Android.
- **Google Workspace endpoint management**: Basic MDM included with Google Workspace. Sufficient for enforcing encryption and screen lock on ChromeOS and mobile devices. Limited for macOS and Windows.

## How to evaluate

1. **Test detection on your actual environment.** Run the evaluation agent on a representative set of devices for at least two weeks. Check for performance impact, false positives, and compatibility with your software stack.

2. **Verify reporting meets audit requirements.** Can you generate a report showing all endpoints have protection enabled, are up to date, and have not had recent detections? This is what an auditor asks for.

3. **Check cross-platform coverage.** If you have a mix of Windows, macOS, and Linux, verify the platform supports all three. Many tools that work well on Windows are second-class on macOS.

4. **Test the uninstall and migration process.** You will eventually switch endpoint protection vendors. How painful is removal? Some agents require manual intervention on every device to uninstall.

5. **Evaluate alert quality, not just detection rates.** A tool that blocks everything generates no alerts. A tool that alerts on everything generates noise. Ask existing customers how many alerts they handle per week and how many are actionable.

## Common mistakes

**Buying EDR without the staff to operate it.** An EDR platform alerts you to suspicious PowerShell execution, unusual process chains, and lateral movement attempts. Someone needs to investigate these alerts. If that person does not exist, you bought a very expensive notification that nobody reads. Consider a managed service if you do not have in-house security staff.

**Relying on built-in OS protection for compliance.** XProtect and Windows Defender (standalone) provide no central reporting. When an auditor asks "prove all your endpoints have malware protection enabled," you cannot answer that question with built-in tools alone. You need a managed platform with a compliance dashboard.

**Ignoring mobile devices.** Employees access company email, Slack, and documents from personal phones. If your endpoint protection strategy only covers laptops, you have a gap. MDM with basic security policies covers mobile devices at minimal additional cost.

**Deploying without a response plan.** Your EDR detects ransomware encrypting files. What happens next? If the answer is "someone gets an email," you need a documented incident response procedure. Detection without response is monitoring, not protection.

**Overlooking Linux servers.** Many organizations protect workstations but leave production Linux servers unprotected. Attackers who compromise a Linux server through an application vulnerability encounter no endpoint detection. Modern EDR platforms support Linux. Use that capability.
