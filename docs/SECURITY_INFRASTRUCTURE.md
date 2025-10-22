# 🔐 Security Infrastructure Guide

Comprehensive security guidelines for the Art Management Tool infrastructure, with focus on external API integrations (Etsy, Shopify, Payment providers).

## 📋 Table of Contents

- [Overview](#overview)
- [Credential Management](#credential-management)
- [Environment Isolation](#environment-isolation)
- [API Security](#api-security)
- [Rate Limiting](#rate-limiting)
- [Data Protection](#data-protection)
- [Monitoring & Auditing](#monitoring--auditing)
- [Incident Response](#incident-response)

## 🎯 Overview

This document outlines security best practices and requirements for the infrastructure supporting external API integrations. It covers credential storage, secure communication, rate limiting, and monitoring.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Secure by Default** - Security as default configuration
4. **Zero Trust** - Verify all requests
5. **Fail Secure** - Default to deny on errors

## 🔑 Credential Management

### Environment Variables

**✅ DO:**
```bash
# Store credentials in environment variables
export ETSY_API_KEY="your_api_key"
export ETSY_API_SECRET="your_api_secret"

# Use .env files (gitignored)
echo "ETSY_API_KEY=your_key" > .env.production
```

**❌ DON'T:**
```go
// Never hardcode credentials
const apiKey = "sk_live_123456789"  // BAD!

// Never commit to version control
git add .env  // BAD!
```

### Secret Management Systems

For production, use dedicated secret management:

**AWS Secrets Manager:**
```bash
# Store secret
aws secretsmanager create-secret \
  --name art-management/etsy-api-key \
  --secret-string "your_api_key"

# Retrieve in application
secret=$(aws secretsmanager get-secret-value \
  --secret-id art-management/etsy-api-key \
  --query SecretString --output text)
```

**HashiCorp Vault:**
```bash
# Store secret
vault kv put secret/art-management/etsy \
  api_key="your_key" \
  api_secret="your_secret"

# Retrieve in application
vault kv get -field=api_key secret/art-management/etsy
```

**Docker Secrets (Swarm):**
```bash
# Create secret
echo "your_api_key" | docker secret create etsy_api_key -

# Use in service
docker service create \
  --secret etsy_api_key \
  art-backend
```

### Credential Rotation

**Rotation Schedule:**
- **Development**: Every 90 days
- **Staging**: Every 60 days
- **Production**: Every 30-45 days

**Rotation Process:**
1. Generate new credentials in API provider dashboard
2. Store new credentials in secret manager
3. Update environment variables
4. Test with new credentials
5. Revoke old credentials
6. Update documentation

### Access Control

**Principle of Least Privilege:**
```yaml
# IAM Policy Example (AWS)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:art-management/*"
    }
  ]
}
```

## 🏢 Environment Isolation

### Environment Separation

Maintain strict separation between environments:

**Development:**
- Local database
- Test API credentials
- No production data
- Relaxed rate limits

**Staging:**
- Separate database instance
- Test API credentials
- Anonymized production data
- Production-like rate limits

**Production:**
- Isolated database
- Production API credentials
- Real customer data
- Strict rate limits

### Network Segmentation

```yaml
# VPC Configuration (Terraform)
resource "aws_vpc" "staging" {
  cidr_block = "10.1.0.0/16"
  tags = { Environment = "staging" }
}

resource "aws_vpc" "production" {
  cidr_block = "10.2.0.0/16"
  tags = { Environment = "production" }
}
```

### Configuration Management

**Environment-Specific Config:**
```bash
# .env.development
ETSY_SYNC_ENABLED=false
LOG_LEVEL=debug

# .env.staging
ETSY_SYNC_ENABLED=true
LOG_LEVEL=info

# .env.production
ETSY_SYNC_ENABLED=true
LOG_LEVEL=warn
```

## 🔒 API Security

### HTTPS Only

**All external API calls must use HTTPS:**
```go
// Enforce HTTPS
client := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            MinVersion: tls.VersionTLS12,
        },
    },
}
```

### Authentication

**OAuth 2.0 (Etsy):**
```go
// Use OAuth tokens with expiration
type EtsyAuth struct {
    AccessToken  string
    RefreshToken string
    ExpiresAt    time.Time
}

// Refresh before expiration
if auth.ExpiresAt.Before(time.Now()) {
    auth = refreshToken(auth.RefreshToken)
}
```

**API Key Rotation:**
```go
// Support multiple active keys during rotation
type APIKeyManager struct {
    Primary   string
    Secondary string  // Used during rotation
    Active    string  // Which key to use
}
```

### Request Signing

For sensitive operations, implement request signing:
```go
// HMAC signature
mac := hmac.New(sha256.New, []byte(apiSecret))
mac.Write([]byte(requestBody))
signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

req.Header.Set("X-Signature", signature)
```

### Certificate Validation

Always validate SSL/TLS certificates:
```go
// Never skip certificate verification
transport := &http.Transport{
    TLSClientConfig: &tls.Config{
        InsecureSkipVerify: false,  // Must be false!
    },
}
```

## ⏱️ Rate Limiting

### Implementation Layers

**1. Application Level (Per-Service):**
```go
// Rate limiter per API
etsyLimiter := ratelimit.NewLimiter(10000, 24*time.Hour)

if !etsyLimiter.Allow() {
    return ErrRateLimitExceeded
}
```

**2. Infrastructure Level (Per-IP):**
```nginx
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
}
```

**3. Database Level:**
```sql
-- Track rate limit in database
CREATE TABLE api_rate_limits (
    client_id VARCHAR(255) PRIMARY KEY,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rate Limit Headers

Implement standard rate limit headers:
```go
w.Header().Set("X-RateLimit-Limit", "10000")
w.Header().Set("X-RateLimit-Remaining", "9500")
w.Header().Set("X-RateLimit-Reset", "1635724800")
```

### Backoff Strategies

**Exponential Backoff:**
```go
func retryWithBackoff(fn func() error, maxRetries int) error {
    for i := 0; i < maxRetries; i++ {
        err := fn()
        if err == nil {
            return nil
        }
        
        if i < maxRetries-1 {
            backoff := time.Duration(math.Pow(2, float64(i))) * time.Second
            time.Sleep(backoff)
        }
    }
    return errors.New("max retries exceeded")
}
```

## 🛡️ Data Protection

### Encryption at Rest

**Database Encryption:**
```sql
-- PostgreSQL with encryption
CREATE DATABASE artmanagement
  WITH ENCRYPTION = 'on';

-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE api_credentials (
    id SERIAL PRIMARY KEY,
    service VARCHAR(50),
    api_key BYTEA,  -- Encrypted
    created_at TIMESTAMP DEFAULT NOW()
);

-- Encrypt before insert
INSERT INTO api_credentials (service, api_key)
VALUES ('etsy', pgp_sym_encrypt('secret_key', 'encryption_key'));
```

**File System Encryption:**
```bash
# Linux dm-crypt
cryptsetup luksFormat /dev/sdb
cryptsetup open /dev/sdb encrypted_data
mkfs.ext4 /dev/mapper/encrypted_data
```

### Encryption in Transit

**TLS Configuration:**
```yaml
# docker-compose.yml with TLS
services:
  postgres:
    environment:
      - POSTGRES_SSL_MODE=require
      - POSTGRES_SSL_CERT=/certs/server.crt
      - POSTGRES_SSL_KEY=/certs/server.key
```

### Data Sanitization

**Logging:**
```go
// Never log sensitive data
log.Printf("API request to Etsy")  // ✅ Good
log.Printf("API key: %s", apiKey)   // ❌ Bad!

// Sanitize before logging
func sanitizeForLogging(data map[string]interface{}) {
    sensitiveFields := []string{"api_key", "api_secret", "token"}
    for _, field := range sensitiveFields {
        if _, exists := data[field]; exists {
            data[field] = "***REDACTED***"
        }
    }
}
```

**Database Backups:**
```bash
# Encrypt backups
pg_dump artmanagement | \
  gpg --encrypt --recipient admin@artmanagement.tool > \
  backup_$(date +%Y%m%d).sql.gpg

# Store securely
aws s3 cp backup_*.sql.gpg s3://backups/ \
  --server-side-encryption AES256
```

## 📊 Monitoring & Auditing

### Security Logging

**What to Log:**
- Authentication attempts (success/failure)
- API credential usage
- Rate limit violations
- Configuration changes
- Access to sensitive data

**Log Format:**
```json
{
  "timestamp": "2025-10-22T19:00:00Z",
  "event": "api_call",
  "service": "etsy",
  "action": "sync_products",
  "user": "system",
  "ip": "10.0.1.5",
  "status": "success",
  "rate_limit_remaining": 9500
}
```

### Audit Trail

**Database Audit Log:**
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    action VARCHAR(50),
    resource_type VARCHAR(50),
    resource_id INTEGER,
    changes JSONB,
    ip_address INET
);

-- Trigger for tracking changes
CREATE TRIGGER audit_api_credentials
AFTER UPDATE ON api_credentials
FOR EACH ROW
EXECUTE FUNCTION log_credential_change();
```

### Alerts

**Critical Security Events:**
```yaml
# AlertManager configuration
alerts:
  - name: HighFailedAuthRate
    expr: rate(auth_failures[5m]) > 10
    severity: critical
    
  - name: RateLimitExceeded
    expr: api_rate_limit_remaining < 1000
    severity: warning
    
  - name: UnauthorizedAPIAccess
    expr: count(api_unauthorized_attempts[1h]) > 5
    severity: critical
```

### Security Scanning

**Regular Scans:**
```bash
# Dependency vulnerabilities
npm audit
go mod verify

# Container scanning
docker scan art-backend:latest

# Infrastructure scanning
trivy config infrastructure/
```

## 🚨 Incident Response

### Response Plan

**1. Detection:**
- Automated monitoring alerts
- Log analysis
- Anomaly detection

**2. Containment:**
```bash
# Immediately revoke compromised credentials
# Disable affected services
docker compose stop backend

# Block suspicious IPs
iptables -A INPUT -s suspicious.ip -j DROP
```

**3. Investigation:**
- Review audit logs
- Identify scope of breach
- Document timeline

**4. Recovery:**
```bash
# Rotate all credentials
./scripts/rotate_credentials.sh

# Update secrets
aws secretsmanager update-secret \
  --secret-id art-management/etsy-api-key \
  --secret-string "new_api_key"

# Restart services
docker compose up -d
```

**5. Post-Mortem:**
- Document lessons learned
- Update security procedures
- Implement additional safeguards

### Contact Information

**Security Team:**
- Email: security@artmanagement.tool
- Emergency: security-emergency@artmanagement.tool
- Phone: +1-XXX-XXX-XXXX

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls)
- [Etsy API Security](https://developers.etsy.com/documentation/essentials/security)

## ✅ Security Checklist

### Pre-Deployment
- [ ] All credentials in environment variables
- [ ] Secrets stored in secure manager
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Firewall rules reviewed
- [ ] Penetration testing completed

### Regular Maintenance
- [ ] Rotate credentials (monthly)
- [ ] Review access logs (weekly)
- [ ] Update dependencies (weekly)
- [ ] Scan for vulnerabilities (weekly)
- [ ] Review security alerts (daily)
- [ ] Test backup restoration (monthly)
- [ ] Update documentation (quarterly)

---

**Last Updated:** 2025-10-22  
**Version:** 1.0  
**Maintained By:** Security Team
