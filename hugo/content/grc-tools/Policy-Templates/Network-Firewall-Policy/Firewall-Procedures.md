# Firewall - Implementation Procedures

Document Title: Firewall - Implementation Procedures
Parent Policy: Network Firewall Policy (NFW-001)
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

---

## Purpose

This document provides step-by-step procedures for managing firewall infrastructure in compliance with the Network Firewall Policy. It covers ruleset management (request, approval, implementation, review, and cleanup), firewall deployment, administrative access controls, and cloud firewall governance - with practical alternatives and common pitfalls.

---

## Standard Approach - Ruleset Lifecycle Management

### Phase 1: Firewall Rule Request and Approval

**Step 1 - Submit the Firewall Rule Request**

All firewall rule changes must originate from a formal request. The requestor (typically a system owner, developer, or business stakeholder) submits a request through the change management system at `____` containing:

| Field | Required Value |
|---|---|
| **Business Justification** | Clear explanation of why this rule is needed, referencing the specific application, service, or business process. "We need to allow port 443" is insufficient - explain WHY. |
| **Source** | Specific IP address(es), CIDR range(s), hostname(s), or security group(s). "Any" is prohibited without documented exception. |
| **Destination** | Specific IP address(es), CIDR range(s), hostname(s), or security group(s). "Any" is prohibited without documented exception. |
| **Protocol / Port(s)** | TCP, UDP, ICMP, or other; specific port or port range. |
| **Expected Duration** | Permanent (ongoing business need) OR temporary with an explicit expiration date. |
| **System Owner Approval** | Approval from the owner of the destination system. |
| **Change Ticket Reference** | Link to the associated change management ticket. |

**Step 2 - Security Review and Approval**

The request is routed to the Network Security Engineer (or designated firewall administrator) for review:

1. **Least Privilege Check:** Is the requested access the minimum necessary? Can the source be scoped more tightly? Can the ports be narrowed? Example: if the request is for "any web server on port 443," ask whether it should be limited to specific servers.
2. **Policy Compliance Check:** Does this rule conflict with any existing policy? Does it introduce a compliance risk (e.g., allowing inbound administrative protocols from the internet)?
3. **Risk Assessment:** If the rule would expose a previously internal service to external access, does this trigger a risk assessment per the Risk Assessment Policy?
4. **Conflict Check:** Does this rule duplicate or conflict with an existing rule? Would it be shadowed by a more general rule?

The reviewer may approve, deny, or request modification. Approvals must be documented - never act on verbal instructions alone.

**Step 3 - Document the Rule Before Implementation**

Before touching the firewall, document the planned rule in the firewall ruleset documentation (maintained at `____`):

```
Rule ID: FW-____
Business Justification: ____
Source: ____
Destination: ____
Protocol/Port: ____
Action: Allow / Deny
Duration: Permanent / Temporary (expires: ____)
Approver: ____
Approval Date: ____
Change Ticket: ____
```

This documentation serves as the source of truth for subsequent ruleset reviews.

---

### Phase 2: Firewall Rule Implementation

**Step 4 - Backup Current Configuration**

Before making any change, back up the current firewall configuration:

- **Physical/Virtual Appliances:** Export the running configuration to a secure backup location. Use the firewall's built-in backup or SCP the configuration file.
- **Cloud Security Groups / NACLs:** Export the current ruleset via CLI (`aws ec2 describe-security-groups`, `az network nsg show`, `gcloud compute firewall-rules list`) or infrastructure-as-code (pull the current state).
- **Store the backup with a timestamp and the change ticket reference.**

Naming convention: `firewall-backup-<device>-YYYY-MM-DD-HHMM-before-<ticket>.cfg`

**Step 5 - Implement the Rule**

**Physical/Virtual Firewalls (e.g., Palo Alto, Fortinet, pfSense, iptables/nftables):**

1. Access the firewall management interface via the secure administrative path (management network or VPN - never directly from the internet).
2. Enter the ruleset for the relevant zone or interface.
3. Place the rule in the correct position: specific rules before general rules. Do not append to the end - determine the right position based on rule ordering logic.
4. Add a comment/description on the rule containing the change ticket reference and business justification summary.
5. For temporary rules, set the expiration/schedule if the firewall platform supports it. If not, create a calendar reminder for manual removal.

**Cloud Firewalls (Security Groups, NACLs):**

