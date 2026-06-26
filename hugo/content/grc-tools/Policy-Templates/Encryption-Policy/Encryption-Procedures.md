# Encryption Policy - Implementation Procedures

> **Companion to:** Encryption Policy (Template.md)
> **Purpose:** These procedures describe how to implement the cryptographic requirements set forth in the Encryption Policy. The policy defines WHAT must be done (approved algorithms, minimum key strengths, encryption requirements); this document describes HOW to do it.

---

## Procedure 1: Key Management Lifecycle

### Standard Approach

This procedure covers the end-to-end lifecycle of cryptographic keys: generation, storage, rotation, revocation, and destruction.

#### 1.1 Key Generation

1. **Key Generation Environment:**
  - Production keys must be generated within a secure, access-controlled environment:
    - **Hardware Security Module (HSM):** For on-premises or high-assurance keys. Use FIPS 140-2 Level 3 or higher certified HSM. Example: `pkcs11-tool --module /usr/lib/opensc-pkcs11.so --keypairgen --key-type RSA:4096 --label "prod-signing-key-2026"`
    - **Cloud Key Management Service (KMS):** For cloud-native workloads. Use AWS KMS, Azure Key Vault, or GCP Cloud KMS. Generate keys within the service - never import key material unless there is a specific external HSM requirement.
  - Development/test keys must be generated in a separate KMS instance from production. Never use production KMS for non-production environments.
2. **Entropy Requirements:**
  - All key generation must use a cryptographically secure pseudo-random number generator (CS-PRNG) seeded with sufficient entropy.
  - For on-premises systems, verify available entropy: `cat /proc/sys/kernel/random/entropy_avail` - should be > 1000 before key generation. Use `haveged` or hardware RNG if entropy is insufficient.
3. **Key Generation Audit Log:**
  - Log every key generation event: timestamp, key identifier, key type, key strength, generating entity (person or service), and purpose.
  - Store logs in the centralized logging platform for minimum 7 years.

#### 1.2 Key Storage and Protection

1. **Never Store Keys in Plaintext:**
  - Private/secret keys must never exist in plaintext on disk, in configuration files, environment variables, source code repositories, or deployment scripts.
  - Scan for plaintext keys using automated secret scanning tools (**git-secrets**, **truffleHog**, **Gitleaks**) in CI/CD pipelines and periodically across all repositories and file shares.
2. **Key Encryption Keys (KEKs):**
  - Encrypt all data encryption keys (DEKs) with a separate key encryption key (KEK).
  - The KEK must be stored one tier higher in the security hierarchy: DEK is application-accessible (via KMS API), KEK is accessible only to the KMS admin role.
3. **Cloud KMS Configuration:**
  - Use customer-managed keys (CMKs) for encrypting Restricted and Confidential data.
  - Configure key policies following least privilege:
     ```json
     // AWS KMS key policy example
     {
       "Effect": "Allow",
       "Principal": {"AWS": "arn:aws:iam::123456789012:role/application-role"},
       "Action": ["kms:Decrypt", "kms:GenerateDataKey"],
       "Resource": "*",
       "Condition": {
         "StringEquals": {"kms:ViaService": "s3.us-east-1.amazonaws.com"}
       }
     }
     ```
  - Enable key usage logging: CloudTrail (AWS), Azure Monitor (Azure), Cloud Audit Logs (GCP).
4. **Access Control:**
  - Access to key material must be restricted to explicitly authorized personnel and systems.
  - Implement dual control for critical key operations (key creation, key deletion, key policy modification): require approval from two authorized individuals.
  - Review key access logs monthly. Flag any unauthorized access attempts.

#### 1.3 Key Rotation

