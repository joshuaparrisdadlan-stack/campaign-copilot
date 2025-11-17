# Campaign Copilot - Prompts 1 & 2 Test Checklist

## Prompt 1 Features (v0.1 MVP)

### ✅ Layout & UI
- [x] Three main panels (Session, Quest Tracker, NPC/Business)
- [x] Responsive design (mobile-friendly)
- [x] Dark theme suitable for gaming sessions
- [x] Skip to main content link (accessibility)

### ✅ Session Panel
- [x] Textarea for "What just happened?"
- [x] Current location input
- [x] "Suggest Next 3 Options" button
- [x] Output area showing 3 numbered suggestions
- [x] Each suggestion has title and bullet points
- [x] Loading state during suggestions
- [x] Session notes saved to localStorage

### ✅ Quest Tracker
- [x] List of quests/rumours
- [x] Each quest has: Title, Location, Status (Open/In Progress/Resolved)
- [x] Form to add new quest
- [x] Toggle quest status
- [x] Filter by location
- [x] Delete quests
- [x] Edit quest functionality
- [x] Bulk operations (select multiple, delete)

### ✅ NPC & Business Panel
- [x] List of NPCs with Name, Role, Location
- [x] List of Business Ideas
- [x] Add/Edit/Delete NPCs
- [x] Add/Edit/Delete Business Ideas
- [x] Tab navigation (NPCs/Business)
- [x] Keyboard navigation support

### ✅ Data Persistence
- [x] Quests saved to localStorage
- [x] NPCs saved to localStorage
- [x] Business ideas saved to localStorage
- [x] Session notes saved to localStorage
- [x] Current location saved to localStorage

### ✅ AI Suggestion Abstraction
- [x] `getNextOptions()` function exists
- [x] Takes SessionContext as input
- [x] Returns array of NextOption objects
- [x] Currently uses rule-based logic (placeholder for LLM)

## Prompt 2 Features (v0.2)

### ✅ Hub & Lead Model
- [x] Hub type defined with id, name, description, tags, defaultLocationName
- [x] Lead type defined with id, hubId, title, summary, status, importance
- [x] Quest and NPC can link to hub via hubId
- [x] Storage functions for hubs and leads
- [x] Active hub tracking

### ✅ Seahaven Seed Data
- [x] `src/seeds/seahaven.ts` file exists
- [x] Seahaven hub definition
- [x] 10 NPCs (John, Vitor, Quinn, Saith, Telt, Breth, Griff, Naomi, Guard Captain, Mayor)
- [x] 5 leads (Missing Travellers, Fishing Hole, Alchemist Conflict, Maple Tapping, Storm)
- [x] 2 sample quests
- [x] `loadSeahavenSeed()` function
- [x] "Load Seahaven" button in QuestTracker

### ✅ Smarter Rule-Based Engine
- [x] `src/logic/nextOptionsEngine.ts` file exists
- [x] Keyword detection (ship, missing, fishing, mayor, storm, business, maple)
- [x] Hub-aware suggestions
- [x] Lead prioritization by importance
- [x] Quest integration
- [x] NPC integration
- [x] Default fallback suggestions
- [x] Always returns exactly 3 options

### ✅ UI Updates for Hubs & Leads
- [x] Hub selector in SessionPanel (shows when hubs exist)
- [x] LeadsPanel component created
- [x] Leads panel shows leads filtered by active hub
- [x] Add/Edit/Delete leads
- [x] Lead status toggle (Open/In Progress/Resolved)
- [x] Lead importance display (1-5 priority)
- [x] Quest form includes hub selection

### ✅ Context Integration
- [x] CampaignContext manages hubs, leads, activeHubId
- [x] SessionContext includes currentHubId and openLeads
- [x] AI suggestions engine uses hub and lead context
- [x] All components use CampaignContext

## Test Scenarios

### Scenario 1: Basic Quest Management
1. Add a new quest
2. Toggle quest status
3. Edit quest details
4. Filter quests by location
5. Delete a quest
6. Verify data persists after refresh

### Scenario 2: NPC & Business Management
1. Add an NPC
2. Add a business idea
3. Switch between NPC and Business tabs
4. Edit NPC details
5. Delete items
6. Verify data persists

### Scenario 3: Session Suggestions (Prompt 1)
1. Enter current location
2. Type "We found a missing person"
3. Click "Suggest Next 3 Options"
4. Verify 3 suggestions appear
5. Check suggestions are relevant

### Scenario 4: Load Seahaven Seed (Prompt 2)
1. Click "Load Seahaven" button
2. Verify hub is created
3. Verify NPCs are added
4. Verify leads are added
5. Verify quests are added
6. Verify active hub is set to Seahaven

### Scenario 5: Hub-Aware Suggestions (Prompt 2)
1. Load Seahaven seed data
2. Select Seahaven as active hub
3. Type "The Sleek Sophia is at anchor"
4. Get suggestions
5. Verify suggestions mention ship-related actions
6. Verify suggestions are hub-aware

### Scenario 6: Lead Management (Prompt 2)
1. With Seahaven active, view Leads panel
2. Add a new lead
3. Set lead importance
4. Toggle lead status
5. Verify lead appears in suggestions context
6. Delete a lead

### Scenario 7: Hub Selector (Prompt 2)
1. Load Seahaven seed
2. Verify hub selector appears in SessionPanel
3. Select Seahaven hub
4. Verify location auto-fills if hub has defaultLocationName
5. Switch to different hub (if multiple exist)

## Expected Results

All features from Prompts 1 and 2 should:
- ✅ Work without console errors
- ✅ Persist data to localStorage
- ✅ Display correctly on desktop and mobile
- ✅ Have proper accessibility attributes
- ✅ Show toast notifications for user feedback
- ✅ Handle edge cases gracefully

