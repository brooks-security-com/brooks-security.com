# Risk Assessment Policy

Policy Title: Risk Assessment Policy
Policy Number: ISP-____
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

## Purpose

The purpose of this policy is to define the methodology for the assessment and treatment of information security risks within ____, and to define the acceptable level of risk as set by ____'s leadership. This policy establishes a consistent, repeatable framework for identifying, analyzing, evaluating, and treating information security risks across the organization.

## Scope

Risk assessment and risk treatment are applied to the entire scope of ____'s Information Security Program, and to all assets which are used within ____ or which could have an impact on information security within it. This policy applies to all employees of ____ who participate in risk assessment and risk treatment activities, including asset owners, risk owners, system owners, and members of the security and compliance teams.

## Background

A key element of ____'s Information Security Program is a holistic and systematic approach to risk management. This policy defines the requirements and processes for ____ to identify, assess, treat, and monitor information security risks. The risk management process consists of four parts:

1. **Identification** of ____'s assets, as well as the threats and vulnerabilities that apply to them.
2. **Assessment** of the likelihood and consequence (impact) of threats exploiting vulnerabilities, producing a risk rating.
3. **Treatment** - identification and implementation of appropriate risk responses for each risk rated above the organizational risk appetite.
4. **Evaluation** of residual risk after treatment, and ongoing monitoring.

This policy is aligned with industry-standard frameworks including ISO 31000 (Risk Management) and ISO 27001 (Information Security Management).

## Policy

### Risk Assessment Process

The risk assessment process includes the identification of threats and vulnerabilities associated with organizational assets.

#### Step 1: Asset Identification

The first step in the risk assessment is to identify all assets within the scope of the Information Security Program - all assets which may affect the confidentiality, integrity, and/or availability of information in the organization. Assets may include:

- Documents in paper or electronic form.
- Applications and software systems.
- Databases and data warehouses.
- Information technology equipment (servers, workstations, network devices).
- Infrastructure (on-premises, cloud, hybrid).
- External/outsourced services and processes.
- Personnel (key roles and knowledge holders).
- Physical facilities.

For each asset, an owner must be identified. The asset owner is responsible for the classification, protection, and lifecycle management of the asset.

#### Step 2: Threat and Vulnerability Identification

For each asset, identify all relevant threats and vulnerabilities. Threats and vulnerabilities must be documented in a Risk Assessment Register (or equivalent tracking system). Each asset may be associated with multiple threats, and each threat may be associated with multiple vulnerabilities.

- **Threat:** Any potential cause of an unwanted incident that may result in harm to the organization (e.g., malicious actors, natural disasters, system failures, human error).
- **Vulnerability:** A weakness in an asset or control that could be exploited by a threat (e.g., unpatched software, weak authentication, lack of encryption, insufficient training).

#### Step 3: Risk Owner Assignment

For each identified risk (threat-vulnerability pair), a risk owner must be identified. The risk owner is accountable for managing the risk, including acceptance, treatment, and ongoing monitoring. The risk owner and the asset owner may be the same individual.

#### Step 4: Risk Analysis - Impact and Likelihood Assessment

Once risk owners are identified, they must assess:

- **Impact:** The magnitude of harm that would result if the risk materializes (i.e., the threat exploits the vulnerability).
- **Likelihood:** The probability that the threat will exploit the vulnerability of the respective asset within a given timeframe.

Criteria for determining impact and likelihood are defined in the tables below. The risk level is calculated by multiplying the **Impact Score** and the **Likelihood Score**:

```
Risk Score = Impact × Likelihood
```

### Description of Impact Levels and Criteria

