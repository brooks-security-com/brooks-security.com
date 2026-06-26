1|# Asset Management Policy
2|
3|Policy Title: Asset Management Policy
4|Policy Number: ISP-004
5|Effective Date: ____
6|Version: 1.0
7|Classification: Internal
8|Approved By: ____
9|
10|## Purpose
11|
12|The purpose of this policy is to define requirements for managing and properly tracking assets owned, managed, and under the control of ____ through their lifecycle from initial acquisition to final disposal.
13|
14|## Scope
15|
16|This policy applies to all physical and virtual assets owned, leased, or managed by the organization, including but not limited to servers, workstations, laptops, mobile devices, networking equipment, virtual machines, software licenses, and cloud resources.
17|
18|## Policy
19|
20|### Physical and Virtual Asset Standard
21|
22|The organization must ensure proper management of assets to maximize information security. The following procedures must be enforced:
23|
24|- A detailed asset inventory must be maintained to track and monitor all significant assets.
25|- Items may be excluded from the inventory only if they carry very low purchase/replacement costs (including time and labor needed to install and configure) and pose little or no risk to business operations or compliance status.
26|- Each significant asset must be associated with an identifier, license, or tag, and proper classification when applicable. Details must include a description of the type, make/model, technical specifications, license details, and software versions.
27|- Assets that contain, store, or handle information must be classified per the Data Classification Policy.
28|- The disposal or replacement of assets must be tracked, whether due to depreciation, expiring leases, obsolescence, loss, or other reasons.
29|- A reporting function must support auditing and monitoring for compliance.
30|
31|### Asset Inventory Standard
32|
33|An asset inventory process must be in place to support the management of critical business processes and meet legal and regulatory requirements. The inventory process must also support discovery, management, and replacement or disposal of all assets.
34|
35|All physical and virtual assets under organizational management or control must include:
36|
37|- Unique identifier (e.g., serial number) or name of the asset
38|- Description of the asset
39|- Purpose of the asset and the role it supports in critical business processes and in meeting legal or regulatory requirements
40|- Entity responsible for the asset
41|- Classification of the asset, as prescribed in the Data Classification Policy
42|
43|### Physical Asset Inventory
44|
45|The organization must maintain an inventory of all organization-owned physical computing equipment, including but not limited to:
46|
47|- Servers
48|- Workstations
49|- Laptops
50|- Printers
51|- Networking equipment
52|
53|All organization-owned devices are subject to a complete data wipe if deemed necessary, such as in the case of device infection or repurposing. This data wipe must be carried out by authorized personnel using approved sanitization methods.
54|
55|### Digital Asset Inventory
56|
57|The organization must maintain records of all digital assets, including but not limited to:
58|
59|- Virtual machines
60|- Virtual servers (cloud instances)
61|- Virtual repositories
62|- Security agents
63|- Source code repositories
64|- User accounts
65|
66|Records must be tagged with owner or project and classification when applicable. All records must be kept up to date through automation where possible.
67|
68|### Asset Retirement Standard
69|
70|The ____ determines when an asset is no longer needed or is obsolete. If the asset to be replaced or retired supports mandatory legal or regulatory requirements of critical business processes, the information resource owner must ensure that any replacement asset can support these processes before the current asset is retired.
71|
72|Before retiring or replacing any asset that retains data, data retention requirements for all data stored or managed by that asset must be reviewed. Any data subject to data retention requirements must be migrated to an appropriate destination and tested for appropriateness, completeness, accessibility, and retrievability before the original data is deleted.
73|
74|### System Hardening
75|
76|System hardening must follow industry-standard benchmarks (CIS or equivalent) and organizational configuration standards.
77|
78|#### Device Hardening
79|
80|All endpoint devices must be hardened according to CIS benchmarks or equivalent industry standards. Vendor defaults must be changed. Insecure protocols must be disabled. Local passwords must use the approved secrets manager. Patching must be automated. Malware protection must be enabled. Logging and MFA must be configured.
81|
82|#### Infrastructure Patching
83|
84|OS and infrastructure patches must be evaluated and installed based on criticality during off-peak hours. Infrastructure changes must be reviewed and approved via staging. Redundant systems must be patched serially. Network diagrams and config standards must be documented and current.
85|
86|#### Endpoint Security
87|
88|Anti-malware/EDR must be deployed on all endpoints with automatic updates, scanning, and alerting.
89|
91|
92|### Physical Media Transfer
93|
94|Physical media transfers must follow secure handling procedures. Electronic transfer is preferred. When physical media is required, data must be encrypted. Approved couriers must be used with verification of identification. Packaging must protect against physical damage. Transfers must be logged with content description, protection type, times, and receipt confirmation.
95|
97|
98|### Return of Assets
99|
100|Upon termination, all issued assets must be returned. The process includes return of physical and electronic assets. If equipment was purchased by or entrusted to an employee or third party, information must be transferred to the organization and securely erased. Unauthorized copying must be monitored and controlled.
101|
103|
104|### Media Disposal
105|
106|Media containing confidential information must be disposed of proportionally to sensitivity. Secure disposal via approved third-party services is required. Sanitization through incineration, shredding, or cryptographic erasure must follow the Encryption Policy. Disposal must be logged for audit trail purposes. Damaged media must be assessed for disposal vs. repair. Sanitization procedures must be tested annually.
107|
109|
110|## Roles and Responsibilities
111|
112|| Role | Responsibility |
113||------|----------------|
114|| ____ | Inventory maintenance; asset lifecycle management |
115|| Information Resource Owners | Data migration; retirement decisions |
116|| ____ | Sanitization; disposal oversight |
117|
118|## Compliance and Enforcement
119|
120|Violation of this policy may result in disciplinary action as outlined in the Information Security Policy.
121|
122|## Related Documents
123|
124|- Information Security Policy (ISP-001)
125|- Data Classification Policy
126|- Encryption Policy
127|- Vendor Management Policy
129|
130|## Revision History
131|
132|| Version | Date | Author | Description |
133||---------|------|--------|-------------|
134|| 1.0 | ____ | ____ | Initial version |
135|