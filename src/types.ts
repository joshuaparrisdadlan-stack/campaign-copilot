// Campaign Copilot TypeScript Types

export interface Campaign {
  id: string;
  name: string; // e.g. "Pets of the Spider Queen", "One-shots", "Seahaven Campaign"
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignLocation {
  id: string;
  name: string;
  description?: string;
}

export interface Hub {
  id: string;
  campaignId: string; // links to Campaign
  name: string; // e.g. "Seahaven", "Grove Village", "Two Weeks at Sea"
  description?: string;
  tags?: string[]; // e.g. ["port", "mystery", "maple-sap"]
  defaultLocationName?: string; // used as the current location label
  createdAt: number;
  updatedAt: number;
}

export interface Lead {
  id: string;
  campaignId: string; // links to Campaign
  hubId: string;
  title: string; // e.g. "Missing sailors", "Poisoned fishing hole"
  summary: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  importance?: number; // simple 1–5 priority
  relatedNPCIds?: string[];
  relatedQuestIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Quest {
  id: string;
  campaignId: string; // links to Campaign
  title: string;
  location: string;
  hubId?: string; // optional link to a hub
  status: 'Open' | 'In Progress' | 'Resolved';
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NPC {
  id: string;
  campaignId: string; // links to Campaign
  name: string;
  role: string;
  location: string;
  hubId?: string; // optional link to a hub
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessIdea {
  id: string;
  campaignId: string; // links to Campaign
  title: string;
  location: string;
  description?: string;
  status?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionNote {
  id: string;
  text: string;
  location?: string;
  timestamp: number;
}

export type SessionMode =
  | 'default'
  | 'interrogate-npc'
  | 'investigate-lead'
  | 'business-planning'
  | 'combat-spells';

export interface SessionEvent {
  id: string;
  campaignId: string; // links to Campaign
  createdAt: string; // ISO timestamp
  hubId?: string;
  locationName?: string;
  mode: SessionMode;
  text: string;
  tags?: string[];
  linkedQuestIds?: string[];
  linkedLeadIds?: string[];
  linkedNpcIds?: string[];
  screenshotUrl?: string; // URL to screenshot image (base64 or file path)
}

export interface SessionContext {
  text: string; // latest "what just happened?"
  currentHubId?: string;
  currentLocationName?: string;
  mode: SessionMode;
  recentEvents?: SessionEvent[]; // last ~10 events for context
  openQuests: Quest[];
  openLeads: Lead[];
  npcs: NPC[];
  characterProfile?: CharacterProfile;
}

export interface NextOption {
  id: string;
  title: string;
  bullets: string[];
  source?: 'llm' | 'rules-fallback';
}

export interface CharacterProfile {
  id: string;
  campaignId: string; // links to Campaign
  name: string;
  classAndLevel: string; // e.g. "Paladin 5"
  race?: string;
  background?: string;
  alignment?: string;
  summary?: string; // free text: key spells, features, fighting style, etc.
  dndBeyondUrl?: string; // e.g. https://www.dndbeyond.com/characters/...
  createdAt: number;
  updatedAt: number;
}
