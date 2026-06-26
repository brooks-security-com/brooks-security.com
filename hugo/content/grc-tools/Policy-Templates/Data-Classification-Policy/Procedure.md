# Data Classification Policy - Implementation Procedures

> **Companion to:** Data Classification Policy (Template.md)
> **Purpose:** How to implement the requirements. The policy defines WHAT; this describes HOW.

## Procedure 1: Classification Labeling
### Standard Approach
1. Establish a labeling standard that defines exactly how each classification level must be marked across media types:
   a. **Electronic documents (Office, PDF):** Header/footer text (e.g., "RESTRICTED - Do Not Distribute"), metadata field (document properties > classification), filename prefix/suffix convention (e.g., `[R] Project_Alpha_Report.docx`).
   b. **Emails:** Subject line tag (e.g., `[RESTRICTED]`), body header, and sensitivity label where the email platform supports it (e.g., Microsoft 365 sensitivity labels).
   c. **Cloud storage:** Classification tag in the storage platform's metadata (e.g., AWS S3 object tags, Google Drive labels, SharePoint sensitivity labels).
   d. **Physical documents:** Printed label/watermark on each page, colored cover sheet (e.g., red for Restricted), and classification marking on the storage container (folder, binder, drawer).
   e. **Databases and data stores:** Schema-level metadata, column/table tags, or a data catalog classification entry.
2. Integrate classification labeling into document creation workflows:
   a. Configure document templates (Word, Google Docs, Confluence) with a classification field that must be set before saving.
   b. For email, configure the email system to prompt for classification when the recipient domain is external or when keywords associated with sensitive data are detected.
3. Train all Personnel on the labeling standard during security awareness training. Include visual examples of correctly and incorrectly labeled documents.
4. Implement automated labeling enforcement:
   a. Configure Data Loss Prevention (DLP) or cloud security tools to detect unlabeled documents containing sensitive data patterns (PII, PHI, credentials) and either auto-apply the correct label or block sharing until labeled.
   b. Configure the email gateway to scan outbound emails for classification markers. Emails containing Restricted data patterns without the [RESTRICTED] tag are flagged or blocked.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Sensitivity label platform (Microsoft Purview, Google DLP, etc.):** Instead of manual labeling, deploy an enterprise sensitivity labeling platform that auto-classifies content based on pattern matching, applies persistent labels that travel with the document, and enforces protection policies (encryption, access restriction) based on the label.
> - **Classification by system rather than by document:** For highly structured environments, classify at the system or database level rather than per-document. All data in "System X" is Internal unless otherwise marked. This reduces labeling burden but requires strong access controls on the system.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Labels that people ignore.** A label that appears on every email ("CONFIDENTIALITY NOTICE: This email is intended only for...") becomes invisible. Use distinctive formatting (color, position, brevity) so that classification labels are noticeable. Reserve "RESTRICTED" for truly sensitive content.
> - **Metadata that doesn't survive export.** The classification stored in document metadata may be stripped when the document is exported to PDF, printed, or attached to an email. The visual label (header/footer text) is the fallback. Always include both metadata and visual labeling.
> - **No labeling for unstructured data.** Documents are easy to label; chat messages, database records, and log files are not. Define what constitutes "labeled" for each data format. A database column with a classification tag in the data catalog is labeled even if individual rows aren't.

