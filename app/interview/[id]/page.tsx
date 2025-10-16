'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';

function InterviewControls({ agentJoined }: { agentJoined: boolean }) {
  const participants = useParticipants();
  
  useEffect(() => {
    console.log('👥 Participants in room:', participants.length);
    participants.forEach(p => {
      console.log('  -', p.identity, p.isAgent ? '(Agent)' : '(Human)');
    });
  }, [participants]);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Participants: {participants.length}</span>
        {agentJoined && (
          <span className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            AI Active
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600">
        {participants.map(p => (
          <div key={p.identity} className="py-1">
            🎤 {p.identity} {p.isAgent && '(AI Interviewer)'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InterviewRoom({ params }: { params: { id: string } }) {
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [agentJoined, setAgentJoined] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let websocket: WebSocket | null = null;

    async function initialize() {
      try {
        // Step 1: Get session details
        console.log('📡 Fetching session details...');
        const sessionRes = await fetch(`/api/sessions/${params.id}`);
        const { session } = await sessionRes.json();
        
        console.log('✅ Session data:', session);
        setSessionData(session);

        // Step 2: Get LiveKit token
        console.log('🎫 Getting LiveKit token...');
        const tokenRes = await fetch(`/api/livekit/token?sessionId=${params.id}`);
        const tokenData = await tokenRes.json();
        
        console.log('✅ Token received for room:', tokenData.roomName);
        setToken(tokenData.token);

        // Resolve reliable room name
        const resolvedRoomName = session?.room_id || tokenData?.roomName;
        if (!resolvedRoomName) {
          console.error('❌ Could not resolve room name from session or token response');
          throw new Error('Room name missing');
        }
        setRoomName(resolvedRoomName);

        // Step 3: Connect WebSocket with CORRECT room name
        console.log('🔌 Connecting WebSocket to:', resolvedRoomName);
        
        websocket = new WebSocket(
          `ws://localhost:8001/ws/interview/${resolvedRoomName}`
        );
        
        websocket.onopen = () => {
          console.log('✅ WebSocket connected');
          websocket?.send(JSON.stringify({
            type: 'join',
            sessionId: params.id,
            role: 'candidate',
            roomName: resolvedRoomName
          }));
        };
        
        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📩 WebSocket message:', data);
          
          if (data.type === 'agent_joined') {
            console.log('🤖 Agent joined!');
            setAgentJoined(true);
          }
        };
        
        websocket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };

        websocket.onclose = () => {
          console.log('🔌 WebSocket closed');
        };
        
        setWs(websocket);

      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
    }

    initialize();

    return () => {
      console.log('🧹 Cleaning up...');
      websocket?.close();
    };
  }, [params.id]);

  // Poll agent status
  useEffect(() => {
    if (!params.id) return;

    const checkAgent = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8001/api/agent-status/${params.id}`);
        const data = await res.json();
        
        if (data.status === 'ready' && !agentJoined) {
          console.log('✅ Agent status: ready');
          setAgentJoined(true);
        }
      } catch (err) {
        // Silent fail
      }
    }, 3000);

    return () => clearInterval(checkAgent);
  }, [params.id, agentJoined]);

  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview?')) {
      ws?.send(JSON.stringify({ type: 'end_interview' }));
      ws?.close();
      router.push('/dashboard');
    }
  };

  if (!token || !roomName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing interview room...</p>
          <p className="text-sm text-gray-400 mt-2">Session: {params.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                AI Interview Session
              </h1>
              <p className="text-gray-500 mt-1">
                Room: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{roomName}</code>
              </p>
              {sessionData && (
                <p className="text-sm text-gray-600 mt-1">
                  Candidate: {sessionData.candidate_name}
                </p>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full ${
              agentJoined 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  agentJoined ? 'bg-green-500' : 'bg-orange-500'
                } animate-pulse`} />
                <span className="font-medium text-sm">
                  {agentJoined ? 'AI Active' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LiveKit Room */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            className="min-h-[400px]"
            onConnected={() => {
              console.log('✅ Connected to LiveKit room');
            }}
            onDisconnected={() => {
              console.log('❌ Disconnected from LiveKit room');
            }}
          >
            <RoomAudioRenderer />
            <StartAudio label="🎤 Click to enable audio" className="text-lg" />
            
            <div className="mt-6">
              <InterviewControls agentJoined={agentJoined} />
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              {agentJoined ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">🎙️</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Interview is Live!
                  </h3>
                  <p className="text-gray-600">
                    The AI interviewer is listening. Speak clearly to answer questions.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Waiting for AI Interviewer
                  </h3>
                  <p className="text-gray-600">
                    The AI agent is joining the room. This may take a few seconds...
                  </p>
                </div>
              )}
            </div>
          </LiveKitRoom>

          {/* Controls */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleEndInterview}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              End Interview
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-4 bg-gray-800 text-gray-100 rounded-lg text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div>Session ID: {params.id}</div>
            <div>Room: {roomName}</div>
            <div>Token: {token ? '✅ Valid' : '❌ Missing'}</div>
            <div>Agent: {agentJoined ? '✅ Joined' : '⏳ Waiting'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}