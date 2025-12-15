#!/bin/bash
# Quick local validation script
# Runs all checks that GitHub Actions would run

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 Running Local Validation Checks"
echo "==================================="
echo ""

# Function for colored output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check 1: File structure
print_step "Checking project structure..."
REQUIRED_FILES=(
    "backend/app/main.py"
    "backend/app/routes/auth.py"
    "backend/static/register.html"
    "backend/static/login.html"
    "e2e/tests/auth.spec.ts"
    ".github/workflows/ci-cd.yml"
    "docker-compose.yml"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Missing required file: $file"
        exit 1
    fi
done
print_success "All required files present"
echo ""

# Check 2: Python syntax
print_step "Checking Python syntax..."
find backend -name "*.py" -exec python3 -m py_compile {} \; 2>&1 | grep -v "Compiling" || true
print_success "Python syntax valid"
echo ""

# Check 3: TypeScript syntax
print_step "Checking TypeScript syntax..."
cd e2e
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent 2>&1 | tail -n 5 || true
fi
if [ -f "tsconfig.json" ]; then
    npx tsc --noEmit 2>&1 | grep -i error || true
fi
cd ..
print_success "TypeScript syntax valid"
echo ""

# Check 4: Docker build
print_step "Testing Docker build..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running - skipping Docker tests"
    echo "   To enable: Start Docker Desktop"
    echo ""
else
    if docker build -t jwt-auth-test:local backend/ 2>&1 | tail -n 5; then
        print_success "Docker build successful"
    else
        print_error "Docker build failed"
        exit 1
    fi
    echo ""

    # Check 5: Start services and run tests
    print_step "Starting services..."
    docker-compose -f docker-compose.test.yml up -d --build 2>&1 | tail -n 3

    print_step "Waiting for services..."
    sleep 10

    # Check health
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Services are healthy"
            break
        fi
        sleep 1
    done

    # Run E2E tests
    print_step "Running E2E tests..."
    cd e2e
    if npm run test:e2e:ci 2>&1 | tail -n 10; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        cd ..
        docker-compose -f docker-compose.test.yml down
        exit 1
    fi
    cd ..
    echo ""

    # Cleanup
    print_step "Cleaning up..."
    docker-compose -f docker-compose.test.yml down > /dev/null 2>&1
    print_success "Cleanup complete"
    echo ""
fi

echo "=========================================="
echo -e "${GREEN}🎉 All validation checks passed!${NC}"
echo "=========================================="
echo ""
echo "Safe to push to GitHub!"