1. If using infrastructure-as-code (IaC) - the preferred method - modify the Terraform/CloudFormation/Pulumi/Ansible configuration and apply via the standard IaC pipeline.
2. If using the cloud console or CLI (acceptable for emergency changes only), document the change and ensure it's back-ported to IaC within `____` business days.
3. Add a description/tag to the rule containing the change ticket reference.

**Step 6 - Validate the Change**

After implementation:

1. Verify the rule appears in the running configuration with correct source, destination, protocol/port, action, and position.
2. Run a connectivity test from the source to the destination on the specified port (if safe and feasible):
   ```bash
   # TCP port test
   nc -zv <destination> <port>
   # Or from PowerShell
   Test-NetConnection <destination> -Port <port>
   ```
3. Verify that only the intended traffic is permitted (no unintended access). If possible, test a denied connection to confirm the rule isn't overly permissive.
4. Check the firewall logs to confirm the new rule is logging traffic as expected.

**Step 7 - Backup Post-Change Configuration**

Back up the configuration after the successful change:

```
firewall-backup-<device>-YYYY-MM-DD-HHMM-after-<ticket>.cfg
```

Store both before and after backups. This enables rollback if the change causes issues and provides evidence of the exact change for audits.

---

### Phase 3: Firewall Ruleset Review

**Step 8 - Schedule the Quarterly Review**

Per policy, all firewall rulesets must be reviewed at least `____` (quarterly). Schedule a recurring review session with the Network Security Engineer and relevant system owners. Prepare for the review by:

1. Exporting the current ruleset from all firewalls (perimeter, internal segmentation, cloud security groups, host-based).
2. Pulling the ruleset documentation (the documented rules with business justifications).
3. Pulling the change management log for the review period.

**Step 9 - Conduct the Review**

For each rule in the ruleset, answer:

| Review Question | If NO, Action |
|---|---|
| Does this rule have a documented business justification? | Flag for investigation: authorize or remove |
| Is the business justification still valid? (Contact the system owner.) | Flag for removal if no longer needed |
| Is the rule as specific as possible (no unnecessary "any-to-any" entries)? | Flag for tightening |
| For temporary rules: has the expiration date passed? | Remove immediately |
| Is the rule in the correct position within the ruleset? | Reorder |
| Is the rule shadowed by a more general rule, making it ineffective? | Either remove the shadowed rule or reorder |
| Is this rule logging traffic? | Reconfigure if logging is missing |
| Does the documented rule match the actual rule? | Resolve discrepancy |

**Step 10 - Document and Act on Findings**

Record all review findings in a review report at `____`. For each finding:

- **Rule to be removed:** Submit a change ticket and remove within `____` business days.
- **Rule to be tightened:** Submit a change ticket with the tighter specification.
- **Missing documentation:** Create or update the documentation.
- **Rule to be reordered:** Assess impact, submit change ticket, reorder during a maintenance window if the reorder could temporarily affect traffic flow.

The review report must be signed by the reviewer and retained for `____` years as audit evidence.

---

### Phase 4: Rule Cleanup and Maintenance

**Step 11 - Remove Expired Temporary Rules**

At least monthly, run an automated scan (or manual check) for temporary rules past their expiration date. Remove or disable them immediately. This can be automated:

```python
# Example: script to identify expired temporary rules in cloud security groups
# and generate a removal report
# (Pseudocode - implement using boto3, Azure SDK, or GCP SDK)
for rule in get_all_firewall_rules():
    if rule.is_temporary and rule.expiration_date < today:
        report_expired(rule)
        # Optionally auto-disable if safe
```

**Step 12 - Clean Up Stale Rules**

During each quarterly review (and ad-hoc as noticed), identify rules that:
- Have zero hit counts over the past `____` days (check firewall logs or hit counters)
- Reference decommissioned systems or IP addresses
- Were created for projects, tests, or migrations that are now complete

Submit a change ticket to remove each stale rule. **Don't let the ruleset accumulate dead rules.** They increase the attack surface and make reviews harder.

---

### Phase 5: Firewall Deployment and Hardening

**Step 13 - Deploy a New Firewall**

When deploying a new firewall (perimeter, host-based, WAF, cloud):

