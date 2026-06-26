1|# Database Password Management Process
2|
3|Policy Title: Database Password Management Process
4|Policy Number: ISP-____
5|Effective Date: ____
6|Version: 1.0
7|Classification: Internal
8|Approved By: ____
9|
10|## Introduction
11|
12|In accordance with the Password Policy, all database credentials - particularly those protecting production data - must be unique, complex, and regularly rotated. This document provides the operational procedures for managing and rotating database passwords across all production database systems while maintaining service uptime.
13|
14|This process applies to all production database systems, including managed database services, self-hosted database instances, and database clusters used by applications and services.
15|
16|## Credential Storage Architecture
17|
18|All production database credentials must be stored in a centralized secrets management service. The organization's standard secrets management platform stores credentials as encrypted secrets, with access controlled by identity and access management policies.
19|
20|### Connection Requirements
21|
22|Applications and services must connect to databases using a centralized secrets management service for credential retrieval. Hardcoded credentials in source code, compiled binaries, or unversioned configuration files are prohibited. Each application must have a unique database user and credential - shared credentials across applications are prohibited.
23|
24|Database credentials must never be committed to source code repositories, included in documentation, or transmitted over unencrypted channels.
25|
26|## Password Rotation Schedule
27|
28|### Rotation Requirements
29|
30|Database credentials must be rotated on the following schedule:
31|
32|- Production database credentials: every ____ days (recommended: 90 days).
33|- Non-production database credentials: every ____ days (recommended: 180 days).
34|- Break-glass / emergency access credentials: immediately after each use.
35|
36|Rotation must be automated where the secrets management service supports it. Manual rotation is permitted only for systems where automated rotation is technically infeasible, and must occur during a pre-defined maintenance window coordinated with application owners. Post-rotation verification must confirm that all dependent applications connect successfully with the new credential.
37|
38|If a password rotation fails, the credential must be immediately reverted to a known working state. The database must not be left in an unknown password state. Failed rotations must be documented as incidents with root cause investigation completed before attempting another rotation.
39|
41|
42|## Access Control
43|
44|Access to database credentials must be strictly controlled:
45|
46|- Credentials stored in the secrets management service must be accessible only to authorized applications and personnel via IAM policies or equivalent access controls.
47|- Access to retrieve secret values manually must be logged and audited.
48|- Credential storage locations (environment files, configuration files) must have file permissions restricted to the application user only.
49|- Shared or group credentials for database access are prohibited. Each application must have a unique database user and credential.
50|- Database credentials must never be committed to source code repositories, included in documentation, or transmitted over unencrypted channels.
51|
53|
54|## Roles and Responsibilities
55|
56|| Role | Responsibility |
57||------|----------------|
58|| ____ (e.g., Infrastructure Lead) | Owns the password rotation schedule; ensures secrets management platform availability |
59|| ____ (e.g., Database Administrators) | Execute database-side password updates; verify database connectivity post-rotation |
60|| Application Owners | Coordinate application-side credential updates; verify application connectivity post-rotation |
61|| ____ (e.g., Security Officer) | Reviews rotation compliance; audits credential access logs |
62|| ____ (e.g., IT Operations) | Supports rotation execution during maintenance windows; monitors for rotation failures |
63|
64|## Compliance and Enforcement
65|
66|Failure to rotate database credentials on schedule, failure to use the secrets management service for credential storage, or storage of database credentials in unauthorized locations (source code, shared documents, unencrypted files) is a violation of this process and the Password Policy and may result in disciplinary action as outlined in the Information Security Policy.
67|
68|## Related Documents
69|
70|- Password Policy
71|- Information Security Policy
72|- Encryption Policy
73|- System Access Control Policy
74|- Backup Policy
76|
77|## Revision History
78|
79|| Version | Date | Author | Description |
80||---------|------|--------|-------------|
81|| 1.0 | ____ | ____ | Initial version |
82|