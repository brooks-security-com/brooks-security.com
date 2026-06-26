# Encryption Policy

Policy Title: Encryption Policy
Policy Number: ENC-001
Effective Date: ____
Version: 1.0
Classification: Internal
Approved By: ____

## Purpose

This policy defines the organizational requirements for the use of cryptographic controls to protect the confidentiality, integrity, authenticity, and non-repudiation of information. It establishes approved algorithms, minimum key strengths, key management practices, and encryption requirements for data at rest and in transit across all systems and environments.

## Scope

This policy applies to all systems, equipment, facilities, and information within the scope of ____'s information security program. It applies to all Personnel, contractors, temporary workers, service providers, and any party performing work on behalf of the organization involving cryptographic systems, algorithms, or keying material.

## Background

A standardized, defense-in-depth approach to cryptographic controls ensures end-to-end security and promotes interoperability across systems and environments. This document defines:

- Approved cryptographic algorithms and minimum strengths
- Requirements for key management and protection throughout the key lifecycle
- Encryption requirements for data at rest and in transit
- Cryptographic requirements for cloud environments
- End-user device encryption standards

## Policy

### Approved Cryptographic Algorithms and Protocols

The following algorithms, protocols, and minimum key sizes are approved for use. Use of algorithms or configurations not listed below requires a written exception from the Security Officer.

#### Symmetric Encryption

| Algorithm | Minimum Key Size | Status | Use Case |
|-----------|-----------------|--------|----------|
| AES-256-GCM | 256 bits | **Preferred** | Data at rest, data in transit, application-level encryption |
| AES-256-CBC | 256 bits | Acceptable (legacy only) | Legacy system compatibility; migrate to GCM |
| ChaCha20-Poly1305 | 256 bits | Acceptable | Mobile/low-power devices, TLS 1.3 cipher suite |

**Prohibited:** DES, 3DES, RC4, Blowfish, AES-128 (for new implementations), ECB mode for any cipher.

#### Asymmetric Encryption

| Algorithm | Minimum Key Size | Status | Use Case |
|-----------|-----------------|--------|----------|
| RSA | 3072 bits | Acceptable | Legacy PKI, SSH host keys |
| ECDSA (NIST P-256) | 256 bits | **Preferred** | TLS certificates, code signing |
| Ed25519 | 256 bits | **Preferred** | SSH keys, API authentication |
| ECDH (NIST P-256, X25519) | 256 bits | **Preferred** | Key agreement, TLS 1.3 |

**Prohibited:** RSA < 2048 bits, DSA, ECDSA with curves < 256 bits.

#### Hashing

| Algorithm | Output Size | Status | Use Case |
|-----------|------------|--------|----------|
| SHA-256 | 256 bits | **Preferred** | General hashing, digital signatures |
| SHA-384 | 384 bits | Acceptable | Higher security margin applications |
| SHA-512 | 512 bits | Acceptable | Higher security margin applications |
| SHA-3 (256+) | 256+ bits | Acceptable | Future-proof implementations |

**Prohibited:** MD5, SHA-1 (except where required for legacy interoperability; requires exception).

#### Transport Layer Security (TLS)

| Protocol | Status | Notes |
|----------|--------|-------|
| TLS 1.3 | **Required** | Minimum for all new deployments |
| TLS 1.2 | Acceptable | Permitted for backward compatibility; must use approved cipher suites only |
| TLS 1.1, TLS 1.0, SSLv3, SSLv2 | **Prohibited** | Must be disabled on all systems |

**Required TLS 1.2 Cipher Suites (where TLS 1.2 is used):**
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (acceptable, not preferred)
- TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 (acceptable, not preferred)

All other TLS 1.2 cipher suites are prohibited unless a written exception is approved.

### Data at Rest Encryption

All data classified as Restricted or Confidential (per the Data Classification Policy) must be encrypted at rest using approved algorithms. Requirements include:

- **Full-Disk Encryption (FDE):** All employee workstations, laptops, and mobile devices must use full-disk encryption. FileVault (macOS) or BitLocker (Windows) must be enabled with recovery keys escrowed to the organization's device management platform.
- **Database Encryption:** All databases storing Restricted or Confidential data must use transparent data encryption (TDE) or application-level encryption with keys managed by an approved key management service.
- **File and Object Storage:** Cloud storage buckets, file shares, and object storage containing Restricted or Confidential data must have server-side encryption enabled using customer-managed keys where available.
- **Backup Encryption:** All backups containing Restricted or Confidential data must be encrypted using approved algorithms before transport or off-site storage.

### Data in Transit Encryption

- All data transmitted over public or untrusted networks must be encrypted using TLS 1.3 (preferred) or TLS 1.2 with approved cipher suites.
- Internal network traffic carrying Restricted or Confidential data should be encrypted; unencrypted internal transmission requires a risk acceptance.
- VPN connections must use approved protocols (WireGuard preferred, IPsec/IKEv2 acceptable) with AES-256-GCM or ChaCha20-Poly1305.
- SSH connections must use protocol version 2 with Ed25519 or ECDSA (NIST P-256) host keys and prohibit password-based authentication (key-based only).
- Email containing Restricted data must be encrypted end-to-end using S/MIME or an approved secure file transfer mechanism. Unencrypted email transmission of Restricted data is prohibited.

