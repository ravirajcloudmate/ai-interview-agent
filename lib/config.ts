// Backend Configuration
export const BACKEND_CONFIG = {
  // Python Backend URL
  PYTHON_BACKEND_URL: process.env.PYTHON_BACKEND_URL || 'http://localhost:8001',
  PYTHON_WEBSOCKET_URL: process.env.PYTHON_WEBSOCKET_URL || 'ws://localhost:8001',
  
  // LiveKit Configuration
  LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server.com',
  
  // API Endpoints
  ENDPOINTS: {
    START_INTERVIEW: '/api/start-interview',
    AGENT_STATUS: '/api/agent-status',
    END_INTERVIEW: '/api/end-interview',
    TOKEN: '/api/token',
    CANDIDATE_JOINED: '/api/candidate-joined',
    WEBSOCKET_INTERVIEW: '/ws/interview'
  }
};

// Helper functions for backend URLs
export const getBackendUrl = (endpoint: string) => {
  return `${BACKEND_CONFIG.PYTHON_BACKEND_URL}${endpoint}`;
};

export const getWebSocketUrl = (path: string) => {
  return `${BACKEND_CONFIG.PYTHON_WEBSOCKET_URL}${path}`;
};