1. **Rotation Automation:**
  - Automate key rotation wherever feasible. Manual rotation is error-prone and leads to expired keys.
  - For cloud KMS: enable automatic rotation. AWS KMS supports automatic annual rotation. Azure Key Vault and GCP Cloud KMS support configurable rotation policies.
  - For application-managed keys: implement rotation in the application deployment pipeline:
     ```bash
     # Example: rotate database encryption key
     # 1. Generate new DEK via KMS
     NEW_DEK=$(aws kms generate-data-key --key-id alias/db-encryption --key-spec AES_256)
     # 2. Re-encrypt data with new DEK
     reencrypt-database --old-key $OLD_DEK --new-key $NEW_DEK
     # 3. Store new DEK (encrypted with KEK)
     aws ssm put-parameter --name /db/encryption-key --value $ENCRYPTED_NEW_DEK
     ```
2. **Rotation Schedule:**
  - Data encryption keys (DEKs): rotate every `____` months (recommended: 12 months).
  - Key encryption keys (KEKs): rotate every `____` months (recommended: 12 months).
  - TLS/SSL certificates: rotate every `____` months (recommended: 12 months, or 90 days for high-assurance environments). Use ACM (AWS) or managed certificate services with auto-renewal.
  - SSH host keys: rotate every `____` months (recommended: 12 months) or on known compromise.
  - API keys and service account credentials: rotate every `____` months (recommended: 6 months). Automate where possible (e.g., IAM role instead of long-lived access keys).
  - Signing keys: rotate every `____` months (recommended: 12 months). Maintain old keys for signature verification of previously signed artifacts.
3. **Rotation Verification:**
  - After rotation, verify: old key is no longer in use, new key is functioning correctly, backups of the new key are secured, and dependent systems have access to the new key.
  - Monitor for "access denied" errors using the old key - this indicates a system that wasn't updated.

#### 1.4 Key Revocation and Destruction

1. **Compromise Response:**
  - Upon suspected key compromise: immediately revoke the key, rotate all data encrypted with that key, initiate incident response per the IR Policy.
  - For TLS certificates: revoke via the Certificate Authority (CA) and publish to CRL/OCSP.
2. **Scheduled Key Destruction:**
  - When a key is no longer needed: verify that no data still requires the key for decryption. If data is still encrypted with the key, decrypt and re-encrypt with a current key before destroying.
  - For cloud KMS: schedule key deletion with a waiting period (AWS: 7-30 days, Azure: configurable, GCP: configurable). The waiting period allows recovery if destruction was accidental.
  - For HSM: use the HSM's secure deletion function that zeroizes the key material.
  - Log every key destruction event: timestamp, key identifier, authorizing individuals (dual control), and rationale.

#### 1.5 Key Backup and Recovery

1. **Key Backup Procedure:**
  - Keys critical for data recovery must be securely backed up.
  - Export the key from KMS/HSM in encrypted form (wrapped with a separate backup key).
  - Store the encrypted key backup in a physically and logically separate environment from the primary keys (different region, different account).
2. **Key Recovery Procedure:**
  - Recovery requires dual control: at least two authorized individuals must approve and participate.
  - Verify the identity of the requesting individuals via out-of-band communication (video call, in-person).
  - Recover the key to the target environment and verify it works.
  - Rotate the recovered key immediately after recovery (it was in transit/outside the secure boundary).
3. **Annual Key Recovery Test:**
  - Test key recovery annually: attempt to recover and use a test key from backup. Document the results.

### Alternative Approaches

> **💡 Why you might choose differently:** Key management architecture depends on deployment model, scale, and compliance requirements.

- **Bring Your Own Key (BYOK):** For organizations with strict data sovereignty requirements, import your own key material into the cloud KMS rather than having the cloud provider generate it. Trade-off: you are responsible for key material security and backup. The cloud provider cannot recover your key if lost.
- **External HSM / Hybrid Model:** Use an on-premises HSM for root of trust and generate cloud KMS keys within the HSM, importing only the public components to the cloud. Provides the strongest separation but adds complexity and latency.
- **HashiCorp Vault for Multi-Cloud:** Organizations operating across multiple clouds may unify key management under HashiCorp Vault (or similar). Provides a single control plane but Vault itself becomes a critical security dependency requiring careful hardening.

### Common Pitfalls

