# Contractor Access and Confidentiality Agreement Template

## What This Is

The Contractor Access and Confidentiality Agreement is the contractor-specific counterpart to the Employee Access and Confidentiality Agreement. It addresses the distinct legal relationship between the organization and non-employee workers (contractors, consultants, freelancers, agency personnel). It must be signed before any system access is granted and before any confidential information is disclosed to the contractor.

## What It Covers

- Definitions of Confidential Material and Client Data relevant to contractor access
- Contractor-specific obligations: authorized use, credential safeguarding, reporting, continuing confidentiality
- Return of materials upon contract termination
- No ownership or intellectual property rights over organizational data
- Governing terms and relationship to the master services agreement
- Accountability provisions including contract termination and legal remedies
- Signature block for contractor and organization representative

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Gotchas People Get Wrong

**1. Treating contractors like employees in the agreement.** Contractors are not employees. The agreement must reference the master services agreement or contract, not employment terms. It must use contractor-appropriate language ("termination of contract" not "termination of employment"). Labor law treats these differently; misclassification in your agreements can create legal exposure.

**2. Not including a return-of-materials clause.** Employees typically go through an offboarding process with HR and IT that includes asset return. Contractors often do not. The agreement must explicitly require return or certified destruction of all materials upon contract end - and someone must verify compliance.

**3. Overlooking subcontractors.** If your contractor hires a subcontractor to do part of the work, does the subcontractor sign this agreement? The master services agreement should flow down confidentiality requirements to subcontractors, and the contractor should be responsible for ensuring compliance.

**4. Access that outlasts the contract.** Contractors often retain system access after their contract ends because nobody remembers to revoke it. This agreement gives you the authority to revoke access "at any time" - but you need a process that actually does it. Link contractor access to the contract end date with automatic expiration.

**5. Intellectual property ambiguity.** The agreement states the contractor has no ownership rights over organizational data, but what about work product created during the engagement? IP ownership (work-for-hire provisions) belongs in the master services agreement, not the confidentiality agreement. Cross-reference them clearly so there's no ambiguity.

## Implementation Advice

- **Tie system access to a signed agreement.** No signed agreement on file = no system accounts provisioned. Use your identity provider or access management tool to enforce this: contractor accounts are only created after the signed agreement is uploaded to the vendor/contractor record.
- **Set automatic access expiration.** Contractor accounts should have an expiration date matching the contract end date. The identity provider should automatically disable the account unless the contract is formally extended and the extension is documented.
- **Use a contractor onboarding checklist.** Standardize what happens when a contractor starts: signed confidentiality agreement, background check (if required), security awareness training, system access provisioning with least privilege, MFA enrollment, and asset assignment tracking. A checklist prevents contractors from slipping through with incomplete compliance.
- **Conduct periodic contractor access reviews.** Quarterly, review all active contractor accounts against active contracts. Any account without a corresponding active contract should be immediately disabled and investigated. This catches both the "forgot to revoke" problem and unauthorized account creation.
- **Include confidentiality in the contractor exit process.** When a contract ends, require the contractor to sign an exit certification confirming they have returned or destroyed all organizational data and materials. This creates a clear record that can be referenced if data misuse is discovered later.
