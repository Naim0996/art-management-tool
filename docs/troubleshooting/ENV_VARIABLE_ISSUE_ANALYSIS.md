# Docker Compose Environment Variable Issue - Analysis & Solution

## Problem Identified

Docker Compose environment variable substitution (`${VAR}`) reads from:
1. Shell environment variables
2. .env file in the same directory  
3. Defaults specified in `${VAR:-default}`

**It does NOT read from `env_file` directive!**

### Current Behavior

```yaml
postgres:
  env_file:
    - .env.production  # Loads into container
  environment:
    POSTGRES_DB: ${DB_NAME:-artmanagement}  # Reads from shell, not env_file!
```

Result: Always uses default `artmanagement` instead of `artmanagement_prod`

### Why Backend Works

The backend service loads the env_file and then the application code reads those variables at runtime - no substitution needed in the compose file.

## Solution Options

### Option 1: Use .env file (RECOMMENDED)
Docker Compose automatically reads a `.env` file in the same directory for substitution:

```yaml
# .env.production
DB_NAME=artmanagement_prod
DB_USER=artuser_prod  
DB_PASSWORD=secret

# docker-compose.production.yml
postgres:
  environment:
    POSTGRES_DB: ${DB_NAME}
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
```

Run with: `docker-compose --env-file .env.production -f docker-compose.production.yml up`

### Option 2: Hardcode per Environment (CURRENT APPROACH)
Each compose file has environment-specific hardcoded values:

```yaml
# docker-compose.production.yml
postgres:
  environment:
    POSTGRES_DB: artmanagement_prod
    POSTGRES_USER: artuser_prod
    POSTGRES_PASSWORD: changeme-prod

# docker-compose.development.yml  
postgres:
  environment:
    POSTGRES_DB: artmanagement
    POSTGRES_USER: artuser
    POSTGRES_PASSWORD: artpassword
```

### Option 3: Shell Environment Variables
Export variables before running:

```bash
export DB_NAME=artmanagement_prod
export DB_USER=artuser_prod
export DB_PASSWORD=secret
docker-compose -f docker-compose.production.yml up
```

## Recommended Fix

Use **Option 1** with `--env-file` flag for proper environment separation while maintaining variable substitution.

### Implementation

1. Keep env_file for backend (application reads at runtime)
2. Use --env-file flag for compose substitution
3. Remove fallback defaults or keep for safety

```yaml
postgres:
  environment:
    POSTGRES_DB: ${DB_NAME}  # No fallback - must be set
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}

backend:
  env_file:
    - .env.production  # App reads these at runtime
```

Run: `docker-compose --env-file .env.production -f docker-compose.production.yml up`