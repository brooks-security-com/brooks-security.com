# Framework Mapping

This document maps each policy template in this repository to the most commonly requested compliance frameworks. Use this to answer auditor questions about control coverage and to identify gaps in your program.

## Mapping Table

| Policy | NIST 800-53 Rev 5 | SOC 2 (CC) | ISO 27001:2022 |
|--------|-------------------|------------|----------------|
| Information Security Policy | All control families (overarching) | CC1.1, CC1.2, CC1.3, CC1.4, CC1.5 | 5.1, 5.2, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2 |
| Acceptable Use Policy | AT-2, AT-3, CM-2, CM-5, PS-6, SI-2, SI-3, SI-4 | CC1.1, CC1.4, CC6.1, CC6.8, CC7.2 | 5.3, 6.3, 7.2.2, 7.7, 8.1, 8.2, 8.3, 8.7 |
| AI Usage Policy | AC-3, AC-4, AC-6, AT-2, AT-3, SI-12 | CC1.1, CC6.1, CC6.7 | 5.10, 5.11, 5.12, 5.19, 5.20, 5.21, 5.22, 5.23, 5.34, 8.10 |
| Asset Management Policy | CM-8, MP-6, PE-20, SA-20 | CC6.1, CC7.1 | 5.9, 5.10, 5.11, 5.12, 7.9, 7.10, 7.14, 8.1 |
| Backup Policy | CP-6, CP-9, CP-10 | CC7.1, CC7.2 | 5.29, 5.30, 5.31, 5.32, 5.33, 8.13, 8.14 |
| Business Continuity Plan | CP-1, CP-2, CP-3, CP-4, CP-5, CP-6, CP-7, CP-8, CP-9, CP-10, CP-11, IR-4 | CC5.1, CC5.2, CC7.1, CC7.2, CC7.3, CC7.4, CC7.5 | 5.29, 5.30, 5.31, 5.32, 5.33, 8.13, 8.14 |
| Change Management Policy | CM-2, CM-3, CM-4, CM-5, CM-6, SA-3, SA-4, SA-5, SA-8, SA-10, SA-11, SA-15, SA-20 | CC8.1 | 8.32 |
| Charter for Oversight Responsibility | All control families (governance) | CC1.1, CC1.2 | 5.1, 5.2, 7.1, 9.1, 9.2, 9.3 |
| Code of Conduct | PL-4, PS-6, PS-7, PS-8 | CC1.1, CC1.2, CC1.4 | 5.2, 5.3, 7.7 |
| Configuration Management Plan | CM-1, CM-2, CM-3, CM-4, CM-5, CM-6, CM-7, CM-8, CM-9, CM-10, CM-11, SA-3, SA-4, SA-5, SA-10, SA-15 | CC6.1, CC8.1 | 5.10, 5.11, 5.12, 8.9, 8.32 |
| Contractor Access Agreement | AC-2, AC-3, AC-4, AC-5, AC-6, PS-3, PS-4, PS-5, PS-6, PS-7, SA-21 | CC6.1, CC6.2, CC6.3, CC6.4, CC6.5 | 5.15, 5.16, 5.17, 5.18, 7.7 |
| Control Self Assessment | CA-2, CA-3, CA-5, CA-6, CA-7, PM-20, PM-30 | CC3.1, CC3.2, CC3.3, CC3.4, CC4.1, CC4.2 | 6.1, 9.1, 9.2, 9.3 |
| Data Classification Policy | RA-2, MP-2, MP-3, MP-4, MP-5, MP-6 | CC6.1, CC6.7 | 5.9, 5.10, 5.11, 5.12, 5.13, 8.10, 8.11, 8.12 |
| Data Protection Policy | AC-3, AC-4, AC-6, AU-2, AU-3, AU-4, AU-5, AU-6, AU-7, AU-8, AU-9, AU-10, AU-11, AU-12, SC-8, SC-13, SC-28, SI-7 | CC6.1, CC6.6, CC6.7 | 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15, 5.16, 5.17, 5.18, 5.24, 8.10, 8.11, 8.12, 8.24 |
| Data Retention Policy | AU-11, MP-2, MP-3, MP-4, MP-5, MP-6 | CC6.1, CC6.5 | 5.9, 5.10, 5.11, 5.12, 7.10, 8.10, 8.11, 8.12 |
| Database Password Management | AC-2, AC-3, AC-6, IA-2, IA-4, IA-5, IA-6 | CC6.1, CC6.3 | 5.15, 5.16, 5.17, 5.18, 8.5 |
| Disaster Recovery Plan | CP-1, CP-2, CP-3, CP-4, CP-5, CP-6, CP-7, CP-8, CP-9, CP-10, CP-11, CP-12, CP-13, IR-4, PE-11, PE-12, PE-13, PE-14, PE-15 | CC5.1, CC5.2, CC7.1, CC7.2, CC7.3, CC7.4, CC7.5 | 5.29, 5.30, 5.31, 5.32, 5.33, 8.13, 8.14 |
| Employee Access Agreement | AC-2, AC-3, AC-4, AC-5, AC-6, PS-6, PS-7, PS-8 | CC1.1, CC1.2, CC1.4, CC6.1, CC6.2, CC6.3 | 5.2, 5.3, 5.4, 5.15, 5.16, 5.17, 5.18, 7.7 |
| Encryption Policy | SC-8, SC-12, SC-13, SC-17, SC-28, SC-40 | CC6.1, CC6.7 | 5.24, 8.24 |
| Incident Response Policy | IR-1, IR-2, IR-3, IR-4, IR-5, IR-6, IR-7, IR-8, IR-9, IR-10 | CC4.1, CC4.2, CC5.1, CC5.2, CC7.1, CC7.2, CC7.3, CC7.4, CC7.5 | 5.24, 5.25, 5.26, 5.27, 5.28, 6.8 |
| Logging and Monitoring Policy | AU-1, AU-2, AU-3, AU-4, AU-5, AU-6, AU-7, AU-8, AU-9, AU-10, AU-11, AU-12, AU-13, AU-14, AU-16, SI-4 | CC6.1, CC6.6, CC6.7, CC7.1, CC7.2, CC7.3 | 5.9, 5.10, 5.11, 5.12, 8.15, 8.16, 8.17 |
| Network Firewall Policy | AC-4, SC-7, SC-5, CA-3, CM-2, CM-6, SI-4, AC-17, AC-18, SC-10, SC-40, SC-41 | CC6.1, CC6.6, CC7.1 | 8.20, 8.21, 8.22, 8.23 |
| Password Policy | IA-2, IA-4, IA-5, IA-6, IA-7, IA-8 | CC6.1, CC6.3 | 5.15, 5.16, 5.17, 5.18, 8.5 |
| Physical Security Policy | PE-1 through PE-23 | CC6.1, CC6.4 | 7.1 through 7.15 |
| Remediation Plan | CM-3, CM-4, CM-6, SI-2, SI-3 | CC7.1, CC7.2, CC7.3, CC7.4, CC7.5, CC8.1 | 8.8, 8.32 |
| Removable Media Policy | MP-2, MP-3, MP-4, MP-5, MP-6, MP-7 | CC6.1, CC6.7 | 7.10, 7.14, 8.10, 8.11, 8.12 |
| Responsible Disclosure Policy | SI-2, SI-3, SI-4, SI-5, PM-15 | CC1.1, CC4.1, CC4.2, CC7.1, CC7.2 | 5.25, 6.8, 8.8 |
| Risk Assessment Policy | RA-1, RA-2, RA-3, RA-5, RA-6, RA-7, RA-9, PM-6, PM-8, PM-9, PM-12, PM-15, PM-16, PM-18, PM-19, PM-20, PM-22, PM-28, PM-30 | CC3.1, CC3.2, CC3.3, CC3.4 | 5.2, 6.1, 8.2, 8.3 |
| SDLC Policy | SA-1 through SA-23, CM-2, CM-3, CM-4, CM-5, CM-6, CM-7, CM-11 | CC6.1, CC7.1, CC7.2, CC8.1 | 5.25, 5.26, 5.27, 5.28, 8.25 through 8.34 |
| System Access Control Policy | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-10, AC-11, AC-12, AC-13, AC-14, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21, AC-22, AC-23, AC-24, AC-25, IA-2, IA-3, IA-4, IA-5, IA-7, IA-8, IA-10, IA-11 | CC6.1, CC6.2, CC6.3, CC6.4, CC6.5, CC6.8 | 5.15, 5.16, 5.17, 5.18, 8.2, 8.3, 8.4, 8.5 |
| Vendor Management Policy | PS-7, SA-9, SA-10, SA-11, SA-12, SA-15, SA-19, SA-20, SA-22, SA-23, SR-1 through SR-13 | CC6.1, CC9.1, CC9.2 | 5.19, 5.20, 5.21, 5.22, 5.23, 8.30, 8.31 |
| Vulnerability Management Policy | RA-3, RA-5, RA-6, SI-2, SI-3, SI-4, SI-5, SI-6, SI-7, SI-10, CA-8, CM-3, CM-4, CM-6, CM-8, CM-10, CM-11 | CC7.1, CC7.2, CC7.3, CC7.4, CC7.5 | 8.8, 8.9, 8.32 |

