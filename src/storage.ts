// LocalStorage helper for Campaign Copilot
import type { Quest, NPC, BusinessIdea, SessionNote, Hub, Lead, CharacterProfile, SessionEvent, SessionMode, Campaign } from './types';
import { generateId } from './utils/id';

const STORAGE_KEYS = {
  CAMPAIGNS: 'campaign-copilot-campaigns',
  ACTIVE_CAMPAIGN_ID: 'campaign-copilot-active-campaign-id',
  QUESTS: 'campaign-copilot-quests',
  NPCS: 'campaign-copilot-npcs',
  BUSINESS_IDEAS: 'campaign-copilot-business-ideas',
  SESSION_NOTES: 'campaign-copilot-session-notes',
  CURRENT_LOCATION: 'campaign-copilot-current-location',
  HUBS: 'campaign-copilot-hubs',
  LEADS: 'campaign-copilot-leads',
  ACTIVE_HUB_ID: 'campaign-copilot-active-hub-id',
  CHARACTER_PROFILE: 'campaign-copilot-character-profile',
  SESSION_EVENTS: 'campaign-copilot-session-events',
  SESSION_MODE: 'campaign-copilot-session-mode',
  MIGRATION_DONE: 'campaign-copilot-migration-v0.5',
} as const;

// Generic storage helpers
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error);
    return defaultValue;
  }
}

// Quest storage
export function saveQuests(quests: Quest[]): void {
  saveToStorage(STORAGE_KEYS.QUESTS, quests);
}

export function loadQuests(): Quest[] {
  return loadFromStorage<Quest[]>(STORAGE_KEYS.QUESTS, []);
}

// NPC storage
export function saveNPCs(npcs: NPC[]): void {
  saveToStorage(STORAGE_KEYS.NPCS, npcs);
}

export function loadNPCs(): NPC[] {
  return loadFromStorage<NPC[]>(STORAGE_KEYS.NPCS, []);
}

// Business Ideas storage
export function saveBusinessIdeas(businessIdeas: BusinessIdea[]): void {
  saveToStorage(STORAGE_KEYS.BUSINESS_IDEAS, businessIdeas);
}

export function loadBusinessIdeas(): BusinessIdea[] {
  return loadFromStorage<BusinessIdea[]>(STORAGE_KEYS.BUSINESS_IDEAS, []);
}

// Session Notes storage (keep last 10)
export function saveSessionNote(note: SessionNote): void {
  const notes = loadSessionNotes();
  const updated = [note, ...notes].slice(0, 10); // Keep last 10
  saveToStorage(STORAGE_KEYS.SESSION_NOTES, updated);
}

export function loadSessionNotes(): SessionNote[] {
  return loadFromStorage<SessionNote[]>(STORAGE_KEYS.SESSION_NOTES, []);
}

// Current location storage
export function saveCurrentLocation(location: string): void {
  saveToStorage(STORAGE_KEYS.CURRENT_LOCATION, location);
}

export function loadCurrentLocation(): string {
  return loadFromStorage<string>(STORAGE_KEYS.CURRENT_LOCATION, '');
}

// Hub storage
export function saveHubs(hubs: Hub[]): void {
  saveToStorage(STORAGE_KEYS.HUBS, hubs);
}

export function loadHubs(): Hub[] {
  return loadFromStorage<Hub[]>(STORAGE_KEYS.HUBS, []);
}

// Lead storage
export function saveLeads(leads: Lead[]): void {
  saveToStorage(STORAGE_KEYS.LEADS, leads);
}

export function loadLeads(): Lead[] {
  return loadFromStorage<Lead[]>(STORAGE_KEYS.LEADS, []);
}

// Active hub storage
export function saveActiveHubId(hubId: string | null): void {
  if (hubId) {
    saveToStorage(STORAGE_KEYS.ACTIVE_HUB_ID, hubId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_HUB_ID);
  }
}

export function loadActiveHubId(): string | null {
  return loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_HUB_ID, null);
}

// Character Profile storage
export function saveCharacterProfile(profile: CharacterProfile | null): void {
  if (profile) {
    saveToStorage(STORAGE_KEYS.CHARACTER_PROFILE, profile);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHARACTER_PROFILE);
  }
}

