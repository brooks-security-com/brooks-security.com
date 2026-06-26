# Physical Security Policy Template

## What This Is

The Physical Security Policy establishes the controls that protect the organization's facilities, equipment, and - by extension - the information contained within them. Physical security is often the most overlooked layer in a security program, but it is also the layer where a single failure (an unlocked door, an unescorted visitor, a stolen laptop) can completely bypass sophisticated technical controls. This policy ensures that physical access is as carefully managed as digital access.

## What It Covers

- General facility access controls (badge requirements, visitor logs, escorts)
- Secure area requirements (server rooms, data centers) with enhanced controls
- Clean desk policy (securing documents, locking workstations, clearing printers)
- Workstation physical security and screen positioning
- Data center and server room environmental controls (temperature, fire suppression, UPS)
- Off-site equipment security (authorization, tracking, incident reporting)
- Physical security perimeter definition
- Alarm and surveillance system requirements
- Fire and life safety

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Physical security controls for facilities, secure areas, workstations, and off-site equipment. Defines access controls, clean desk requirements, alarm systems, and data center security. This is the governance document reviewed by leadership and auditors.
- **`Physical-Security-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Physical access control system configuration, badge management, surveillance monitoring procedures, and facility inspection workflows. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Treating physical security as "just facilities."** Physical security is a shared responsibility between security, IT, and facilities teams. If the security team doesn't know that the server room door lock has been broken for two weeks because "facilities handles that," there is a governance gap. The policy must establish clear cross-functional ownership.

**2. Undefined secure areas.** Not every room with a rack needs data-center-level security, but you must define which areas are "secure" and what that means. A common failure is having a server closet that is also the janitorial supply room, accessible to cleaning staff with no access logging.

**3. Visitor logs that don't work in practice.** Visitor logs that require paper sign-in with no verification are theater. A visitor can write any name and any host. Implement a process that verifies identity (ID check), issues a temporary badge visibly different from employee badges, and logs entry/exit digitally.

**4. Clean desk policy without enforcement.** Almost every organization has a clean desk policy. Almost nobody enforces it. Without periodic walkthrough inspections - ideally unannounced - the policy is aspirational. Consider gentle enforcement: leave a "thank you for securing your desk" card on clean desks and a reminder on unsecured ones.

**5. Ignoring off-site and remote work.** Physical security doesn't stop at the office door. Laptops taken home, to coffee shops, or on business travel are high-risk. A stolen laptop with unencrypted Restricted data is a reportable breach. The policy must address off-site equipment security explicitly.

## Implementation Advice

- **Photograph secure areas annually.** In addition to access reviews, photograph server rooms, wiring closets, and other secure areas. Compare year over year to detect unauthorized equipment, cabling changes, or deteriorating conditions.
- **Run unannounced walkthroughs.** Scheduled inspections are valuable, but unannounced walkthroughs catch real behavior. Walk the office after hours and check for unlocked workstations, documents on desks, and propped doors. Use findings to improve training, not punish.
- **Integrate badge system with HRIS.** When HR processes a termination, the badge system should automatically deactivate access within hours, not days. Manual deactivation processes have a failure rate that creates exposure. If integration isn't possible, implement a daily reconciliation process.
- **Use clear desk audit results in security awareness training.** Real findings ("we found 12 workstations unlocked, 3 whiteboards with passwords, and 4 desks with Restricted documents") make the training concrete and memorable. Abstract warnings are ignored.
- **Test backup power under load regularly.** UPS batteries degrade, generators fail to start, and load calculations are often wrong. An annual load test of backup power systems is essential. Discovering that the generator can't handle the full rack load during an actual outage is catastrophic and entirely preventable.
