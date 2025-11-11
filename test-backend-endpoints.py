# Quick test script to check backend endpoints
import requests
import json

BACKEND_URL = "http://localhost:8001"

print("=" * 60)
print("Testing Backend Endpoints")
print("=" * 60)

# Test 1: Health check
print("\n1. Testing /health endpoint...")
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# Test 2: /agent/join endpoint
print("\n2. Testing /agent/join endpoint...")
try:
    data = {
        "sessionId": "test_session",
        "roomName": "test_room",
        "candidateId": "test@example.com",
        "candidateName": "Test Candidate",
        "jobId": "test_job",
        "agentId": "test_agent",
        "agentPrompt": "Test prompt",
        "jobDetails": {}
    }
    response = requests.post(f"{BACKEND_URL}/agent/join", json=data, timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# Test 3: /start-interview endpoint
print("\n3. Testing /start-interview endpoint...")
try:
    data = {
        "roomName": "test_room",
        "candidateId": "test@example.com",
        "jobId": "test_job",
        "candidateName": "Test Candidate"
    }
    response = requests.post(f"{BACKEND_URL}/start-interview", json=data, timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# Test 4: /api/candidate-joined endpoint
print("\n4. Testing /api/candidate-joined endpoint...")
try:
    data = {
        "sessionId": "test_session",
        "roomId": "test_room",
        "candidateName": "Test Candidate",
        "candidateEmail": "test@example.com"
    }
    response = requests.post(f"{BACKEND_URL}/api/candidate-joined", json=data, timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)

