# Environment Variables Guide

This file documents all environment variables used in the JWT Auth application.

## Required for Production

These variables **MUST** be set in production:

### JWT_SECRET
- **Description**: Secret key used to sign JWT tokens
- **Required**: Yes (production)
- **Default**: `dev-secret-key-change-in-production` (development only)
- **Example**: `your-super-secret-key-min-32-chars`
- **Security**: Use a strong, random string (minimum 32 characters)
- **Generation**: 
  ```bash
  openssl rand -hex 32
  ```

### DATABASE_URL
- **Description**: PostgreSQL connection string
- **Required**: Yes
- **Format**: `postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE`
- **Default**: `postgresql+psycopg://postgres:postgres@localhost:5432/auth_db`
- **Example**: `postgresql+psycopg://myuser:mypass@db.example.com:5432/prod_db`

### DOCKERHUB_USERNAME
- **Description**: Docker Hub username for CI/CD
- **Required**: Yes (for CI/CD)
- **Where**: GitHub Secrets
- **Example**: `yourname`

### DOCKERHUB_TOKEN
- **Description**: Docker Hub access token
- **Required**: Yes (for CI/CD)
- **Where**: GitHub Secrets
- **How to get**: Docker Hub → Account Settings → Security → New Access Token

## Optional Configuration

### JWT_ALGORITHM
- **Description**: Algorithm for JWT signing
- **Default**: `HS256`
- **Options**: `HS256`, `HS384`, `HS512`
- **Note**: Must match when verifying tokens

### JWT_EXPIRES_MINUTES
- **Description**: Token expiration time in minutes
- **Default**: `30`
- **Recommended**: `15-30` for access tokens
- **Example**: `30`

### HOST
- **Description**: Server bind host
- **Default**: `0.0.0.0`
- **Note**: `0.0.0.0` allows external connections

### PORT
- **Description**: Server bind port
- **Default**: `8000`
- **Example**: `8000`

## Setting Environment Variables

### Local Development

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=30
```

Load with:
```bash
export $(cat .env | xargs)
uvicorn app.main:app --reload
```

### Docker Compose

Edit `docker-compose.yml`:

```yaml
services:
  api:
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:postgres@db:5432/auth_db
      JWT_SECRET: ${JWT_SECRET:-dev-secret-key}
```

Run with:
```bash
JWT_SECRET="my-secret" docker-compose up
```

### GitHub Actions

Add secrets in repository settings:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:
   - `JWT_SECRET`
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

### Kubernetes/Production

Use Kubernetes Secrets:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: jwt-auth-secrets
type: Opaque
stringData:
  jwt-secret: "your-production-secret"
  database-url: "postgresql+psycopg://user:pass@host:5432/db"
```

## Security Best Practices

1. **Never commit secrets to git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for templates

2. **Use different secrets per environment**
   - Development: Simple secrets
   - Staging: Medium strength
   - Production: Strong, rotated regularly

3. **Rotate secrets regularly**
   - JWT_SECRET: Every 90 days
   - Database passwords: Every 90 days
   - Docker Hub tokens: Every 180 days

4. **Use secret management tools**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Secret Manager

## Troubleshooting

### "Invalid JWT Secret" Error
- Ensure `JWT_SECRET` is set
- Verify it's the same value used to create tokens

### "Database Connection Failed"
- Check `DATABASE_URL` format
- Verify database is running
- Check network connectivity

### "Docker Hub Push Failed"
- Verify `DOCKERHUB_USERNAME` is correct
- Check `DOCKERHUB_TOKEN` is valid
- Ensure token has push permissions

## Example .env.example

```bash
# Database Configuration
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/auth_db

# JWT Configuration
JWT_SECRET=change-this-to-a-secure-random-string-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Docker Hub (for CI/CD only - set in GitHub Secrets)
# DOCKERHUB_USERNAME=yourname
# DOCKERHUB_TOKEN=dckr_pat_xxxxx
```
