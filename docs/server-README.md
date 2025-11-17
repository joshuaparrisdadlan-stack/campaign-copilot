# Campaign Copilot - Backend Server

Express backend for Campaign Copilot that handles AI API calls with OpenAI integration.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   PORT=3001
   CLIENT_URL=http://localhost:5173
   ```

   **Note:** If `OPENAI_API_KEY` is not set, the server will use rule-based fallback.

3. **Run the server:**
   ```bash
   npm run dev:server
   ```

   Or run both client and server together:
   ```bash
   npm run dev:all
   ```

## API Endpoints

### POST `/api/next-options`

Generates 3 next options based on session context.

**Request Body:**
```json
{
  "text": "What just happened in the session",
  "currentHubId": "optional-hub-id",
  "currentLocationName": "Seahaven",
  "openQuests": [...],
  "openLeads": [...],
  "npcs": [...],
  "characterProfile": {...}
}
```

**Response:**
```json
{
  "options": [
    {
      "id": "1",
      "title": "Option title",
      "bullets": ["bullet 1", "bullet 2"],
      "source": "llm" | "rules-fallback"
    }
  ],
  "source": "llm" | "rules-fallback"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T..."
}
```

## How It Works

1. Client calls `/api/next-options` with session context
2. Server checks if `OPENAI_API_KEY` is configured
3. If yes, calls OpenAI API with structured prompt
4. If no (or API fails), falls back to rule-based engine
5. Returns 3 options with source indicator

## Fallback Behavior

- If OpenAI API key is missing → uses rule-based engine
- If OpenAI API call fails → uses rule-based engine
- If OpenAI response is invalid → uses rule-based engine
- Always returns exactly 3 options

