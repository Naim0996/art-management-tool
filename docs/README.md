# 📚 Art Management Tool Documentation

Welcome to the Art Management Tool documentation hub! This directory contains all project documentation organized by topic.

## 🚀 Quick Navigation

### New to the Project?

Start here to get up and running quickly:

1. **[Environment Setup Guide](./guides/ENVIRONMENT_SETUP.md)** ⭐ - Configure your development environment
2. **[Docker Guide](./guides/DOCKER.md)** - Run the application with Docker
3. **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project

### Documentation Structure

```
docs/
├── README.md                   # This file - Documentation hub
├── CHANGELOG.md                # Version history and changes
├── ARCHITECTURE.md             # System architecture overview
├── CONTRIBUTING.md             # Contribution guidelines
│
├── guides/                     # Step-by-step guides
│   ├── ENVIRONMENT_SETUP.md    # ⭐ Environment configuration
│   ├── DOCKER.md               # Docker deployment
│   ├── DEPLOYMENT.md           # Production deployment
│   ├── DEPLOYMENT_UPLOAD_SYSTEM.md # Upload system deployment
│   ├── TESTING_GUIDE.md        # Testing strategies
│   └── INTEGRATION_SUMMARY.md  # Integration overview
│
├── api/                        # API documentation
│   └── SHOP_API.md             # REST API reference
│
├── troubleshooting/            # Problem-solving guides
│   ├── CART_TROUBLESHOOTING.md # Shopping cart issues
│   └── PROXY_SOLUTION.md       # API proxy configuration
│
├── summaries/                  # Implementation summaries
│   ├── ETSY_INFRASTRUCTURE_SUMMARY.md
│   ├── ETSY_PAYMENT_SUMMARY.md
│   ├── FRONTEND_ETSY_INTEGRATION_SUMMARY.md
│   └── REFACTORING_SUMMARY.md
│
├── FILE_UPLOAD_SYSTEM.md       # File upload system documentation
│
└── Integration Docs            # Third-party integrations
    ├── ETSY_INTEGRATION.md
    ├── ETSY_PAYMENT_INTEGRATION.md
    ├── ETSY_FRONTEND_INTEGRATION.md
    ├── ETSY_UI_MOCKUP.md
    └── SECURITY_INFRASTRUCTURE.md
```

## 📖 Documentation by Topic

### 🏗️ Architecture & Design

- **[Architecture](./ARCHITECTURE.md)** - System design, components, and data flow
- **[Security Infrastructure](./SECURITY_INFRASTRUCTURE.md)** - Security best practices and implementation

### 🔧 Setup & Configuration

- **[Environment Setup](./guides/ENVIRONMENT_SETUP.md)** ⭐ **START HERE**
  - Environment file configuration (.env.development, .env.test, etc.)
  - Docker Compose environments
  - Database setup and migrations
  - Auto-seeding configuration
  
- **[Docker Guide](./guides/DOCKER.md)**
  - Container orchestration
  - Development vs. Production setup
  - Multi-stage builds
  
- **[Deployment Guide](./guides/DEPLOYMENT.md)**
  - Production deployment strategies
  - Cloud platform guides (AWS, GCP, Azure)
  - CI/CD pipelines

- **[Upload System Deployment](./guides/DEPLOYMENT_UPLOAD_SYSTEM.md)**
  - File upload system deployment
  - Volume management and backups
  - CDN integration
  - Security and monitoring

### 📁 File Management

- **[File Upload System](./FILE_UPLOAD_SYSTEM.md)**
  - Image upload for products and personaggi
  - Docker-based persistent storage
  - Security and validation
  - API endpoints and frontend integration

### 🧪 Testing

- **[Testing Guide](./guides/TESTING_GUIDE.md)**
  - Unit testing strategies
  - Integration testing
  - E2E testing with Playwright
  - Test environment configuration

### 🔌 API & Integration

#### REST API

- **[Shop API Documentation](./api/SHOP_API.md)**
  - Complete endpoint reference
  - Request/response schemas
  - Authentication
  - Error handling

#### Etsy Integration

- **[Etsy Integration Guide](./ETSY_INTEGRATION.md)** - Complete Etsy API integration
- **[Etsy Payment Integration](./ETSY_PAYMENT_INTEGRATION.md)** - Payment processing
- **[Etsy Frontend Integration](./ETSY_FRONTEND_INTEGRATION.md)** - UI components
- **[Etsy UI Mockup](./ETSY_UI_MOCKUP.md)** - Design specifications

