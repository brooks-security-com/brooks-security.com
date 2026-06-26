# Vendor Management Policy

Policy Title: Vendor Management Policy
Policy Number: VMP-001
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

## Purpose

This policy establishes the requirements for assessing, onboarding, managing, and offboarding third-party vendors and service providers that have access to ____'s information, systems, or facilities. Effective vendor risk management ensures that third-party relationships do not introduce unacceptable risk to the confidentiality, integrity, or availability of organizational and customer data.

## Scope

This policy applies to all IT vendors, service providers, contractors, and partners who process, store, or transmit organizational or customer data; provide critical services; have network or system access to ____'s environment; or are within the scope of ____'s information security program. It also applies to all Personnel responsible for vendor evaluation, engagement, management, or oversight.

## Policy

### Vendor Risk Tiering

| Risk Tier | Criteria | Examples |
|-----------|----------|----------|
| **High** | Stores or accesses Restricted or Confidential data; failure would have critical impact on business operations | Cloud infrastructure providers, payment processors, data analytics platforms with PII access, managed security service providers |
| **Medium** | May access Internal data but not Restricted or Confidential data; failure would have moderate but not critical impact | Project management tools, communication platforms, non-critical SaaS applications |
| **Low** | Does not store or access organizational data; failure would have minimal operational impact | Publicly available tools, isolated utility services |

### Vendor Risk Assessment

#### High-Risk Vendor Requirements

Prior to engagement, High-risk vendors must provide:

- A current third-party audit report: **SOC 2 Type II, ISO 27001 certification, or equivalent** independent assessment, dated within the last ____ (e.g., 12) months.
- In lieu of an independent audit, the organization may conduct its own security assessment using a standardized questionnaire (e.g., SIG, CAIQ) and may perform additional technical testing or on-site evaluation.
- Documented information security policies and an incident response plan.
- Evidence of background checks for personnel accessing organizational systems or data.
- Data flow diagrams or descriptions showing where organizational data will be stored, processed, and transmitted, including geographic locations.

#### Medium-Risk Vendor Requirements

- A completed security questionnaire (e.g., SIG-Lite, custom questionnaire).
- Confirmation of security practices in areas relevant to the services provided.
- Additional documentation may be requested if questionnaire responses raise concerns.

#### Low-Risk Vendor Requirements

- Brief review confirming the vendor's risk tier classification. No formal questionnaire or audit required unless specific concerns arise.

### Vendor Contracts and Agreements

Formal, written contracts must be in place before vendors are granted access to organizational systems or data. All contracts must address:

- **Data Security:** Vendor is responsible for security of organizational data in its possession.
- **Compliance:** Vendor must comply with applicable laws, regulations, and organizational security requirements.
- **Confidentiality:** Obligations to protect confidential information, including return or secure destruction upon contract termination.
- **Incident Notification:** Requirement to notify the organization within ____ hours (e.g., 24-48) of a security incident affecting organizational data.
- **Subcontractors:** Disclosure of subcontractors and flow-down of security requirements.
- **Audit Rights:** Organization's right to audit vendor compliance.
- **Data Location:** Geographic restrictions on data storage, processing, or transmission.
- **Data Return/Destruction:** Procedures and timelines for return or secure destruction of data upon termination.
- **Right to Terminate:** Right to terminate if vendor fails to meet security requirements.

**Additional provisions for High-risk vendors:** independent review requirements, background check requirements, SLAs.
**Additional provisions for Cloud Service Providers:** shared responsibility model definition, advance notification of substantive changes, incident response support, exit strategy.

### Vendor Inventory

A centralized vendor inventory must be maintained, containing: vendor name and contact, risk tier, services provided, data types shared, access method, key security controls, date of most recent assessment, contract expiration, and security documentation on file. The inventory must be reviewed at least ____ (e.g., quarterly).

### Ongoing Vendor Monitoring

- **High-risk vendors:** Annual re-assessment. Review updated audit reports, security documentation, and any changes to services or data handling practices.
- **Medium-risk vendors:** Re-assessment every ____ (e.g., 2) years or upon significant changes.
- **Low-risk vendors:** Re-assessment upon contract renewal or if risk tier classification changes.
- **All vendors:** Continuous monitoring of publicly available information (breach notifications, news, security advisories).

### Vendor Access Management

- Vendor access must follow the System Access Control Policy, with additional requirements:
- Access limited to minimum necessary for the contracted service.
- Access must be time-bound with defined expiration date aligned to contract term.
- Vendor accounts must be clearly identified as such.
- Vendor access must be reviewed at least ____ (e.g., quarterly or monthly for High-risk).
- Vendor access must be revoked within ____ (e.g., 1) business day of contract termination.

### Vendor Offboarding

When a vendor relationship ends: all access must be revoked, vendor must certify data return/destruction, organizational assets must be returned, integrations/API keys deactivated, and vendor inventory updated.

### Individual Contractors

Individual contractors must undergo the same security procedures as employees: background checks (where legally permissible), signed NDAs, security awareness training, compliance with all applicable policies, and standard access provisioning and offboarding.

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| ____ (e.g., CISO / Security Officer) | Policy owner; annual review; approve High-risk vendor engagements |
| Vendor Management Office / Procurement | Maintain vendor inventory; ensure security requirements in contracts |
| Legal | Review and negotiate contract security provisions |
| System Owners / Business Owners | Initiate vendor risk assessments; monitor vendor performance |
| IT / Security Engineering | Implement and manage vendor access; review vendor access logs |
| All Personnel | Do not engage vendors outside the approved procurement process; report unauthorized vendor activity |

## Exceptions

Exceptions must be submitted in writing with business justification and compensating controls, approved by the Security Officer, and reviewed at least ____ (e.g., annually). Exceptions do not exempt the vendor from compliance with applicable laws and regulations.

## Compliance and Enforcement

Compliance is verified through quarterly vendor inventory reviews, audit of vendor contracts, review of vendor access logs, assessment of overdue re-assessments, and incident post-mortems involving vendor-related root causes. Engaging a vendor outside the approved process is a policy violation.

## Related Documents

- Information Security Policy
- Data Classification Policy
- System Access Control Policy
- Incident Response Policy
- Acceptable Use Policy

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
