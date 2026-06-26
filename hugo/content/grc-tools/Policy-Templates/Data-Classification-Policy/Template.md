1|# Data Classification Policy
2|
3|Policy Title: Data Classification Policy
4|Policy Number: DCP-001
5|Effective Date: ____
6|Version: 1.0
7|Classification: Internal
8|Approved By: ____
9|
10|## Purpose
11|
12|This policy provides Personnel and third parties with a standardized framework for classifying, labeling, and handling organizational information based on its sensitivity and the potential impact of unauthorized disclosure, alteration, or destruction. The classification scheme defined in this policy enables consistent application of security controls appropriate to each level of information sensitivity.
13|
14|## Scope
15|
16|This policy applies to all information owned, managed, controlled, or maintained by ____, regardless of the medium on which it resides. Covered information includes, but is not limited to, data that is received, stored, processed, or transmitted via any means - electronic, hardcopy, verbal, or any other form. All Personnel, contractors, and third parties with access to organizational information are subject to this policy.
17|
18|## Policy
19|
20|### Classification Levels
21|
22|All organizational data must be classified into one of the following four tiers based on the potential impact of a confidentiality, integrity, or availability breach:
23|
24|#### Restricted (Level 4)
25|
26|**Definition:** Highly sensitive information whose unauthorized disclosure, alteration, or destruction would cause **severe or catastrophic** impact to ____, its customers, or its partners. This classification is typically driven by external legal, regulatory, or contractual requirements.
27|
28|**Examples:** Personally Identifiable Information (PII), Protected Health Information (PHI), payment card data, authentication secrets, encryption keys, customer data subject to data protection regulations, legally privileged communications.
29|
30|**Handling Requirements:**
31|- Access is limited to specifically authorized individuals with a documented business need.
32|- Explicit approval from the Security Officer (or designee) is required for access provisioning.
33|- Encryption is mandatory at rest and in transit.
34|- Must not be transmitted via unencrypted channels (email, chat, file transfer without encryption).
35|- Physical copies must be stored in locked, access-controlled environments.
36|- Destruction must use verified secure deletion methods (shredding for physical, cryptographic erasure or secure wipe for digital).
37|
38|#### Confidential (Level 3)
39|
40|**Definition:** Sensitive information whose unauthorized disclosure, alteration, or destruction would cause **significant** impact to ____. This classification is typically driven by internal business requirements, contractual obligations, or privacy considerations.
41|
42|**Examples:** Internal financial data, business strategy documents, customer contracts, employee personnel records, unreleased product information, security architecture documentation, internal audit reports.
43|
44|**Handling Requirements:**
45|- Access is limited to authorized Personnel with a legitimate business need.
46|- Encryption is required in transit; encryption at rest is strongly recommended.
47|- Physical copies must be stored in secured areas when unattended.
48|- Sharing with third parties requires a Non-Disclosure Agreement (NDA).
49|
50|#### Internal (Level 2)
51|
52|**Definition:** Non-sensitive information originating within or owned by ____, or entrusted to it by others, whose unauthorized disclosure would cause **moderate** impact. This is the default classification for all organizational information not explicitly classified at another level.
53|
54|**Examples:** Internal policies and procedures, training materials, general internal communications, project plans, employee directory, operational metrics.
55|
56|**Handling Requirements:**
57|- Access is limited to Personnel and authorized third parties.
58|- Encryption is recommended but not required for internal transmission.
59|- May not be released to the general public without authorization.
60|- Reasonable care must be taken to prevent inadvertent disclosure.
61|
62|#### Public (Level 1)
63|
64|**Definition:** Information that has been approved for public release and whose disclosure would cause **no appreciable** impact to ____.
65|
66|**Examples:** Marketing materials, public website content, press releases, published job postings, publicly filed documents.
67|
68|**Handling Requirements:**
69|- No confidentiality controls required.
70|- Integrity controls should be applied to prevent unauthorized modification of public-facing content.
71|- Public release must be approved by the designated authority (e.g., Marketing or Communications).
72|
73|### Data Classification Decision Matrix
74|
75|When the appropriate classification is not immediately apparent, use the following matrix as a guide:
76|
77|| Classification | Confidentiality Impact | Integrity Impact | Availability Impact | Regulatory Driver |
78||----------------|----------------------|------------------|---------------------|-------------------|
79|| **Restricted** | Severe harm to individuals or organization | Critical to safety or legal compliance | Must be continuously available | GDPR, HIPAA, PCI-DSS, CCPA |
80|| **Confidential** | Significant competitive or reputational harm | Important to business operations | Important for business continuity | Contractual obligations, NDAs |
81|| **Internal** | Moderate inconvenience or minor reputational impact | Some operational impact | Some operational impact | Internal policy |
82|| **Public** | No harm | No harm (integrity still desirable) | No critical dependency | None |
83|
84|### Handling Controls Matrix
85|
86|| Control | Restricted | Confidential | Internal | Public |
87||---------|-----------|-------------|----------|--------|
88|| **Access Control** | Explicit authorization required; least privilege enforced | Role-based access; business need required | Role-based access for Personnel | Open access |
89|| **Encryption at Rest** | Mandatory (AES-256-GCM or equivalent) | Strongly recommended; mandatory on mobile/portable devices | Recommended | Not required |
90|| **Encryption in Transit** | Mandatory (TLS 1.3 minimum) | Mandatory (TLS 1.2 minimum) | Recommended | Not required |
91|| **Email Transmission** | Prohibited without end-to-end encryption | Encryption required; do not forward | Caution advised; do not forward | No restrictions |
92|| **Physical Storage** | Locked, access-controlled environment; separate secure storage | Secured area; locked when unattended | General office security | No restrictions |
93|| **Disposal** | Cryptographic erasure or verified physical destruction | Secure deletion or cross-cut shredding | Standard deletion or shredding | Standard deletion |
94|| **Third-Party Sharing** | NDA required; written approval required; encryption mandatory | NDA recommended; encryption required | Business justification required | No restrictions |
95|| **Mobile Devices** | Encryption mandatory; remote wipe enabled | Encryption mandatory; remote wipe enabled | Encryption recommended | No requirements |
96|| **Logging and Monitoring** | Full access logging; real-time alerting | Access logging; periodic review | Basic access logging | Not required |
97|
98|### Information Aggregation
99|
100|When information from multiple classification levels is combined in a single document, repository, or system, the entire aggregate must be protected at the level of the most sensitive component. For example, a report containing both Internal and Restricted data must be treated as Restricted.
101|
102|### De-Identification
103|
104|Data that has been de-identified through the removal of all direct and indirect identifiers is no longer subject to Restricted or Confidential handling requirements, provided the de-identification process has been validated and re-identification risk is acceptably low. De-identified data must be reviewed periodically to ensure re-identification risks remain managed.
105|
106|### Labeling Requirements
107|
108|- **Restricted:** Documents must be clearly marked "RESTRICTED" in the header or footer. Electronic files should include the classification in the filename or metadata.
109|- **Confidential:** Documents must be marked "CONFIDENTIAL." Electronic labeling is strongly recommended.
110|- **Internal:** Electronic labeling is recommended but not required. Hardcopy labeling is at the discretion of the document owner.
111|- **Public:** No labeling required. Documents intended for public release should indicate approval authority.
112|
113|## Roles and Responsibilities
114|
115|| Role | Responsibility |
116||------|----------------|
117|| ____ (e.g., CISO / Security Officer) | Policy owner; annual review; classification guidance; approves Restricted data access |
118|| Data Owners | Classify information under their stewardship; authorize access; review classifications periodically |
119|| Data Custodians | Implement and maintain technical controls per classification requirements |
120|| All Personnel | Properly classify, label, and handle information in accordance with this policy; report misclassification |
121|| Privacy Officer / Legal | Advise on regulatory classification requirements; review de-identification processes |
122|
123|## Compliance and Enforcement
124|
125|Compliance with this policy is verified through periodic audits, automated data discovery tools, and review of access controls. Personnel found to have violated this policy may be subject to disciplinary action, up to and including termination of employment or engagement.
126|
127|Misclassification of data - particularly under-classification of Restricted data - is a serious policy violation and must be remediated immediately upon discovery.
128|
129|## Exceptions
130|
131|Requests for exceptions to any provision of this policy must be submitted in writing to the Security Officer (or designee) and must include a business justification, a risk assessment, and compensating controls. Approved exceptions must be reviewed and revalidated on at least a ____ (e.g., quarterly) basis.
132|
133|## Related Documents
134|
135|- Information Security Policy
136|- Data Protection Policy
137|- Data Retention Policy
138|- Encryption Policy
139|- System Access Control Policy
140|- Acceptable Use Policy
142|
143|## Revision History
144|
145|| Version | Date | Author | Description |
146||---------|------|--------|-------------|
147|| 1.0 | ____ | ____ | Initial version. Four-tier classification (Public, Internal, Confidential, Restricted). |
148|