#!/bin/bash
# Local GitHub Actions Testing Script
# Test workflows locally before pushing to GitHub using 'act'

set -e

echo "🧪 Testing GitHub Actions Workflow Locally"
echo "=========================================="
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ 'act' is not installed"
    echo "Install with: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    exit 1
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

echo "📋 Available workflows:"
echo ""
echo "1. Test full CI/CD pipeline (requires secrets)"
echo "2. Test only the test job (no Docker Hub push)"
echo "3. Dry run (show what would run)"
echo ""
read -p "Select option (1-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Running FULL CI/CD pipeline..."
        echo ""
        echo "⚠️  Note: This requires GitHub secrets to be set in .secrets file"
        echo "   Create .secrets file with:"
        echo "   JWT_SECRET=your-secret"
        echo "   DOCKERHUB_USERNAME=your-username"
        echo "   DOCKERHUB_TOKEN=your-token"
        echo ""
        
        if [ -f ".secrets" ]; then
            act --secret-file .secrets -j build-and-push
        else
            echo "❌ .secrets file not found. Running without secrets..."
            act -j build-and-push
        fi
        ;;
    2)
        echo ""
        echo "🧪 Running TEST job only..."
        echo ""
        if [ -f ".secrets" ]; then
            act --secret-file .secrets -j test
        else
            # Create temporary secrets for testing
            echo "JWT_SECRET=test-secret-for-local-testing" > .secrets.tmp
            act --secret-file .secrets.tmp -j test
            rm .secrets.tmp
        fi
        ;;
    3)
        echo ""
        echo "📄 Dry run - showing what would execute..."
        echo ""
        act -n
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Local workflow test completed!"
