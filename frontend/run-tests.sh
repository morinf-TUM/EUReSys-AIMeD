#!/bin/bash

# Exit immediately if any command fails
set -e

echo "🚀 Starting Playwright Tests for Regulatory Scoping Workflow"
echo "============================================================"

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local name=$2
    
    # For backend, check if API is responding (any 2xx status)
    # For frontend, check for 200 OK
    if [[ "$url" == *"8000"* ]]; then
        # Backend check - look for any successful response
        if curl -s --head --request GET "$url" | grep -E "2[0-9]{2}" > /dev/null; then
            echo "✅ $name is running at $url"
            return 0
        else
            echo "❌ $name is not running at $url"
            return 1
        fi
    else
        # Frontend check - look for 200 OK
        if curl -s --head --request GET "$url" | grep "200 OK" > /dev/null; then
            echo "✅ $name is running at $url"
            return 0
        else
            echo "❌ $name is not running at $url"
            return 1
        fi
    fi
}

# Check if frontend is running
if ! check_url "http://localhost:3000" "Frontend"; then
    echo "Please start the frontend with: npm start"
    exit 1
fi

# Check if backend is running
if ! check_url "http://localhost:8000" "Backend"; then
    echo "Please start the backend with: python manage.py runserver"
    exit 1
fi

echo ""
echo "🧪 Running Playwright tests..."
echo ""

# Install Playwright browsers if not already installed
if [ ! -d "node_modules/@playwright/test" ]; then
    echo "Installing Playwright..."
    npm install
fi

# Generate HTML report
if [ ! -d "playwright-report" ]; then
    mkdir -p playwright-report
fi

# Run the specific test file with proper configuration
npx playwright test src/test/TwoPageWorkflow.test.ts \
  --timeout=60000 \
  --reporter=html \
  --workers=1 \
  --retries=0

# Check the exit status
TEST_EXIT_CODE=$?

echo ""
echo "============================================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests passed!"
    echo ""
    echo "📊 Test Results:"
    echo "   - HTML Report: file://$(pwd)/playwright-report/index.html"
    echo "   - Test Results: $(pwd)/test-results/"
    echo "   - Screenshots: $(pwd)/test-results/"
    echo ""
    echo "💡 To view the HTML report, open:"
    echo "   $(pwd)/playwright-report/index.html"
else
    echo "❌ Some tests failed"
    echo ""
    echo "🔍 Debugging Information:"
    echo "   - HTML Report: $(pwd)/playwright-report/index.html"
    echo "   - Test Results: $(pwd)/test-results/"
    echo "   - Screenshots: $(pwd)/test-results/"
    echo "   - Traces: $(pwd)/test-results/"
    echo ""
    echo "💡 Check the HTML report for detailed failure information"
fi
echo "============================================================"

exit $TEST_EXIT_CODE