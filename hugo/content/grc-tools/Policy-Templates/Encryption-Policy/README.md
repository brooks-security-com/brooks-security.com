# Encryption Policy Template

## What This Is

The Encryption Policy is the authoritative reference for which cryptographic algorithms, protocols, and key management practices are permitted in the organization. It prevents the proliferation of weak cryptography by giving engineering, IT, and security teams a single source of truth. This is one of the most technically prescriptive policies in the GRC suite - it names specific algorithms, minimum key sizes, and required configurations.

## What It Covers

- Approved symmetric and asymmetric encryption algorithms with minimum key sizes
- Approved hashing algorithms
- TLS protocol version requirements and approved cipher suites
- Data at rest encryption (full-disk, database, file/object storage, backups)
- Data in transit encryption (TLS, VPN, SSH, email)
- Key management lifecycle: generation, storage, rotation, revocation, destruction, backup
- Cloud environment cryptographic requirements
- End-user device encryption standards (macOS, Windows, mobile)

## Document Structure

This folder contains two documents that work together:

- **`Template.md`** - The policy itself. Defines WHAT is required: Approved cryptographic algorithms, minimum key strengths, key management lifecycle, and encryption requirements for data at rest, data in transit, cloud environments, and end-user devices. This is the governance document reviewed by leadership and auditors.
- **`Encryption-Procedures.md`** - Companion implementation procedures. Describes HOW to operationalize the policy: Key management implementation, device encryption deployment (FileVault, BitLocker), TLS configuration, and cryptographic validation procedures. This is what the implementation teams use.

The policy sets the requirements; the procedure provides the step-by-step instructions for meeting them. Keep them aligned: when the policy changes, the procedures must be reviewed for consistency.


## Common Gotchas and Mistakes

**1. Allowing AES-256-CBC as equal to GCM.** CBC mode is still widely deployed but is vulnerable to padding oracle attacks if not implemented with encrypt-then-MAC and constant-time comparison. GCM provides authenticated encryption by default. The policy should clearly deprecate CBC and require GCM for all new implementations.

**2. Permitting TLS 1.2 without cipher suite restrictions.** Simply saying "TLS 1.2 or higher" is insufficient. TLS 1.2 supports dozens of cipher suites, including weak ones (RSA key exchange, CBC ciphers, SHA-1 MAC). The policy must enumerate the specific approved TLS 1.2 cipher suites. TLS 1.3 eliminates this problem by design.

**3. Treating key rotation as optional or annual-only.** Keys that protect high-value data should rotate more frequently than keys for lower-sensitivity systems. A single "rotate annually" requirement for all keys creates a false equivalence. Differentiate rotation periods by key type: DEKs, KEKs, TLS certs, API keys, signing keys.

**4. Ignoring quantum computing risk.** While large-scale quantum computers don't exist today, data encrypted now may be stored and decrypted later when they do ("harvest now, decrypt later"). The policy should acknowledge this risk and commit to tracking NIST post-quantum cryptography standards for future adoption.

**5. Embedding cryptographic requirements in code without validation.** Engineers implement what the policy says, but configuration drift and library defaults often override intended settings. TLS configurations, cipher suite ordering, and key sizes must be validated through automated scanning, not assumed correct because someone read the policy.

## Implementation Advice

- **Publish a companion standards document.** The policy says *what* must be done. A separate standards document provides the *how* - example nginx/Apache TLS configurations, OpenSSL commands for certificate generation, AWS KMS key policy templates. This prevents every team from independently interpreting the policy.
- **Use certificate transparency monitoring.** Monitor CT logs for certificates issued for your domains. This catches mis-issued certificates, unauthorized CAs, and expiring certificates before they cause outages or security incidents.
- **Automate key rotation for cloud services.** Cloud KMS services support automatic key rotation. Enable it by default. For application-level encryption, build key rotation into the encryption library so application teams don't need to think about it.
- **Test encrypted backup recovery.** Full-disk encryption, database TDE, and backup encryption all rely on keys that must be available during disaster recovery. If the key management service is in the same cloud region that failed, you may lose both data and keys. Test recovery from a different region or provider.
- **Scan for prohibited algorithms continuously.** Use vulnerability scanners and cloud security posture management tools to detect prohibited algorithms in deployed systems. SSL Labs, testssl.sh, and cloud-native tools can identify weak TLS configurations, expired certificates, and prohibited cipher suites across your entire environment.
