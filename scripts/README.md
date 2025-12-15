# Testing Scripts

This directory contains scripts for local testing and validation.

## Scripts Overview

### 1. `validate-local.sh` - Quick Local Validation
Runs all validation checks locally before pushing to GitHub.

**Usage**:
```bash
./scripts/validate-local.sh
```

**What it checks**:
- ✅ Project file structure
- ✅ Python syntax validation
- ✅ TypeScript syntax validation
- ✅ Docker build success
- ✅ Services start correctly
- ✅ All E2E tests pass

**Duration**: ~2-3 minutes

---

### 2. `test-workflow.sh` - Test GitHub Actions Locally
Uses `act` to run GitHub Actions workflows on your machine.

**Usage**:
```bash
./scripts/test-workflow.sh
```

**Options**:
1. Test full CI/CD pipeline (requires secrets)
2. Test only the test job (no Docker Hub push)
3. Dry run (show what would run)

**Requirements**:
- `act` installed (`brew install act` or see https://github.com/nektos/act)
- Docker running
- Optional: `.secrets` file for full testing

---

### 3. Pre-push Hook (Automatic)
Automatically runs validation before every `git push`.

**Location**: `.git/hooks/pre-push`

**What it does**:
1. Checks Docker is running
2. Starts test environment
3. Runs all E2E tests
4. Cleans up
5. Only allows push if all tests pass

**Bypass** (not recommended):
```bash
git push --no-verify
```

---

## Setup

### Make Scripts Executable
```bash
chmod +x scripts/*.sh
chmod +x .git/hooks/pre-push
```

### Setup Secrets for Local Testing
```bash
# Copy example file
cp .secrets.example .secrets

# Edit with your values
nano .secrets
```

**`.secrets` format**:
```
JWT_SECRET=your-local-test-secret
DOCKERHUB_USERNAME=your-username
DOCKERHUB_TOKEN=dckr_pat_xxxxx
```

⚠️ **Never commit `.secrets`** - it's in `.gitignore`

---

## Workflow Examples

### Before Pushing to GitHub
```bash
# Option 1: Quick validation
./scripts/validate-local.sh

# Option 2: Test exact GitHub Actions workflow
./scripts/test-workflow.sh
# Select option 2 (test job only)
```

### Test Full CI/CD Pipeline Locally
```bash
# Setup secrets first
cp .secrets.example .secrets
# Edit .secrets with real credentials

# Run full pipeline
./scripts/test-workflow.sh
# Select option 1
```

### Bypass Pre-push Hook (Emergency)
```bash
# Only use if you know what you're doing
git push --no-verify
```

---

## Troubleshooting

### "act: command not found"
```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Or download from: https://github.com/nektos/act/releases
```

### "Docker is not running"
```bash
# Start Docker Desktop or Docker daemon
sudo systemctl start docker  # Linux
open -a Docker  # macOS
```

### Tests fail locally but should pass
```bash
# Clean everything and retry
docker-compose -f docker-compose.test.yml down -v
docker system prune -f
./scripts/validate-local.sh
```

### Pre-push hook not executing
```bash
# Make it executable
chmod +x .git/hooks/pre-push

# Verify it exists
ls -la .git/hooks/pre-push
```

---

## CI/CD Flow

### With Pre-push Hook Enabled:
```
git commit -m "changes"
    ↓
git push
    ↓
Pre-push hook runs
    ↓
✅ Tests pass → Push to GitHub → GitHub Actions runs
❌ Tests fail → Push blocked → Fix issues
```

### Manual Testing:
```
./scripts/validate-local.sh
    ↓
✅ All checks pass
    ↓
git push
    ↓
GitHub Actions runs
```

---

## Benefits

1. **Faster feedback** - Catch errors before GitHub
2. **Save CI minutes** - Don't waste GitHub Actions time
3. **Work offline** - Test without internet
4. **Exact replication** - Same tests as CI/CD
5. **Confidence** - Know it will work before pushing

---

## Notes

- Pre-push hook runs automatically on every push
- Can take 2-3 minutes to complete
- Ensures nothing broken reaches GitHub
- Maintains your commit history clean
- Saves embarrassment from failed CI runs! 😅
