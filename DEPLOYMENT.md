# Deployment Guide

This guide provides instructions for deploying the Art Management Tool to production.

## Architecture Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Frontend  │──────▶│   Backend   │──────▶│  Database   │
│  (Next.js)  │       │   (Go API)  │       │ (Optional)  │
└─────────────┘       └─────────────┘       └─────────────┘
```

## Prerequisites

- AWS account (for infrastructure deployment)
- Terraform installed (>= 1.0)
- Go installed (>= 1.24)
- Node.js installed (>= 20)
- Docker (optional, for containerized deployment)

## Infrastructure Deployment

### 1. Deploy Infrastructure with Terraform

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

This creates:
- VPC with public subnets
- Security groups for backend and frontend
- Internet Gateway and routing

### 2. Note the Outputs

After applying, note the output values:
- `vpc_id`
- `public_subnet_ids`
- `backend_security_group_id`
- `frontend_security_group_id`

## Backend Deployment

### Option 1: EC2 Deployment

1. Launch an EC2 instance in the created VPC
2. SSH into the instance
3. Install Go:
   ```bash
   wget https://go.dev/dl/go1.24.linux-amd64.tar.gz
   sudo tar -C /usr/local -xzf go1.24.linux-amd64.tar.gz
   export PATH=$PATH:/usr/local/go/bin
   ```
4. Clone and run the backend:
   ```bash
   git clone https://github.com/Naim0996/art-management-tool.git
   cd art-management-tool/backend
   go build -o art-backend
   ./art-backend
   ```

### Option 2: Docker Deployment

1. Create a Dockerfile in the backend directory:
   ```dockerfile
   FROM golang:1.24-alpine
   WORKDIR /app
   COPY . .
   RUN go build -o art-backend
   EXPOSE 8080
   CMD ["./art-backend"]
   ```

2. Build and push to registry:
   ```bash
   docker build -t art-backend .
   docker tag art-backend:latest your-registry/art-backend:latest
   docker push your-registry/art-backend:latest
   ```

### Option 3: AWS ECS/Fargate

1. Create an ECS cluster in the VPC
2. Define a task definition using the Docker image
3. Create a service with the task definition
4. Configure load balancer

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url
   ```
3. Deploy automatically on push

### Option 2: AWS Amplify

1. Connect your GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Option 3: Static Export to S3 + CloudFront

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Create S3 bucket and upload:
   ```bash
   aws s3 sync .next/static s3://your-bucket-name/
   ```

3. Configure CloudFront distribution

## Environment Configuration

### Backend Environment Variables

```bash
export PORT=8080
export DATABASE_URL=postgres://user:pass@host:5432/dbname  # if using database
export JWT_SECRET=your-secret-key
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Database Setup (Optional)

For production, replace in-memory storage with a database:

1. Set up PostgreSQL or MongoDB
2. Update backend handlers to use database connections
3. Add connection pooling
4. Implement data persistence

## Security Considerations

1. **Authentication**: Replace demo credentials with proper authentication
2. **HTTPS**: Enable SSL/TLS for all endpoints
3. **API Keys**: Store sensitive data in secrets manager
4. **CORS**: Update CORS settings to allow only your frontend domain
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Input Validation**: Ensure all inputs are validated and sanitized

## Monitoring and Logging

1. Set up CloudWatch for AWS resources
2. Configure application logging
3. Set up alerts for errors and performance issues
4. Use APM tools like DataDog or New Relic

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and deploy backend
        run: |
          cd backend
          go build -o art-backend
          # Deploy to your infrastructure

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and deploy frontend
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to your infrastructure
```

## Scaling Considerations

1. **Backend**: Use load balancer with multiple instances
2. **Frontend**: Leverage CDN for static assets
3. **Database**: Implement read replicas and connection pooling
4. **Caching**: Add Redis for session and data caching
5. **Queue**: Use message queues for background tasks

## Backup and Recovery

1. Regular database backups
2. Infrastructure state backups (Terraform state)
3. Code repository backups
4. Disaster recovery plan

## Cost Optimization

1. Use auto-scaling for compute resources
2. Implement caching to reduce API calls
3. Use reserved instances for predictable workloads
4. Monitor and optimize resource usage

## Support and Maintenance

1. Regular security updates
2. Monitor application logs
3. Performance tuning
4. User feedback integration
