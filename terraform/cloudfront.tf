resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.domain}.s3.us-east-1.amazonaws.com"
  description                       = ""
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "hugo" {
  name    = "hugo"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/files/hugo-cf-function.js")
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2"
  price_class     = "PriceClass_100"
  comment         = ""
  aliases         = ["www.${var.domain}", var.domain]

  origin {
    origin_id   = "${var.domain}.s3.us-east-1.amazonaws.com"
    domain_name = "${var.domain}.s3.us-east-1.amazonaws.com"

    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "${var.domain}.s3.us-east-1.amazonaws.com"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized (AWS-managed)

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.hugo.arn
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

}
