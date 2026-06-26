# Business Continuity Plan - Implementation Procedures

> **Companion to:** Business Continuity Plan (Template.md)
> **Purpose:** These procedures describe how to execute the recovery and testing requirements set forth in the Business Continuity Plan. The BCP defines WHAT must be done; this document describes HOW to do it. These procedures cover business operations recovery only; for IT system recovery, refer to the Disaster Recovery Plan and DR Procedures.

---

## Procedure 1: Work Site Recovery

### Standard Approach

This procedure covers the steps to transition personnel and operations when a physical work site becomes non-functional.

#### 1.1 Immediate Response (First 4 Hours)

1. **Safety First:** The Facilities and Personnel Safety Team Lead (`____`) confirms that all personnel at the affected site are accounted for and safe. Use the emergency contact list (maintained offline by team leads). If any personnel are unaccounted for, contact emergency services immediately.
2. **Site Assessment:** Determine the nature and expected duration of the disruption:
  - **Building access denied** (fire, gas leak, structural issue): expected duration `____` hours/days.
  - **Building destroyed or inaccessible long-term** (earthquake, flood, major fire): expected duration weeks to months.
  - **Utility failure** (power, water, internet): expected duration `____` hours. Check with utility providers for restoration estimates.
3. **Activation Decision:** The primary authority holder (or successor per the line of succession) decides whether to activate the BCP. For disruptions expected to exceed `____` hours, activation is mandatory.
4. **Notification Cascade:** Activate the notification sequence:
  - Executive Coordination Team Lead notifies all other team leads.
  - Each team lead notifies their team members using pre-established contact methods (messaging platform, SMS, phone tree).
  - The Communications Team Lead notifies all personnel via the organization-wide communication channel.
  - Record all notification timestamps in the event log.

#### 1.2 Transition to Remote Work

1. **Remote Work Enablement:**
  - Instruct all affected personnel to work from home or from the pre-designated secondary location (`____` address/location).
  - Verify that personnel have: a functional computer (corporate laptop or personal device with VPN), internet connectivity, and access to required systems.
  - For personnel who do not have a corporate laptop: the IT team ships or arranges pickup of loaner devices from `____` (IT inventory location).
2. **Connectivity Verification:**
  - IT Support verifies that VPN capacity is sufficient for the increased remote workforce. If not, provision additional VPN endpoints or enable split tunneling for non-sensitive traffic.
  - Verify that MFA, SSO, and identity provider are operational and accessible from remote locations.
  - Test connectivity to all critical business applications from a remote endpoint.
3. **Communication Cadence:**
  - The Communications Team sends an initial all-hands message within 1 hour of activation: what happened, what's being done, what personnel should do, and when the next update will come.
  - Establish a regular update cadence: `____` hours (recommended: every 4 hours during the first day, then twice daily).
  - Create a dedicated channel/category in the messaging platform for continuity event updates.

#### 1.3 Alternate Work Site Activation (If Remote Work Insufficient)

If certain roles cannot function remotely (e.g., physical security, hardware-dependent operations):

1. **Facilities Team** activates the pre-arranged alternate work site at `____` (address). Verify:
  - Power, water, HVAC are operational.
  - Internet connectivity is available (primary ISP: `____`, backup: `____`).
  - Workstations, phones, and essential equipment are functional.
  - Physical security controls (badge access, cameras) are active.
2. **Relocation Logistics:**
  - Arrange transportation for personnel who cannot drive to the alternate site.
  - If the alternate site is in a different city, arrange hotel accommodations for essential personnel.
  - Coordinate with HR for expense reimbursement guidelines during the continuity event.
3. **Minimum Viable Operations:** Identify the absolute minimum personnel and equipment needed at the alternate site. Everyone else works remotely. This reduces logistical complexity and cost.

#### 1.4 Distributed Workforce Assurance

Validate that critical business processes do not depend on physical presence:

1. **Process Audit:** Review each critical business process. If any process requires physical presence (e.g., signing physical checks, accessing a specific on-premises server), document a remote-capable alternative:
  - Physical checks → electronic payments or mail-to-sign workflows.
  - On-premises server → ensure remote access or migrate to cloud before a disruption occurs.
2. **Equipment Gaps:** Identify personnel who require specialized equipment (designers needing high-end workstations, finance needing check printers) and maintain a loaner inventory or cloud-based alternatives.

### Alternative Approaches

> **💡 Why you might choose differently:** Organizational size, geographic distribution, and industry constraints drive different recovery models.

- **Hot Site / Co-Location:** Organizations that cannot tolerate any downtime for on-premises operations may maintain a hot site - a fully equipped, ready-to-use alternate facility with replicated data. This is expensive (2x infrastructure cost) but provides near-zero RTO for facilities. Common in financial services and healthcare.
- **100% Remote-First Model:** Organizations already operating fully remote or hybrid may not need physical work site recovery. Focus instead on ensuring personnel have redundant internet (secondary ISP or cellular backup) and that cloud services are resilient. The BCP becomes primarily a communication and coordination plan.
- **Shared Recovery Facilities:** Multiple small/medium organizations can contract with a shared recovery facility provider (e.g., Sungard AS, Recovery Point) that maintains workstations, phones, and connectivity for multiple clients. This reduces cost but may create contention if a regional disaster affects multiple clients simultaneously.

