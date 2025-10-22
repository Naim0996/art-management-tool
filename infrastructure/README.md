# 🏗️ Infrastructure as Code (Terraform)

AWS infrastructure configuration for deploying the Art Management Tool e-commerce platform using Terraform.

[![Terraform](https://img.shields.io/badge/Terraform-1.0+-623CE4?logo=terraform)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?logo=amazon-aws)](https://aws.amazon.com/)

> ⚠️ **Note**: This directory contains advanced infrastructure configuration for AWS deployment. For most use cases, we **strongly recommend using Docker and Docker Compose** instead. See the main [README.md](../README.md) and [DEPLOYMENT.md](../DEPLOYMENT.md) for simpler deployment options.

## 📋 Table of Contents

- [Overview](#overview)
- [When to Use This](#when-to-use-this)
- [Resources Created](#resources-created)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Cost Estimation](#cost-estimation)
- [Recommended Alternatives](#recommended-alternatives)

## 🎯 Overview

This Terraform configuration provisions a complete AWS infrastructure suitable for hosting the Art Management Tool in a production environment. It creates networking, security, and compute resources optimized for containerized applications.

## 🤔 When to Use This

### ✅ Use Terraform IaC When:
- You need enterprise-grade AWS infrastructure
- Compliance requires specific AWS services
- You're deploying to an existing AWS environment
- You need advanced networking (VPC, subnets, security groups)
- You require auto-scaling and load balancing
- Your team is familiar with AWS and Terraform

### ❌ Don't Use This When:
- You want a simple, quick deployment → Use **Docker Compose**
- You're developing locally → Use **local development setup**
- You have limited AWS budget → Use **managed platforms**
- You're prototyping → Use **Vercel** (frontend) + **Railway** (backend)
- You want zero infrastructure management → Use **PaaS solutions**

## 🛠️ Resources Created

This Terraform configuration creates the following AWS resources:

### Network Infrastructure
- **VPC (Virtual Private Cloud)**
  - CIDR: `10.0.0.0/16`
  - DNS hostnames and support enabled
  
- **Public Subnets** (2)
  - Subnet 1: `10.0.1.0/24` (eu-south-1a)
  - Subnet 2: `10.0.2.0/24` (eu-south-1b)
  - Auto-assign public IP enabled
  
- **Internet Gateway**
  - Provides internet access for public subnets
  
- **Route Tables**
  - Public route table with internet gateway route
  - Associations for both public subnets

### Security Groups
- **Backend Security Group**
  - Inbound: Port 8080 (HTTP API)
  - Outbound: All traffic
  
- **Frontend Security Group**
  - Inbound: Ports 80 (HTTP) and 443 (HTTPS)
  - Outbound: All traffic

### Outputs
- VPC ID
- Public Subnet IDs
- Security Group IDs
- Availability Zones

## 📦 Prerequisites

### Required Tools
- **Terraform**: Version 1.0 or higher
  ```bash
  # Install Terraform
  # macOS
  brew install terraform
  
  # Windows (Chocolatey)
  choco install terraform
  
  # Linux
  wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
  unzip terraform_1.6.0_linux_amd64.zip
  sudo mv terraform /usr/local/bin/
  ```

- **AWS CLI**: Configured with credentials
  ```bash
  # Install AWS CLI
  pip install awscli
  
  # Configure credentials
  aws configure
  ```

### AWS Account Requirements
- Active AWS account
- IAM user with appropriate permissions:
  - VPC creation and management
  - EC2 instance management
  - Security group management
  - IAM role creation (if using ECS/Fargate)

### Cost Considerations
- This infrastructure incurs AWS charges
- Estimated cost: $20-100/month depending on usage
- Always review AWS pricing before deploying
- Remember to destroy resources when not in use

## 🚀 Quick Start

### 1. Initialize Terraform

```bash
# Navigate to infrastructure directory
cd infrastructure

# Initialize Terraform (downloads providers)
terraform init
```

Output:
```
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

### 2. Review Planned Changes

```bash
# See what resources will be created
terraform plan
```

This shows a detailed preview of all resources that will be created without actually creating them.

### 3. Apply Configuration

```bash
# Create the infrastructure
terraform apply

# Review the plan and type 'yes' to confirm
```

### 4. View Outputs

```bash
# Display output values
terraform output

# Get specific output
terraform output vpc_id
terraform output public_subnet_ids
```

### 5. Destroy Infrastructure (When Done)

```bash
# Remove all created resources
terraform destroy

# Type 'yes' to confirm deletion
```

⚠️ **Important**: Always run `terraform destroy` when you're done to avoid ongoing AWS charges!

## ⚙️ Configuration

### Variables

Create a `terraform.tfvars` file to customize your deployment:

```hcl
# terraform.tfvars
aws_region   = "eu-south-1"
project_name = "art-management-tool"
environment  = "production"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# Subnet Configuration
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
availability_zones  = ["eu-south-1a", "eu-south-1b"]

# Tags
tags = {
  Project     = "Art Management Tool"
  Environment = "Production"
  ManagedBy   = "Terraform"
}
```

### Environment-Specific Configurations

**Development:**
```hcl
# dev.tfvars
environment  = "development"
vpc_cidr     = "10.0.0.0/16"
```

**Staging:**
```hcl
# staging.tfvars
environment  = "staging"
vpc_cidr     = "10.1.0.0/16"
```

**Production:**
```hcl
# prod.tfvars
environment  = "production"
vpc_cidr     = "10.2.0.0/16"
enable_nat_gateway = true
enable_vpn_gateway = true
```

Apply with specific variables:
```bash
terraform apply -var-file="prod.tfvars"
```

### Backend Configuration

For team collaboration, configure remote state storage:

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "art-management-tool/terraform.tfstate"
    region         = "eu-south-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

## 📊 Deployment

### Complete Deployment Workflow

1. **Plan Infrastructure**:
   ```bash
   terraform plan -out=tfplan
   ```

2. **Review Plan**:
   ```bash
   terraform show tfplan
   ```

3. **Apply Plan**:
   ```bash
   terraform apply tfplan
   ```

4. **Save Outputs**:
   ```bash
   terraform output -json > outputs.json
   ```

### Deploy Application Containers

After infrastructure is provisioned:

#### Option 1: ECS/Fargate (Recommended)

```bash
# Build and push Docker images to ECR
aws ecr get-login-password --region eu-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-south-1.amazonaws.com

# Tag and push backend
docker tag art-backend:latest <account-id>.dkr.ecr.eu-south-1.amazonaws.com/art-backend:latest
docker push <account-id>.dkr.ecr.eu-south-1.amazonaws.com/art-backend:latest

# Tag and push frontend
docker tag art-frontend:latest <account-id>.dkr.ecr.eu-south-1.amazonaws.com/art-frontend:latest
docker push <account-id>.dkr.ecr.eu-south-1.amazonaws.com/art-frontend:latest

# Deploy to ECS (requires ECS configuration)
aws ecs update-service --cluster art-cluster --service backend --force-new-deployment
aws ecs update-service --cluster art-cluster --service frontend --force-new-deployment
```

#### Option 2: EC2 Instances

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@<instance-public-ip>

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# Pull and run containers
docker pull <your-registry>/art-backend:latest
docker pull <your-registry>/art-frontend:latest

docker run -d -p 8080:8080 --name backend <your-registry>/art-backend:latest
docker run -d -p 3000:3000 --name frontend <your-registry>/art-frontend:latest
```

### Post-Deployment Steps

1. **Configure DNS**:
   - Point your domain to load balancer or instance IP
   - Set up SSL/TLS certificates (AWS Certificate Manager)

2. **Set up Monitoring**:
   ```bash
   # Enable CloudWatch logs
   aws logs create-log-group --log-group-name /aws/art-management-tool
   ```

3. **Configure Auto-scaling** (if using ECS):
   ```bash
   aws application-autoscaling register-scalable-target \
     --service-namespace ecs \
     --resource-id service/art-cluster/backend \
     --scalable-dimension ecs:service:DesiredCount \
     --min-capacity 2 \
     --max-capacity 10
   ```

## 💰 Cost Estimation

### Monthly Cost Breakdown (Approximate)

**Minimal Setup:**
- VPC: Free
- 1x t3.micro EC2: ~$7.50/month
- Internet Gateway: Free (data transfer charges apply)
- **Total: ~$10-20/month**

**Production Setup:**
- VPC: Free
- 2x t3.small ECS tasks: ~$30/month
- Application Load Balancer: ~$16/month
- RDS PostgreSQL (db.t3.micro): ~$15/month
- Data transfer: ~$10/month
- **Total: ~$70-100/month**

**Enterprise Setup:**
- VPC with NAT Gateway: ~$32/month
- Auto-scaling ECS cluster: ~$100-300/month
- RDS Multi-AZ: ~$50/month
- CloudWatch: ~$10/month
- **Total: ~$200-400/month**

💡 **Cost-Saving Tips:**
- Use spot instances for non-critical workloads
- Implement auto-scaling to scale down during low traffic
- Use S3 for static assets with CloudFront CDN
- Clean up unused resources regularly
- Set up AWS budgets and alerts

## 🎯 Recommended Alternatives

If AWS + Terraform seems too complex or expensive, consider these alternatives:

### 1. **Docker Compose on VPS** (Simplest)
**Platforms**: DigitalOcean, Hetzner, Linode
- **Cost**: $5-20/month
- **Setup**: 10 minutes
- **Best for**: Small to medium projects
  
```bash
# One command deployment
docker compose up -d
```

### 2. **Platform as a Service (PaaS)** (Zero Infrastructure)

**Frontend (Vercel)**:
- Free tier available
- Automatic SSL
- Global CDN
- Zero config deployment

**Backend (Railway/Render)**:
- $5-10/month
- Automatic deployments
- Built-in database
- No infrastructure management

### 3. **Managed Kubernetes** (Scalable)
- **Google Cloud Run**: Pay per use
- **AWS App Runner**: Simplified containers
- **Azure Container Instances**: On-demand containers

### 4. **Serverless** (Ultra-scalable)
- **Vercel** (Frontend) + **Vercel Serverless** (Backend)
- **AWS Lambda** + **API Gateway**
- **Cloudflare Workers**

## 📖 Next Steps

After provisioning infrastructure:

1. ✅ Deploy application containers
2. ✅ Configure database (RDS or external)
3. ✅ Set up SSL certificates
4. ✅ Configure custom domain
5. ✅ Set up monitoring and logging
6. ✅ Implement backup strategy
7. ✅ Configure CI/CD pipeline
8. ✅ Set up staging environment
9. ✅ Implement disaster recovery plan
10. ✅ Document runbooks
11. ✅ Configure Etsy API integration (see [ETSY_INTEGRATION.md](../docs/ETSY_INTEGRATION.md))

## 📚 Additional Resources

- 📖 [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- 🏗️ [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- 🔐 [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- 💰 [AWS Pricing Calculator](https://calculator.aws/)
- 📊 [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🛟 Support & Troubleshooting

### Common Issues

**Issue**: `Error: No valid credential sources`
```bash
# Solution: Configure AWS CLI
aws configure
```

**Issue**: `Error: VPC limit exceeded`
```bash
# Solution: Request limit increase or delete unused VPCs
aws ec2 describe-vpcs
```

**Issue**: `Error: InsufficientPermissions`
```bash
# Solution: Ensure IAM user has required permissions
# Required: EC2FullAccess, VPCFullAccess
```

### Getting Help

- 📧 Check main project [README](../README.md)
- 🐛 [Report Issues](https://github.com/Naim0996/art-management-tool/issues)
- 💬 [Discussions](https://github.com/Naim0996/art-management-tool/discussions)

## 🤝 Contributing

Contributions to infrastructure code are welcome! Please:
- Test changes in a separate environment
- Document new variables
- Update this README
- Follow Terraform best practices

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**💡 Recommendation**: Unless you specifically need AWS infrastructure, start with Docker Compose deployment for simplicity and cost-effectiveness. See [DEPLOYMENT.md](../DEPLOYMENT.md) for details.
