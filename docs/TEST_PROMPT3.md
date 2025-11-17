# Prompt 3 Testing Guide

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- Express and CORS for the server
- tsx for running TypeScript server files
- concurrently for running both servers
- Type definitions

### 2. Configure Environment (Optional for OpenAI)
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Note:** The app works without OpenAI - it will use rule-based fallback.

### 3. Start the Application

**Option A: Run both servers together (recommended)**
```bash
npm run dev:all
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

## Testing Checklist

### ✅ Test 1: Server Health Check
1. Start the server
2. Open browser to: `http://localhost:3001/health`
3. Should see: `{"status":"ok","timestamp":"..."}`

### ✅ Test 2: Rule-Based Fallback (No OpenAI)
1. Don't set `OPENAI_API_KEY` in `.env`
2. Start both servers
3. Open app at `http://localhost:5173`
4. Enter session text: "We found a missing person"
5. Click "Suggest Next 3 Options"
6. **Expected:** 3 suggestions with "Rules" badge (yellow)
7. **Expected:** Suggestions are relevant to input

### ✅ Test 3: Character Profile
1. Fill out character profile:
   - Name: "Sir Robert-Morigan"
   - Class & Level: "Paladin 5"
   - Race: "Human"
   - Summary: "Lay on Hands, Divine Smite, Celestial Steed"
2. Save character
3. Enter session text: "We're in combat"
4. Get suggestions
5. **Expected:** Character info is used in suggestions (if OpenAI) or available for future use

### ✅ Test 4: With OpenAI (if configured)
1. Set `OPENAI_API_KEY` in `.env`
2. Restart server
3. Enter session text: "The Sleek Sophia is at anchor"
4. Get suggestions
5. **Expected:** 3 suggestions with "AI" badge (green)
6. **Expected:** Suggestions are more contextual and detailed

### ✅ Test 5: API Error Handling
1. Set invalid `OPENAI_API_KEY` in `.env`
2. Restart server
3. Get suggestions
4. **Expected:** Falls back to rule-based engine
5. **Expected:** Shows "Rules" badge
6. **Expected:** No errors in console

### ✅ Test 6: Character Profile in Context
1. Fill out character profile
2. Load Seahaven seed data
3. Enter: "I need to use a spell"
4. Get suggestions
5. **Expected:** Character class/level considered in suggestions
6. **Expected:** Character summary included in AI prompt (if OpenAI)

### ✅ Test 7: Backend API Direct Test
```bash
curl -X POST http://localhost:3001/api/next-options \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We found a missing person",
    "currentLocationName": "Seahaven",
    "openQuests": [],
    "openLeads": [],
    "npcs": []
  }'
```

**Expected:** JSON response with 3 options

## Expected Behavior

### Without OpenAI Key:
- ✅ Server starts successfully
- ✅ Uses rule-based engine
- ✅ Shows "Rules" badge
- ✅ Always returns 3 options
- ✅ Suggestions are relevant

### With OpenAI Key:
- ✅ Server starts successfully
- ✅ Calls OpenAI API
- ✅ Shows "AI" badge
- ✅ More contextual suggestions
- ✅ Character profile included
- ✅ Falls back to rules on error

## Troubleshooting

### Server won't start:
- Check if port 3001 is available
- Verify Node.js is installed
- Check for TypeScript errors: `npx tsc --noEmit`

### API calls fail:
- Check server is running on port 3001
- Verify CORS is configured
- Check browser console for errors
- Verify `VITE_API_URL` matches server port

### OpenAI not working:
- Verify `OPENAI_API_KEY` is set correctly
- Check API key is valid
- Check server logs for errors
- Verify model name is correct

### Character profile not saving:
- Check browser localStorage
- Verify no console errors
- Check storage functions are called

## Success Criteria

✅ All tests pass
✅ Server runs without errors
✅ Frontend connects to backend
✅ Fallback works when OpenAI unavailable
✅ Character profile saves and loads
✅ Source indicator shows correctly
✅ Suggestions are relevant and useful