## Procedure 2: Handling Controls Implementation
### Standard Approach
1. Translate the Handling Controls Matrix from the policy into specific technical configurations for each control area:
   a. **Access Control:** Configure IAM policies, group memberships, and permission sets per classification level. Restricted data access requires explicit, individually approved permissions - no group-based default access.
   b. **Encryption at Rest:** Enforce encryption standards per classification: AES-256-GCM for Restricted, minimum AES-256 for Confidential. Use cloud provider default encryption with customer-managed keys for Restricted data, provider-managed keys acceptable for Confidential.
   c. **Encryption in Transit:** Enforce TLS minimum versions per classification (1.3 for Restricted, 1.2+ for Confidential). Configure load balancers, CDNs, and application servers to reject connections below the minimum version.
   d. **Email Transmission:** Configure the email gateway/DLP to enforce restrictions: block emails containing Restricted data patterns unless encrypted (S/MIME, PGP, or secure portal link). Warn on Confidential data sent externally without encryption.
   e. **Physical Storage:** For Restricted data physical copies, implement separate locked storage with access logging (badge access, sign-in/sign-out log). For Confidential, standard locked cabinet or secure office is acceptable.
   f. **Disposal:** Integrate disposal methods with IT asset disposition procedures. For digital Restricted data, use cryptographic erasure (key deletion for encrypted volumes) or verified multi-pass overwrite. For physical Restricted media, use cross-cut shredding or incineration with witnessed destruction.
   g. **Mobile Devices:** Enforce via MDM policy: encryption mandatory for all devices accessing Restricted or Confidential data, with remote wipe capability enabled. Devices that cannot meet encryption requirements are blocked from accessing data above Internal classification.
   h. **Logging and Monitoring:** For Restricted data access, enable full access logging (who accessed what, when, from where) with real-time alerting on anomalous access patterns. For Confidential, enable access logging with periodic (weekly) review.
2. Document the implementation for each control area: system, configuration, responsible team, and verification method.
3. Test each control after implementation: verify that Restricted data cannot be emailed unencrypted, that unencrypted devices are blocked from Restricted data access, and that disposal procedures produce irrecoverable data.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Policy-as-code for cloud environments:** Use infrastructure-as-code (Terraform, CloudFormation) to define classification-based security controls. A resource tagged `classification=restricted` automatically inherits the full suite of Restricted controls through policy-as-code enforcement.
> - **Data security platform (DSPM):** Deploy a Data Security Posture Management platform that continuously monitors data stores, classifies data, and flags control gaps (e.g., "Restricted data found in unencrypted S3 bucket"). This shifts handling control enforcement from a point-in-time implementation to continuous compliance.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Controls that are configurable but disabled by default.** Many cloud services offer encryption, logging, and access control features but ship with them disabled. Verify that your implementation ACTUALLY enables the controls, not just provisions a service that could support them.
> - **Handling controls that break workflows.** If enabling encryption-at-rest on the file server suddenly prevents the backup system from reading files, users will find workarounds (like saving to unencrypted locations). Test handling controls against all dependent systems before enforcing them.
> - **No handling controls for data in transit between internal systems.** Internal network traffic is often treated as trusted and unencrypted. If Restricted data flows between internal systems without TLS, an attacker with network access can intercept it. Encrypt internal traffic carrying Restricted or Confidential data.

## Procedure 3: Reclassification
### Standard Approach
1. Define reclassification triggers:
   a. **Data owner initiated:** The data owner determines the current classification is incorrect and requests a change (upward or downward).
   b. **Time-based:** Data that loses sensitivity over time (e.g., financial results before vs. after public earnings release) is scheduled for reclassification.
   c. **De-identification validated:** Data that has been de-identified and validated as non-re-identifiable may be reclassified downward per the policy.
   d. **Discovery:** Automated scanning discovers data that appears misclassified (e.g., patterns matching Restricted data found in Internal-labeled storage).
2. Reclassification process:
   a. The data owner submits a reclassification request with justification.
   b. For upward reclassification: approved by the data owner's manager. Implementation handles it as a priority - the data is under-protected.
   c. For downward reclassification: requires approval from the Security Officer or Privacy Officer. A downward reclassification reduces protections and must be justified and documented.
   d. Upon approval, update: the data's classification label/metadata, the access controls to match the new classification, the storage location if required (e.g., moving from Restricted storage to Confidential storage), and downstream systems and reports that reference this data.
   e. Notify all users with access to the reclassified data of the change and any new handling requirements.
