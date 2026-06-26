#!/bin/bash
# Build and push the grc-tools Lambda container image to ECR.
# Run this BEFORE applying terraform/grc-tools-lambda.tf.
#
# Prerequisites:
#   - Docker installed and running
#   - AWS credentials with ecr:GetAuthorizationToken and ecr:*
#   - terraform/grc-tools.tf already applied (ECR repo exists)
#
# Usage:
#   cd terraform/files/grc-tools
#   ../../../scripts/docker-push.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE_DIR="$REPO_ROOT/terraform/files/grc-tools"

# Get ECR repo URL from Terraform outputs (or use the known name)
AWS_ACCOUNT="${AWS_ACCOUNT:-570516803292}"
AWS_REGION="${AWS_REGION:-us-east-1}"
REPO_NAME="grc-tools"
ECR_URL="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME"

echo "=== Building grc-tools Lambda image ==="
echo "ECR: $ECR_URL"
echo "Source: $IMAGE_DIR"
echo ""

# Login to ECR
echo "[1/3] Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build
echo "[2/3] Building Docker image..."
docker build -t "$ECR_URL:latest" "$IMAGE_DIR"

# Push
echo "[3/3] Pushing to ECR..."
docker push "$ECR_URL:latest"

echo ""
echo "=== Done ==="
echo "Image: $ECR_URL:latest"
echo ""
echo "Now run: terraform apply  (to create the Lambda + API Gateway routes)"
