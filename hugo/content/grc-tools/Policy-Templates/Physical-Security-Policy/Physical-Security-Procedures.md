# Physical Security - Implementation Procedures

Document Title: Physical Security - Implementation Procedures
Parent Policy: Physical Security Policy (PHY-001)
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

---

## Purpose

This document provides step-by-step procedures for implementing the Physical Security Policy. It covers secure area setup, access control management, clean desk enforcement, workstation security, visitor management, alarm systems, and off-site equipment handling - with practical alternatives and common pitfalls to help teams maintain a verifiably secure physical environment.

---

## Standard Approach - Secure Area Implementation

### Phase 1: Define and Configure Secure Areas

**Step 1 - Classify Each Physical Space**

Walk the facilities with the Facilities Manager and Security Officer. Classify each room/area:

| Classification | Criteria | Examples |
|---|---|---|
| **Public** | Open to visitors and non-Personnel without escort | Lobby, reception, public meeting rooms |
| **General** | Accessible to all Personnel; visitors allowed with escort | Open-plan offices, break rooms, hallways |
| **Secure** | Restricted to authorized Personnel only; enhanced controls required | Server rooms, network closets, executive offices, HR file rooms, labs with sensitive equipment |

Document the classification of each space on the facility floor plan. Post classification signage as appropriate.

**Step 2 - Establish Access Control for Secure Areas**

For each secure area:

1. **Select the access control mechanism:**
  - **Badge readers:** Proximity card, smart card, or mobile credential. Each badge uniquely identifies the individual.
  - **Biometric readers:** Fingerprint, iris, or facial recognition for high-security areas.
  - **Smart locks with PIN:** Acceptable for low-traffic secure areas (e.g., individual offices); PINs must be unique per individual, not shared.

2. **Wire the door for fail-safe operation:**
  - In a power failure, doors must default to a state that permits safe egress (fail-safe, not fail-secure) per fire code.
  - Ensure the access control system is on UPS/battery backup so it continues to log access events during power interruptions.

3. **Configure access logging:** The access control system must log every access event - individual identity, door, timestamp, and access granted/denied. Logs must be retained for at least `____` months and forwarded to the centralized logging platform (or equivalent for physical access).

**Step 3 - Establish Access Authorization Process**

Create a documented process for granting access to secure areas:

1. **Request:** Individual or their manager submits an access request specifying the secure area(s) and business justification.
2. **Approval:** Area owner or Security Officer approves. Approval is documented in the access management system.
3. **Provisioning:** Facilities or IT adds the individual to the access group for the door(s). Badge is programmed with the new access rights.
4. **Verification:** Individual tests access at the door. Confirmation logged.
5. **Documentation:** Access grant recorded in the access registry with: individual, area(s), approving authority, date, and expiration (if temporary).

**Step 4 - Implement Access Reviews**

Per policy, access lists for secure areas must be reviewed quarterly:

1. **Export the access list** from the access control system for each secure area.
2. **Send to area owners:** Each area owner reviews the list and confirms each individual still has a legitimate business need. Flag any individuals who should be removed.
3. **Check for terminated Personnel:** Cross-reference with HR termination records. Any terminated individual's access must be revoked within `____` hours. Run this cross-reference automatically if the access control system integrates with the HRIS.
4. **Remove unnecessary access** within `____` business days of the review.
5. **Document the review:** Date, reviewer, access removals, and any exceptions granted.

---

### Phase 2: Badge and Credential Management

**Step 5 - Issue Identification Badges**

Every Person must be issued an organization identification badge. Procedures:

1. **Photo capture:** Take a photo at onboarding or have the individual submit a compliant photo.
2. **Badge production:** Print the badge with: full name, photo, organization name, badge number. Include a visual indicator of access level (color coding or clearance marking) if the organization uses tiered access.
3. **Badge activation:** Encode the badge with the individual's access rights. Test at a badge reader.
4. **Badge delivery:** Issue the badge in person. Have the individual sign an acknowledgment of the badge policy (lost badge reporting, visible wear requirement, no sharing).
5. **Temporary badges for visitors and contractors:** Use a distinct visual design (different color, "VISITOR" or "CONTRACTOR" marking). Temporary badges must include an expiration date and are collected upon departure.