## How to use this mapping

**For auditors:** This table shows which policies cover which framework requirements. When an auditor asks "how do you address NIST AC-2 (Account Management)," point them to the System Access Control Policy.

**For gap analysis:** If you are pursuing a specific framework, check that you have implemented all policies that map to its requirements. For example, SOC 2 requires controls across all nine CC criteria. Verify that every CC criterion has at least one policy mapped to it.

**For control rationalization:** If you have been asked to implement controls from multiple frameworks, this mapping shows where a single policy satisfies requirements from multiple frameworks. The System Access Control Policy alone maps to 25 NIST 800-53 controls, 8 SOC 2 criteria, and 13 ISO 27001 controls.

## Framework quick reference

### NIST SP 800-53 Rev 5
The US federal standard for security and privacy controls. Organized into 20 control families. Used by federal agencies and contractors. Also adopted voluntarily by private sector organizations as a comprehensive control framework.

### SOC 2 (Trust Services Criteria)
Developed by the AICPA. Organized around five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. The CC (Common Criteria) series applies across all five categories. SOC 2 is the most common compliance framework for US-based SaaS companies.

### ISO 27001:2022
International standard for information security management systems. Organized around Annex A controls and clauses 4-10. Widely adopted internationally. Often required for business with European or multinational customers. More prescriptive than SOC 2 about the structure of the management system itself.