### Common Pitfalls

> **⚠️ Watch out:** The "just work from home" assumption failing at scale. If a regional disaster affects home internet (power outage, ISP damage), remote work is not viable. Always have an alternate site option that is geographically separate - far enough that the same disaster won't affect both locations (typically 50+ miles for most natural disasters).

> **⚠️ Watch out:** Personnel contact lists that are only accessible from the intranet or a SaaS tool that requires authentication. During a disruption, personnel may not be able to access these. Team leads must maintain an offline copy (printed or on a personal device) of their team's contact information.

> **⚠️ Watch out:** Ignoring the psychological impact. A disaster that destroys the office is traumatic. Personnel may be dealing with personal losses, childcare disruptions, or displacement. The BCP must account for reduced capacity, extended response times, and the need for mental health support resources.

> **⚠️ Watch out:** Assuming key personnel are always available. During a regional disaster, key personnel may themselves be affected - evacuated, injured, or unreachable. The succession plan must be tested under the assumption that the top 2 people in each role may be unavailable.

---

## Procedure 2: Critical Service Recovery

### Standard Approach

This procedure covers the steps to maintain or restore customer-facing and revenue-generating business operations during a continuity event (non-IT-specific aspects; for IT recovery, see DR Plan & Procedures).

#### 2.1 Service Impact Assessment

1. **Identify Affected Services:** The Executive Coordination Team works with business unit leads to identify which customer-facing services are affected and the nature of the impact:
  - Service fully unavailable.
  - Service degraded (slower, partial functionality).
  - Service operational but dependent on a disrupted function (e.g., payments processing down but application still running).
2. **Customer Impact Quantification:**
  - Number of customers affected.
  - Revenue impact per hour/day of disruption.
  - Regulatory or contractual SLA impact.
  - Reputational risk (is this customer-visible or internal-only?).
3. **Prioritization:** Rank services for recovery based on: customer impact, revenue criticality, regulatory requirements, and dependencies (Service A must be restored before Service B).

#### 2.2 Customer Communication

1. **Status Page Update:** The Communications Team updates the public status page (`____` URL) within `____` minutes of confirming a customer-visible impact:
  - What service is affected.
  - What customers are experiencing.
  - What the organization is doing.
  - When the next update will be posted (specific time, not "soon").
  - If the cause is known and appropriate to share.
2. **Direct Customer Notification:** For critical services affecting a known set of customers:
  - Send direct email notification within `____` hours.
  - Include a point of contact for questions (support email or designated account manager).
  - If the disruption is expected to exceed `____` hours, schedule a customer briefing call.
3. **Support Channel Continuity:**
  - If the primary support channel (e.g., Zendesk, Intercom) is affected, activate the fallback: `____` (e.g., email alias, phone hotline, social media support).
  - Prepare a support team FAQ document so all support agents provide consistent information.
  - Escalation path for customers demanding service credits/refunds: `____` (Customer Success / Legal).

#### 2.3 Business Process Workarounds

For each affected business process, document and activate manual or alternate workarounds:

1. **Payment Processing Down:** Activate offline payment capture (record payment details securely for processing when system is restored). Notify finance team to monitor for duplicate charges during recovery.
2. **Order Fulfillment Down:** Use manual order tracking (shared spreadsheet) and notify customers of delays. Prioritize orders by customer tier and order date.
3. **Customer Support Down:** Activate email-only support with extended response time SLA communicated to customers.

### Common Pitfalls

> **⚠️ Watch out:** Status page saying "Investigating" for 6 hours with no update. This erodes customer trust faster than the outage itself. Set a hard rule: update the status page at least every `____` minutes (recommended: 30 minutes), even if the update is "We're still working on it. Next update at [specific time]."

> **⚠️ Watch out:** Customer communication that promises unrealistic recovery times. "We'll be back up in 30 minutes" - and then you're not - is far worse than "We're working on it and will provide a timeline within 2 hours." Under-promise and over-deliver on communications.

---

## Procedure 3: Third-Party Dependency Failures

### Standard Approach

#### 3.1 Vendor Disruption Response

1. **Vendor Status Verification:** When a critical vendor or service provider experiences an outage:
  - Check the vendor's own status page and subscribe to updates.
  - Contact the vendor through established support channels (open a Severity 1 ticket if applicable).
  - Check the vendor's SLA: what is their committed recovery time? Are service credits accruing?