**Step 6 - Handle Lost or Stolen Badges**

When a badge is reported lost or stolen:

1. **Deactivate immediately:** The individual reports the loss to the Security Officer or Facilities (contact: `____`). The badge is deactivated in the access control system within `____` hours of the report.
2. **Issue a temporary replacement:** Provide a temporary badge valid for `____` days while a permanent replacement is produced.
3. **Investigate:** Review access logs for the deactivated badge going back `____` days to check for unauthorized use.
4. **Produce permanent replacement:** Issue a new badge with a new badge number and re-encode access rights.
5. **For keys (physical locks):** If physical keys to secure areas are lost or stolen, the lock must be rekeyed within `____` days. All key holders for that lock must receive new keys.

**Step 7 - Offboard Badge and Access**

When Personnel depart (termination, resignation, contract end):

1. **Collect the badge** on the individual's last day (or remotely: require badge return via tracked mail within `____` days).
2. **Deactivate all access** in the access control system within `____` hours of departure. This applies even if the badge hasn't been physically recovered.
3. **Collect all physical keys.** Update the key registry.
4. **If the badge is not returned:** Treat as a lost badge (Step 6). Deactivate immediately. Document the non-return.

---

### Phase 3: Clean Desk Enforcement

**Step 8 - Communicate the Clean Desk Policy**

Ensure all Personnel understand the clean desk requirements:

- **End of day:** Restricted and Confidential documents must be removed from desks and locked in drawers or cabinets.
- **When stepping away:** Computer workstations must be locked (Windows: Win+L, Mac: Control+Command+Q, Linux: Ctrl+Alt+L or equivalent).
- **After meetings:** Whiteboards containing Restricted or Confidential information must be erased.
- **After printing/copying/faxing:** Sensitive documents must be collected immediately; never left in output trays.
- **Credentials:** Passwords, PINs, and access badges must never be left in plain view or unattended.

Post reminders in common areas. Include clean desk expectations in the onboarding checklist and annual security awareness training.

**Step 9 - Conduct Clean Desk Audits**

Schedule clean desk audits (recommended: quarterly, unannounced):

