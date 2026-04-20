#!/bin/bash

# Manual test script for frontend functionality
echo "Testing frontend functionality..."

# Test 1: Check if frontend is running
echo "Test 1: Checking if frontend is accessible..."
curl -s -o /dev/null -w "Frontend status: %{http_code}" http://localhost:3000/regulatory-scoping

# Test 2: Check if backend API is working
echo "Test 2: Checking backend API..."
curl -s -X GET "http://localhost:8000/api/regulatory/questions/?step=1" | jq '.success'

# Test 3: Test form submission
echo "Test 3: Testing form submission..."
curl -s -X POST "http://localhost:8000/api/regulatory/profiles/temp-profile-id/answers/" \
     -H "Content-Type: application/json" \
     -d '{"answers": [{"questionId": "q1", "answer": "Test Device"}, {"questionId": "q2", "answer": "Test Description"}, {"questionId": "q3", "answer": true}, {"questionId": "q4", "answer": true}]}' | jq '.success'

echo "Manual tests completed."
