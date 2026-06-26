# Risk Register Template

This template implements the risk assessment methodology defined in the Risk Assessment Policy. It uses a standard likelihood × impact scoring model to prioritize risks and track treatment plans.

## How to use this template

1. Identify risks through the annual risk assessment process, audit findings, incident post-mortems, and ongoing operations.
2. Score each risk for likelihood and impact using the criteria below.
3. Calculate the risk score (likelihood × impact).
4. Determine the risk level and required treatment.
5. Assign a risk owner and track treatment to completion.
6. Review the register quarterly and update as risks change.

## Scoring Criteria

### Likelihood

| Score | Description | Guideline |
|-------|-------------|-----------|
| 1 (Rare) | Once in 100+ years | Less than 10% chance over the organization's lifespan |
| 2 (Unlikely) | Once in 50-100 years | 10-35% chance |
| 3 (Possible) | Once in 25-50 years | 35-65% chance |
| 4 (Likely) | Once in 2-25 years | 65-90% chance |
| 5 (Certain) | Up to once in 2 years | Greater than 90% chance |

### Impact

| Score | Description | Financial | Reputational | Regulatory |
|-------|-------------|-----------|--------------|-------------|
| 1 (Incidental) | Minimal | Under $10,000 loss | Local, short-term attention | Not reportable |
| 2 (Minor) | Minor | $10,000 - $100,000 | Local reputational damage | Reportable, no follow-up |
| 3 (Moderate) | Moderate | $100,000 - $500,000 | National short-term coverage | Report with immediate correction required |
| 4 (Major) | Significant | $500,000 - $5,000,000 | National long-term coverage; market share loss | Major corrective action project required |
| 5 (Extreme) | Massive | Over $5,000,000 | International coverage; game-changing | Prosecution, fines, litigation, incarceration |

### Risk Level

| Risk Score | Level | Required Action |
|------------|-------|----------------|
| 1-4 | Low | Accept or treat at management discretion |
| 5-9 | Medium | Treat or transfer within current planning cycle |
| 10-16 | High | Treat within 90 days; escalate to oversight body |
| 17-25 | Critical | Treat within 30 days; immediate escalation |

## Risk Register Table

Copy the table below into a spreadsheet. Each row is one risk.

| ID | Risk Description | Category | Likelihood (1-5) | Impact (1-5) | Risk Score | Risk Level | Risk Owner | Treatment | Treatment Description | Residual Likelihood | Residual Impact | Residual Score | Target Date | Status |
|----|-----------------|----------|------------------|-------------|------------|------------|------------|-----------|----------------------|--------------------|----------------|----------------|-------------|--------|
| R001 | ____ | ____ | | | | | | | | | | | | |
| R002 | ____ | ____ | | | | | | | | | | | | |

**Categories:** Cybersecurity, Operational, Financial, Regulatory/Legal, Reputational, Third-Party, Physical, HR/Personnel

**Treatment options:**
- **Avoid:** Stop the activity that creates the risk
- **Mitigate:** Implement controls to reduce likelihood or impact
- **Transfer:** Shift risk through insurance or contractual arrangements
- **Accept:** Formally accept the risk (requires documented justification)

**Status:** Identified, In Treatment, Accepted, Closed

## Example Risks

Use these examples to calibrate your own scoring. Replace with your organization's actual risks.

| ID | Risk Description | Likelihood | Impact | Score | Level | Treatment |
|----|-----------------|-----------|--------|-------|-------|-----------|
| R001 | Ransomware encrypts production systems; backups also compromised because they were in the same network segment | 3 (Possible) | 5 (Extreme) | 15 | High | Mitigate: Implement offline backups, network segmentation, EDR, and tested restore procedures |
| R002 | Employee falls for phishing attack; attacker gains access to email and resets passwords on SaaS tools | 5 (Certain) | 3 (Moderate) | 15 | High | Mitigate: Deploy phishing-resistant MFA, security awareness training, and conditional access policies |
| R003 | Critical third-party SaaS vendor experiences extended outage; customer-facing service unavailable | 3 (Possible) | 3 (Moderate) | 9 | Medium | Transfer: Require vendor SLA with credits; develop manual workaround process |
| R004 | Developer accidentally exposes API key in public GitHub repository | 4 (Likely) | 2 (Minor) | 8 | Medium | Mitigate: Implement pre-commit secret scanning, credential scanning in CI/CD, and automated key rotation |
| R005 | Data center fire destroys primary hosting facility | 1 (Rare) | 5 (Extreme) | 5 | Medium | Transfer: Insurance; Mitigate: Multi-region deployment with automated failover |

## Annual Review Process

1. Review all risks in the register. Update likelihood and impact scores based on changes in the threat landscape, business operations, or control effectiveness.
2. Verify that treatment plans are progressing. Escalate stalled treatments.
3. Identify new risks from: recent incidents (internal and industry), audit findings, technology changes, organizational changes, regulatory changes.
4. Remove or close risks that are no longer relevant (control implemented, activity discontinued).
5. Present the updated register to the oversight body. Document decisions, especially risk acceptances.