2. **Impact Assessment:** Determine which internal business functions are affected by the vendor outage:
  - Direct dependency (if Vendor X is down, our Service Y is down).
  - Indirect dependency (Vendor X is down, so our vendor's vendor is affected, cascading to us).
3. **Activate Vendor Contingency:** Consult the vendor contingency register (`____` location). For each critical vendor, this register documents:
  - Alternative provider(s) that can replace the function.
  - Manual workaround procedures.
  - Estimated switching time.
  - Authorization required to switch.
4. **Escalation Protocol:**
  - `____` hours into the outage: Business owner escalates to vendor account manager.
  - `____` hours into the outage (or if approaching RTO): Executive sponsor contacts vendor executive sponsor.
  - If vendor cannot restore within the function's RTO: activate the alternate provider or manual process.

#### 3.2 Alternate Provider Activation

1. **Authorization:** The Executive Coordination Team authorizes the switch based on cost, operational impact, and expected duration of the primary vendor's outage.
2. **Cutover Execution:**
  - If the alternate provider is already configured (warm standby): redirect traffic or workflows to the alternate.
  - If the alternate provider requires setup (cold standby): execute the documented onboarding procedure. This may require data migration, DNS changes, or API key reconfiguration.
3. **Validation:** Test that the alternate provider is functioning correctly before notifying users of the switch.
4. **Return to Primary:** Once the primary vendor is restored and stable (typically after a `____`-hour observation period with no further issues), plan a controlled cutback during a maintenance window.

### Common Pitfalls

> **⚠️ Watch out:** The alternate provider requiring the same data that was on the primary provider, which is now unavailable. If your CRM is down and you want to switch to an alternate CRM, you need your customer data - which may only exist in the down CRM. Mitigate this by maintaining regular data exports from critical SaaS platforms to an organization-controlled location.

> **⚠️ Watch out:** Assuming the alternate provider is still available and hasn't changed their pricing, API, or terms since the contingency was documented. Review and test vendor contingencies at least annually - actually attempt to activate the alternate in a test scenario.

---

## Procedure 4: BCP Testing Execution

### Standard Approach

#### 4.1 Tabletop Exercise Execution

1. **Scenario Design:** `____` (BCP Coordinator) designs a realistic scenario `____` weeks before the exercise. The scenario must:
  - Be plausible for the organization's geography and industry.
  - Affect multiple business functions (not just one team).
  - Require succession decisions (assume a key leader is unavailable).
  - Have an evolving timeline (injects - new information revealed at intervals).
2. **Participant Preparation:**
  - Distribute the scenario briefing 48 hours before the exercise (do not share the injects - these should be surprises).
  - Remind participants to bring their offline contact lists and copies of the BCP.
  - Designate a facilitator (external to the response teams) who controls the timeline and injects.
3. **Exercise Execution:**
  - Facilitator reads the opening scenario and starts the clock.
  - Teams respond as they would in a real event: activating communication channels, making decisions, documenting actions.
  - Facilitator introduces injects at pre-planned intervals (e.g., "The ISP just reported a 12-hour fiber cut" at T+30 minutes, "A key customer is threatening to terminate their contract" at T+90 minutes).
  - A designated note-taker (not a participant) records all decisions, actions, and timestamps.
4. **Metrics to Capture:**
  - Time from scenario start to BCP activation decision.
  - Time to complete the notification cascade (all team leads notified).
  - Time to stand up alternate work arrangements (remote work or alternate site).
  - Time to customer notification (if applicable in the scenario).
  - Number of decisions that required escalation due to an unavailable authority holder.
5. **Hot Wash / Debrief:** Immediately after the exercise, conduct a 30-minute debrief:
  - Each team lead shares: what worked, what didn't, what they'd change.
  - Facilitator captures all feedback.
  - Do not problem-solve during the hot wash - just capture.

#### 4.2 Post-Exercise Remediation

1. **Post-Exercise Report:** Within `____` business days, produce a report documenting:
  - Scenario, objectives, and participants.
  - Timeline of actions taken.
  - Metrics achieved vs. targets.
  - Issues identified and recommendations.
  - Remediation items with assigned owners and due dates.
2. **Remediation Tracking:** All remediation items are entered into `____` (ticketing system). Track to resolution. Items not resolved before the next annual test are escalated to executive leadership.

### Common Pitfalls

> **⚠️ Watch out:** Tabletop exercises that are too easy. If the scenario doesn't challenge assumptions or force hard decisions, the exercise provides a false sense of readiness. Include injects that remove key people, cut communication channels, and force trade-off decisions.

> **⚠️ Watch out:** Treating the tabletop as a compliance checkbox. The exercise is training, not an exam. A "failed" exercise that identifies 10 gaps is more valuable than a "perfect" exercise that finds nothing. Create psychological safety: no one is blamed for gaps discovered during testing.

---

## Related Documents

- Business Continuity Plan (Template.md)
- Disaster Recovery Plan (../Disaster-Recovery-Plan/Template.md)
- Disaster Recovery Process (../Disaster-Recovery-Process/Template.md)
- Backup Policy (../Backup-Policy/Template.md)
- Incident Response Policy (../Incident-Response-Policy/IR-Policy-Template.md)
- Vendor Management Policy (../Vendor-Management-Policy/Template.md)
