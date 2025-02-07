#!/usr/bin/env bash
set -eu -o pipefail
trap "exit" SIGINT SIGTERM

# AWS region to deploy in
REGION="ap-southeast-2"

# Names of AWS resources to create/use
SERVICE_NAME="fabra-prototype"
AUTO_SCALING_CONFIGURATION_NAME="fabra-prototype-autoscaling"
IAM_ROLE_NAME="apprunner-ecr-access-role"

# AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity | jq -r ".Account")

# Build app
echo "Building Next.js app..."
yarn build

# Copy static assets (ideally these would be served from a CDN)
echo "Copying static assets..."
cp -r -t .next/standalone public
cp -r -t .next/standalone/.next .next/static

# Check if we need to create the ECR repository
echo "Checking if ECR repository exists..."
set +e
aws ecr describe-repositories \
  --region "$REGION" \
  --repository-names "$SERVICE_NAME" \
  > /dev/null 2>&1
status=$?
set -e

if [ $status -ne 0 ]; then
  # Create the ECR repository
  echo "Creating ECR repository..."
  aws ecr create-repository \
    --region "$REGION" \
    --repository-name "$SERVICE_NAME" > /dev/null
fi

# Get the ECR repository URI
echo "Getting ECR repository URI..."
ECR_URI=$(aws ecr describe-repositories \
  --region "$REGION" \
  --repository-names "$SERVICE_NAME" \
  | jq -r '.repositories[0].repositoryUri')

# Log in to the ECR repository
echo "Logging in to ECR repository..."
aws ecr get-login-password \
  --region "$REGION" \
  | docker login \
    --username AWS \
    --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Build the Docker image
echo "Building Docker image..."
docker build -t "$SERVICE_NAME" -f ./deployment/Dockerfile .
docker tag "$SERVICE_NAME" "$ECR_URI:latest"

# Push the Docker image
echo "Pushing Docker image to ECR..."
docker push "$ECR_URI:latest"

# Check if we need to create the IAM role
echo "Checking if IAM role exists..."
set +e
aws iam get-role --region "$REGION" --role-name "$IAM_ROLE_NAME" > /dev/null 2>&1
status=$?
set -e

if [ $status -ne 0 ]; then
  # Create IAM role to allow App Runner to access the ECR repository
  echo "Creating IAM role for App Runner..."
  aws iam create-role \
    --region "$REGION" \
    --role-name "$IAM_ROLE_NAME" \
    --assume-role-policy-document "$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
          "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
  )" > /dev/null

  # Allow the IAM role to read from the ECR repository
  aws iam attach-role-policy \
    --region "$REGION" \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly \
    --role-name "$IAM_ROLE_NAME" > /dev/null
fi

# Check if an autoscaling configuration exists
echo "Checking if autoscaling configuration exists..."
if [ \
  $(aws apprunner list-auto-scaling-configurations \
    --region "$REGION" \
    --auto-scaling-configuration-name "$AUTO_SCALING_CONFIGURATION_NAME" \
    | jq -r '.AutoScalingConfigurationSummaryList | length') -eq 0 ]; then
  # Create autoscaling configuration. Since this is a prototype, we're limiting
  # the maximum number of instances to 1.
  echo "Creating autoscaling configuration..."
  aws apprunner create-auto-scaling-configuration \
    --region "$REGION" \
    --auto-scaling-configuration-name "$AUTO_SCALING_CONFIGURATION_NAME" \
    --max-size 1 > /dev/null
fi

# Check if App Runner service exists
echo "Checking if App Runner service exists..."
if [ \
  $(aws apprunner list-services \
    --region "$REGION" \
    | jq -r '.ServiceSummaryList | map(select(.ServiceName == "'"$SERVICE_NAME"'")) | length') \
  -eq 0 ]; then
  # Create App Runner service. This will also deploy the app.
  echo "Creating App Runner service..."
  aws apprunner create-service \
    --region "$REGION" \
    --service-name "$SERVICE_NAME" \
    --auto-scaling-configuration-arn "arn:aws:apprunner:$REGION:$AWS_ACCOUNT_ID:autoscalingconfiguration/$AUTO_SCALING_CONFIGURATION_NAME" \
    --source-configuration "$(cat <<EOF
{
  "ImageRepository": {
    "ImageIdentifier": "$ECR_URI:latest",
    "ImageRepositoryType": "ECR",
    "ImageConfiguration": {
      "RuntimeEnvironmentVariables": {
        "HOSTNAME": "0.0.0.0"
      }
    }
  },
  "AutoDeploymentsEnabled": false,
  "AuthenticationConfiguration": {
    "AccessRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/$IAM_ROLE_NAME"
  }
}
EOF
    )" \
    --instance-configuration "$(cat <<EOF
{
  "Cpu": "0.25 vCPU",
  "Memory": "0.5 GB"
}
EOF
    )" > /dev/null
else
  # Get the App Runner service ARN
  service_arn=$(aws apprunner list-services \
    --region "ap-southeast-2" \
    | jq -r '.ServiceSummaryList | map(select(.ServiceName == "'"$SERVICE_NAME"'"))[0].ServiceArn'
  )

  # Deploy the app
  echo "Deploying App Runner service..."
  aws apprunner start-deployment \
    --region "$REGION" \
    --service-arn "$service_arn"
fi

# Display the service URL
service_url=$(aws apprunner list-services \
  --region "ap-southeast-2" \
  | jq -r '.ServiceSummaryList | map(select(.ServiceName == "'"$SERVICE_NAME"'"))[0].ServiceUrl'
)
echo "Done!"
echo "Once the deployment completes, you can access the app at: https://$service_url"
