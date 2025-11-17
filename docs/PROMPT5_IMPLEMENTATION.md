# Prompt 5 (v0.5) - Multi-Campaign & Export/Import - Implementation Complete ✅

## Overview

Prompt 5 adds multi-campaign support, allowing users to manage multiple D&D campaigns (e.g., "Pets of the Spider Queen", "One-shots", etc.) within a single app instance. It also enhances export/import functionality and adds hooks for D&D Beyond URLs and screenshot attachments.

## ✅ Features Implemented

### 1. Multi-Campaign Support
- ✅ **Campaign Type**: Added `Campaign` interface with `id`, `name`, `description`, `createdAt`, `updatedAt`
- ✅ **Campaign ID on All Entities**: All entities now include `campaignId`:
  - Quest
  - NPC
  - BusinessIdea
  - Hub
  - Lead
  - SessionEvent
  - CharacterProfile
- ✅ **Campaign Storage**: Added storage functions for campaigns:
  - `saveCampaigns()`, `loadCampaigns()`
  - `saveActiveCampaignId()`, `loadActiveCampaignId()`
- ✅ **Campaign Context**: Updated `CampaignContext` to:
  - Manage campaigns state
  - Filter all entities by `activeCampaignId`
  - Require active campaign for all add operations
  - Auto-migrate existing data to multi-campaign format

### 2. Campaign Switcher UI
- ✅ **CampaignSwitcher Component**: Full UI for managing campaigns
  - List all campaigns
  - Create new campaigns
  - Edit campaign name/description
  - Delete campaigns (with confirmation)
  - Switch active campaign
  - Visual indicator for active campaign
- ✅ **Integration**: Added to App.tsx at top of main content

### 3. Data Migration
- ✅ **Auto-Migration**: `migrateToMultiCampaign()` function:
  - Runs automatically on app load
  - Creates "Default Campaign" for existing data
  - Adds `campaignId` to all existing entities
  - Marks migration as complete to prevent re-running
  - Returns default campaign ID

### 4. Export/Import Enhancement
- ✅ **Campaign-Aware Export**: Updated `exportCampaignData()`:
  - Includes campaign object in export
  - Version bumped to 1.2
  - All entities include `campaignId`
- ✅ **Campaign-Aware Import**: Updated `importCampaignData()`:
  - Handles legacy format (pre-v0.5) by creating campaign
  - Validates campaign structure
  - Creates campaign from import date if missing

### 5. D&D Beyond Integration
- ✅ **CharacterProfile**: Already includes `dndBeyondUrl` field
- ✅ **Storage**: URL is persisted with character profile

### 6. Screenshot Hooks
- ✅ **SessionEvent**: Added `screenshotUrl` field
- ✅ **Type Definition**: Optional string field for screenshot/image URL
- ✅ **Ready for Future**: Field exists, ready for UI implementation

## 📁 Files Modified/Created

### New Files:
- `src/components/CampaignSwitcher.tsx` - Campaign management UI

### Modified Files:
- `src/types.ts` - Added Campaign type, added campaignId to all entities, added screenshotUrl to SessionEvent
- `src/storage.ts` - Added campaign storage functions, migration function
- `src/contexts/CampaignContext.tsx` - Complete refactor for multi-campaign support
- `src/utils/exportData.ts` - Updated to include campaign in export/import
- `src/App.tsx` - Added CampaignSwitcher component

## 🔄 Migration Strategy

The migration is **automatic and safe**:
1. On first load after v0.5, migration runs automatically
2. Existing data is assigned to "Default Campaign"
3. All entities get `campaignId` added
4. Migration flag prevents re-running
5. No data loss - all existing data is preserved

## 🎯 Usage

### Creating a Campaign
1. Click "+ New Campaign" in Campaign Switcher
2. Enter campaign name (required) and description (optional)
3. Campaign is created and automatically activated

### Switching Campaigns
1. Click on any campaign name in the list
2. Active campaign is highlighted in blue
3. All panels update to show only that campaign's data

### Editing a Campaign
1. Click "Edit" button on a campaign
2. Modify name and/or description
3. Click "Save" or "Cancel"

### Deleting a Campaign
1. Click "Delete" button (only shown if more than 1 campaign exists)
2. Confirm deletion
3. If deleting active campaign, switches to first available

### Exporting a Campaign
- Export functions now include the campaign object
- All exported entities are scoped to that campaign

### Importing a Campaign
- Import creates a new campaign (doesn't merge)
- Legacy exports (pre-v0.5) are automatically converted

## ⚠️ Breaking Changes

### For Components Using Context:
- All `add*` methods now require `activeCampaignId`
- Methods throw error if no active campaign
- Components should check for active campaign before allowing adds

### For Existing Data:
- Migration is automatic
- All existing data becomes part of "Default Campaign"
- No manual intervention needed

## 🧪 Testing Checklist

- [ ] App loads with existing data → migration runs
- [ ] "Default Campaign" appears in switcher
- [ ] Can create new campaign
- [ ] Can switch between campaigns
- [ ] Data is filtered by active campaign
- [ ] Can edit campaign name/description
- [ ] Can delete campaign (with confirmation)
- [ ] Adding entities requires active campaign
- [ ] Export includes campaign
- [ ] Import creates new campaign
- [ ] Legacy exports import correctly

## 📝 Notes

- **D&D Beyond URL**: Already supported in CharacterProfile, no changes needed
- **Screenshot URL**: Field added to SessionEvent, ready for UI implementation
- **Seed Data**: Seahaven seed doesn't need campaignId - it's added by `loadSeahavenSeed()` in context
- **Character Profile**: Now scoped to campaign (one per campaign)

## ✅ Status

**All Prompt 5 features are implemented and ready for testing!**

The app now supports:
- Multiple campaigns
- Campaign switching
- Campaign-scoped data
- Export/import with campaign structure
- Automatic migration from single-campaign format
- Hooks for D&D Beyond and screenshots (ready for future UI)

