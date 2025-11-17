# Prompt 4 + Improvements - Complete Test Checklist

## ✅ Pre-Test Verification

- [x] No TypeScript errors
- [x] No linter errors
- [x] All imports resolved
- [x] All components exported correctly

## 🧪 Feature Testing

### 1. Session Mode Selection
- [ ] Open SessionPanel
- [ ] See 5 mode buttons: General, NPC, Investigate, Business, Combat/Spells
- [ ] Click each mode button - it should highlight
- [ ] Mode persists after page refresh
- [ ] Mode is saved to localStorage

### 2. Event Creation (Auto)
- [ ] Type text in "What just happened?"
- [ ] Select a mode
- [ ] Click "Suggest Next 3 Options"
- [ ] Event is automatically created
- [ ] Event appears in SessionTimeline
- [ ] Event has correct mode, hub, location
- [ ] Auto-linking works (if text mentions quest/NPC/lead names)
- [ ] Auto-tagging works (if text contains keywords)

### 3. SessionTimeline - Basic View
- [ ] Timeline shows recent events (most recent first)
- [ ] Events show: time, mode badge (color-coded), hub, text preview
- [ ] Click "View" to expand event
- [ ] Expanded view shows full text
- [ ] Click "Collapse" to collapse

### 4. SessionTimeline - Filters
- [ ] Hub filter dropdown works
- [ ] Mode filter dropdown works
- [ ] Tag filter dropdown appears when tags exist
- [ ] Search box searches event text
- [ ] Search also finds linked quest titles
- [ ] Search also finds linked NPC names
- [ ] Search also finds linked lead titles
- [ ] Filters can be combined

### 5. SessionTimeline - Event Editing
- [ ] Click "Edit" on an event
- [ ] Textarea appears with event text
- [ ] Mode dropdown appears
- [ ] Tags input appears
- [ ] Edit text, mode, and tags
- [ ] Click "Save" - changes persist
- [ ] Click "Cancel" - changes are discarded
- [ ] Edited event shows updated content

### 6. SessionTimeline - Event Linking
- [ ] Expand an event
- [ ] Click "Link Entities"
- [ ] Linking modal appears
- [ ] Quest checkboxes show all quests
- [ ] Lead checkboxes show all leads
- [ ] NPC checkboxes show all NPCs
- [ ] Select/deselect entities
- [ ] Click "Save Links" - links are saved
- [ ] Linked entities appear as chips in expanded view
- [ ] Click "Cancel" - changes are discarded

### 7. SessionTimeline - Tag Management
- [ ] Tags appear as clickable chips
- [ ] Click a tag - timeline filters to that tag
- [ ] Tag filter dropdown shows all tags
- [ ] Tags can be edited when editing event
- [ ] Auto-suggested tags appear on new events

### 8. SessionTimeline - Bulk Operations
- [ ] Click "Bulk Select" button
- [ ] Checkboxes appear on all events
- [ ] Select multiple events
- [ ] "Select All" / "Deselect All" works
- [ ] Selected events are highlighted
- [ ] Click "Delete Selected" - selected events are deleted
- [ ] Click "Cancel" - exits bulk mode

### 9. SessionTimeline - Statistics
- [ ] Click "Show Stats"
- [ ] Stats panel appears
- [ ] Shows total event count
- [ ] Shows events by mode (all 5 modes)
- [ ] Shows events by hub (if any)
- [ ] Click "Hide Stats" - panel disappears

### 10. SessionTimeline - Quick Actions
- [ ] Expand an event
- [ ] See quick action buttons
- [ ] Click "Create Quest" - quest is created with event text
- [ ] Click "Create Lead" - lead is created (if event has hub)
- [ ] Click "Jump to Hub" - active hub switches
- [ ] Click "Copy" - event text copied to clipboard
- [ ] All actions show success toasts

### 11. SessionTimeline - Pagination
- [ ] Create more than 20 events
- [ ] "Load More" button appears
- [ ] Click "Load More" - more events load
- [ ] Button shows remaining count
- [ ] Button disappears when all events loaded

### 12. HandoffSummary - Basic
- [ ] Component appears in layout
- [ ] Shows "Generate Summary" button
- [ ] Button is disabled if no events
- [ ] Click button - summary generates
- [ ] Shows "What Just Happened" section
- [ ] Shows "Open Threads" section
- [ ] Shows "Top 3 Priorities" section

### 13. HandoffSummary - Customization
- [ ] Event count input appears
- [ ] Change event count (5-50)
- [ ] Generate summary with different counts
- [ ] Summary reflects the count

