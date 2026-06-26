# Vendor Security Questionnaire

Use this questionnaire to assess the security posture of third-party vendors before granting them access to your systems or data. Send this to vendors during the procurement or renewal process.

## How to use this questionnaire

1. Send to the vendor before signing a contract.
2. Review responses against the risk-tiering criteria in the Vendor Management Policy.
3. For High-risk vendors (those accessing sensitive data): require a completed questionnaire plus a current SOC 2 Type 2 or ISO 27001 certification. If the vendor has a SOC 2 report, you can skip sections of this questionnaire that are covered by the report.
4. For Medium-risk vendors: a completed questionnaire is sufficient.
5. For Low-risk vendors: no questionnaire is required. Standard terms and conditions are sufficient.

## Vendor Information

| Field | Response |
|-------|----------|
| Vendor Name | ____ |
| Product/Service | ____ |
| Vendor Contact | ____ |
| Date of Assessment | ____ |
| Assessor | ____ |

## Risk Tier Determination

| Question | Yes | No |
|----------|-----|----|
| Will the vendor store, process, or transmit customer data? | | |
| Will the vendor store, process, or transmit employee PII? | | |
| Will the vendor have access to production systems? | | |
| Will the vendor have access to source code repositories? | | |
| Will the vendor integrate with authentication systems (SSO, LDAP)? | | |
| Could a failure of this vendor's service cause a critical business outage? | | |

If you answered Yes to any question, the vendor is at least Medium risk. If you answered Yes to the first question about customer data, the vendor is High risk.

## Security Program

| Question | Response |
|----------|----------|
| Does your organization have a documented information security program? | |
| Do you have a designated security officer or security team? | |
| Do you conduct annual security awareness training for all employees? | |
| Do you have a current third-party audit report (SOC 2 Type 2, ISO 27001)? Please attach. | |
| If you do not have a third-party audit, would you complete a more detailed security assessment? | |

## Data Protection

| Question | Response |
|----------|----------|
| Where is our data stored geographically? List all locations. | |
| Is all customer data encrypted at rest? What encryption standard? | |
| Is all customer data encrypted in transit? What protocol and version? | |
| Do you maintain a data inventory and classification scheme? | |
| How do you handle data deletion requests? What is the deletion timeline? | |
| Do you use subcontractors that would have access to our data? If yes, list them and their access level. | |

## Access Control

| Question | Response |
|----------|----------|
| Do you enforce multi-factor authentication for all user accounts? | |
| Do you enforce single sign-on (SSO) for enterprise customers? | |
| Do you use role-based access control? | |
| Do you conduct periodic access reviews? How frequently? | |
| How quickly is access revoked when an employee leaves? | |
| Do you have a password policy that enforces minimum length and prohibits reuse? | |

## Infrastructure and Operations

| Question | Response |
|----------|----------|
| Where is your infrastructure hosted? (AWS, GCP, Azure, on-premise, other) | |
| Do you maintain separate development, staging, and production environments? | |
| Do you have a change management process that requires approval before production changes? | |
| How do you manage vulnerabilities? What is your patch timeline for Critical/High findings? | |
| Do you conduct regular vulnerability scanning? How frequently? | |
| Do you conduct penetration testing? How frequently? Please attach the most recent summary. | |

## Incident Response

| Question | Response |
|----------|----------|
| Do you have a documented incident response plan? | |
| What is your SLA for notifying customers of a security incident? | |
| Have you experienced a security incident in the last 24 months that involved customer data? If yes, provide a summary. | |
| Do you have cybersecurity insurance? | |

## Business Continuity

| Question | Response |
|----------|----------|
| Do you have a business continuity and disaster recovery plan? | |
| What is your RTO (Recovery Time Objective) for critical services? | |
| What is your RPO (Recovery Point Objective) for customer data? | |
| Do you test your disaster recovery plan? How frequently? | |
| Do you perform regular backups of customer data? How frequently? | |

## Scoring Guide

Count the number of concerning answers (No or blank where Yes is expected, or incomplete responses):

| Score | Action |
|-------|--------|
| 0-2 concerns | Acceptable. Proceed with standard contract terms. |
| 3-5 concerns | Requires additional review. Request clarification or compensating controls before proceeding. |
| 6+ concerns | Significant risk. Escalate to security team for detailed assessment. Consider alternative vendors. |

## Additional questions for High-risk vendors

If the vendor will process customer data, also request:

- A copy of their Data Processing Agreement (DPA)
- Confirmation of GDPR, CCPA, or other applicable privacy regulation compliance
- Their subprocessor list and process for adding new subprocessors
- Their data export and deletion process (for when the contract ends)
- Penetration test summary for the specific product or service you are using
