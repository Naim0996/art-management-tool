# Docker Deployment Guide

This guide provides detailed instructions for running the Art Management Tool using Docker.

## Quick Start

The fastest way to get the application running:

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

## What Gets Deployed

The `docker-compose.yml` file deploys:

- **Backend API** (Go): Running on port 8080
- **Frontend** (Next.js): Running on port 3000
- **Private network**: Both services communicate via a Docker bridge network

## Accessing the Application

Once running, you can access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/health

## Docker Compose Commands

### Starting Services

```bash
# Start in detached mode (background)
docker compose up -d

# Start and view logs
docker compose up

# Build and start
docker compose up --build
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs backend
docker compose logs frontend
```

### Stopping Services

```bash
# Stop services (keeps containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop, remove containers, and delete volumes
docker compose down -v
```

### Rebuilding Services

```bash
# Rebuild specific service
docker compose build backend
docker compose build frontend

# Rebuild all services
docker compose build

# Rebuild and start
docker compose up --build
```

## Individual Container Deployment

### Backend Only

```bash
cd backend
docker build -t art-backend .
docker run -p 8080:8080 art-backend
```

### Frontend Only

```bash
cd frontend
docker build -t art-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 art-frontend
```

## Production Deployment

### 1. Build Production Images

```bash
# Build with specific tags
docker build -t your-registry/art-backend:v1.0.0 ./backend
docker build -t your-registry/art-frontend:v1.0.0 ./frontend
```

### 2. Push to Container Registry

```bash
# Login to your registry (Docker Hub, AWS ECR, Google GCR, etc.)
docker login your-registry

# Push images
docker push your-registry/art-backend:v1.0.0
docker push your-registry/art-frontend:v1.0.0
```

### 3. Deploy to Production

Update your production `docker-compose.yml` to use the registry images:

```yaml
version: '3.8'

services:
  backend:
    image: your-registry/art-backend:v1.0.0
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: always

  frontend:
    image: your-registry/art-frontend:v1.0.0
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    restart: always
```

## Environment Variables

### Backend Environment Variables

```bash
PORT=8080                                              # API port
DATABASE_URL=postgres://user:pass@host:5432/dbname    # Optional: Database connection
JWT_SECRET=your-secret-key                            # JWT signing secret
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend API URL
```

Create a `.env` file in the root directory:

```env
# Backend
PORT=8080
JWT_SECRET=change-this-in-production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Then update `docker-compose.yml`:

```yaml
services:
  backend:
    env_file:
      - .env
```

## Troubleshooting

### Port Already in Use

If you get "port already allocated" errors:

```bash
# Check what's using the port
sudo lsof -i :8080
sudo lsof -i :3000

# Stop the conflicting process or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check container logs
docker compose logs backend
docker compose logs frontend

# Check container status
docker compose ps

# Restart specific service
docker compose restart backend
```

### Build Failures

```bash
# Clean build without cache
docker compose build --no-cache

# Remove old images and rebuild
docker compose down
docker system prune -a
docker compose up --build
```

### Network Issues

```bash
# Recreate network
docker compose down
docker network prune
docker compose up
```

## Performance Optimization

### Multi-stage Builds

Both Dockerfiles use multi-stage builds to:
- Reduce final image size
- Separate build and runtime dependencies
- Improve security by minimizing attack surface

### Image Size

Check image sizes:

```bash
docker images | grep art
```

Typical sizes:
- Backend: ~15-20 MB (with Alpine)
- Frontend: ~150-200 MB (with Node.js)

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Security Best Practices

1. **Don't run as root**: Add user in Dockerfile
2. **Use specific image versions**: Avoid `latest` tags
3. **Scan for vulnerabilities**: Use `docker scan`
4. **Keep secrets out of images**: Use environment variables
5. **Use read-only filesystems** where possible

## Deployment Platforms

### Docker on VPS (DigitalOcean, Hetzner, Linode)

```bash
# SSH to server
ssh user@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone and start
git clone https://github.com/Naim0996/art-management-tool.git
cd art-management-tool
docker compose up -d
```

### AWS ECS

1. Push images to Amazon ECR
2. Create ECS cluster
3. Define task definitions using your images
4. Create services from task definitions

### Google Cloud Run

```bash
gcloud run deploy art-backend --image your-registry/art-backend:latest
gcloud run deploy art-frontend --image your-registry/art-frontend:latest
```

### Azure Container Instances

```bash
az container create --resource-group myResourceGroup \
  --name art-backend --image your-registry/art-backend:latest \
  --ports 8080
```

## Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats art-backend
```

### Health Checks

The backend includes a health check endpoint:

```bash
curl http://localhost:8080/health
```

Docker Compose is configured to use this for container health monitoring.

## Backup and Restore

### Backup Data

If using volumes for persistent data:

```bash
# Backup volume
docker run --rm -v art-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz -C /data .
```

### Restore Data

```bash
# Restore volume
docker run --rm -v art-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/backup.tar.gz -C /data
```

## CI/CD Integration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for GitHub Actions examples for automated builds and deployments.

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Production Checklist](https://docs.docker.com/engine/security/security/)