> **⚠️ Watch out:** Key rotation that creates a new key but leaves the old key active. "Rotated" doesn't mean "added a second key." Verify that the old key is disabled or scheduled for destruction after rotation. Run monthly audits checking for keys that should have been destroyed but are still active.

> **⚠️ Watch out:** Backing up the encryption key alongside the encrypted data. If the key backup is in the same S3 bucket as the data backup, an attacker who compromises that bucket gets both. Store key backups in a separate KMS or a separate cloud account with different credentials and MFA requirements.

> **⚠️ Watch out:** Losing the ability to decrypt old data because keys were destroyed too aggressively. TLS certificate private keys can be destroyed; data encryption keys for archived data must be preserved as long as the retention period for that data. Maintain a key lifecycle schedule aligned with data retention policies.

> **⚠️ Watch out:** Hard-coded "test" encryption keys making it to production. A common pattern: developers use a hard-coded key for local testing, and it accidentally gets deployed. Use KMS in all environments; for local development, use a local KMS emulator (e.g., localstack) or a dedicated dev KMS that cannot access production key material.

---

## Procedure 2: Employee Device Encryption

### Standard Approach

This procedure covers the deployment, configuration, and enforcement of full-disk encryption on organizational endpoints.

#### 2.1 macOS: FileVault Deployment

1. **Pre-Deployment Verification:**
  - Verify the device is enrolled in the MDM platform (`____`, e.g., Jamf Pro, Kandji, Mosyle).
  - Verify the device meets minimum OS requirements (macOS 12 Monterey or later recommended).
  - Ensure the user has a secure password (not linked to an insecure Apple ID).
2. **Enable FileVault via MDM:**
  - Push a FileVault configuration profile with the following settings:
     ```xml
     <!-- MDM FileVault Configuration -->
     <key>PayloadType</key>
     <string>com.apple.MCX.FileVault2</string>
     <key>Enable</key>
     <string>On</string>
     <key>Defer</key>
     <false/>
     <key>ShowRecoveryKey</key>
     <false/>  <!-- Escrow to MDM, don't show to user -->
     <key>UseRecoveryKey</key>
     <true/>
     ```
  - Recovery key must be escrowed to the MDM platform - never display it to the end user (who may store it insecurely).
3. **Verification:**
  - Verify encryption status via MDM: `fdesetup status` should return "FileVault is On."
  - Configure MDM compliance policy: if FileVault is disabled, mark the device as non-compliant and notify the user + IT.
  - Attempted FileVault disable: generate a Critical alert to the Security team.
4. **User Guidance:**
  - At login, the user must enter their password to unlock the disk. This is automatic - FileVault uses the same password.
  - If the user forgets their password, IT can retrieve the recovery key from the MDM.
  - Users must NOT store their recovery key on a sticky note, in email, or in personal password managers synced to the same device.

#### 2.2 Windows: BitLocker Deployment

1. **Pre-Deployment Verification:**
  - Verify the device has a TPM chip (TPM 2.0 required for modern Windows). Check via `tpm.msc`.
  - Verify the device is enrolled in MDM/Intune or domain-joined to Active Directory.
  - Ensure BIOS is set to UEFI mode (not Legacy BIOS).
2. **Enable BitLocker via Intune/GPO:**
  - Intune policy (Endpoint Security > Disk Encryption):
    - **Encryption method:** XTS-AES 256-bit (for Windows 10 1809+).
    - **TPM startup:** Require TPM. Do not allow startup PIN (adds friction without significant security gain for modern TPM 2.0).
    - **Recovery key escrow:** Escrow to Azure AD / Active Directory.
  - Group Policy (for AD-joined devices):
    - Computer Configuration > Administrative Templates > Windows Components > BitLocker Drive Encryption > Operating System Drives
    - "Choose how BitLocker-protected operating system drives can be recovered" → Save recovery keys to AD DS.
3. **Verification:**
  - Check encryption status: `manage-bde -status` (should show "Protection: On" and "Encryption Method: XTS-AES 256").
  - MDM compliance check: flag devices where BitLocker is not active. Auto-remediate after `____` hours by forcing encryption.