1. **Establish default-deny posture:** Configure the default rule to deny all traffic (inbound and outbound, as appropriate for the firewall role).
2. **Add only approved rules** from the documented ruleset. Do not carry over legacy rules from an old firewall without re-reviewing each one.
3. **Harden management access:** Disable management interfaces on untrusted networks. Enable MFA for administrative access. Configure logging for all administrative actions.
4. **Configure log forwarding:** Forward firewall logs to the centralized logging platform / SIEM at `____`. Log at minimum: all denied connections, all allowed connections, all administrative access, and all system events.
5. **Configure NTP:** Synchronize the firewall clock with the organization's NTP infrastructure.
6. **Test:** Run penetration testing and connectivity verification. Ensure logging is being received at the SIEM.
7. **Document:** Add the new firewall to the asset inventory and network diagram. Document its rules in the ruleset documentation.

**Step 14 - Harden Host-Based Firewalls**

On all servers and workstations:

- **Linux (iptables/nftables/ufw):** Ensure the host firewall is enabled and blocks all unsolicited inbound connections. Only allow inbound connections on ports explicitly required for the server's role (e.g., 443 for a web server, 22 from management network only).
- **Windows:** Ensure Windows Defender Firewall is enabled for all profiles (Domain, Private, Public). Block inbound by default. Configure outbound restrictions for production servers.
- **macOS:** Ensure the built-in firewall is enabled (System Settings → Network → Firewall). For managed Macs, enforce via MDM profile.

**Step 15 - Deploy and Tune the WAF**

For web application firewalls in front of public-facing applications:

1. Start in **detection-only mode** (log but don't block) for `____` days to establish a baseline and tune out false positives.
2. Enable OWASP Top 10 rule sets (SQL injection, XSS, CSRF, path traversal, command injection, etc.).
3. After the tuning period, switch to **blocking mode**.
4. Configure WAF logs to forward to the SIEM.
5. Create alerts for WAF blocking events exceeding normal volume (potential active attack).
6. Schedule quarterly WAF rule reviews parallel to network firewall reviews.

---

## Alternative Approaches

### 💡 Alternative 1 - Infrastructure-as-Code (IaC) for All Firewall Rules

Manage all firewall rules (cloud and on-premises) through infrastructure-as-code: Terraform, Pulumi, CloudFormation, or Ansible. All rule changes go through the standard code review and CI/CD pipeline. No one touches the firewall console directly.

**Implementation:** Define firewall rules in version-controlled IaC repositories. Changes are proposed via pull request, reviewed by a peer (and the security team for sensitive rules), tested in a staging environment, and deployed through the CI/CD pipeline.

**Trade-off:** Higher initial investment in codifying existing rules. Slower for emergency changes (you'll need a documented emergency bypass process - use it, but audit it). Dramatically improves consistency, auditability, and the ability to rebuild the firewall configuration from source.

### 💡 Alternative 2 - Automated Ruleset Analysis Tools

Use automated tools to analyze firewall rulesets: FireMon, AlgoSec, Tufin, or open-source alternatives like Nipper. These tools can identify shadowed rules, overly permissive rules, unused rules, and compliance violations automatically.

**Trade-off:** Cost for commercial tools; open-source alternatives require more manual setup. Most valuable when you have 50+ rules across multiple firewalls, making manual review error-prone.

### 💡 Alternative 3 - Zero Trust Network Architecture

Move beyond perimeter firewalls to a Zero Trust model: micro-segmentation, identity-aware proxies, and software-defined perimeters. In this model, the firewall is less about network boundaries and more about per-application, per-session access policies enforced by a policy engine.

**Trade-off:** Major architectural change. Requires application-level authentication for all services. Most practical for greenfield deployments; challenging to retrofit onto legacy applications. Reduces reliance on traditional firewall rulesets while requiring investments in identity, policy engine, and monitoring infrastructure.

---

## Common Pitfalls

### ⚠️ Pitfall 1 - The "Temporary" Rule That Never Dies

**Symptom:** A rule was added "temporarily" for a vendor demo, a migration, or a troubleshooting session. Six months later, it's still there. Nobody remembers why, and nobody wants to remove it "just in case."

**Why It's Dangerous:** Temporary rules often bypass normal review rigor ("it's only for a week"). They accumulate and create undocumented, unmanaged access paths. Attackers specifically look for these forgotten rules because they're likely to be overly permissive and unmonitored.

**How to Avoid:** Every temporary rule must have an explicit, system-enforced expiration date. The firewall platform or an automated script must alert on (or automatically disable) expired rules. During quarterly reviews, "temporary" rules past expiration are removed without further discussion.

### ⚠️ Pitfall 2 - Ruleset Review That Only Looks at the Firewall

**Symptom:** The quarterly ruleset review pulls the running configuration from the firewall, checks it against the documentation, and declares success. But it never verifies whether the documented business justifications are still valid - is that vendor still engaged? Is that application still running? Does that developer still need access?

**Why It's Dangerous:** The documentation matches reality, but the reality is wrong. Rules persist for systems, vendors, and people that no longer exist. The documentation-reality feedback loop is closed but detached from business reality.

**How to Avoid:** Each quarterly review must include validation with system owners. Send a list of rules to each owner: "Do you still need this access?" Require a response. If no response within `____` business days, the rule is flagged for removal. This is the "ruleset re-certification" step that validates both documentation and business need.

### ⚠️ Pitfall 3 - Overly Permissive Cloud Security Groups

**Symptom:** Cloud security groups have "0.0.0.0/0" (any IPv4) or "::/0" (any IPv6) as the source for inbound rules on common ports (22, 3389, 443, 3306). The team assumes "it's fine, we have other controls."

**Why It's Dangerous:** Cloud security groups are perimeter controls. A wide-open security group on SSH (port 22) means anyone on the internet can attempt to connect and brute-force credentials. Even with strong authentication, you've increased the attack surface unnecessarily.

**How to Avoid:** Security group sources should be as specific as possible: known office IP ranges, VPN concentrator IPs, specific security group IDs. Configure CSPM (Cloud Security Posture Management) rules to alert on any security group rule with a source of 0.0.0.0/0 or ::/0 for sensitive ports. Make it a blocking finding in the quarterly review.

### ⚠️ Pitfall 4 - Egress Blindness

**Symptom:** Inbound rules are carefully managed and reviewed. Outbound rules are an afterthought - typically "allow all" from internal networks. Nobody monitors outbound traffic for command-and-control communication, data exfiltration, or crypto-mining activity.

**Why It's Dangerous:** If an attacker compromises an internal system, unrestricted outbound access gives them a clear channel to exfiltrate data, establish persistence, or communicate with their command infrastructure. The perimeter firewall's primary value at that point is nullified.

**How to Avoid:** Implement egress filtering. Production servers should only be allowed to connect to explicitly required external destinations on required ports. Integrate threat intelligence feeds to block outbound connections to known malicious IPs. Log and alert on unusual outbound data volumes or connections to rare destinations.

### ⚠️ Pitfall 5 - Cloud vs. On-Premises Firewall Silos

**Symptom:** The on-premises firewall ruleset is reviewed quarterly. Cloud security groups and NACLs are managed by a different team using a different process and a different review cadence. Nobody has a unified view of the organization's entire network boundary.

**Why It's Dangerous:** Gaps at the cloud boundary are invisible to the team reviewing the on-premises boundary. An attacker who can't get through the on-premises firewall may find a wide-open cloud security group.

**How to Avoid:** Cloud firewall constructs must be included in the same quarterly ruleset review. The review report must cover all boundaries. If different teams manage on-premises and cloud firewalls, the review is a joint exercise. Use IaC to enforce consistency - the same review process applies to a PR touching a cloud security group as to a change ticket for an on-premises rule.

---

## Quick Reference: Firewall Change Request Checklist

- [ ] Business justification clearly documented
- [ ] Source specified as narrowly as possible (no "any" without exception)
- [ ] Destination specified as narrowly as possible
- [ ] Protocol and port(s) explicitly listed
- [ ] Duration specified (Permanent or Temporary with expiration date)
- [ ] Destination system owner has approved
- [ ] Change ticket created and linked
- [ ] Rule documented in ruleset documentation before implementation
- [ ] Configuration backed up before change
- [ ] Rule added in correct position in ruleset
- [ ] Rule tagged/commented with ticket reference
- [ ] Connectivity tested and verified
- [ ] Configuration backed up after change
- [ ] Logging confirmed for the new rule

---

## Related Documents

- Network Firewall Policy (NFW-001)
- Information Security Policy
- System Access Control Policy
- Encryption Policy
- Incident Response Policy
- Change Management Policy
- Disaster Recovery Plan
- Logging and Monitoring Policy

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version - extracted implementation procedures from Network Firewall Policy. |
