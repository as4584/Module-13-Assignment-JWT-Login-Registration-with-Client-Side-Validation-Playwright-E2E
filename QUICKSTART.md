# Quick Start Guide

Get the JWT Auth application running in under 5 minutes.

## Prerequisites Check

```bash
# Check Docker
docker --version
# Required: Docker 20.10+

# Check Docker Compose
docker-compose --version
# Required: 2.0+

# Check Node.js (for tests)
node --version
# Required: 18+
```

## Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd mod13
```

## Step 2: Start Services

```bash
# Start database and API
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

Wait for:
```
INFO:     Application startup complete.
```

## Step 3: Test the Application

### Option A: Web Browser

1. Open http://localhost:8000/static/register.html
2. Enter email: `test@example.com`
3. Enter password: `SecurePass123!`
4. Confirm password: `SecurePass123!`
5. Click Register
6. See success message ✅
7. Open DevTools → Application → Local Storage
8. Verify `access_token` exists

### Option B: Command Line

```bash
# Register a user
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!"
  }'

# Expected response:
# {"access_token":"eyJ...","token_type":"bearer"}

# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Expected response:
# {"access_token":"eyJ...","token_type":"bearer"}
```

## Step 4: Run E2E Tests

```bash
# Install test dependencies
cd e2e
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm run test:e2e
```

Expected output:
```
Running 12 tests using 1 worker

✓ Registration Page > should display registration form elements
✓ Registration Page > positive: should register a valid user
✓ Registration Page > negative: should show error for short password
...

12 passed (30s)
```

## Step 5: Clean Up

```bash
# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

## Troubleshooting

### Port 8000 Already in Use

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8001:8000"
```

### Database Connection Error

```bash
# Check if database is ready
docker-compose logs db

# Wait for: "database system is ready to accept connections"

# Restart API
docker-compose restart api
```

### Playwright Installation Issues

```bash
# Install system dependencies
npx playwright install-deps

# Or use Docker for tests
docker run -v $PWD/e2e:/work -w /work mcr.microsoft.com/playwright:latest npm run test:e2e
```

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [REFLECTION.md](REFLECTION.md) for learning insights
- Review [RUBRIC_COMPLIANCE.md](RUBRIC_COMPLIANCE.md) for grading details
- See [ENV_VARS.md](ENV_VARS.md) for configuration options

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| API | http://localhost:8000 | Backend server |
| Register | http://localhost:8000/static/register.html | Sign up page |
| Login | http://localhost:8000/static/login.html | Sign in page |
| Health | http://localhost:8000/health | Health check |
| Docs | http://localhost:8000/docs | Swagger UI |
| Database | localhost:5432 | PostgreSQL |

Default credentials (docker-compose):
- DB User: `postgres`
- DB Password: `postgres`
- DB Name: `auth_db`