export function loadCharacterProfile(): CharacterProfile | null {
  return loadFromStorage<CharacterProfile | null>(STORAGE_KEYS.CHARACTER_PROFILE, null);
}

// Session Events storage (keep last 200)
const MAX_SESSION_EVENTS = 200;

export function saveSessionEvents(events: SessionEvent[]): void {
  // Trim to max events, keeping most recent
  const trimmed = events.slice(0, MAX_SESSION_EVENTS);
  saveToStorage(STORAGE_KEYS.SESSION_EVENTS, trimmed);
}

export function loadSessionEvents(): SessionEvent[] {
  return loadFromStorage<SessionEvent[]>(STORAGE_KEYS.SESSION_EVENTS, []);
}

export function appendSessionEvent(event: SessionEvent): void {
  const events = loadSessionEvents();
  const updated = [event, ...events].slice(0, MAX_SESSION_EVENTS);
  saveSessionEvents(updated);
}

// Session Mode storage
export function saveSessionMode(mode: SessionMode): void {
  saveToStorage(STORAGE_KEYS.SESSION_MODE, mode);
}

export function loadSessionMode(): SessionMode {
  return loadFromStorage<SessionMode>(STORAGE_KEYS.SESSION_MODE, 'default');
}

// Campaign storage
export function saveCampaigns(campaigns: Campaign[]): void {
  saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
}

export function loadCampaigns(): Campaign[] {
  return loadFromStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, []);
}

export function saveActiveCampaignId(campaignId: string | null): void {
  if (campaignId) {
    saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID, campaignId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID);
  }
}

export function loadActiveCampaignId(): string | null {
  return loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID, null);
}

// Migration: Convert single-campaign data to multi-campaign format
export function migrateToMultiCampaign(): string {
  // Check if migration already done
  if (loadFromStorage<boolean>(STORAGE_KEYS.MIGRATION_DONE, false)) {
    const campaigns = loadCampaigns();
    if (campaigns.length > 0) {
      return campaigns[0].id; // Return first campaign ID
    }
  }

  // Create default campaign
  const defaultCampaign: Campaign = {
    id: generateId(),
    name: 'Default Campaign',
    description: 'Migrated from pre-v0.5 data.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Get existing data
  const existingQuests = loadQuests();
  const existingNPCs = loadNPCs();
  const existingBusinessIdeas = loadBusinessIdeas();
  const existingHubs = loadHubs();
  const existingLeads = loadLeads();
  const existingSessionEvents = loadSessionEvents();
  const existingCharacterProfile = loadCharacterProfile();

  // Add campaignId to all entities
  const migratedQuests = existingQuests.map(q => ({
    ...q,
    campaignId: defaultCampaign.id,
  }));

  const migratedNPCs = existingNPCs.map(n => ({
    ...n,
    campaignId: defaultCampaign.id,
  }));

  const migratedBusinessIdeas = existingBusinessIdeas.map(b => ({
    ...b,
    campaignId: defaultCampaign.id,
  }));

  const migratedHubs = existingHubs.map(h => ({
    ...h,
    campaignId: defaultCampaign.id,
  }));

  const migratedLeads = existingLeads.map(l => ({
    ...l,
    campaignId: defaultCampaign.id,
  }));

  const migratedSessionEvents = existingSessionEvents.map(e => ({
    ...e,
    campaignId: defaultCampaign.id,
  }));

  const migratedCharacterProfile = existingCharacterProfile ? {
    ...existingCharacterProfile,
    campaignId: defaultCampaign.id,
  } : null;

  // Save migrated data
  saveCampaigns([defaultCampaign]);
  saveActiveCampaignId(defaultCampaign.id);
  saveQuests(migratedQuests);
  saveNPCs(migratedNPCs);
  saveBusinessIdeas(migratedBusinessIdeas);
  saveHubs(migratedHubs);
  saveLeads(migratedLeads);
  saveSessionEvents(migratedSessionEvents);
  if (migratedCharacterProfile) {
    saveCharacterProfile(migratedCharacterProfile);
  }

  // Mark migration as done
  saveToStorage(STORAGE_KEYS.MIGRATION_DONE, true);

  return defaultCampaign.id;
}
