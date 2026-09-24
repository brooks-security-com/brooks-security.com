# Video archive bucket

Private S3 bucket holding the master copies of the recorded talks.

This is a **preservation store, not a delivery origin**. It is never public,
never fronted by CloudFront, and nothing on the site reads from it. The servable
copies are separate objects in the site bucket under `downloads/` (see `s3.tf`).

| | |
|---|---|
| Bucket | `brooks-security-video-archive` |
| Region | `us-east-1` |
| Defined in | `terraform/video-archive.tf` |
| Terraform var | `video_archive_bucket` |
| Contents | Master recordings, best available quality, ~721 MB |
| Cost | ~$0.02/month at this size |

## Why a second bucket

The site bucket is a delivery origin. It runs against `hugo deploy
--maxDeletes -1`, it serves the public internet, and it has no versioning. One
`aws s3 rm`, one bad lifecycle rule, or one leaked key and the recordings are
gone. That is the same failure mode as the vendor channel disappearing, just
closer to home.

## Protection model

**Versioning, enabled by Terraform.** Overwrites and deletes create new versions
rather than destroying data. Every prior version remains retrievable.

**MFA Delete, enabled once by hand.** Permanently deleting a version, or changing
the versioning state, then requires two forms of authentication: the caller's
credentials *and* a live code from an MFA device. A leaked access key alone
cannot purge the archive.

### What this does and does not protect against

| Threat | Covered |
|---|---|
| Fat-fingered `aws s3 rm` of a version | Yes, needs MFA |
| Compromised IAM access key purging versions | Yes, needs MFA |
| Object appears deleted (delete marker added) | No, but the versions survive; remove the marker to restore |
| Someone with root *and* the MFA device | No |
| Losing the AWS account entirely | No. See "Off-AWS copy" below |

## Object Lock is not enabled, and cannot be added later

S3 Object Lock can only be turned on when a bucket is created. It **cannot** be
added to an existing bucket afterwards, ever. This bucket is created without it,
so choosing it later means creating a new bucket and copying the objects across.

That was a deliberate choice. If it is ever revisited, it has to be a new bucket,
not a change to this one.

## Enabling MFA Delete (one-time, root only)

**This is the one part of the bucket not managed by Terraform.** The provider
exposes `versioning_configuration[0].mfa_delete` and a resource-level `mfa`
argument, but `mfa` must be a *current* six-digit TOTP value. CI cannot supply
that, so the setting is deliberately excluded from management:

```hcl
lifecycle {
  ignore_changes = [versioning_configuration[0].mfa_delete]
}
```

Without that, an apply from CI would try to reconcile a setting it cannot read a
code for, and could revert MFA Delete.

### Prerequisites

| Requirement | Status (checked 2026-09-23) |
|---|---|
| Bucket owner is the root account | Yes, root created the bucket |
| Root account has MFA enabled | **Yes** (`AccountMFAEnabled: 1`) |
| Root access keys exist | **No** (`AccountAccessKeysPresent: 0`) |

AWS restricts this operation to the bucket owner, which for an account-created
bucket means **root**. Only root can enable or disable MFA Delete, and it cannot
be done from the console at all.

Because root has no access keys, use **CloudShell from a root console session**.
That is the recommended path: no root access keys are created, so nothing has to
be cleaned up afterwards. Creating temporary root access keys also works but
means handling a credential that should not exist, then deleting it.

### The command

Sign in to the AWS console as root, open CloudShell, and run:

```bash
aws s3api put-bucket-versioning \
  --bucket brooks-security-video-archive \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::570516803292:mfa/root-account-mfa-device 123456"
```

Replace `123456` with the current code from the root MFA device. Confirm the
device ARN in the console under **IAM → Security credentials → root user → MFA**;
for a root virtual MFA device it is normally
`arn:aws:iam::<account-id>:mfa/root-account-mfa-device`.

Format of `--mfa` is the device serial, a space, then the six-digit code. For a
virtual device the serial is the device ARN.

### Verify

```bash
aws s3api get-bucket-versioning --bucket brooks-security-video-archive
```

Expected:

```json
{ "Status": "Enabled", "MFADelete": "Enabled" }
```

If `MFADelete` is missing, the call ran without root credentials or the code was
rejected. It fails silently in that direction, so always read the response.

### Confirm Terraform is not fighting it

Do not skip this. The initial plan shows `mfa_delete = (known after apply)`,
which means the provider will read the setting from the API and *may* want to
reconcile it. `ignore_changes` is what prevents that, and nested-attribute
ignores are a known-fragile area of Terraform, so assert the behaviour rather
than trusting it.

After enabling MFA Delete, run a plan locally and confirm it is clean:

```bash
cd terraform
terraform plan -no-color | tail -5
```

Expected: `No changes.` If it instead proposes changing `mfa_delete` back to
`Disabled`, the ignore is not taking effect and the resource needs restructuring
(for example, dropping `aws_s3_bucket_versioning` for this bucket and managing
versioning by hand alongside MFA Delete).

The same check runs in CI on any pull request that touches `terraform/`, so a
drift proposal would also surface there.

## Known limitation: no lifecycle rules

**MFA Delete cannot be used with lifecycle configurations.** If noncurrent
version expiry is ever wanted on this bucket, MFA Delete has to be turned off
first, which defeats the purpose. At 721 MB, lifecycle rules are not needed.

## Uploading the archive

The masters live outside this repo at
`~/Projects/Personal/brooks-security-video-archive/masters/`. Upload out of band:

```bash
aws s3 cp ~/Projects/Personal/brooks-security-video-archive/masters/ \
  s3://brooks-security-video-archive/masters/ \
  --recursive --profile brooks-security
```

Include `*.info.json` (yt-dlp provenance: title, description, upload date, view
count) and the thumbnails. They are small and they are the record of what these
files actually are.

## Recovering a deleted object

Because versioning is on, a "deleted" object usually just has a delete marker:

```bash
# List versions, including delete markers
aws s3api list-object-versions --bucket brooks-security-video-archive \
  --prefix masters/ --profile brooks-security

# Remove the delete marker to restore the object
aws s3api delete-object --bucket brooks-security-video-archive \
  --key masters/<file> --version-id <delete-marker-version-id> \
  --profile brooks-security
```

Removing a *delete marker* is not a permanent deletion, so MFA Delete does not
apply. Permanently deleting a *version* does require it.

## Off-AWS copy

One AWS account is not a backup. This bucket survives accidental deletion and a
leaked key; it does not survive losing the account. A second copy off AWS
(Backblaze B2 at roughly $6/TB/month, or an external drive) is what makes this
3-2-1. Until that exists, the local `masters/` directory and this bucket are the
only two copies, and both are the same data.