4. **Recovery Key Access:**
  - IT can retrieve recovery keys from Azure AD (Intune > Devices > [Device] > Recovery Keys) or Active Directory.
  - Access to recovery keys must be logged and audited monthly.

#### 2.3 Mobile Devices (iOS and Android)

1. **iOS Devices:**
  - Encryption is enabled by default when a passcode is set. MDM policy must:
    - Require passcode (minimum 6 digits or alphanumeric).
    - Enforce "Data Protection" (encryption) as enabled.
  - Verify via MDM: check that "Data Protection" is reported as compliant.
2. **Android Devices:**
  - Android 7+ uses file-based encryption by default. MDM policy must:
    - Require a screen lock (password/PIN/pattern).
    - Enforce full-disk encryption if the device supports it (Android 5–6).
    - Block devices that report encryption as disabled.
3. **Prohibited Devices:**
  - Jailbroken (iOS) or rooted (Android) devices are prohibited from accessing organizational data. MDM must detect jailbreak/root and automatically block access (conditional access policy) or wipe corporate data.
  - Devices that cannot run a supported OS version (iOS < 15, Android < 11) must be blocked.

#### 2.4 Ongoing Compliance Monitoring

1. **Monthly Audit:** Generate a report from MDM showing:
  - Total enrolled devices.
  - Devices with encryption disabled or not reporting.
  - Devices with missing or non-escrowed recovery keys.
  - Devices that haven't checked in for > `____` days (recommended: 14 days).
2. **Remediation:** For each non-compliant device:
  - Send automated notification to the user with instructions and a deadline (48 hours).
  - If not remediated, IT contacts the user directly.
  - If not remediated within `____` days, block device access to organizational data.

### Alternative Approaches

> **💡 Why you might choose differently:** Different device ecosystems and BYOD policies require different strategies.

- **BYOD with Conditional Access:** Instead of managing encryption on personal devices, enforce access controls: block access from devices that don't meet compliance policies (encryption, OS version, passcode). The user is responsible for enabling encryption on their personal device; if they don't, they can't access organizational data. Use Microsoft Intune MAM (Mobile Application Management) or equivalent to protect data within apps without full device management.
- **VDI/DaaS for Unmanaged Devices:** For contractors or BYOD users on unmanaged devices, provide access only through a virtual desktop (AWS WorkSpaces, Windows 365, Citrix) or browser-based interface. No organizational data is stored on the device, eliminating the encryption requirement.

### Common Pitfalls

> **⚠️ Watch out:** Recovery keys escrowed to a system that requires the same device to be working to access. If a user's laptop won't boot and the recovery key is only accessible via an MDM portal that requires MFA on that user's phone (which they also lost), IT is stuck. Maintain a break-glass procedure: authorized IT personnel can retrieve recovery keys from a secure offline backup.

> **⚠️ Watch out:** FileVault prompting users to enable encryption with no enforcement. macOS will nag users to enable FileVault but will not force it without MDM enforcement. Configure MDM to require FileVault and mark devices non-compliant if it's not enabled - don't rely on user cooperation.

> **⚠️ Watch out:** Assuming all devices are encrypted because encryption is "enabled by default" on modern OSes. FileVault is not enabled by default on macOS - it must be explicitly turned on. BitLocker is not enabled by default on Windows unless Intune/GPO forces it. Verify, don't assume.

---

## Procedure 3: TLS Configuration

### Standard Approach

This procedure covers the deployment and hardening of TLS configurations across web servers, load balancers, and CDN endpoints.

#### 3.1 Server TLS Configuration

