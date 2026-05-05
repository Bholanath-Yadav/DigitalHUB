# 🚀 Live Chat Setup Guide

## Overview

The Digital HUB Live Chat is powered by:
- **Frontend**: React chat widget with real-time updates
- **Backend**: Express.js API with Supabase database
- **AI**: Google Gemini AI for intelligent responses
- **Database**: Supabase PostgreSQL for message storage

---

## Quick Start

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your clipboard

### 2. Update Environment Variables

Add to your `.env` file in the **root directory**:

```bash
GEMINI_API_KEY=your_api_key_here
```

And in `artifacts/api-server/.env`:

```bash
GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Install Dependencies

```bash
cd artifacts/api-server
pnpm install
pnpm build
```

### 4. Restart Dev Server

```bash
# From root directory
pnpm run dev
```

The chat will now use Gemini AI for intelligent responses!

---

## Architecture

### Frontend (`artifacts/gaming-store/src/components/chat-widget.tsx`)

```
ChatWidget
├── State Management
│   ├── Session ID (localStorage)
│   ├── Messages
│   ├── Input text
│   └── Loading state
├── Features
│   ├── Real-time message polling (4s interval)
│   ├── Optimistic UI updates
│   ├── Auto-scroll to latest message
│   └── Floating bubble with unread count
└── UI
    ├── Chat bubble (bottom-right)
    ├── Message history
    └── Input form with Send button
```

### Backend (`artifacts/api-server/src/routes/chat.ts`)

```
GET  /api/chat/messages?sessionId=XXX   → Fetch conversation history
POST /api/chat/messages                 → Send message & get AI response
```

**Flow**:
1. User sends message
2. Backend stores in Supabase
3. Gemini AI generates response
4. Response stored in database
5. Frontend polls and displays both

### AI Service (`artifacts/api-server/src/lib/gemini.ts`)

```typescript
getAIResponse(userMessage)
├── Check if Gemini API available
├── Call Gemini 1.5 Flash model
├── Send with system prompt
├── Return response or fallback
└── Fallback to keyword matching if API fails
```

---

## System Prompt

The AI assistant is instructed to:

✅ Provide helpful customer support for Digital HUB
✅ Keep responses short (1-2 sentences)
✅ Know about:
   - Game top-ups (Free Fire, PUBG, Mobile Legends, TikTok)
   - Subscriptions (Netflix, Spotify, YouTube Premium)
   - Gift Cards (Google Play, Steam, Apple)
   - Payment methods (eSewa, Khalti, IME Pay)
   - Support contact (WhatsApp +977 9826749317)
✅ Guide users to products or human support when needed

---

## Database Schema

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,           -- Unique per user/browser
  user_id TEXT,                       -- Supabase auth ID (if logged in)
  guest_name TEXT,                    -- Name for guests
  sender "chat_sender" NOT NULL,      -- 'user' | 'bot' | 'staff'
  content TEXT NOT NULL,              -- Message text
  read INTEGER DEFAULT 0,             -- Unread flag
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_chat_session ON chat_messages(session_id);
```

---

## API Endpoints

### Get Messages
```http
GET /api/chat/messages?sessionId=12345-abc
```

**Response**:
```json
[
  {
    "id": 1,
    "sessionId": "12345-abc",
    "sender": "user",
    "content": "Hi, do you have Free Fire?",
    "createdAt": "2026-05-05T10:30:00Z"
  },
  {
    "id": 2,
    "sessionId": "12345-abc",
    "sender": "bot",
    "content": "Yes! We offer Free Fire Diamonds in multiple amounts. Browse our Game Top-ups section!",
    "createdAt": "2026-05-05T10:30:02Z"
  }
]
```

### Send Message
```http
POST /api/chat/messages
Content-Type: application/json

{
  "sessionId": "12345-abc",
  "content": "Hi, do you have Free Fire?"
}
```

**Response**:
```json
{
  "userMessage": {
    "id": 1,
    "sessionId": "12345-abc",
    "sender": "user",
    "content": "Hi, do you have Free Fire?",
    "createdAt": "2026-05-05T10:30:00Z"
  },
  "botMessage": {
    "id": 2,
    "sessionId": "12345-abc",
    "sender": "bot",
    "content": "Yes! We offer Free Fire Diamonds...",
    "createdAt": "2026-05-05T10:30:02Z"
  }
}
```

---

## Error Handling

### Gemini API Errors

If the API key is invalid or rate-limited:

```typescript
try {
  const response = await getAIResponse(message);
} catch (error) {
  // Falls back to keyword matching
  return getFallbackResponse(message);
}
```

**Fallback Keywords**:
- hello, hi, help, order, payment, refund, delivery, free fire, pubg, price, esewa, khalti, netflix, spotify

### Network Errors

- **Message fails to send**: Error toast shown, message stays in input
- **Polling fails**: Silently continues, retries in 4s
- **Supabase down**: "Internal error" response

---

## Rate Limiting

**Gemini API**:
- Free tier: 60 requests/minute
- Paid tier: 600 requests/minute

**Recommendation**: For production, upgrade to paid tier or implement request batching.

---

## Monitoring & Logs

### Check API Logs
```bash
# Watch terminal where dev server is running
# Should see:
# [timestamp] INFO (pid): request completed
#   req: { method: "POST", url: "/api/chat/messages" }
#   res: { statusCode: 201 }
```

### Check Message Storage
```sql
-- Supabase SQL Editor
SELECT * FROM chat_messages
WHERE session_id = 'your_session_id'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   - `GEMINI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

EXPOSE 3001
CMD ["pnpm", "start"]
```

---

## Troubleshooting

### Chat not responding
1. Check Gemini API key is valid
2. Verify environment variable is set
3. Check API server logs
4. Restart dev server

### Messages not appearing
1. Check network tab in browser DevTools
2. Verify Supabase connection
3. Check chat_messages table has data
4. Restart browser and try again

### High latency
1. Gemini API might be rate-limited
2. Check Supabase performance
3. Consider caching frequent responses
4. Use text generation caching (future improvement)

---

## Future Improvements

- [ ] **Conversation history** - Remember context across sessions
- [ ] **Multi-turn conversations** - Better context awareness
- [ ] **Semantic search** - Find similar questions for faster responses
- [ ] **Staff handoff** - Smooth transition to human support
- [ ] **Sentiment analysis** - Route urgent issues to support team
- [ ] **Message analytics** - Track popular questions
- [ ] **Caching** - Cache common responses to reduce API calls
- [ ] **WebSockets** - Real-time updates instead of polling

---

## Support

For issues with the live chat:

1. Check this guide first
2. Review browser console for errors
3. Check API server logs
4. Create an issue on GitHub

---

**Happy chatting! 🎮💬**
