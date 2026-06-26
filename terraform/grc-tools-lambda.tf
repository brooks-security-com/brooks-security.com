# =============================================================================
# grc-tools policy builder — phase 2: Lambda + API Gateway
#
# REQUIRES: a Docker image at ${aws_ecr_repository.grc_tools.repository_url}:latest
# Before applying this file, run:
#   docker build -t <repo_url>:latest terraform/files/grc-tools/
#   aws ecr get-login-password | docker login --username AWS --password-stdin <repo_url>
#   docker push <repo_url>:latest
#
# The phase 1 resources (grc-tools.tf) must already exist.
# =============================================================================

# --- Lambda function (container image from ECR) -----------------------------

resource "aws_lambda_function" "grc_tools" {
  function_name = "grc-tools"
  role          = aws_iam_role.grc_tools.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.grc_tools.repository_url}:latest"
  timeout       = 30
  memory_size   = 512
  tags          = local.grc_tags

  environment {
    variables = {
      SESSIONS_TABLE = aws_dynamodb_table.grc_sessions.name
      POLICIES_TABLE = aws_dynamodb_table.grc_policies.name
      S3_BUCKET      = var.domain
      S3_PREFIX      = "grc-tools/users"
      USER_POOL_ID   = aws_cognito_user_pool.grc_tools.id
      CLIENT_ID      = aws_cognito_user_pool_client.grc_tools.id
      ORIGIN_SECRET  = random_password.contact_origin.result
    }
  }
}

resource "aws_cloudwatch_log_group" "grc_tools" {
  name              = "/aws/lambda/${aws_lambda_function.grc_tools.function_name}"
  retention_in_days = 14
  tags              = local.grc_tags
}

# --- API Gateway routes (added to the existing contact API) ------------------

resource "aws_apigatewayv2_integration" "grc_tools" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.grc_tools.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "grc_whoami" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/whoami"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_session_get" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/session"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_session_put" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "PUT /api/grc-tools/session"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_templates" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/templates"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_generate" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/grc-tools/generate"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_bundle" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/grc-tools/bundle"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

resource "aws_apigatewayv2_route" "grc_policies" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/grc-tools/policies"
  target    = "integrations/${aws_apigatewayv2_integration.grc_tools.id}"
}

# Let API Gateway invoke the Lambda
resource "aws_lambda_permission" "grc_tools_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.grc_tools.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}
