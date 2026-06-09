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

  # Contact-form backend: the API Gateway HTTP API, fronted same-origin under
  # /api/contact (see the ordered_cache_behavior below). The custom header is the
  # shared secret the Lambda checks so the public API can't be hit directly.
  origin {
    origin_id   = "contact-api"
    domain_name = replace(aws_apigatewayv2_api.contact.api_endpoint, "https://", "")

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Origin-Secret"
      value = random_password.contact_origin.result
    }
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

  # Contact-form API. POST passthrough to the API Gateway origin with caching
  # disabled. Deliberately no `hugo` function association here: the pretty-URL
  # rewrite would mangle /api/contact into /api/contact/index.html.
  ordered_cache_behavior {
    path_pattern             = "/api/contact"
    target_origin_id         = "contact-api"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = false
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled (AWS-managed)
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AllViewerExceptHostHeader (AWS-managed)
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
