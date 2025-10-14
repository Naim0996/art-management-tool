# Infrastructure (Optional)

**Note**: This directory contains Terraform configurations for AWS cloud deployment. For most use cases, we recommend using Docker and Docker Compose instead (see main [README.md](../README.md) and [DEPLOYMENT.md](../DEPLOYMENT.md)).

This Terraform configuration is provided for advanced users who need to deploy on AWS infrastructure.

## Resources

The Terraform configuration creates:
- VPC with public subnets across 2 availability zones
- Internet Gateway
- Route tables and associations
- Security groups for backend and frontend services

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions

## Usage

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Review the planned changes:
   ```bash
   terraform plan
   ```

3. Apply the configuration:
   ```bash
   terraform apply
   ```

4. To destroy the infrastructure:
   ```bash
   terraform destroy
   ```

## Variables

You can customize the deployment by creating a `terraform.tfvars` file:

```hcl
aws_region   = "us-east-1"
project_name = "art-management-tool"
environment  = "dev"
```

## Outputs

After applying, you'll get:
- VPC ID
- Public subnet IDs
- Security group IDs for backend and frontend

## Next Steps

After infrastructure is provisioned:
1. Deploy Docker containers to ECS/Fargate using the images from the Docker builds
2. Or deploy the backend application to EC2 instances
3. Configure DNS and SSL certificates
4. Set up monitoring and logging

## Recommended Approach

For simpler and more cost-effective deployment, consider using:
- Docker Compose on a single VPS (DigitalOcean, Hetzner, Linode)
- Managed container services (AWS ECS, Google Cloud Run, Azure Container Instances)
- Platform-as-a-Service offerings (Fly.io, Railway, Render)

See [DEPLOYMENT.md](../DEPLOYMENT.md) for Docker-based deployment instructions.