#### Other Integrations

- **[Integration Summary](./guides/INTEGRATION_SUMMARY.md)** - Overview of all integrations
  - Stripe payment processing
  - Shopify (stub implementation)
  - External services

### 🐛 Troubleshooting

- **[Cart Troubleshooting](./troubleshooting/CART_TROUBLESHOOTING.md)**
  - Shopping cart issues
  - Session management
  - State synchronization
  
- **[Proxy Solution](./troubleshooting/PROXY_SOLUTION.md)**
  - CORS issues
  - API proxy configuration
  - Development proxy setup

### 🤝 Contributing

- **[Contributing Guide](./CONTRIBUTING.md)**
  - Code style guidelines
  - Pull request process
  - Development workflow
  - Testing requirements

### 📝 Project History

- **[Changelog](./CHANGELOG.md)** - Version history and notable changes

### 📊 Implementation Summaries

Detailed summaries of major features and refactorings:

- **[Etsy Infrastructure Summary](./summaries/ETSY_INFRASTRUCTURE_SUMMARY.md)**
- **[Etsy Payment Summary](./summaries/ETSY_PAYMENT_SUMMARY.md)**
- **[Frontend Etsy Integration Summary](./summaries/FRONTEND_ETSY_INTEGRATION_SUMMARY.md)**
- **[Refactoring Summary](./summaries/REFACTORING_SUMMARY.md)**

## 🎯 Common Tasks

### Setting Up Development Environment

1. Read the [Environment Setup Guide](./guides/ENVIRONMENT_SETUP.md)
2. Choose your environment: `.env.development`, `.env.test`, or `.env.local`
3. Start with Docker: `docker compose -f docker-compose.development.yml up -d`
4. Database migrations run automatically!

### Running Tests

```bash
# Backend tests
cd backend
ENV=test go test ./...

# Frontend tests
cd frontend
npm test
```

See [Testing Guide](./guides/TESTING_GUIDE.md) for details.

### API Development

1. Review [Shop API Documentation](./api/SHOP_API.md)
2. Use the provided Postman collection (if available)
3. Test endpoints with curl or your favorite API client

### Integrating with Etsy

1. Follow [Etsy Integration Guide](./ETSY_INTEGRATION.md)
2. Configure credentials in environment file
3. Enable sync: `ETSY_SYNC_ENABLED=true`
4. Monitor logs for sync status

### Deploying to Production

1. Review [Deployment Guide](./guides/DEPLOYMENT.md)
2. Configure `.env.production` with secure credentials
3. Use `docker-compose.production.yml`
4. Set `AUTO_MIGRATE=true` for automatic migrations
5. Never set `AUTO_SEED=true` in production!

## 🔍 Quick Reference

### Environment Files

| File | Purpose | Docker Compose File |
|------|---------|-------------------|
| `.env.development` | Development defaults | `docker-compose.development.yml` |
| `.env.test` | Testing (pre-configured) | N/A (CI/local) |
| `.env.staging` | Staging environment | `docker-compose.staging.yml` |
| `.env.production` | Production | `docker-compose.production.yml` |
| `.env.local` | Local overrides (gitignored) | Overrides all |

### Docker Commands

```bash
# Development with hot-reload
docker compose -f docker-compose.development.yml up -d

# Staging
docker compose -f docker-compose.staging.yml up -d

# Production
docker compose -f docker-compose.production.yml up -d

# Default (demo/quick start)
docker compose up -d

# Enable seeding
AUTO_SEED=true docker compose up -d
```

### Key Ports

| Service | Development | Staging | Production |
|---------|------------|---------|-----------|
| Frontend | 3000 | 3001 | 3000 |
| Backend | 8080 | 8081 | 8080 |
| Database | 5432 | 5433 | 5432 |

## 📞 Getting Help

- 🐛 **Issues**: [GitHub Issues](https://github.com/Naim0996/art-management-tool/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Naim0996/art-management-tool/discussions)
- 📧 **Email**: support@artmanagement.tool

## 🔄 Documentation Updates

Documentation is a living resource. If you find:

- Missing information
- Outdated instructions
- Broken links
- Confusing explanations

Please open an issue or submit a pull request! See [Contributing Guide](./CONTRIBUTING.md).

---

**Last Updated**: 2025-10-22  
**Project Version**: See [CHANGELOG.md](./CHANGELOG.md)
