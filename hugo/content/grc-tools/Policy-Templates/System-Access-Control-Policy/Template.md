1|# System Access Control Policy
2|
3|Policy Title: System Access Control Policy
4|Policy Number: SAC-001
5|Effective Date: ____
6|Version: 1.0
7|Classification: Internal
8|Approved By: ____
9|
10|## Purpose
11|
12|This policy establishes the requirements for provisioning, modifying, reviewing, and revoking access to ____'s information systems and data. It ensures that access is granted based on the principle of least privilege, properly authorized, and regularly reviewed to maintain alignment with job responsibilities.
13|
14|## Scope
15|
16|This policy applies to all systems, applications, networks, and data repositories owned or managed by ____. It governs access for all users, including employees, contractors, temporary workers, business partners, and any other individuals granted access to organizational information systems.
17|
18|## Policy
19|
20|### General Access Principles
21|
22|Access to organizational systems and data is governed by the following principles:
23|
24|- **Least Privilege:** Access is limited to the minimum necessary to perform assigned job responsibilities.
25|- **Need to Know:** Access to sensitive information requires a demonstrable business need.
26|- **Separation of Duties:** Conflicting responsibilities must be assigned to different individuals where feasible.
27|- **Individual Accountability:** All access must be attributable to a unique individual. Shared accounts are prohibited except in narrowly defined circumstances with documented justification and compensating controls.
28|- **Periodic Review:** All access rights must be formally reviewed at least ____ (e.g., quarterly).
29|
30|### Access Provisioning
31|
32|Access must be provisioned through a formal, documented process that includes: request submission with business justification, approval by the system owner or designated approver, identity verification, role-based access assignment per the principle of least privilege, and policy acknowledgment before activation. Roles must be defined by job function, not individual identity, and documented. Privileged access must be explicitly authorized, use just-in-time (JIT) provisioning with automatic expiration (max ____ hours), and be logged. Third-party and contractor access must be limited in scope and duration with a defined expiration, supported by a valid contract, and promptly revoked upon contract completion.
33|
35|
36|### Access Reviews
37|
38|Formal access reviews must be conducted by system owners and managers on a ____ (e.g., quarterly) schedule. Each review must confirm that the individual still requires access, the level of access is appropriate, and no unauthorized escalation has occurred. Unneeded access must be revoked; discrepancies must be remediated and documented. Reviews must be completed within ____ (e.g., 30) days of initiation, and results must be documented and retained.
39|
41|
42|### Unique User Identification
43|
44|- Every user must have a unique user ID. Shared or generic accounts are prohibited except as noted below.
45|- User IDs must not be reused or reassigned.
46|- Identifiers should distinguish user types (e.g., employee vs. contractor naming convention).
47|- Automated logon configurations that bypass password entry are prohibited, except for the approved password manager.
48|
49|#### Shared Account Exceptions
50|
51|May be permitted only when: the system does not support individual accounts (legacy), for break-glass emergency access, or other compelling technical constraints. Any shared account exception must be documented, approved by the Security Officer, have its password stored in the password manager with access logging, reviewed at least ____ (e.g., monthly), and eliminated through system replacement as soon as feasible.
52|
53|### Workstation and Endpoint Access Controls
54|
55|- Workstations must auto-lock after ____ (e.g., 10) minutes of inactivity.
56|- Personnel must manually lock workstations when leaving them unattended.
57|- Workstation firewalls must be enabled.
58|- Full-disk encryption must be enabled per Encryption Policy.
59|- Local administrator access must be restricted; standard users must not have administrative privileges by default.
60|
61|### Offboarding and Access Revocation
62|
63|Access must be revoked according to the individual's departure type:
64|Access must be revoked according to the individual's departure type:
65|- **Voluntary Departure:** Physical access revoked by end of last working day. Logical access revoked within ____ (e.g., 1) business day. A termination checklist documents all access removal and asset return.
66|- **Involuntary Termination:** Access revoked immediately upon notification - before or simultaneously with notification to the individual.
67|- **Role Change:** Previous role access must be removed if no longer needed. New role access provisioned through standard process. Access must not accumulate across roles.
68|- **Extended Inactivity:** Accounts inactive for ____ (e.g., 90) days must be disabled. Disabled accounts unused for an additional ____ (e.g., 90) days must be deleted.
69|
71|
72|### Access Control for Customer Data
73|
74|- Access to customer production data is prohibited by default for all Personnel.
75|- Temporary access granted only for specific operational needs with explicit approval.
76|- All customer data access must be logged (who, what, when, why).
77|- Customer data access logs must be reviewed weekly for anomalies.
78|
79|## Roles and Responsibilities
80|
81|| Role | Responsibility |
82||------|----------------|
83|| ____ (e.g., CISO / Security Officer) | Policy owner; annual review; conduct or delegate access reviews; approve privileged access |
84|| System Owners | Approve access requests; participate in access reviews |
85|| Managers | Request appropriate access for team members; verify access during reviews; notify IT of departures |
86|| IT / IAM | Provision and revoke access; maintain identity management system; enforce technical controls |
87|| Human Resources | Notify IT of new hires, role changes, and terminations |
88|| All Personnel | Request only necessary access; report unauthorized access; lock workstations; comply with access policies |
89|
90|## Compliance and Enforcement
91|
92|Compliance is verified through quarterly access reviews, automated monitoring of privileged account usage, audit of access logs, and periodic reconciliation of active accounts against active HR records. Violations may result in disciplinary action, up to and including termination.
93|
94|## Related Documents
95|
96|- Password Policy
97|- Data Classification Policy
98|- Acceptable Use Policy
99|- Vendor Management Policy
100|- Encryption Policy
102|
103|## Revision History
104|
105|| Version | Date | Author | Description |
106||---------|------|--------|-------------|
107|| 1.0 | ____ | ____ | Initial version |
108|