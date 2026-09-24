# AIGP study app — aigp.brooks-security.com
#
# Public static hosting for the AIGP study app (github.com/LittleSeneca/aigp-study,
# private repo). S3 origin, private, reachable only by CloudFront via OAC, behind
# its own distribution with its own ACM cert and A/AAAA alias records.
#
# The app is seven static files (study.html plus JS data and vendored d3/marked).
# The one piece of compute is the optional accounts-and-sync API under /api/*,
# defined in aigp-sync.tf: an ordinary API Gateway + Lambda origin, the same
# pattern as the contact form. There is still no Lambda@Edge and no CloudFront
# Function; if request rewriting is ever needed, the house rule is CloudFront
# Functions first, Lambda@Edge only if a CloudFront Function genuinely cannot do
# the job.
#
# Terraform owns the infrastructure only. The objects are synced by the app repo's
# deploy workflow, not from here.
#
# Modelled on sso.tf (subdomain on its own distribution) and cloudfront.tf (the
# OAC + private-bucket + bucket-policy pattern), minus the SSO redirect — this
# deployment is public.
#
# One thing deliberately NOT copied from the main distribution: its cache policy.
# See the comment on aws_cloudfront_cache_policy.aigp below.

locals {
  aigp_domain = "aigp.${var.domain}"
  aigp_bucket = "aigp.${var.domain}"
  # CloudFront wants a bare hostname for the origin; the bucket is addressed over
  # the S3 REST endpoint, never the website endpoint.
  aigp_origin = "aigp.${var.domain}.s3.us-east-1.amazonaws.com"
}

# --- ACM certificate --------------------------------------------------------
# CloudFront requires the certificate in us-east-1, which is already our default
# region. A dedicated cert for this one name — not a wildcard, which would be
# broader than anything here needs.

resource "aws_acm_certificate" "aigp" {
  domain_name       = local.aigp_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "aigp_acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.aigp.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

# Synthetic resource — no AWS API backing, just waits for ISSUED status before the
# distribution is created. Mirrors aws_acm_certificate_validation.aws_subdomain.
resource "aws_acm_certificate_validation" "aigp" {
  certificate_arn         = aws_acm_certificate.aigp.arn
  validation_record_fqdns = [for record in aws_route53_record.aigp_acm_validation : record.fqdn]
}

# --- Private S3 origin ------------------------------------------------------

resource "aws_s3_bucket" "aigp" {
  bucket = local.aigp_bucket
}

resource "aws_s3_bucket_public_access_block" "aigp" {
  bucket                  = aws_s3_bucket.aigp.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "aigp" {
  bucket = aws_s3_bucket.aigp.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "aigp" {
  bucket = aws_s3_bucket.aigp.id
  rule {
    bucket_key_enabled = true
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# No aws_s3_bucket_website_configuration here, unlike the main site: that resource
# exists there only to match pre-existing live state, and it is unused because
# CloudFront hits the REST endpoint. Nothing to match here, so nothing to add.

resource "aws_s3_bucket_policy" "aigp" {
  bucket = aws_s3_bucket.aigp.id
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
      Resource = "${aws_s3_bucket.aigp.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.aigp.arn
        }
      }
    }]
  })
}

# --- Origin access control --------------------------------------------------

resource "aws_cloudfront_origin_access_control" "aigp" {
  name                              = local.aigp_origin
  description                       = "OAC for ${local.aigp_domain}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- Cache policy -----------------------------------------------------------
# Deliberately NOT CachingOptimized, which the main distribution uses. That works
# there because `hugo deploy` stamps per-object Cache-Control metadata (no-cache
# on html, a year on woff2). This app is synced with `aws s3 sync`, which sets no
# metadata by default — and under CachingOptimized that means CloudFront's 24-hour
# default TTL, so every question-bank update would be invisible for a day.
#
# min_ttl = default_ttl = 0 makes CloudFront cache exactly what the origin says it
# may and nothing more. The failure mode is safe: if the deploy sets no metadata,
# nothing is cached and the app is always current. Caching is then opt-in from the
# deploy via `--cache-control`, which is the right place for it:
#
#   aws s3 sync <files> s3://aigp.brooks-security.com \
#     --cache-control "no-cache"                              # study.html + data
#   aws s3 cp d3.v7.min.js s3://aigp.brooks-security.com/ \
#     --cache-control "public, max-age=31536000, immutable"    # vendored, versioned
#
# With that in place no invalidation is ever needed.

resource "aws_cloudfront_cache_policy" "aigp" {
  name        = "aigp-origin-controlled"
  comment     = "Cache only what the origin's Cache-Control permits; default TTL 0 so a sync without metadata is never stale."
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# --- CloudFront distribution ------------------------------------------------

resource "aws_cloudfront_distribution" "aigp" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"
  price_class     = "PriceClass_100"
  comment         = "AIGP study app"
  aliases         = [local.aigp_domain]

  # The app's entry point is study.html, not index.html. Without this, a request
  # for the bare subdomain returns AccessDenied from S3.
  default_root_object = "study.html"

  origin {
    origin_id                = local.aigp_origin
    domain_name              = local.aigp_origin
    origin_access_control_id = aws_cloudfront_origin_access_control.aigp.id
  }

  # Sync API (aigp-sync.tf), same-origin under /api/* so the app needs no CORS.
  # The custom header is the shared secret the Lambda checks, so the public
  # execute-api endpoint can't be called directly. CloudFront overwrites any
  # viewer-supplied header of the same name.
  origin {
    origin_id   = "aigp-api"
    domain_name = replace(aws_apigatewayv2_api.aigp.api_endpoint, "https://", "")

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Origin-Secret"
      value = random_password.aigp_origin.result
    }
  }

  # No function_association: the `hugo` CloudFront Function on the main
  # distribution rewrites pretty URLs to /index.html, which would mangle this
  # app's flat file paths.
  default_cache_behavior {
    target_origin_id       = local.aigp_origin
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.aigp.id
  }

  # Sync API. POST passthrough with caching disabled; mirrors /api/contact on the
  # main distribution. AllViewerExceptHostHeader so API Gateway sees its own Host.
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "aigp-api"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = false
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled (AWS-managed)
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AllViewerExceptHostHeader (AWS-managed)
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.aigp.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# --- Route 53 ---------------------------------------------------------------
# A dedicated record for aigp, which takes precedence over the
# *.brooks-security.com wildcard. That wildcard points at a legacy EC2 instance
# and is deliberately left alone.

resource "aws_route53_record" "aigp_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.aigp_domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.aigp.domain_name
    zone_id                = aws_cloudfront_distribution.aigp.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "aigp_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.aigp_domain
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.aigp.domain_name
    zone_id                = aws_cloudfront_distribution.aigp.hosted_zone_id
    evaluate_target_health = false
  }
}

# --- Outputs ----------------------------------------------------------------
# Kept in this file rather than outputs.tf so the whole change is one new file.

output "aigp_bucket_name" {
  value       = aws_s3_bucket.aigp.id
  description = "S3 bucket the app repo's deploy workflow syncs into."
}

output "aigp_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.aigp.id
  description = "Distribution to invalidate, if the deploy ever sets cache headers and needs a purge."
}

output "aigp_cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.aigp.domain_name
  description = "Origin domain; aigp.brooks-security.com aliases to this."
}

output "aigp_url" {
  value       = "https://${local.aigp_domain}"
  description = "Public URL of the study app."
}
