import type { CampaignData } from './exportData';
import { loadCampaigns, loadQuests, loadNPCs, loadHubs, loadLeads, loadSessionEvents, loadCharacterProfile } from '../storage';
import { generateId } from '../utils/id';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateCampaignData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Import file is not a valid JSON object.');
    return { valid: false, errors, warnings };
  }

  const d = data as CampaignData;
  if (!d.campaign || !d.campaign.id) {
    errors.push('Missing `campaign` object or `campaign.id`.');
  }

  if (!Array.isArray(d.quests)) {
    warnings.push('`quests` is missing or not an array; treated as empty.');
  }
  if (!Array.isArray(d.npcs)) {
    warnings.push('`npcs` is missing or not an array; treated as empty.');
  }
  if (!Array.isArray(d.hubs)) {
    warnings.push('`hubs` is missing or not an array; treated as empty.');
  }

  // version check optional
  if (d && (d as any).version && typeof (d as any).version === 'string') {
    // allow, could add compatibility checks here
  }

  return { valid: errors.length === 0, errors, warnings };
}

export type ConflictSummary = {
  questsConflicts: number;
  npcsConflicts: number;
  hubsConflicts: number;
  leadsConflicts: number;
  characterConflict: boolean;
  details: string[];
};

export function computeConflicts(imported: CampaignData): ConflictSummary {
  const existingQuests = loadQuests();
  const existingNPCs = loadNPCs();
  const existingHubs = loadHubs();
  const existingLeads = loadLeads();
  const existingCharacter = loadCharacterProfile();

  const details: string[] = [];

  const questsConflicts = (imported.quests || []).filter(q => existingQuests.some(eq => eq.id === q.id)).length;
  if (questsConflicts) details.push(`${questsConflicts} quest(s) with colliding IDs`);

  const npcsConflicts = (imported.npcs || []).filter(n => existingNPCs.some(en => en.id === n.id)).length;
  if (npcsConflicts) details.push(`${npcsConflicts} NPC(s) with colliding IDs`);

  const hubsConflicts = (imported.hubs || []).filter(h => existingHubs.some(eh => eh.id === h.id)).length;
  if (hubsConflicts) details.push(`${hubsConflicts} hub(s) with colliding IDs`);

  const leadsConflicts = (imported.leads || []).filter(l => existingLeads.some(el => el.id === l.id)).length;
  if (leadsConflicts) details.push(`${leadsConflicts} lead(s) with colliding IDs`);

  const charConflict = !!(imported.characterProfile && existingCharacter && imported.characterProfile.id === existingCharacter.id);
  if (charConflict) details.push('Character profile ID collides with existing profile');

  return {
    questsConflicts,
    npcsConflicts,
    hubsConflicts,
    leadsConflicts,
    characterConflict: charConflict,
    details,
  };
}

export function resolveMerge(imported: CampaignData) {
  // Renames IDs in imported data when they collide with existing items by generating new IDs
  const existingQuests = loadQuests();
  const existingNPCs = loadNPCs();
  const existingHubs = loadHubs();
  const existingLeads = loadLeads();
  const existingEvents = loadSessionEvents();
  const existingCampaigns = loadCampaigns();
  const existingCharacter = loadCharacterProfile();

  const mapId: Record<string, string> = {};

  function ensureId(id?: string) {
    if (!id) return generateId();
    if (mapId[id]) return mapId[id];
    const collision = existingQuests.some(q => q.id === id) || existingNPCs.some(n => n.id === id) || existingHubs.some(h => h.id === id) || existingLeads.some(l => l.id === id) || existingEvents.some(e => e.id === id) || existingCampaigns.some(c => c.id === id) || (existingCharacter && existingCharacter.id === id);
    if (!collision) {
      mapId[id] = id;
      return id;
    }
    const newId = generateId();
    mapId[id] = newId;
    return newId;
  }

  const campaignId = ensureId(imported.campaign.id);

  const quests = (imported.quests || []).map(q => ({ ...q, id: ensureId(q.id), campaignId }));
  const npcs = (imported.npcs || []).map(n => ({ ...n, id: ensureId(n.id), campaignId }));
  const hubs = (imported.hubs || []).map(h => ({ ...h, id: ensureId(h.id), campaignId }));
  const leads = (imported.leads || []).map(l => ({ ...l, id: ensureId(l.id), campaignId }));
  const events = (imported.sessionEvents || []).map(e => ({ ...e, id: ensureId(e.id), campaignId }));
  const character = imported.characterProfile ? { ...imported.characterProfile, id: ensureId(imported.characterProfile.id), campaignId } : null;

  const newCampaign = { ...imported.campaign, id: campaignId };

  return {
    campaign: newCampaign,
    quests,
    npcs,
    hubs,
    leads,
    sessionEvents: events,
    characterProfile: character,
    currentLocation: imported.currentLocation || '',
  } as CampaignData;
}