| Impact Value | Rating | Definition |
|--------------|--------|------------|
| **1.0 - Incidental** | Very Low | Minimal loss or damage; localized media attention quickly remedied; not reportable to regulators; isolated staff dissatisfaction. |
| **2.0 - Minor** | Low | Minor financial loss; local reputational damage; reportable incident to regulator with no follow-up required; general staff morale problems and increase in turnover. |
| **3.0 - Moderate** | Medium | Moderate financial loss; national short-term negative media coverage; report of breach to regulator with immediate correction required; widespread staff morale problems and high turnover. |
| **4.0 - Major** | High | Significant financial loss; national long-term negative media coverage; significant loss of market share; report to regulator requiring major corrective action project; senior managers depart, high turnover of experienced staff. |
| **5.0 - Extreme** | Critical | Massive financial loss; international long-term negative media coverage; game-changing loss of market share; significant prosecution and fines, litigation including class actions, incarceration of leadership; multiple senior leaders leave. |

### Description of Likelihood Values and Criteria

| Likelihood Value | Rating | Description |
|-----------------|--------|-------------|
| **1.0 - Rare** | Very Low | Once in 100+ years (<10% chance of occurrence over the life of the organization). |
| **2.0 - Unlikely** | Low | Once in 50 to 100 years (10% to 35% chance of occurrence over the life of the organization). |
| **3.0 - Possible** | Medium | Once in 25 to 50 years (35% to 65% chance of occurrence over the life of the organization). |
| **4.0 - Likely** | High | Once in 2 to 25 years (65% to 90% chance of occurrence over the life of the organization). |
| **5.0 - Certain** | Very High | Up to once in 2 years (90% or greater chance of occurrence over the life of the organization). |

### Risk Rating Criteria

| Risk Level | Risk Score |
|------------|-----------|
| **Low** | ≤ 4.0 |
| **Medium** | > 4.0 and ≤ 9.0 |
| **High** | > 9.0 and ≤ 16.0 |
| **Critical** | > 16.0 |

### Risk Score Matrix

| Likelihood ↓ / Impact → | **Incidental (1.0)** | **Minor (2.0)** | **Moderate (3.0)** | **Major (4.0)** | **Extreme (5.0)** |
|--------------------------|---------------------|-----------------|--------------------|-----------------|-------------------|
| **Certain (5.0)** | Medium (5.0) | High (10.0) | High (15.0) | Critical (20.0) | Critical (25.0) |
| **Likely (4.0)** | Low (4.0) | Medium (8.0) | High (12.0) | High (16.0) | Critical (20.0) |
| **Possible (3.0)** | Low (3.0) | Medium (6.0) | Medium (9.0) | High (12.0) | High (15.0) |
| **Unlikely (2.0)** | Low (2.0) | Low (4.0) | Medium (6.0) | Medium (8.0) | High (10.0) |
| **Rare (1.0)** | Low (1.0) | Low (2.0) | Low (3.0) | Low (4.0) | Medium (5.0) |

### Risk Appetite and Tolerance

____'s risk appetite is defined as follows:

- **Critical Risks:** Must be treated immediately. Risk acceptance at this level requires executive leadership approval. Critical risks that cannot be treated must be escalated to the Board or equivalent governing body.
- **High Risks:** Must be treated within a defined timeframe. Risk acceptance at this level requires ____ approval and documented compensating controls.
- **Medium Risks:** Should be treated where cost-effective. Risk acceptance is permitted with documented justification.
- **Low Risks:** May be accepted without further action, though treatment may be pursued for continuous improvement purposes.

### Risk Treatment

As part of the risk remediation process, ____ shall determine objectives for mitigating or treating risks. All Critical and High risks must be treated or formally accepted with executive approval. For continuous improvement purposes, risk owners may also opt to treat Medium and/or Low risks.

Treatment options for risks include:

1. **Implement Security Controls:** Select, develop, or enhance security controls (technical, administrative, or physical) to reduce the likelihood or impact of the risk.
2. **Risk Transfer:** Transfer the risk to a third party, for example, by purchasing a cyber insurance policy, outsourcing to a managed service provider with contractual SLAs, or signing risk-sharing agreements with suppliers or partners.
3. **Risk Avoidance:** Discontinue the business activity, process, or system that creates the risk, or avoid initiating the activity altogether.
4. **Risk Acceptance:** Formally accept the risk. This option is permitted only if:
  - The risk level is within the organization's risk appetite, OR
  - The cost of other treatment options demonstrably exceeds the potential impact of the risk being realized, AND
  - The acceptance is formally documented and approved by the appropriate authority.

