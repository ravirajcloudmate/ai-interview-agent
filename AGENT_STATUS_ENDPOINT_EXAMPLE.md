# Agent Status Endpoint - Backend Implementation

## Overview
आपके backend में `/agent-status/{roomName}` endpoint बनाना होगा जो बताएगा कि AI agent room में join हो गया है या नहीं।

## Endpoint Details

**URL:** `GET http://localhost:8000/agent-status/{roomName}`

**Response Format:**
```json
{
  "status": "success",
  "roomName": "interview-candidate-123-550288",
  "agentConnected": true,  // या false
  "candidateConnected": true,
  "participantCount": 2,
  "currentQuestion": "Tell me about yourself",
  "interviewProgress": 25,
  "isAgentSpeaking": false,
  "isListening": true,
  "participants": [
    {
      "identity": "candidate-123",
      "name": "Candidate",
      "isAgent": false
    },
    {
      "identity": "ai-interviewer",
      "name": "AI Interviewer",
      "isAgent": true
    }
  ]
}
```

## Python FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from livekit import api

app = FastAPI()

@app.get("/agent-status/{room_name}")
async def get_agent_status(room_name: str):
    try:
        # LiveKit API से room participants get करें
        room_service = api.RoomService()
        participants = await room_service.list_participants(room_name)
        
        # Check if AI agent is in the room
        agent_connected = False
        candidate_connected = False
        
        for participant in participants:
            if "ai-interviewer" in participant.identity or participant.metadata.get("isAgent"):
                agent_connected = True
            else:
                candidate_connected = True
        
        return {
            "status": "success",
            "roomName": room_name,
            "agentConnected": agent_connected,
            "candidateConnected": candidate_connected,
            "participantCount": len(participants),
            "participants": [
                {
                    "identity": p.identity,
                    "name": p.name or p.identity,
                    "isAgent": "ai-interviewer" in p.identity
                }
                for p in participants
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "agentConnected": False
        }
```

## Node.js Express Example

```javascript
const express = require('express');
const { RoomServiceClient } = require('livekit-server-sdk');

const app = express();

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

app.get('/agent-status/:roomName', async (req, res) => {
  try {
    const { roomName } = req.params;
    
    // Get room participants
    const participants = await roomService.listParticipants(roomName);
    
    let agentConnected = false;
    let candidateConnected = false;
    
    participants.forEach(participant => {
      if (participant.identity.includes('ai-interviewer')) {
        agentConnected = true;
      } else {
        candidateConnected = true;
      }
    });
    
    res.json({
      status: 'success',
      roomName,
      agentConnected,
      candidateConnected,
      participantCount: participants.length,
      participants: participants.map(p => ({
        identity: p.identity,
        name: p.name || p.identity,
        isAgent: p.identity.includes('ai-interviewer')
      }))
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
      agentConnected: false
    });
  }
});
```

## Important Notes

1. **Agent Identity**: सुनिश्चित करें कि आपका AI agent LiveKit room में join करते समय unique identity use करे (जैसे: `ai-interviewer-{roomName}`)

2. **Polling**: Frontend हर 2 seconds में इस endpoint को call करेगा जब तक agent connect नहीं हो जाता

3. **Error Handling**: अगर room exist नहीं करता, तो `agentConnected: false` return करें

4. **Performance**: Cache करें room status को अगर बहुत ज्यादा requests आ रहे हैं

## Testing

Test करने के लिए:
```bash
curl http://localhost:8000/agent-status/interview-candidate-123-550288
```

## Troubleshooting

### Agent join नहीं हो रहा?

1. Check करें कि LiveKit agent process properly start हो रहा है
2. Verify करें LiveKit credentials सही हैं
3. Agent को proper token मिल रहा है
4. Room name सही है
5. Check agent logs for errors

### Frontend में "waiting" state में stuck है?

1. Backend logs check करें - agent start हो रहा है या नहीं
2. LiveKit dashboard में देखें room participants
3. Network tab में देखें API calls सही response दे रहे हैं
4. Console में errors check करें

