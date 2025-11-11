# ===========================================
# BACKEND FIXES - Copy these into your server.py
# ===========================================

# Replace your existing /agent/join endpoint (around line 141) with this:

@app.post("/agent/join")
async def agent_join(data: dict):
    """Endpoint for auto-joining agent to interview room"""
    try:
        session_id = data.get('sessionId')
        room_name = data.get('roomName')
        candidate_id = data.get('candidateId')
        candidate_name = data.get('candidateName')
        job_id = data.get('jobId')
        agent_id = data.get('agentId')
        agent_prompt = data.get('agentPrompt')
        job_details = data.get('jobDetails', {})
        
        if not session_id or not room_name:
            raise HTTPException(status_code=400, detail="sessionId and roomName are required")
        
        logger.info(f"🤖 Agent join request - Session: {session_id}, Room: {room_name}")
        logger.info(f"   Candidate: {candidate_name} ({candidate_id}), Job: {job_id}")
        logger.info(f"   Agent: {agent_id}, Prompt: {agent_prompt[:50]}...")
        
        # Store all the interview details for agent to use
        agent_status[session_id] = {
            'status': 'joining',
            'room': room_name,
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'job_id': job_id,
            'agent_id': agent_id,
            'agent_prompt': agent_prompt,
            'job_details': job_details,
            'requested_at': datetime.now().isoformat()
        }
        
        return {
            "success": True,  # ✅ Changed from "status": "success"
            "message": "Agent join request received",
            "sessionId": session_id,
            "roomName": room_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Agent join failed: {e}")
        raise HTTPException(status_code=500, detail=f"Agent join failed: {e}")


# ===========================================
# Replace your existing /start-interview endpoint (around line 173) with this:

@app.post("/start-interview")
async def start_interview(data: dict):
    """Endpoint for starting an interview session"""
    try:
        room_name = data.get('roomName')
        candidate_id = data.get('candidateId')
        job_id = data.get('jobId', 'default-job')
        candidate_name = data.get('candidateName', 'Candidate')
        role_type = data.get('roleType', 'general')
        session_id = data.get('sessionId')  # Optional - generate if not provided
        
        if not room_name:
            raise HTTPException(status_code=400, detail="roomName is required")
        
        # Generate session_id from room_name if not provided
        if not session_id:
            session_id = f"session_{room_name}"
        
        logger.info(f"🎬 Starting interview - Room: {room_name}, Candidate: {candidate_name}, Job: {job_id}")
        
        # Initialize session tracking
        active_sessions[room_name] = {
            'session_id': session_id,
            'candidate_id': candidate_id,
            'candidate_name': candidate_name,
            'job_id': job_id,
            'role_type': role_type,
            'started_at': datetime.now().isoformat(),
            'status': 'starting'
        }
        
        # Mark agent as pending if not already ready
        if session_id not in agent_status:
            agent_status[session_id] = {
                'status': 'pending',
                'room': room_name,
                'candidate_id': candidate_id,
                'candidate_name': candidate_name,
                'job_id': job_id,
                'requested_at': datetime.now().isoformat()
            }
        
        return {
            "success": True,  # ✅ Changed from "status": "success"
            "message": "Interview started",
            "sessionId": session_id,
            "roomName": room_name,
            "agentStatus": agent_status.get(session_id, {}).get('status', 'pending')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Start interview failed: {e}")
        raise HTTPException(status_code=500, detail=f"Start interview failed: {e}")


# ===========================================
# Replace your existing /api/candidate-joined endpoint (around line 207) with this:

@app.post("/api/candidate-joined")
async def candidate_joined(data: dict):
    """Optional endpoint for notifications when candidate joins"""
    try:
        session_id = data.get('sessionId')
        room_name = data.get('roomName') or data.get('roomId')  # ✅ Accept both roomName and roomId
        candidate_name = data.get('candidateName')
        candidate_email = data.get('candidateEmail')
        
        logger.info(f"👤 Candidate joined notification - Session: {session_id}, Room: {room_name}, Candidate: {candidate_name}")
        
        # Update session info if it exists
        if room_name in active_sessions:
            active_sessions[room_name]['candidate_id'] = candidate_email
            active_sessions[room_name]['candidate_name'] = candidate_name
            active_sessions[room_name]['candidate_joined_at'] = datetime.now().isoformat()
        
        return {
            "success": True,  # ✅ Changed from "status": "success"
            "message": "Candidate join notification received",
            "sessionId": session_id
        }
    except Exception as e:
        logger.error(f"❌ Candidate joined notification failed: {e}")
        # Don't fail the request, just log the error
        return {
            "success": True,
            "message": "Notification processed (with warnings)"
        }