1. **Audit team:** Two-person team (one from Security/Facilities, one from the department being audited).
2. **Walk the floor after hours:** Check each desk, office, and common area.
3. **Checklist:**
  - [ ] Any Restricted or Confidential documents left on desks?
  - [ ] Whiteboards with sensitive information not erased?
  - [ ] Workstations unlocked? (Lightly tap spacebar - if the screen wakes to a desktop, it's unlocked.)
  - [ ] Passwords or credentials visible? (Sticky notes, whiteboards, under keyboards.)
  - [ ] Printers/copiers with sensitive documents in output trays?
  - [ ] Badges left unattended?

4. **Document findings:** Photograph violations (with sensitive content redacted or obscured) for evidence. Record: location, type of violation, date/time.
5. **Escalate repeat violations:** First offense: reminder and education. Second offense: notice to manager. Third+ offense: formal policy violation per compliance framework.

**Step 10 - Automate Workstation Locking**

Reduce reliance on human memory:

- **Group Policy (Windows):** Configure screen saver timeout to `____` minutes with password protection on resume. Consider lower timeout for sensitive roles (5 minutes or less).
- **MDM (Mac):** Push a configuration profile enforcing screen lock after `____` minutes of inactivity.
- **Endpoint management (Linux):** Configure `logind.conf` with `HandleLidSwitch=lock` and `IdleAction=lock` and `IdleActionSec=____`.

---

### Phase 4: Workstation Security

**Step 11 - Configure Workstation Security Baseline**

All organization workstations must be configured with:

1. **Full-disk encryption:** Enabled and verified (BitLocker for Windows, FileVault for Mac, LUKS for Linux). Recovery keys must be escrowed in the device management platform - not stored locally.
2. **Host-based firewall:** Enabled, blocking all unsolicited inbound connections.
3. **Endpoint detection and response (EDR):** Installed and reporting to the management console.
4. **Automatic screen lock:** Configured as described in Step 10.
5. **Device management enrollment:** Workstation is enrolled in the organization's MDM/UEM platform (e.g., Jamf, Intune, Workspace ONE) and receiving configuration and security policies.

**Step 12 - Implement Privacy Screen Guidelines**

For Personnel whose screens may display sensitive information in view of unauthorized individuals:
- Issue privacy filters for laptop and desktop monitors.
- Configure workspaces so screens face away from windows, walkways, and visitor areas.
- In open-plan offices, arrange desks so that sensitive work is not visible from adjacent desks or common areas.

**Step 13 - Secure End-of-Day Workstation Practices**

Communicate and enforce end-of-day procedures:

- **Log off or shut down** workstations unless operational requirements dictate otherwise (e.g., long-running computations). Locking is the minimum; logging off is preferred as it terminates all active sessions.
- **Remove any external storage devices** (USB drives, external hard drives) and store them in a locked drawer or cabinet.
- **Close and lock** laptop lids. If the laptop is left at the desk overnight, use a cable lock secured to the desk.

---

### Phase 5: Visitor Management

**Step 14 - Establish the Visitor Intake Process**

All visitors must be processed through a standardized intake procedure:

1. **Pre-registration (preferred):** The hosting employee registers the visitor at least `____` business days in advance. Registration includes: visitor name, organization, purpose of visit, dates/times, host name, and areas to be accessed.
2. **Day-of check-in:** Visitor arrives at the designated entrance. Reception verifies identity (government-issued ID or equivalent). Visitor signs in on the visitor log.
3. **Badge issuance:** Visitor receives a visitor badge (visually distinct from Personnel badges). The badge includes the date and "ESCORT REQUIRED" marking.
4. **Escort:** The host (or designated escort) meets the visitor and accompanies them at all times while on premises. The visitor must never be left unescorted in a secure area.
5. **Check-out:** Upon departure, the visitor signs out on the visitor log. The visitor badge is collected.

**Step 15 - Maintain and Review Visitor Logs**

The visitor log must capture:
- Visitor name and organization
- Purpose of visit
- Date and time in / out
- Host name
- Areas accessed

Logs are maintained at the reception desk (physical book or digital kiosk) and retained for `____` months. Logs are reviewed monthly by the Security Officer for anomalies: after-hours visits, unexpectedly long visits, visits to areas inconsistent with stated purpose.

---

### Phase 6: Alarm Systems

**Step 16 - Deploy Alarm Systems**

For facilities housing sensitive information or critical infrastructure:

1. **Intrusion detection:** Door contact sensors on all perimeter doors and secure area doors. Motion detectors covering hallways and open areas after hours. Glass-break sensors on ground-floor windows.
2. **Environmental monitoring:** Smoke and heat detectors, water leak sensors, temperature/humidity sensors in server rooms.
3. **Central monitoring:** Alarm system connected to a 24/7 monitoring service or internal security operations center. The monitoring service must have current contact information for responsible Personnel.

**Step 17 - Test Alarm Systems**

Test quarterly (or per policy frequency):

1. **Coordinate:** Schedule the test with the monitoring service to avoid dispatching law enforcement.
2. **Test each sensor type:** Trigger at least one door contact, one motion detector, and (if present) one environmental sensor. Verify the monitoring service receives the signal.
3. **Test communication paths:** Verify the alarm system can communicate with the monitoring service via primary and backup paths (cellular backup for landline, or equivalent).
4. **Document results:** Record date, sensors tested, results, any failures, and corrective actions.

**Step 18 - Respond to Alarm Malfunctions**

If the alarm system or any sensor malfunctions:

1. **Log the malfunction** with time, affected component, and symptoms.
2. **Implement compensating controls** while the system is impaired: increase guard patrol frequency, restrict access to affected areas, or station Personnel at the affected entry point.
3. **Repair within `____` hours.** Escalate if the repair deadline is at risk.
4. **Verify restoration** by testing the repaired component.

---

### Phase 7: Off-Site Equipment and Remote Work

**Step 19 - Authorize Equipment Removal**

Before equipment leaves the premises:

1. **Submit an equipment removal request** via the asset management system at `____`. Include: equipment asset tag, serial number, purpose, destination, expected return date, and responsible individual.
2. **Approval:** Manager or department head approves.
3. **Update asset inventory:** Record the equipment as "Off-Site" with the removal date, expected return date, and responsible individual.
4. **Brief the responsible individual** on their obligations: equipment must remain in their physical custody or secured (hotel safe, locked vehicle trunk) at all times; never left unattended in public spaces; lost or stolen equipment must be reported immediately.

**Step 20 - Secure Home Office and Remote Work Environments**

For Personnel working from home or remote locations with organizational assets:

1. **Provide guidance** on securing the home workspace:
  - Work in a private space where screens are not visible to others (family, roommates, visitors).
  - Lock the workstation when stepping away.
  - Store physical documents with sensitive data in a locked file cabinet or drawer.
  - Use a shredder for sensitive documents no longer needed.
  - Do not allow non-Personnel to use organization equipment.

2. **Verify through self-assessment or spot check:** Include remote work security in the annual security awareness training. Consider a self-assessment questionnaire for Personnel handling Restricted or Confidential data at home.

---

## Alternative Approaches

### 💡 Alternative 1 - Cloud-Based Access Control System

Instead of on-premises access control hardware and software, use a cloud-managed access control platform (e.g., Verkada, Brivo, Openpath). Cloud systems offer: remote management from anywhere, automatic software updates, built-in redundancy, and simplified integration with identity providers (SSO/SCIM for automatic provisioning and deprovisioning).

**Trade-off:** Recurring subscription cost vs. capital expenditure. Requires reliable internet connectivity at each facility. Data sovereignty considerations if access logs contain PII and must stay within a jurisdiction.

### 💡 Alternative 2 - Co-Working Space Security (No Dedicated Office)

For organizations without dedicated office space, physical security relies on the co-working provider. Your procedures shift to vendor management: ensure the co-working provider meets your security requirements through their SOC 2 or ISO 27001 certification. Supplement with: privacy screens on all laptops, cable locks for equipment in shared spaces, and locked storage for sensitive documents.

**Trade-off:** Less control over the physical environment. Stronger reliance on non-physical controls (full-disk encryption, remote wipe, VPN). Ensure the co-working contract includes security obligations.

### 💡 Alternative 3 - Mantrap / Anti-Tailgating Entry

For high-security facilities, deploy a mantrap (interlocking door system) at the main entrance to prevent tailgating. The mantrap enforces one-person-at-a-time entry. Integrate with the access control and camera system to log and record every entry.

**Trade-off:** Higher cost, reduced throughput (slower entry during peak times), accessibility considerations. Reserved for facilities where tailgating risk justifies the investment (data centers, research labs, financial operations centers).

---

## Common Pitfalls

### ⚠️ Pitfall 1 - Propped-Open Doors

**Symptom:** Personnel prop open secure doors for "just a minute" (to carry equipment through, step out for a smoke, get fresh air). A door stop, rock, or piece of cardboard keeps the door from latching.

**Why It's Dangerous:** A propped-open secure door completely bypasses the access control system. Anyone can enter. This is one of the most common physical security failures in real-world breaches and penetration tests.

**How to Avoid:** Install door position sensors that trigger an audible alarm (and a security alert) when a secure door is held open for more than `____` seconds. The goal is to make propping more annoying than using the badge reader. Include "no propping doors" in security awareness training with real photos of the consequences.

### ⚠️ Pitfall 2 - Tailgating Culture

**Symptom:** A Person badges through a secure door, and three others follow without badging because it feels rude to close the door on colleagues. The access control system records one entry for four people.

**Why It's Dangerous:** Untailgated individuals are not logged. If an incident occurs, you can't account for who was in the secure area. An attacker in professional attire can easily tailgate in without ever presenting credentials.

**How to Avoid:** Organizational culture is the primary control - make it clear that challenging tailgaters is expected, not rude. Train Personnel: "If you don't recognize someone behind you, let the door close and let them badge in." Consider turnstiles or optical turnstiles for high-traffic entrances, which physically enforce one-person-per-credential.

### ⚠️ Pitfall 3 - The Inactive Badge That Still Works

**Symptom:** A Person's access is "revoked" in the HR system upon termination, but the badge deactivation wasn't propagated to the access control system. The badge still opens doors. Nobody discovers this until the next quarterly review.

**Why It's Dangerous:** The gap between HR termination and access control deactivation is a window where a terminated individual - potentially disgruntled - can access secure areas. In high-profile cases, terminated employees have used this window to steal data, sabotage equipment, or cause harm.

**How to Avoid:** Automate the HR-to-access-control deactivation. If the access control system integrates with the HRIS (via SCIM, LDAP, or API), deactivation should happen within minutes of the termination record being entered. If manual, the termination checklist must include "deactivate physical access" as the first item, completed within `____` hours. Verify deactivation by checking the access control system, not just trusting the HR record.

### ⚠️ Pitfall 4 - Unmonitored Cameras

**Symptom:** Cameras cover all secure area entry points, but nobody reviews the footage unless an incident is reported. Meanwhile, the camera over the server room door has been pointed at the ceiling for a month because a contractor bumped it.

**Why It's Dangerous:** Camera coverage that isn't monitored or maintained provides false assurance. If an incident occurs and the footage is found to be unavailable or unusable, the investigation is compromised. The camera system becomes security theater.

**How to Avoid:** Weekly automated check: verify each camera is online, recording, and has not been moved (compare current frame to baseline). The system should generate an alert for any camera that goes offline or has a significant change in field of view. Spot-check random footage weekly to verify quality. If full-time monitoring isn't feasible, at minimum ensure the recording is functional so it's available for post-incident review.

### ⚠️ Pitfall 5 - Ignoring the Clean Desk Policy After Hours

**Symptom:** The clean desk policy is communicated during onboarding and mentioned in annual training, but nobody enforces it. After-hours walkthroughs find sensitive documents on desks, unlocked workstations, and credentials on sticky notes - every time.

**Why It's Dangerous:** After-hours cleaning staff, maintenance workers, and visitors who stay late have access to unattended sensitive information. A single photographed document can be a significant data breach. Unlocked workstations provide network access without authentication.

**How to Avoid:** Enforcement is the difference between a policy that works and one that's ignored. Conduct genuine after-hours audits (not announced in advance). Report aggregate statistics to department heads: "Last quarter, your department had 12 clean desk violations out of 3 audits." Tie clean desk compliance to management accountability. Make it easier to comply than to violate - provide lockable storage at every desk.

---

## Quick Reference: Daily Security Walkthrough Checklist

For facilities staff or security personnel conducting a daily end-of-day walkthrough:

- [ ] All external doors secured and locked
- [ ] Secure area doors closed and latched (not propped)
- [ ] All Personnel workstations locked or logged off (check random sample)
- [ ] No Restricted or Confidential documents left on desks (spot-check)
- [ ] Whiteboards in secure meeting rooms erased
- [ ] Printers/copiers clear of sensitive documents
- [ ] Visitor badges collected, visitors departed
- [ ] Alarm system armed
- [ ] Any anomalies logged and reported

---

## Related Documents

- Physical Security Policy (PHY-001)
- Information Security Policy
- Asset Management Policy
- Acceptable Use Policy
- Incident Response Policy
- Data Classification Policy

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ____ | ____ | Initial version - extracted implementation procedures from Physical Security Policy. |