### Key Management

Cryptographic keys must be managed throughout their lifecycle in accordance with the following requirements:

#### Key Generation

- Keys must be generated using cryptographically secure random number generators (CS-PRNG) seeded with sufficient entropy.
- Key generation must occur within a secure, access-controlled environment such as a hardware security module (HSM) or an approved cloud key management service.

#### Key Storage and Protection

- Private and secret keys must never be stored in plaintext. They must be encrypted with a separate key encryption key (KEK) or stored within an HSM.
- Keys must not be embedded in source code, configuration files, deployment scripts, or version control systems.
- Access to key material must be restricted to explicitly authorized personnel and systems, with all access logged.

#### Key Rotation

| Key Type | Maximum Rotation Interval |
|----------|--------------------------|
| Data encryption keys (DEKs) | ____ months (e.g., 12) |
| Key encryption keys (KEKs) | ____ months (e.g., 12) |
| TLS/SSL certificates | ____ months (e.g., 12) |
| SSH host keys | ____ months (e.g., 12) |
| API keys and service account credentials | ____ months (e.g., 6) |
| User authentication secrets (passwords, tokens) | Per Password Policy |
| Signing keys (code signing, document signing) | ____ months (e.g., 12) |

Key rotation must be automated wherever feasible. Manual rotation processes are acceptable only for systems where automation is not technically possible and a written exception has been approved.

#### Key Revocation and Destruction

- Keys must be revoked immediately when they are suspected of compromise.
- Revoked keys must be removed from all systems and configurations.
- Key destruction must render the key material irrecoverable. For HSM-stored keys, the HSM's secure deletion function must be used.
- Key destruction events must be logged audibly.

#### Key Backup and Recovery

- Keys required for data recovery must be securely backed up.
- Key backups must be encrypted with a separate key and stored in a physically and logically separate environment from the primary keys.
- Key recovery procedures must require approval from a minimum of two authorized individuals (split knowledge / dual control).
### Cloud Environment Cryptography

When using cloud infrastructure and platform services:

- Cloud-native key management services (e.g., AWS KMS, Azure Key Vault, GCP Cloud KMS) are the preferred method for managing encryption keys in cloud environments.
- Customer-managed keys (CMKs) must be used for encrypting data classified as Restricted or Confidential. Provider-managed keys are acceptable for Internal and Public data.
- Key access policies must follow least privilege - only the specific services and roles that require cryptographic operations should have access to each key.
- Cloud HSM offerings should be evaluated for protecting high-value keys such as root Certificate Authority keys or master key encryption keys.

### End-User Device Encryption

- **Apple macOS:** FileVault full-disk encryption must be enabled on all organization-managed macOS devices. Recovery keys must be escrowed to the MDM platform. Employees must not disable FileVault.
- **Microsoft Windows:** BitLocker full-disk encryption must be enabled on all organization-managed Windows devices. Recovery keys must be escrowed to the MDM platform or Active Directory.
- **Mobile Devices (iOS, Android):** Device encryption must not be disabled. Devices must be managed through an MDM platform that enforces encryption policies. Jailbroken or rooted devices are prohibited.
### Customer Transparency

For organizations offering cloud-based services, customers must have access to information regarding:

- The cryptographic tools and algorithms used to protect their data
- The identity of jurisdictions where cryptographic operations are performed
- Available capabilities for customers to apply their own encryption (customer-managed keys, bring-your-own-key)
- Third-party audits or certifications validating the organization's cryptographic controls

### Legal and Regulatory Compliance

Encryption practices must comply with all applicable local, regional, and international laws and regulations, including import/export controls on cryptographic technology. Encryption must not be used to violate applicable laws or to obstruct lawful investigations.

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| ____ (e.g., CISO / Security Officer) | Policy owner; annual review; approve cryptographic exceptions |
| IT / Infrastructure | Deploy and maintain encryption on endpoints and infrastructure |
| Engineering / DevOps | Implement application-level encryption; manage TLS configurations; integrate with key management services |
| Security Engineering | Define cryptographic standards; validate implementations; manage PKI |
| All Personnel | Ensure device encryption is enabled on organization-managed devices; report encryption issues immediately |

## Compliance and Enforcement

Cryptographic controls are verified through vulnerability scanning, configuration audits, penetration testing, and certificate transparency monitoring. Non-compliance findings include:

- Use of prohibited algorithms or protocols
- Unencrypted transmission of Restricted or Confidential data
- Keys stored in insecure locations (source code, plaintext files, version control)
- Expired or unrotated keys and certificates
- End-user devices without full-disk encryption enabled

Violations of this policy may result in disciplinary action, up to and including termination of employment or engagement.

## Related Documents

- Information Security Policy
- Data Classification Policy
- Data Protection Policy
- Password Policy
- System Access Control Policy
- Asset Management Policy

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
