# Data Protection Policy Template

## What This Is

The Data Protection Policy translates the high-level data classification framework into concrete technical and operational controls. Where the Data Classification Policy says "Restricted data must be encrypted," the Data Protection Policy specifies *how* encryption must be implemented, *who* may access production data, and *what* logging and monitoring must be in place. This is the policy that operations and engineering teams will reference day-to-day.

## What It Covers

- General data protection principles (least privilege, least functionality, logging)
- Customer data protection and logical segmentation requirements
- Production data access controls, including just-in-time access
- Data at rest encryption and secure disposal methods
- Data in transit encryption requirements for internal and external transmission
- Information exchange agreements with external parties (API integrations, vendor data sharing)
- End-user messaging channel restrictions for sensitive data
- Confidentiality and Non-Disclosure Agreement (NDA) requirements

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Data protection controls throughout the data lifecycle. Defines customer data segmentation, production access controls, encryption requirements, data deletion standards, and information exchange governance. This is the governance document reviewed by leadership and auditors.
- **`Data-Protection-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Customer data segmentation implementation, production data access controls (JIT provisioning), secure data deletion methods, and monitoring setup for data protection. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Allowing routine production access.** The single most common data protection failure is letting developers or support staff have standing administrative access to production databases. Every routine access pathway that exists will eventually be misused or compromised. Just-in-time access with automatic revocation is the standard; standing access is the exception that must be justified.

**2. Mixing data classifications in the same database.** A database that contains both Public and Restricted data must be protected at the Restricted level. This means simple lookup tables become expensive to protect. Designing data stores with classification segregation in mind from the start avoids costly retrofitting.

**3. Encrypting data at rest but neglecting key management.** Full-disk encryption on a database server is worthless if the encryption keys are stored on the same server or in an unsecured location. Key management must be treated as a separate, higher-assurance control with its own access restrictions, rotation schedule, and audit logging.

**4. Overlooking logical segmentation testing.** Stating that customer data is "logically separated at the API layer" is not sufficient. The segmentation must be penetration tested. A single missing tenant-ID filter in a database query can expose all customers' data. Test this continuously, not just once.

**5. NDAs without teeth.** An NDA that defines the protected information vaguely, has no audit rights, and specifies no concrete consequences for breach provides a false sense of security. Legal must review NDAs to ensure they are enforceable and cover your actual data sharing scenarios.

## Implementation Advice

- **Implement just-in-time access from day one.** Even if you start with a simple manual approval process tracked in tickets, establish the pattern early. Retrofitting JIT access into a culture accustomed to standing production access is extremely difficult.
- **Use a data discovery tool to find classification violations.** Run a data discovery scan across all repositories quarterly. Look for Restricted data (SSNs, credit card numbers, API keys) in locations not configured for Restricted-level protection. This catches both misclassification and shadow IT.
- **Automate encryption verification.** Don't rely on configuration management alone - periodically scan storage volumes and databases to verify encryption is actually enabled and using the correct key management service. Misconfigurations during maintenance windows are a common root cause of unencrypted data exposure.
- **Document data flows for external integrations.** For every third-party integration, maintain a data flow diagram showing what data is exchanged, how it is encrypted in transit, where it is stored, and who has access at each stage. This makes vendor security reviews and incident response significantly faster.
- **Test your data deletion process.** Periodically verify that "deleted" data is actually irrecoverable. Attempt to restore data that was deleted 90 days ago using backup systems, database snapshots, and filesystem recovery tools. If you can recover it, your deletion process is not working.
