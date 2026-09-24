# Private archive for the recorded talks.
#
# This bucket is a preservation store, not a delivery origin. It is never
# public, never fronted by CloudFront, and nothing on the site reads from it.
# The servable copies live in the site bucket under downloads/ (see s3.tf).
#
# ---------------------------------------------------------------------------
# Object Lock is deliberately NOT enabled here.
#
# S3 Object Lock can only be turned on when a bucket is created. It cannot be
# added to an existing bucket afterwards, ever. So if this bucket is created
# without it, changing your mind later means creating a new bucket and copying
# the objects across.
#
# The protection model instead is: versioning on (below), plus MFA Delete,
# enabled once by the root account. See docs/video-archive.md for that step.
# It is a manual operation because the API requires a live MFA code.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "video_archive" {
  bucket = var.video_archive_bucket
}

resource "aws_s3_bucket_versioning" "video_archive" {
  bucket = aws_s3_bucket.video_archive.id
  versioning_configuration {
    status = "Enabled"
  }

  # MFA Delete is enabled once, manually, by the root account (only root can
  # set it, and the API requires a live 6-digit code). The provider exposes
  # `versioning_configuration[0].mfa_delete` and a resource-level `mfa`
  # argument, but `mfa` must be a current TOTP value, so CI can never supply
  # it. Without this ignore, an apply from CI would try to reconcile the
  # setting it cannot read a code for, and could revert MFA Delete.
  #
  # Consequence: MFA Delete state is not managed here. It is asserted by
  # docs/video-archive.md and checked by the verification command in it.
  lifecycle {
    ignore_changes = [versioning_configuration[0].mfa_delete]
  }
}

resource "aws_s3_bucket_public_access_block" "video_archive" {
  bucket                  = aws_s3_bucket.video_archive.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "video_archive" {
  bucket = aws_s3_bucket.video_archive.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "video_archive" {
  bucket = aws_s3_bucket.video_archive.id
  rule {
    bucket_key_enabled = true
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