### 14. HandoffSummary - AI Toggle
- [ ] "Use AI" checkbox appears
- [ ] Can toggle checkbox
- [ ] Currently uses rule-based (AI not implemented yet)

### 15. HandoffSummary - Export
- [ ] Generate a summary
- [ ] "Export" button appears
- [ ] Click "Export" - Markdown file downloads
- [ ] File contains all summary sections
- [ ] Filename includes date

### 16. Visual Mode Indicators
- [ ] General mode badge is blue
- [ ] NPC mode badge is green
- [ ] Investigate mode badge is yellow
- [ ] Business mode badge is purple
- [ ] Combat/Spells mode badge is red

### 17. Auto-Link Suggestions
- [ ] Create event mentioning a quest title
- [ ] Quest is auto-linked
- [ ] Create event mentioning an NPC name
- [ ] NPC is auto-linked
- [ ] Create event mentioning a lead title
- [ ] Lead is auto-linked
- [ ] Keywords trigger auto-tags

### 18. Enhanced Search
- [ ] Search for quest title (in linked quest)
- [ ] Event appears in results
- [ ] Search for NPC name (in linked NPC)
- [ ] Event appears in results
- [ ] Search for lead title (in linked lead)
- [ ] Event appears in results
- [ ] Search for hub name
- [ ] Events from that hub appear

### 19. Backend Integration
- [ ] Start server: `npm run dev:server`
- [ ] Start client: `npm run dev:client`
- [ ] Get suggestions - should call backend
- [ ] Mode is included in API call
- [ ] Recent events are included in API call
- [ ] Backend uses mode-aware prompts
- [ ] Without API key, falls back to rules

### 20. Data Persistence
- [ ] Create events
- [ ] Refresh page
- [ ] Events persist
- [ ] Edit an event
- [ ] Refresh page
- [ ] Edit persists
- [ ] Link entities
- [ ] Refresh page
- [ ] Links persist
- [ ] Mode selection persists

## 🐛 Edge Cases to Test

- [ ] Empty timeline (no events)
- [ ] Timeline with 200+ events (should cap)
- [ ] Event with no hub
- [ ] Event with no tags
- [ ] Event with no links
- [ ] Search with no results
- [ ] Filter with no results
- [ ] Edit event and cancel
- [ ] Link entities and cancel
- [ ] Bulk select all, then deselect all
- [ ] Generate summary with no events
- [ ] Generate summary with no open quests/leads
- [ ] Export summary multiple times

## ✅ Integration Tests

- [ ] Create event → appears in timeline
- [ ] Edit event → changes reflect everywhere
- [ ] Link quest → quest appears in event
- [ ] Delete quest → link is broken (graceful)
- [ ] Create quest from event → quest appears in quest tracker
- [ ] Create lead from event → lead appears in leads panel
- [ ] Jump to hub → hub becomes active
- [ ] Filter by hub → only that hub's events show
- [ ] Tag event → tag appears in filter dropdown
- [ ] Click tag → timeline filters

## 🎯 Performance Tests

- [ ] Timeline loads quickly with 50 events
- [ ] Timeline loads quickly with 200 events
- [ ] Search is responsive
- [ ] Filters are responsive
- [ ] Bulk operations are responsive
- [ ] No lag when expanding/collapsing events

## 📱 Mobile Tests

- [ ] Layout stacks correctly on mobile
- [ ] Buttons are tappable
- [ ] Text is readable
- [ ] Filters are usable
- [ ] Timeline scrolls smoothly

## 🔧 Technical Verification

- [ ] All TypeScript types are correct
- [ ] No console errors
- [ ] No console warnings
- [ ] localStorage operations work
- [ ] Context updates propagate
- [ ] State updates correctly
- [ ] Event handlers work
- [ ] Async operations complete

---

## Quick Test Script

1. **Start the app**: `npm run dev:all` (or separately)
2. **Load Seahaven seed**: Click "Load Seahaven" in QuestTracker
3. **Create test events**:
   - Type "Talked to the mayor about missing sailors" (NPC mode)
   - Type "Investigated the fishing hole north of town" (Investigate mode)
   - Type "Planned exotic butcher business with Vitor" (Business mode)
4. **Test timeline**:
   - View events
   - Edit one event
   - Link entities to one event
   - Filter by mode
   - Search for "mayor"
5. **Test bulk operations**:
   - Enter bulk mode
   - Select 2 events
   - Delete them
6. **Test handoff summary**:
   - Generate summary
   - Change event count
   - Export summary
7. **Verify persistence**:
   - Refresh page
   - All data should still be there

---

## Expected Results

✅ All features should work smoothly
✅ No errors in console
✅ Data persists across refreshes
✅ UI is responsive and intuitive
✅ All improvements are functional

