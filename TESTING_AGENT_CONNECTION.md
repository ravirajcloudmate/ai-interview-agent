# Testing Agent Connection Flow

## Expected Console Logs

जब आप interview page खोलेंगे, console में ये logs दिखेंगे:

### 1️⃣ Initial Connection (जब candidate join करता है)
```
Start interview response: {
  status: "success",
  roomName: "interview-candidate-1759992625799-550288",
  token: "ey...",
  url: "wss://...",
  agentConnected: false
}

Connected to interview room
```

### 2️⃣ Polling for Agent (हर 2 seconds)
```
🔍 Agent status check: {
  status: "success",
  roomName: "interview-candidate-1759992625799-550288",
  agentConnected: false,
  candidateConnected: true,
  participantCount: 1
}
⏳ Waiting for agent to join... participantCount: 1
```

### 3️⃣ When Agent Joins (जब agent connect होता है)
```
🔍 Agent status check: {
  status: "success",
  roomName: "interview-candidate-1759992625799-550288",
  agentConnected: true,    ← ✅ THIS IS THE KEY!
  candidateConnected: true,
  participantCount: 2,
  participants: [
    { identity: "candidate-...", name: "Candidate", isAgent: false },
    { identity: "ai-interviewer", name: "AI Interviewer", isAgent: true }
  ]
}
✅ Agent joined! Starting interview...
```

## UI Changes

### Before Agent Joins:
```
┌─────────────────────────────────────────┐
│ AI Interview - 🟢 Connected             │
├─────────────────────────────────────────┤
│  ⏳ AI Agent is joining the room...     │
│     Please wait                          │
│     Status: connecting                   │
├─────────────────────────────────────────┤
│ 📋 Please ensure your microphone        │
│    is enabled                            │
│ 🔊 The AI interviewer will start        │
│    speaking once connected               │
└─────────────────────────────────────────┘
```

### After Agent Joins:
```
┌─────────────────────────────────────────┐
│ AI Interview - 🟢 Connected             │
├─────────────────────────────────────────┤
│ ✅ AI Agent Connected - Interview Ready!│
├─────────────────────────────────────────┤
│ Progress: 0%                             │
│ [████░░░░░░░░░░░░░░░░░░░░░░] 0%        │
├─────────────────────────────────────────┤
│ Current Question:                        │
│ Tell me about yourself...               │
├─────────────────────────────────────────┤
│ Status: asking                           │
│ Audio tracks: 1                          │
├─────────────────────────────────────────┤
│ 🎤 Please answer the question.          │
│    The agent is listening...            │
└─────────────────────────────────────────┘
```

## Backend Response Format

आपका backend `/agent-status/{roomName}` endpoint ये return करे:

### जब Agent नहीं है:
```json
{
  "status": "success",
  "roomName": "interview-candidate-123",
  "agentConnected": false,
  "candidateConnected": true,
  "participantCount": 1
}
```

### जब Agent है:
```json
{
  "status": "success",
  "roomName": "interview-candidate-123",
  "agentConnected": true,     ← IMPORTANT!
  "candidateConnected": true,
  "participantCount": 2,
  "participants": [
    {
      "identity": "candidate-123",
      "name": "John Doe",
      "isAgent": false
    },
    {
      "identity": "ai-interviewer-123",
      "name": "AI Interviewer",
      "isAgent": true
    }
  ]
}
```

## Debugging Checklist

अगर agent join नहीं हो रहा:

- [ ] Backend में `/start-interview` endpoint काम कर रहा है?
- [ ] LiveKit credentials सही हैं?
- [ ] Agent process start हो रहा है?
- [ ] `/agent-status/{roomName}` endpoint सही response दे रहा है?
- [ ] Backend logs में agent connection दिख रहा है?
- [ ] LiveKit dashboard में room में 2 participants दिख रहे हैं?
- [ ] Console में errors नहीं आ रहे?

## Network Tab में Check करें

1. Open DevTools → Network Tab
2. Filter: `agent-status`
3. हर 2 seconds में request दिखनी चाहिए
4. Response में `agentConnected: true` आना चाहिए जब agent join करे

## Quick Test Command

Backend test करने के लिए:
```bash
# Test start interview
curl -X POST http://localhost:8000/start-interview \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-room","candidateId":"test-123","jobId":"job-456","candidateName":"Test User","roleType":"general"}'

# Test agent status
curl http://localhost:8000/agent-status/test-room
```

Expected responses पिछले section में देखें! 🚀