3. Log all reclassifications: data asset, previous classification, new classification, justification, approving authority, and date. Review the reclassification log quarterly for patterns - frequent downward reclassification may indicate initial over-classification or a process gap.
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Automated reclassification based on data age or content:** Configure data discovery tools to auto-reclassify data that meets defined criteria (e.g., data containing PII that is older than 7 years and has not been accessed in 3 years may be recommended for reclassification to a lower tier if de-identification criteria are met). Human approval is still required for downward reclassification.
> - **Project-level classification overrides:** For time-bound projects, classify all project data at a single level (usually the highest level of any data in the project) for simplicity, then reclassify individual assets at project close-out.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Reclassification that doesn't propagate.** You change the label on a document in SharePoint, but copies in email, local drives, backups, and downstream reports still carry the old classification. The reclassification must cascade to all known copies or the old classification controls remain in effect for those copies.
> - **De-identification that isn't validated.** Reclassifying de-identified data downward without independent validation of the de-identification process is a leading cause of data exposure. The Privacy Officer or Data Science team must validate that re-identification risk is acceptably low before reclassification.

## Procedure 4: Automated Discovery and Classification
### Standard Approach
1. Deploy data discovery tools to scan structured and unstructured data stores: cloud storage (S3, Azure Blob, GCS), file shares, databases, email archives, and collaboration platforms (SharePoint, Google Drive, Confluence).
2. Configure discovery rules based on the classification definitions:
   a. **Restricted patterns:** PII (SSN, passport, driver's license numbers), PHI (diagnosis codes, treatment records), payment card data (PAN), credentials and secrets (API keys, passwords), encryption keys.
   b. **Confidential patterns:** Financial figures, contract terms, employee personnel data, security architecture references, unreleased product names/descriptions.
   c. **Internal patterns:** Everything not matching Restricted or Confidential patterns, originating from internal sources.
   d. **Public patterns:** Documents with public distribution approval markers.
3. Run discovery scans on a schedule:
   a. **High-risk repositories** (customer data stores, HR systems, finance systems): weekly.
   b. **General repositories** (departmental file shares, collaboration platforms): monthly.
   c. **New data sources:** scan immediately upon onboarding.
4. For each discovery finding:
   a. **Auto-classify and label** when confidence is high (e.g., document containing 50+ SSN patterns → auto-label Restricted).
   b. **Flag for review** when confidence is moderate or the classification conflicts with the existing label. Route to the data owner or security team for manual review.
   c. **Generate an incident ticket** when Restricted data is found in a location not authorized for Restricted data (e.g., SSNs in an unencrypted, publicly accessible bucket).
5. Report discovery metrics quarterly:
   a. Total data assets scanned.
   b. Data assets by classification (count and volume).
   c. Misclassified data found (count and volume, by classification mismatch).
   d. Remediation status (misclassified data reclassified, unauthorized locations secured).
### Alternative Approaches
> **💡 Why you might choose differently:**
> - **Data Security Posture Management (DSPM) platform:** Instead of running separate discovery tools, deploy a DSPM platform that continuously discovers, classifies, and monitors data across cloud environments. DSPM tools provide a single pane of glass rather than stitching together scan results from multiple tools.
> - **Classification at ingestion rather than post-hoc:** Integrate classification into the data ingestion pipeline. When data enters the organization (via API, file upload, email), classify it at the point of entry based on source, schema, and content. This is more reliable than post-hoc scanning.
### Common Pitfalls
> **⚠️ Watch out:**
> - **Discovery rules that generate 10,000 findings.** Pattern matching without tuning produces overwhelming false positives (every 9-digit number is not an SSN). Tune rules with context: SSN patterns in documents named "tax_form" are higher confidence than SSN patterns in source code. Start with high-confidence rules and expand gradually.
> - **Discovery that finds data but can't fix it.** Finding Restricted data in an unencrypted location generates an alert, but if nobody is assigned to remediate, the alert is noise. Define a response workflow before enabling discovery: who gets the alert, what action they must take, and within what timeframe.
> - **Scanning without legal authorization.** In some jurisdictions, scanning employee email or personal drives for data classification may have privacy implications. Consult Legal before deploying discovery tools on systems where Personnel have an expectation of privacy.
