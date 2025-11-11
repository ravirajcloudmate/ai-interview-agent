# 🤖 Python Backend Integration for AI Interview Agent
# Install required packages: pip install fastapi uvicorn livekit livekit-agents

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from typing import Dict, Any
from pydantic import BaseModel
from livekit import rtc, agents
from livekit.agents import AutoSubscribe

# Request Models
class InterviewRequest(BaseModel):
    roomName: str
    agentToken: str
    candidateId: str
    jobId: str
    livekitUrl: str
    livekitApiKey: str
    livekitApiSecret: str

class AgentJoinRequest(BaseModel):
    # Room & Session Info
    roomName: str
    sessionId: str = None
    
    # Candidate Details
    candidateId: str
    candidateName: str = "Candidate"
    candidateEmail: str = ""
    candidateSkills: str = ""
    candidateExperience: str = ""
    candidateProjects: str = ""
    
    # Job Details
    jobId: str
    jobTitle: str = ""
    jobDepartment: str = ""
    jobDescription: str = ""
    employmentType: str = ""
    experienceLevel: str = ""
    location: str = ""
    salaryMin: int = None
    salaryMax: int = None
    currency: str = "USD"
    isRemote: bool = False
    
    # Interview Settings
    interviewMode: str = "video"
    interviewLanguage: str = "en"
    interviewDuration: int = 30
    questionsCount: int = 5
    difficultyLevel: str = "medium"
    interviewDate: str = None
    interviewTime: str = None
    
    # Agent/Prompt Template Details
    agentId: str = None
    agentPrompt: dict = {}
    promptTemplateName: str = ""
    promptTemplateDescription: str = ""
    promptTemplateCategory: str = "technical"
    promptTemplateLevel: str = "mid"
    promptTemplateDuration: int = 45
    promptText: dict = {}

# FastAPI App
app = FastAPI(title="AI Interview Agent Backend")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to track active interviews
active_interviews: Dict[str, Any] = {}

@app.post("/agent/join")
async def agent_join(request: AgentJoinRequest):
    """Endpoint for agent to join interview with complete details"""
    try:
        print(f"🤖 Agent join request received")
        print(f"📋 Room: {request.roomName}")
        print(f"👤 Candidate: {request.candidateName} ({request.candidateId})")
        print(f"💼 Job: {request.jobTitle} ({request.jobId})")
        print(f"🤖 Agent ID: {request.agentId}")
        
        # Create and start AI agent with complete interview data
        interview_data = {
            'candidateName': request.candidateName,
            'candidateEmail': request.candidateEmail,
            'candidateSkills': request.candidateSkills,
            'candidateExperience': request.candidateExperience,
            'candidateProjects': request.candidateProjects,
            'jobTitle': request.jobTitle,
            'jobDescription': request.jobDescription,
            'jobDepartment': request.jobDepartment,
            'interviewMode': request.interviewMode,
            'interviewLanguage': request.interviewLanguage,
            'interviewDuration': request.interviewDuration,
            'questionsCount': request.questionsCount,
            'difficultyLevel': request.difficultyLevel,
            'promptText': request.promptText,
            'agentPrompt': request.agentPrompt,
            'promptTemplateName': request.promptTemplateName
        }
        
        # Note: You'll need to generate agent_token and get livekit_url from your config
        # For now, using placeholders - update these based on your setup
        agent = AIInterviewAgent(
            room_name=request.roomName,
            agent_token="",  # Generate from LiveKit
            candidate_id=request.candidateId,
            job_id=request.jobId,
            livekit_url="",  # Get from config
            interview_data=interview_data
        )
        
        # Start agent in background
        asyncio.create_task(agent.start_interview())
        
        # Store agent reference
        active_interviews[request.candidateId] = agent
        
        return {
            "success": True,
            "message": "Agent join request received",
            "sessionId": request.sessionId,
            "roomName": request.roomName,
            "agentStatus": "connecting"
        }
        
    except Exception as e:
        print(f"❌ Error in agent join: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start-interview")
async def start_interview(request: InterviewRequest):
    """Main endpoint called by frontend to start AI interview"""
    try:
        print(f"🚀 Starting interview for candidate: {request.candidateId}")
        print(f"📋 Job ID: {request.jobId}")
        print(f"🏠 Room: {request.roomName}")
        
        # Create and start AI agent
        agent = AIInterviewAgent(
            room_name=request.roomName,
            agent_token=request.agentToken,
            candidate_id=request.candidateId,
            job_id=request.jobId,
            livekit_url=request.livekitUrl
        )
        
        # Start agent in background
        asyncio.create_task(agent.start_interview())
        
        # Store agent reference
        active_interviews[request.candidateId] = agent
        
        return {
            "success": True,
            "message": "AI agent started successfully",
            "roomName": request.roomName,
            "candidateId": request.candidateId,
            "jobId": request.jobId,
            "agentStatus": "connecting"
        }
        
    except Exception as e:
        print(f"❌ Error starting interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interview-status/{candidate_id}")