After selecting and implementing a treatment option, the risk owner must estimate the **residual risk** - the new impact and likelihood values after the planned controls are implemented. Risks with unacceptable residual risk levels require additional treatment.

### Plan of Action and Milestones (POA&M)

____ shall develop and maintain a Plan of Action and Milestones (POA&M) for all identified risks requiring treatment. The POA&M documents:

- Remedial actions planned to address identified deficiencies or vulnerabilities.
- Corrective actions to reduce or eliminate known risks.
- Assigned responsible entities and resource estimates.
- Scheduled milestones and completion dates.
- Current status (Ongoing, Complete, Delayed).

The POA&M must be updated at least ____ (monthly/quarterly), based on findings from risk assessments, security control assessments, security impact analyses, and continuous monitoring activities.

Each POA&M entry must include:

- Unique Identifier
- Milestone Description
- Responsible Entity (individual or team)
- Resource Estimate (funded, unfunded, or reallocation)
- Creation Date
- Deficiency/Risk Name
- Deficiency/Risk Description
- Deficiency/Risk Source (e.g., Risk Assessment, Audit Finding, Penetration Test)
- Severity Level (Low, Medium, High, Critical)
- Scheduled Completion Date
- Changes to Milestones (date and description of any changes)
- Status (Ongoing, Complete, Delayed, Cancelled)
- Actual Completion Date
- Controls In Place or Planned

### Regular Reviews of Risk Assessment and Risk Treatment

- The Risk Assessment Register (or Risk Assessment Report) must be reviewed and updated when newly identified risks are discovered.
- At a minimum, a comprehensive risk assessment must be conducted and documented **at least once per year**.
- Risk assessments must be re-triggered upon significant changes to the business, technology environment, threat landscape, or regulatory requirements.
- All risk acceptances must be reviewed at least annually to ensure the acceptance rationale remains valid.

### Reporting

The results of risk assessments, and all subsequent reviews, must be documented in a Risk Assessment Report. This report must be:

- Presented to the Security Oversight Committee (or equivalent governance body) at least annually.
- Made available to internal and external auditors upon request.
- Retained for a minimum of ____ years (recommended: 3 years for SOC 2, longer if required by regulation).

### Threat Assessment

____ collects and analyzes information about existing or potential threats to prevent harm to the organization through informed actions. Threat assessment activities include:

- Identifying, collecting, processing, and analyzing threat-related information from internal and external sources.
- Appropriately communicating and sharing threat assessments with relevant stakeholders.
- Integrating threat intelligence into the risk management process as input for prioritizing safeguards and controls.

Threat assessments must be conducted at least annually, or more frequently based on changes in the threat landscape or business operations.

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| ____ (e.g., CISO / Security Officer) | Policy owner; oversight of risk assessment process; annual review; reporting to senior management |
| Risk Owners | Assessing and treating assigned risks; maintaining POA&M entries; reporting risk status |
| Asset Owners | Identifying assets and their classification; cooperating with risk assessment activities |
| Security Oversight Committee | Reviewing risk assessment results; approving risk acceptances above defined thresholds |
| All Personnel | Reporting identified risks, threats, or vulnerabilities through established channels |

## Compliance and Enforcement

Violation of this policy, including failure to complete assigned risk assessments or implement approved treatment plans, may result in disciplinary action as outlined in the Information Security Policy. Management, under authority granted by ____, retains the right to monitor compliance with this policy.

## Related Documents

- Information Security Policy (ISP-001)
- Vulnerability Management Policy
- Incident Response Policy
- Asset Management Policy
- Data Classification Policy
- Business Continuity Plan
- Disaster Recovery Plan
- Vendor Management Policy

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
