# Data Classification Policy Template

## What This Is

The Data Classification Policy establishes a standardized taxonomy for categorizing all organizational data based on sensitivity and business impact. This policy is the cornerstone of data-centric security - it tells everyone in the organization how to label information and what handling controls apply at each level. Without classification, security controls are applied inconsistently, leading to both over-protection (wasted resources) and under-protection (increased risk).

## What It Covers

- Four-tier classification scheme: Restricted, Confidential, Internal, Public
- Definitions, examples, and impact descriptions for each level
- Handling controls matrix covering access, encryption, transmission, storage, disposal
- Decision matrix for determining appropriate classification
- Information aggregation rules (highest classification governs)
- De-identification standards
- Labeling requirements for physical and electronic documents

## Document Structure

This folder contains three files:

- **`Template.md`** - The policy. Defines WHAT is required.
- **`Procedure.md`** - Companion procedures. Describes HOW to implement the policy.
- **`README.md`** - This overview.

The policy and procedure are deliberately separate: the policy is for all employees and auditors; the procedure is for implementers. When updating this policy, ensure implementation changes flow into the procedure document.

## Common Gotchas and Mistakes

**1. Too many or too few classification levels.** Some organizations create seven or eight tiers that no one can consistently apply. Others default everything to one level. Four tiers (Public, Internal, Confidential, Restricted) is the industry standard for a reason - it balances granularity with usability. Anything beyond four levels degrades adoption.

**2. Defaulting everything to "Confidential" or "Internal."** When classification is undefined or too hard, people mark everything the same. This either creates alert fatigue (everything is "high sensitivity") or causes sensitive data to leak because "everything is just Internal." The policy must make classification easy and automated where possible.

**3. Ignoring the aggregation problem.** A common mistake is classifying individual fields but not the combined dataset. A report combining employee names (Internal) with salary data (Confidential) is Confidential. If it also includes Social Security numbers (Restricted), the whole report becomes Restricted. This cascading effect is frequently overlooked.

**4. No enforcement mechanism.** A classification policy without automated tooling (DLP, data discovery, classification labels enforced by the DLP system) relies entirely on human diligence - which fails consistently. Plan for technical enforcement from the start.

**5. Confusing classification with retention.** Classification determines *how* data is protected; retention determines *how long* it is kept. These are related but distinct policies. Don't conflate them - a document might be Public (low sensitivity) but still require seven-year retention for legal reasons.

## Implementation Advice

- **Automate classification where possible.** Use data discovery and classification tools to scan repositories and auto-tag data. Manual classification at scale is a fantasy. Start with high-value targets: file shares, email, cloud storage.
- **Integrate classification into the creation workflow.** Add a classification field to document templates, project intake forms, and ticket systems. If people have to stop and think about classification at the point of creation, compliance improves significantly.
- **Publish the handling matrix as a one-pager.** The full policy is for auditors. The one-page handling matrix is what people actually need at their desks. Laminated quick-reference cards work surprisingly well for physical environments.
- **Test de-identification assumptions.** De-identified data frequently retains re-identification risk (e.g., through cross-referencing with public datasets). Have the Privacy or Data Science team validate de-identification processes before reclassifying data downward.
- **Review classifications during access reviews.** Quarterly access reviews are a natural opportunity to verify that data classifications are still accurate. Build this verification step into the access review procedure.
