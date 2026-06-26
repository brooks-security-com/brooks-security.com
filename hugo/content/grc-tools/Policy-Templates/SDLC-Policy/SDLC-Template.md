1|# Software Development Life Cycle (SDLC) Policy
2|
3|Policy Title: Software Development Life Cycle Policy
4|Policy Number: ISP-____
5|Effective Date: ____
6|Version: 1.0
7|Classification: Internal
8|Approved By: ____
9|
10|## Purpose
11|
12|This policy defines the high-level requirements for providing business program managers, project managers, technical leads, and other stakeholders with guidance to support the approval, planning, and lifecycle development of ____ software systems, aligned with the Information Security Program. It ensures that information security is integrated into every phase of the software development lifecycle.
13|
14|## Scope
15|
16|This policy applies to:
17|
18|- All software developed by or for ____, including internal applications, customer-facing applications, APIs, mobile applications, and system utilities.
19|- All software development methodologies employed (Waterfall, Agile, Iterative, DevOps, etc.).
20|- All personnel involved in the software development lifecycle, including developers, architects, quality assurance testers, project managers, and system owners.
21|- Software developed by third parties or outsourced development teams on behalf of ____.
22|
23|## Roles and Responsibilities
24|
25|| Role | Responsibility |
26||------|----------------|
27|| ____ (e.g., Security Officer) | Annual policy review and updates; security requirements oversight |
28|| ____ (e.g., Privacy Officer / Data Protection Officer) | Approval of systems handling personal or sensitive data |
29|| Development Managers / Tech Leads | Ensuring SDLC security requirements are implemented within their teams |
30|| Developers | Secure coding practices; code review participation; remediation of security findings |
31|| QA / Testers | Security testing; verification of security requirements |
32|| Product Managers / System Owners | Defining security requirements during planning; accepting residual risk |
33|
34|## Policy
35|
36|____ must establish and maintain processes for ensuring that all computer applications and systems follow an SDLC process that is consistent, repeatable, and maintains information security at every stage. Security must be integrated from the earliest phases ("shift left") rather than being added as an afterthought.
37|
38|## Software Development Phases and Security Integration
39|
41|
42|### Phase 1: Determine System Need
43|
44|An information system need is identified and a decision is made whether to commit resources.
45|
46|**Required Security Activities:**
47|
48|- Conduct an initial security impact assessment: will this system process, store, or transmit sensitive or regulated data?
49|- Identify applicable regulatory and compliance requirements (GDPR, HIPAA, PCI DSS, SOC 2, etc.).
50|- Determine the system's information classification level.
51|- Identify external dependencies and third-party components that may introduce supply chain risk.
52|- Document security and privacy requirements at a high level for inclusion in the business case.
53|
55|
56|### Phase 2: Define System Requirements
57|
58|User requirements are decomposed into detailed functional and non-functional requirements.
59|
60|**Required Security Activities:**
61|
62|- Conduct a formal information security risk assessment for the proposed system.
63|- Define detailed, testable security requirements covering: authentication and authorization, data protection (encryption at rest and in transit), audit logging and monitoring, input validation and output encoding, session management, error handling, and API security.
64|- Identify security controls that must be inherited from the organizational security framework.
65|- Document security requirements in the system requirements specification.
66|- Complete privacy review and approval (if handling personal data).
67|
69|
70|### Phase 3: Design System Components
71|
72|Requirements are transformed into architectural and detailed design specifications.
73|
74|**Required Security Activities:**
75|
76|- Conduct threat modeling to identify potential threats and attack vectors using structured methodologies (STRIDE, PASTA, or attack trees). Document identified threats, their likelihood and impact, and planned mitigations.
77|- Perform architecture risk analysis.
78|- Design security controls into the system architecture: authentication and authorization architecture, encryption architecture (key management, certificates), network segmentation and API gateway design, and logging and monitoring architecture.
79|- Apply secure design principles: defense in depth, least privilege, secure by default, fail secure, economy of mechanism, complete mediation, open design, separation of duties, and psychological acceptability.
80|- Review data flow diagrams to identify trust boundaries and data sensitivity at each boundary.
81|
83|
84|### Phase 4: Build System Components
85|
86|Detailed design is transformed into coded software units, integrated into a complete product.
87|
88|**Required Security Activities:**
89|
90|- **Secure Coding Standards:** All developers must follow secure coding practices aligned with the OWASP Top 10 and language-specific guidelines.
91|- **Developer Security Training:** All developers must complete annual secure coding training before writing or supporting production code. Developers on internet-facing applications must receive additional training.
92|- **Automated Security Testing (CI/CD Pipeline):** SAST, SCA, container scanning, IaC scanning, and secret scanning must be integrated into the build pipeline. The pipeline must fail builds for Critical and High severity findings.
93|- **Code Review:** All code changes must be reviewed by at least one individual other than the author. Reviews must include security vulnerability assessment, not just functional correctness.
94|- **Secrets Management:** Secrets must never be hardcoded or committed. They must be managed through a dedicated secrets management system with credential scanning to prevent accidental exposure.
95|- **Environment Separation:** Development, testing, and production environments must be separated. Access to production must be restricted and controlled through change management.
96|
98|
99|### Phase 5: Evaluate System Readiness
100|
101|The system is tested to verify it satisfies functional, performance, and security requirements.
102|
103|**Required Security Activities:**
104|
105|- **Security Testing:** DAST scanning of running applications, penetration testing for high-risk or internet-facing applications (at least annually), API security testing, authentication/authorization testing, and fuzz testing where appropriate.
106|- **Quality Assurance Testing:** Feature acceptance tests must include edge cases, boundary conditions, and negative test cases.
107|- **Security Acceptance Criteria:** The system must meet all defined security requirements before deployment. Any exceptions must be formally documented with risk acceptance.
108|- **Independent Testing:** Where possible, security testing should be performed by testers independent of the development team.
109|
111|
112|### Phase 6: System Deployment
113|
114|The system is released initially to a pilot or staging environment and then into production.
115|
116|**Required Security Activities:**
117|
118|- Complete the **Pre-Deployment Checklist:** all Critical/High security findings resolved, security configuration hardened per baselines, default accounts/passwords removed, test data and debug functionality removed, encryption configured and verified, logging and monitoring configured, and deployment automation with human approval gates for production.
119|- All production deployments must follow the change management process.
120|- Monitor the system for security events, errors, and performance issues for at least ____ days post-deployment.
121|- Provide security training to users of the new system.
122|
124|
125|### Project Management
126|
127|The sequence and iteration of development phases depends on the project management approach:
128|
129|- **Waterfall:** Sequential phases with formal gate reviews between each phase.
130|- **Agile / Scrum:** Iterative cycles (sprints) with security activities integrated into each sprint's definition of done.
131|- **DevOps / Continuous Delivery:** Security activities integrated into the CI/CD pipeline (DevSecOps), with automated security gates.
132|- **Staged Delivery:** Phases may overlap across multiple releases; security requirements apply to each release increment.
133|
134|Regardless of methodology, security activities must be traceable from requirements through design, implementation, testing, and deployment.
135|
136|## SDLC Security Controls - Detailed Requirements
137|
138|### Production Data in Non-Production Environments
139|
140|Production data must NOT be used in development or testing environments. If a specific situation requires the use of production data for testing:
141|
142|- The Information Resource Owner must provide written approval before production data can be used for testing.
143|- Production data must be tokenized, anonymized, pseudonymized, or de-identified wherever possible.
144|- A separate copy of production data must be used; the test location must be acceptable (e.g., production data on a developer laptop is NOT acceptable).
145|- Data must not be extracted, handled, or used in a manner that subjects it to unauthorized disclosure.
146|- Access to the test data must follow the same access control procedures as the production environment (need-to-know basis).
147|- Each copy of production data to a test environment requires separate authorization.
148|- Copying production data to test environments must be logged for an audit trail.
149|- Access to production data in test environments must be restricted to individuals with a documented business need.
150|- Production data used for testing must be securely erased upon completion of testing.
151|- Test data, test accounts, and test credentials must be removed before systems are placed into production.
152|
154|
155|### Third-Party and Outsourced Development
156|
157|If software development is outsourced to third parties, the following must be addressed across the entire external supply chain, in conjunction with the Vendor Management Policy:
158|
159|- Licensing arrangements, code ownership, and intellectual property rights related to outsourced content.
160|- Contractual requirements for secure design, coding, and testing practices.
161|- Provision of the approved threat model to the external developer.
162|- Acceptance testing for quality, accuracy, and security of deliverables.
163|- Evidence that security thresholds were used to establish minimum acceptable levels of security and privacy quality.
164|- Evidence that sufficient testing has been applied to guard against intentional and unintentional malicious content (backdoors, logic bombs).
165|- Evidence that sufficient testing has been applied to guard against known vulnerabilities.
166|- Source code escrow arrangements (if source code becomes unavailable).
167|- Contractual right to audit development processes and controls.
168|- Effective documentation of the build environment used to create deliverables.
169|- ____ remains responsible for compliance with applicable laws and control effectiveness verification, even when development is outsourced.
170|
171|### Error Handling and Logging
172|
173|- Error messages must not leak sensitive information (stack traces, internal IP addresses, database schema, API keys).
174|- User-facing error messages must be generic; detailed error information must be logged server-side for debugging.
175|- All security-relevant events must be logged in accordance with the Logging and Monitoring Policy.
176|
177|### Encryption
178|
179|- Restricted, Confidential, and Protected information must be encrypted at rest and in transit per the Encryption Policy.
180|- Encryption algorithms and key lengths must meet current industry standards (avoid deprecated algorithms like MD5, SHA-1, DES, 3DES, RC4).
181|- TLS must be configured to current best practices (disable older protocols and weak cipher suites).
182|
183|### Change Control
184|
185|- All changes to production environments must strictly follow change control procedures.
186|- All changes must have human approval granted by an authorized owner of that environment.
187|- Automated updates must NOT be allowed without such approval (except for pre-approved automated security patching within defined parameters).
188|- Emergency changes must follow an expedited process with post-change review.
189|
190|## Compliance and Enforcement
191|
192|Violation of this policy, including failure to follow secure coding practices, failure to complete required security testing, or deployment of code containing Critical unaddressed security findings, may result in disciplinary action as outlined in the Information Security Policy.
193|
194|## Related Documents
195|
196|- Information Security Policy (ISP-001)
197|- Change Management Policy
199|- Vulnerability Management Policy
200|- Encryption Policy
201|- Logging and Monitoring Policy
202|- Data Classification Policy
203|- Vendor Management Policy
204|- Risk Assessment Policy
206|
207|## Revision History
208|
209|| Version | Date | Author | Description |
210||---------|------|--------|-------------|
211|| 1.0 | ____ | ____ | Initial version |
212|