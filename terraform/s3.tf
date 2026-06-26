resource "aws_s3_bucket" "origin" {
  bucket = var.domain
}

resource "aws_s3_bucket_public_access_block" "origin" {
  bucket                  = aws_s3_bucket.origin.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "origin" {
  bucket = aws_s3_bucket.origin.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "origin" {
  bucket = aws_s3_bucket.origin.id
  rule {
    bucket_key_enabled = true
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# This website config is set but unused — CloudFront hits the S3 REST endpoint,
# not the website endpoint. Kept here to match live state exactly.
resource "aws_s3_bucket_website_configuration" "origin" {
  bucket = aws_s3_bucket.origin.id
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "origin" {
  bucket = aws_s3_bucket.origin.id
  policy = jsonencode({
    Version = "2008-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
    Statement = [{
      Sid    = "AllowCloudFrontServicePrincipal"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "arn:aws:s3:::${var.domain}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
        }
      }
      },
      {
        Sid    = "AllowGRCToolsLambdaWrite"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.grc_tools.arn
        }
        Action = [
          "s3:PutObject",
          "s3:GetObject",
        ]
        Resource = "arn:aws:s3:::${var.domain}/grc-tools/users/*"
    }]
  })
}
