# 🎥 LiveKit Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
```

## Getting LiveKit Credentials

### Option 1: LiveKit Cloud (Recommended)
1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Copy API Key, API Secret, and WebSocket URL

### Option 2: Self-Hosted LiveKit
1. Deploy LiveKit server
2. Get credentials from your server configuration
3. Use your server's WebSocket URL

## Testing LiveKit Connection

1. **Check Environment Variables:**
   Visit: `http://localhost:3000/api/check-email-config`

2. **Test Token Generation:**
   The interview page will automatically test token generation

3. **Expected Behavior:**
   - ✅ Interview page loads with LiveKit room
   - ✅ Video/audio controls work
   - ✅ AI agent can join the room

## Troubleshooting

### Common Issues:

1. **"LiveKit not configured" error:**
   - Check environment variables are set correctly
   - Restart development server after adding env vars

2. **"Failed to get access token" error:**
   - Verify API key and secret are correct
   - Check LiveKit server is accessible

3. **Connection issues:**
   - Verify WebSocket URL is correct
   - Check firewall/network settings

## Development vs Production

### Development:
- Use LiveKit Cloud for easy setup
- Free tier available for testing

### Production:
- Consider self-hosted for better control
- Configure proper SSL certificates
- Set up monitoring and scaling

## Integration Flow

1. **Interview Creation** → Generates room ID
2. **Token Generation** → Creates access token for candidate
3. **LiveKit Room** → Candidate joins with token
4. **AI Agent** → Connects to same room
5. **Interview Session** → Real-time video/audio interaction