async def get_interview_status(candidate_id: str):
    """Get current interview status"""
    if candidate_id in active_interviews:
        agent = active_interviews[candidate_id]
        return {
            "status": "active",
            "candidateId": candidate_id,
            "agentConnected": agent.is_connected,
            "currentQuestion": agent.current_question,
            "interviewProgress": agent.progress
        }
    return {"status": "not_found"}

@app.delete("/end-interview/{candidate_id}")
async def end_interview(candidate_id: str):
    """End interview session"""
    if candidate_id in active_interviews:
        agent = active_interviews[candidate_id]
        await agent.end_interview()
        del active_interviews[candidate_id]
        return {"success": True, "message": "Interview ended"}
    return {"success": False, "message": "Interview not found"}

class AIInterviewAgent:
    def __init__(self, room_name: str, agent_token: str, candidate_id: str, job_id: str, livekit_url: str, interview_data: dict = None):
        self.room_name = room_name
        self.agent_token = agent_token
        self.candidate_id = candidate_id
        self.job_id = job_id
        self.livekit_url = livekit_url
        
        # Store complete interview data
        self.interview_data = interview_data or {}
        
        # Extract details from interview_data
        self.candidate_name = interview_data.get('candidateName', 'Candidate')
        self.candidate_email = interview_data.get('candidateEmail', '')
        self.candidate_skills = interview_data.get('candidateSkills', '')
        self.candidate_experience = interview_data.get('candidateExperience', '')
        self.candidate_projects = interview_data.get('candidateProjects', '')
        
        self.job_title = interview_data.get('jobTitle', '')
        self.job_description = interview_data.get('jobDescription', '')
        self.job_department = interview_data.get('jobDepartment', '')
        
        self.interview_mode = interview_data.get('interviewMode', 'video')
        self.interview_language = interview_data.get('interviewLanguage', 'en')
        self.interview_duration = interview_data.get('interviewDuration', 30)
        self.questions_count = interview_data.get('questionsCount', 5)
        self.difficulty_level = interview_data.get('difficultyLevel', 'medium')
        
        # Prompt template data
        self.prompt_text = interview_data.get('promptText', {})
        self.agent_prompt = interview_data.get('agentPrompt', {})
        self.prompt_template_name = interview_data.get('promptTemplateName', '')
        
        self.room = rtc.Room()
        self.is_connected = False
        self.current_question = None
        self.progress = 0
        self.questions = []
        self.responses = []
        
    async def start_interview(self):
        """Connect to LiveKit room and start interview"""
        try:
            print(f"🤖 AI Agent connecting to room: {self.room_name}")
            
            # Connect to LiveKit room
            await self.room.connect(self.livekit_url, self.agent_token)
            self.is_connected = True
            print(f"✅ AI Agent connected successfully!")
            
            # Enable microphone and camera
            await self.room.local_participant.set_microphone_enabled(True)
            await self.room.local_participant.set_camera_enabled(True)
            
            # Set up event handlers
            self.room.on("participant_connected", self.on_participant_connected)
            self.room.on("data_received", self.on_data_received)
            self.room.on("track_subscribed", self.on_track_subscribed)
            
            # Load interview questions
            self.questions = await self.load_interview_questions(self.job_id)
            
            # Start interview process
            await self.conduct_interview()
            
        except Exception as e:
            print(f"❌ Error in AI Agent: {str(e)}")
            self.is_connected = False
    
    async def conduct_interview(self):
        """Main interview logic"""
        print(f"🎯 Starting interview with {len(self.questions)} questions")
        print(f"👤 Candidate: {self.candidate_name} ({self.candidate_email})")
        print(f"💼 Position: {self.job_title} - {self.job_department}")
        print(f"⚙️ Settings: {self.interview_mode} mode, {self.interview_language} language, {self.interview_duration} min")
        print(f"📝 Prompt Template: {self.prompt_template_name}")
        
        # Send greeting message if available
        greeting = self.prompt_text.get('greeting_message', '') if self.prompt_text else ''
        if not greeting:
            greeting = f"Hello {self.candidate_name}, welcome to your interview for the {self.job_title} position!"
        
        await self.ask_question(greeting)
        await asyncio.sleep(3)
        
        # Wait for candidate to be ready
        await asyncio.sleep(2)
        
        for i, question in enumerate(self.questions):
            try:
                self.current_question = question
                self.progress = (i / len(self.questions)) * 100
                
                print(f"❓ Asking question {i+1}/{len(self.questions)}: {question}")
                
                # Ask question
                await self.ask_question(question)
                
                # Wait for response (with timeout)
                response = await self.wait_for_response(timeout=60)
                
                if response:
                    # Analyze response
                    analysis = await self.analyze_response(question, response)
                    self.responses.append({
                        "question": question,
                        "response": response,
                        "analysis": analysis
                    })
                    
                    # Provide feedback
                    await self.provide_feedback(analysis)
                else:
                    print("⏰ No response received, moving to next question")
                
                # Wait before next question
                await asyncio.sleep(3)
                
            except Exception as e:
                print(f"❌ Error in question {i+1}: {str(e)}")
                continue
        
        # Interview completed
        await self.complete_interview()
    
    async def ask_question(self, question: str):
        """Ask question to candidate"""
        # Send question via data channel
        await self.room.local_participant.publish_data(
            json.dumps({
                "type": "question",
                "question": question,
                "timestamp": time.time(),
                "agent": "ai-interviewer"
            }).encode()
        )
        
        # Also speak the question (if you have TTS)
        await self.speak_question(question)
    
    async def wait_for_response(self, timeout: int = 60):
        """Wait for candidate response"""
        print(f"👂 Listening for candidate response...")
        
        # This is a simplified version - in reality you'd implement
        # speech-to-text or wait for data channel messages
        await asyncio.sleep(5)  # Simulate waiting
        
        # Return mock response for now
        return f"Mock response to: {self.current_question}"
    
    async def analyze_response(self, question: str, response: str):
        """Analyze candidate response using AI"""
        print(f"🧠 Analyzing response...")
        
        # Here you would integrate with your AI model
        # For now, return mock analysis
        analysis = {
            "score": 8.5,
            "feedback": "Good response, shows relevant experience",
            "keywords": ["experience", "skills", "passion"],
            "sentiment": "positive",
            "completeness": 0.9
        }
        
        return analysis
    
    async def provide_feedback(self, analysis: dict):
        """Provide feedback to candidate"""
        feedback_msg = f"Great answer! Score: {analysis['score']}/10. {analysis['feedback']}"
        
        await self.room.local_participant.publish_data(
            json.dumps({
                "type": "feedback",
                "message": feedback_msg,
                "score": analysis["score"],
                "timestamp": time.time()
            }).encode()
        )
        
        print(f"💬 Feedback sent: {feedback_msg}")
    
    async def speak_question(self, question: str):
        """Speak question using TTS (if available)"""
        print(f"🗣️ Speaking: {question}")
        # Implement TTS here if you have it
        pass
    
    async def load_interview_questions(self, job_id: str):
        """Load questions based on job ID and prompt template"""
        questions = []
        
        # Get questions from prompt_text JSONB
        if self.prompt_text:
            # Technical questions
            if 'technical_questions' in self.prompt_text and self.prompt_text['technical_questions']:
                questions.extend(self.prompt_text['technical_questions'])
            
            # Default questions
            if 'default_questions' in self.prompt_text and self.prompt_text['default_questions']:
                questions.extend(self.prompt_text['default_questions'])
        
        # If no questions in template, use default based on job
        if not questions:
            questions = [
                f"Hello {self.candidate_name}, tell me about yourself and your background",
                f"Why are you interested in the {self.job_title} position?",
                f"What relevant experience do you have for this {self.job_department} role?",
                "Describe a challenging project you worked on",
                "What are your greatest strengths?",
                "Do you have any questions for us?"
            ]
        
        # Limit questions based on questions_count setting
        questions = questions[:self.questions_count]
        
        print(f"📋 Loaded {len(questions)} questions for job {self.job_title} ({job_id})")
        print(f"📋 Questions: {questions}")
        return questions
    
    async def complete_interview(self):
        """Complete interview and generate report"""
        print(f"🎉 Interview completed for candidate {self.candidate_id}")
        
        # Generate final report
        final_score = sum(r["analysis"]["score"] for r in self.responses) / len(self.responses)
        
        await self.room.local_participant.publish_data(
            json.dumps({
                "type": "interview_complete",
                "final_score": final_score,
                "total_questions": len(self.questions),
                "timestamp": time.time()
            }).encode()
        )
        
        print(f"📊 Final Score: {final_score}/10")
    
    async def end_interview(self):
        """End interview session"""
        if self.room:
            await self.room.disconnect()
        self.is_connected = False
        print(f"🔚 Interview ended for candidate {self.candidate_id}")
    
    # Event handlers
    async def on_participant_connected(self, participant):
        print(f"👤 Participant connected: {participant.identity}")
    
    async def on_data_received(self, data):
        try:
            message = json.loads(data.data.decode())
            print(f"📨 Received message: {message}")
        except:
            pass
    
    async def on_track_subscribed(self, track, publication, participant):
        print(f"🎥 Track subscribed: {track.kind} from {participant.identity}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_interviews": len(active_interviews)}

# Run the server
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Interview Agent Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

