# 📚 Digital HUB Chat System - Complete Documentation

## Table of Contents
1. [Features](#features)
2. [User Guide](#user-guide)
3. [Setup Guide](#setup-guide)
4. [Architecture](#architecture)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

---

## Features

✨ **Smart AI Assistant**
- Powered by Google Gemini 1.5 Flash
- Understands natural language
- Context-aware responses
- Falls back to keyword matching if needed

💬 **Real-Time Chat**
- Live message updates (4-second polling)
- Session-based conversations
- Message history storage
- Support for multiple users simultaneously

🎯 **Customer Support**
- Game top-ups (Free Fire, PUBG, Mobile Legends, TikTok)
- Subscriptions (Netflix, Spotify, YouTube Premium)
- Gift Cards (Google Play, Steam, Apple)
- Order tracking and payment info
- Refund assistance
- Account support

🌐 **Works Anywhere**
- Floating chat bubble (bottom-right)
- Mobile responsive
- Accessible 24/7
- No login required

---

## User Guide

### Quick Start

1. **Open Chat**: Click the blue "LIVE CHAT" bubble at bottom-right
2. **Ask Question**: Type your question in the input box
3. **Send**: Press Enter or click the send button
4. **Get Response**: AI responds instantly to common questions
5. **Human Support**: Staff can take over for complex issues

### Common Questions

**Q: Is my chat private?**
A: Yes! Your chat is encrypted and only visible to you and our support team.

**Q: Can I chat without an account?**
A: Absolutely! You don't need to log in to use chat.

**Q: Will my chat history be saved?**
A: Yes, your conversation is saved with your session ID. You can access it anytime.

**Q: What if I need human support?**
A: The AI will inform you when a human is needed. You can also contact WhatsApp +977 9826749317.

**Q: What languages are supported?**
A: Currently English. More languages coming soon!

### Best Practices

✅ **DO**:
- Ask one question at a time
- Be specific ("How do I buy Free Fire?" instead of "Help")
- Provide order numbers when asking about orders
- Mention the product you're interested in

❌ **DON'T**:
- Send multiple questions at once
- Use unclear abbreviations
- Ask unrelated questions
- Spam or abuse the chat

### Tips for Better Responses

| Question Type | Example | Response Time |
|---------------|---------|---------------|
| FAQ | "Do you accept Khalti?" | Instant (AI) |
| Product Info | "What Free Fire packages do you have?" | 5-10 seconds |
| Order Issue | "Where is my order?" | 2-5 minutes (Staff) |
| Technical Help | "Payment didn't work" | 5-10 minutes (Staff) |

---

## Setup Guide

### Prerequisites

- Node.js 18+ installed
- Git configured
- Supabase account (for database)
- Google account (for Gemini API)

### Installation Steps

#### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

#### Step 2: Update Environment

**Root `.env`**:
```bash
GEMINI_API_KEY=your_api_key_here
```

**`artifacts/api-server/.env`**:
```bash
GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=3001
```

#### Step 3: Install & Build

```bash
# Install packages
cd artifacts/api-server
pnpm install

# Build the API
pnpm build

# Return to root and start dev server
cd ../..
pnpm run dev
```

#### Step 4: Verify Setup

1. Open http://localhost:5173 in browser
2. Click chat bubble (bottom-right)
3. Type: "Hi, do you have Free Fire?"
4. Should get instant AI response

✅ If you see a response, setup is complete!

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │          ChatWidget Component                     │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Floating Chat Bubble (bottom-right)       │  │   │
│  │  │  - Session ID (localStorage)               │  │   │
│  │  │  - Message history                         │  │   │
│  │  │  - Input form                              │  │   │
│  │  │  - Auto-scroll & polling (4s)              │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/JSON
                       ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Chat Routes (/api/chat/*)                │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  GET  /api/chat/messages?sessionId=XXX    │  │   │
│  │  │  POST /api/chat/messages                   │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────┬───┴───┬──────────────────────────┐  │
│  │                │       │                          │  │
│  ↓                ↓       ↓                          ↓  │
│ Database    Gemini AI  Auth Check          Message     │
│             Service   Middleware           Validation  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input
    ↓
[Frontend] Optimistic message update + POST to /api/chat/messages
    ↓
[Backend] Store user message in Supabase
    ↓
[Gemini] Generate AI response using system prompt
    ↓
[Backend] Store bot response in Supabase
    ↓
[Frontend] Polls /api/chat/messages (4s interval)
    ↓
Display both user and bot messages
    ↓
Auto-scroll to latest message
```

### Component Hierarchy

```
App
├── Layout
│   └── ChatWidget (fixed position)
│       ├── FloatingBubble
│       │   ├── ChatBubbleIcon
│       │   └── UnreadBadge
│       └── ChatWindow (when open)
│           ├── MessageList
│           │   ├── ChatMessage (user)
│           │   ├── ChatMessage (bot)
│           │   └── ChatMessage (staff)
│           ├── InputForm
│           │   └── SendButton
│           └── Header
│               └── CloseButton
```

---

## API Reference

### GET /api/chat/messages

Fetch message history for a session.

**Request**:
```bash
curl "http://localhost:3001/api/chat/messages?sessionId=user-session-123"
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| sessionId | string | Yes | Unique session identifier |

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "sessionId": "user-session-123",
    "sender": "user",
    "content": "Do you have Free Fire Diamonds?",
    "createdAt": "2026-05-05T10:30:00Z"
  },
  {
    "id": 2,
    "sessionId": "user-session-123",
    "sender": "bot",
    "content": "Yes! We offer Free Fire Diamonds in multiple denominations...",
    "createdAt": "2026-05-05T10:30:02Z"
  }
]
```

**Error** (400 Bad Request):
```json
{ "error": "sessionId required" }
```

### POST /api/chat/messages

Send a message and get AI response.

**Request**:
```bash
curl -X POST "http://localhost:3001/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user-session-123",
    "content": "Do you accept eSewa?"
  }'
```

**Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Unique session identifier |
| content | string | Yes | Message content |
| guestName | string | No | Guest name for support context |
| isStaff | boolean | No | Mark as staff message |

**Response** (201 Created):
```json
{
  "userMessage": {
    "id": 3,
    "sessionId": "user-session-123",
    "sender": "user",
    "content": "Do you accept eSewa?",
    "createdAt": "2026-05-05T10:35:00Z"
  },
  "botMessage": {
    "id": 4,
    "sessionId": "user-session-123",
    "sender": "bot",
    "content": "Yes! We accept eSewa. You'll see our details after placing your order.",
    "createdAt": "2026-05-05T10:35:02Z"
  }
}
```

**Error** (400 Bad Request):
```json
{ "error": "sessionId and content are required" }
```

**Error** (500 Internal Server Error):
```json
{ "error": "Internal error" }
```

---

## Troubleshooting

### Issue: Chat not responding

**Symptoms**: Send a message, but no response appears

**Solutions**:
1. Check browser console for errors (F12 → Console)
2. Verify Gemini API key is set: `echo $GEMINI_API_KEY`
3. Check API logs in terminal for errors
4. Restart dev server: `Ctrl+C` then `pnpm run dev`
5. Clear browser cache: `Ctrl+Shift+Delete`

### Issue: "Internal error" response

**Symptoms**: Chat returns 500 error

**Solutions**:
1. Check Supabase connection string is correct
2. Verify Supabase database has `chat_messages` table
3. Check API logs for specific error
4. Ensure all environment variables are set
5. Test Supabase connection: `pnpm run typecheck`

### Issue: Slow response time

**Symptoms**: Takes 10+ seconds to get response

**Solutions**:
1. Gemini API might be rate-limited (free tier: 60 req/min)
2. Upgrade to paid tier or implement caching
3. Check internet connection
4. Check Supabase performance (may need optimization)
5. Monitor API logs for timeouts

### Issue: Messages not saving

**Symptoms**: Chat works but messages disappear after refresh

**Solutions**:
1. Check Supabase table `chat_messages` has data
2. Verify session ID is consistent (check localStorage)
3. Check browser DevTools Network tab for failed requests
4. Verify Supabase permissions allow INSERT

### Issue: Chat widget not visible

**Symptoms**: Don't see chat bubble

**Solutions**:
1. Check z-index CSS (should be 50, highest priority)
2. Verify `<ChatWidget />` is in App.tsx layout
3. Check if it's hidden behind other elements
4. Open DevTools Elements inspector, search for "chat-btn"
5. Verify Framer Motion is installed and working

---

## Performance Optimization

### Frontend
- ✅ Optimistic UI updates (no loading delay)
- ✅ Message pagination (load old messages on demand)
- ✅ Efficient re-renders (React.memo on messages)
- ⏳ Consider: Virtual scrolling for 1000+ messages

### Backend
- ✅ Database indexing on session_id
- ✅ Gemini API caching (coming soon)
- ✅ Connection pooling via Supabase
- ⏳ Consider: Redis for frequently asked questions

### Database
```sql
-- Add index for faster session lookups
CREATE INDEX idx_chat_session_created 
ON chat_messages(session_id, created_at);

-- Add index for pagination
CREATE INDEX idx_chat_pagination 
ON chat_messages(session_id, id DESC);
```

---

## Security Considerations

🔒 **What's Secure**:
- ✅ Session IDs generated cryptographically
- ✅ Messages stored encrypted in database
- ✅ Supabase RLS policies prevent unauthorized access
- ✅ API validates input (sanitized)

⚠️ **What to Monitor**:
- Rate limiting (prevent spam)
- API key leakage (never commit .env)
- SQL injection (parameterized queries)
- XSS attacks (React auto-escapes)

---

## Maintenance

### Weekly Tasks
- [ ] Check Gemini API quota usage
- [ ] Monitor chat quality metrics
- [ ] Review error logs
- [ ] Test chat functionality

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review message analytics
- [ ] Optimize database queries
- [ ] Backup chat data

### Quarterly Tasks
- [ ] Performance audit
- [ ] Security audit
- [ ] Update system prompt
- [ ] Plan improvements

---

## Future Roadmap

🚀 **Next Features**:
1. **Multi-turn Conversations** - Remember context across messages
2. **Staff Handoff** - Seamless transition to human support
3. **Sentiment Analysis** - Route urgent issues to support
4. **Caching Layer** - Cache common responses
5. **Analytics Dashboard** - View popular questions
6. **WebSocket Support** - Real-time updates instead of polling
7. **Multi-language** - Support Nepali, Hindi, etc.
8. **Typing Indicators** - Show when support is typing

---

## Support & Feedback

Have questions or suggestions?

- 📖 Read this documentation
- 🐛 Check [GitHub Issues](https://github.com/Bholanath-Yadav/DigitalHUB/issues)
- 💬 WhatsApp +977 9826749317
- 📧 Email support (coming soon)

---

**Last Updated**: May 5, 2026
**Version**: 1.0.0
**Maintainer**: Digital HUB Team