1. **Nginx TLS Configuration:**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_protocols TLSv1.3;  # TLS 1.3 only for new deployments
       # If TLS 1.2 compatibility is required:
       # ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers on;
       ssl_ecdh_curve secp384r1;
       ssl_certificate /etc/ssl/certs/example.com.crt;
       ssl_certificate_key /etc/ssl/private/example.com.key;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 1d;
       ssl_session_tickets off;  # Disable session tickets (uses random key)
       ssl_stapling on;
       ssl_stapling_verify on;
       add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
   }
   ```
2. **Apache TLS Configuration:**
   ```apache
   SSLProtocol -all +TLSv1.3
   # If TLS 1.2 needed: SSLProtocol -all +TLSv1.2 +TLSv1.3
   SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
   SSLHonorCipherOrder on
   SSLSessionTickets off
   Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
   ```
3. **Load Balancer / CDN Configuration:**
  - Configure TLS termination at the load balancer (ALB, CloudFront, Cloudflare) with a minimum TLS version of 1.3 (or 1.2 if compatibility required).
  - Use an ACM/Cloudflare-managed certificate with auto-renewal.
  - Configure the origin connection (load balancer → server) to use TLS with a valid certificate (not self-signed, not disabled).

#### 3.2 TLS Certificate Management

1. **Certificate Procurement:**
  - Use a public CA (Let's Encrypt, DigiCert, AWS Certificate Manager) for public-facing services.
  - For internal services, maintain an internal CA (e.g., HashiCorp Vault PKI, Active Directory Certificate Services, step-ca).
  - Certificates must use ECDSA P-256 or RSA 3072-bit keys minimum. Preferred: ECDSA P-256.
2. **Auto-Renewal:**
  - For public certificates: use ACM (auto-renews) or Certbot (Let's Encrypt) with automatic renewal.
  - Configure renewal alerting: if a certificate is within 30 days of expiry and hasn't renewed, generate a P2 alert.
  - For internal CA certificates: implement auto-renewal via Vault PKI or similar. If manual, maintain a certificate expiry calendar and assign ownership.
3. **Certificate Expiry Monitoring:**
  - Use a monitoring tool (e.g., SSL Labs, UptimeRobot, custom script) that checks certificate expiry daily.
  - Alert thresholds: 60 days → P3, 30 days → P2, 14 days → P1, expired → Critical P1.

#### 3.3 TLS Hardening Verification

1. **Scan All Public Endpoints:**
  - Use SSL Labs Server Test (`https://www.ssllabs.com/ssltest/`) or `testssl.sh` CLI tool to scan all public-facing endpoints.
  - Target: A or A+ rating. Acceptable: B. B and below: remediate.
2. **Scan Internal Endpoints:**
  - Use `testssl.sh` or Nessus to scan internal services.
  - Flag any service using TLS 1.0, TLS 1.1, SSLv3, or prohibited cipher suites.
3. **Quarterly Full Scan:**
  - Scan all domains and subdomains in the organization's DNS.
  - Produce a report of endpoints with weak TLS configurations.
  - Track remediation in the ticketing system.

### Common Pitfalls

> **⚠️ Watch out:** TLS termination at the load balancer but HTTP between load balancer and origin. If traffic between the load balancer and the application server is unencrypted, it's vulnerable to network sniffing within the VPC/datacenter. Always encrypt origin connections, even if using a self-signed or internal CA certificate.

> **⚠️ Watch out:** HSTS headers not set or set with a short max-age. Without HSTS, a man-in-the-middle can strip TLS. Set `max-age=63072000` (2 years) and include `includeSubDomains` and `preload`. Test at `https://hstspreload.org`.

> **⚠️ Watch out:** Certificate transparency not monitored. If someone issues a fraudulent certificate for your domain, you may not know until it's used in an attack. Set up certificate transparency monitoring (e.g., CertSpotter, crt.sh alerts, Cloudflare CT monitoring) for all domains.

---

## Related Documents

- Encryption Policy (Template.md)
- Data Classification Policy (../Data-Classification-Policy/Template.md)
- Data Protection Policy (../Data-Protection-Policy/Template.md)
- System Access Control Policy (../System-Access-Control-Policy/Template.md)
- Password Policy (../Password-Policy/Template.md)
- Asset Management Policy (../Asset-Management-Policy/AMP-Template.md)
