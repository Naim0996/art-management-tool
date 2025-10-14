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

- Docker and Docker Compose installed (recommended)
- Go installed (>= 1.24) - for local development
- Node.js installed (>= 20) - for local development
- AWS account (optional, for cloud deployment)
- Terraform installed (>= 1.0) - optional, for AWS infrastructure

## Quick Start with Docker (Recommended)

The easiest way to deploy the entire application stack is using Docker Compose:

### 1. Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/Naim0996/art-management-tool.git
cd art-management-tool

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 2. Individual Docker Containers

If you prefer to run services separately:

#### Backend:
```bash
cd backend
docker build -t art-backend .
docker run -p 8080:8080 art-backend
```

#### Frontend:
```bash
cd frontend
docker build -t art-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 art-frontend
```

### 3. Docker in Production

For production deployment:

1. Build and tag images:
   ```bash
   docker build -t your-registry/art-backend:latest ./backend
   docker build -t your-registry/art-frontend:latest ./frontend
   ```

2. Push to container registry:
   ```bash
   docker push your-registry/art-backend:latest
   docker push your-registry/art-frontend:latest
   ```

3. Deploy using docker-compose or orchestration platform (Kubernetes, Docker Swarm, etc.)

## Alternative Deployment Options

### Local Development Deployment

#### Backend Setup (without Docker)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Run the server:
   ```bash
   go run main.go
   ```

#### Frontend Setup (without Docker)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Cloud Deployment Options

#### Option 1: AWS ECS/Fargate

1. Push Docker images to Amazon ECR
2. Create an ECS cluster
3. Define task definitions using the Docker images
4. Create services with the task definitions
5. Configure Application Load Balancer

#### Option 2: Vercel + Backend Hosting

1. Deploy frontend to Vercel:
   - Connect your GitHub repository to Vercel
   - Configure environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url`
   - Deploy automatically on push

2. Deploy backend to any Docker-compatible hosting:
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform
   - Fly.io
   - Railway

#### Option 3: Traditional Infrastructure (AWS)

If you need to deploy with traditional AWS infrastructure using Terraform, see the [Infrastructure README](./infrastructure/README.md) for details. Note that this approach requires more setup and may incur higher costs compared to containerized deployments.

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

### Docker Deployment

1. Use `docker compose logs` for viewing logs:
   ```bash
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

2. Implement centralized logging (optional):
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Grafana + Loki
   - Papertrail

3. Container monitoring:
   - Docker stats: `docker stats`
   - cAdvisor for detailed metrics
   - Prometheus + Grafana

### Cloud Deployment

1. AWS: Use CloudWatch for logs and metrics
2. Configure application logging
3. Set up alerts for errors and performance issues
4. Use APM tools like DataDog, New Relic, or Application Insights

## CI/CD Pipeline

### GitHub Actions Example (Docker)

```yaml
name: Build and Deploy Docker Images
on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.REGISTRY_URL }}/art-backend:latest
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.REGISTRY_URL }}/art-frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # SSH to server and pull new images
          # docker compose pull
          # docker compose up -d
          echo "Deploy to your infrastructure"
```

## Scaling Considerations

1. **Backend**: Use load balancer with multiple instances
2. **Frontend**: Leverage CDN for static assets
3. **Database**: Implement read replicas and connection pooling
4. **Caching**: Add Redis for session and data caching
5. **Queue**: Use message queues for background tasks

## Backup and Recovery

1. **Database backups**: Regular backups if using persistent database
2. **Docker volumes**: Backup Docker volumes containing persistent data
3. **Container images**: Push images to container registry for version control
4. **Code repository**: Maintain Git repository backups
5. **Configuration**: Version control docker-compose.yml and environment files
6. **Disaster recovery plan**: Document recovery procedures

## Cost Optimization

### Docker Deployment

1. Use multi-stage builds to reduce image sizes (already implemented)
2. Implement caching to reduce API calls
3. Run on cost-effective platforms:
   - DigitalOcean Droplets
   - Hetzner Cloud
   - OVH Cloud
   - Linode
4. Use Docker resource limits to optimize usage

### Cloud Deployment

1. Use auto-scaling for compute resources
2. Use spot/preemptible instances where appropriate
3. Use reserved instances for predictable workloads
4. Monitor and optimize resource usage with cloud cost management tools

## Support and Maintenance

1. Regular security updates
2. Monitor application logs
3. Performance tuning
4. User feedback integration
