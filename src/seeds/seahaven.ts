// Seahaven Seed Data for Campaign Copilot
import type { Hub, NPC, Quest, Lead } from '../types';
import { generateId } from '../utils/id';

const now = Date.now();
const SEAHAVEN_CAMPAIGN_ID = 'seahaven-campaign';

export const seahavenHub: Hub = {
  id: 'seahaven-hub',
  campaignId: SEAHAVEN_CAMPAIGN_ID,
  name: 'Seahaven',
  description: 'A coastal port town where sailors and travellers have been going missing, often at night, mostly from ships. The trade has suffered; the mayor is paranoid and may offer a reward for evidence. There is a storm coming; ships like the Sleek Sophia seek shelter behind rocks near the harbour.',
  tags: ['port', 'mystery', 'missing-people', 'storm'],
  defaultLocationName: 'Seahaven',
  createdAt: now,
  updatedAt: now,
};

export const seahavenNPCs: NPC[] = [
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'John the Guard',
    role: 'Gate Guard',
    location: 'Seahaven - Main Gate',
    hubId: 'seahaven-hub',
    notes: 'Gives advice on hunters, mayor, markets',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Vitor',
    role: 'Fish/Food Stall Vendor',
    location: 'Seahaven - Market',
    hubId: 'seahaven-hub',
    notes: 'Warns about Quinn\'s Tavern',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Quinn',
    role: 'Tavern Owner',
    location: 'Seahaven - Quinn\'s Tavern',
    hubId: 'seahaven-hub',
    notes: 'Worried about missing regulars',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Saith',
    role: 'Local Contact',
    location: 'Seahaven',
    hubId: 'seahaven-hub',
    notes: 'Mentions missing travellers & dried fishing hole',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Telt',
    role: 'Shipwright Cook',
    location: 'Seahaven - Shipwright Area',
    hubId: 'seahaven-hub',
    notes: 'Spicy fish stew + rumours',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Breth',
    role: 'Maple-Sap Carpenter',
    location: 'Seahaven - North of Town',
    hubId: 'seahaven-hub',
    notes: 'Works with maple tapping',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Griff',
    role: 'Fisherman/Hunter',
    location: 'Seahaven - Fishing Hole Area',
    hubId: 'seahaven-hub',
    notes: 'Says the fishing hole is poisoned',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Naomi',
    role: 'Visiting Fisher',
    location: 'Seahaven',
    hubId: 'seahaven-hub',
    notes: 'Points to Griff',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Guard Captain',
    role: 'Guard Captain',
    location: 'Seahaven - Guard Station',
    hubId: 'seahaven-hub',
    notes: 'Overworked investigator of missing people',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    name: 'Mayor',
    role: 'Mayor',
    location: 'Seahaven - Mayor\'s Residence',
    hubId: 'seahaven-hub',
    notes: 'Paranoid, lives next to place of worship',
    createdAt: now,
    updatedAt: now,
  },
];

export const seahavenLeads: Lead[] = [
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    hubId: 'seahaven-hub',
    title: 'Missing Travellers near Seahaven',
    summary: 'Sailors and travellers have been going missing, often at night, mostly from ships',
    status: 'Open',
    importance: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    hubId: 'seahaven-hub',
    title: 'Dried/Fouled Fishing Hole North of Town',
    summary: 'The fishing hole north of Seahaven has dried up or been fouled. Griff suspects poisoning',
    status: 'Open',
    importance: 4,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    hubId: 'seahaven-hub',
    title: 'Alchemist vs Maple Tappers Conflict',
    summary: 'Tension between alchemists and maple tappers in the area',
    status: 'Open',
    importance: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    hubId: 'seahaven-hub',
    title: 'Maple Tapping Job Tomorrow Morning',
    summary: 'Work opportunity: maple tapping expedition tomorrow at first light',
    status: 'Open',
    importance: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    hubId: 'seahaven-hub',
    title: 'Storm Tonight & The Sleek Sophia at Anchor',
    summary: 'A storm is coming tonight. The ship Sleek Sophia seeks shelter behind rocks near the harbour',
    status: 'Open',
    importance: 4,
    createdAt: now,
    updatedAt: now,
  },
];

export const seahavenQuests: Quest[] = [
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    title: 'Investigate Missing Sailors',
    location: 'Seahaven',
    hubId: 'seahaven-hub',
    status: 'Open',
    description: 'Find out what\'s happening to the missing sailors and travellers',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    campaignId: SEAHAVEN_CAMPAIGN_ID,
    title: 'Investigate Fishing Hole',
    location: 'Seahaven - North',
    hubId: 'seahaven-hub',
    status: 'Open',
    description: 'Discover why the fishing hole has dried up or been fouled',
    createdAt: now,
    updatedAt: now,
  },
];

export interface SeahavenSeedData {
  hub: Hub;
  npcs: NPC[];
  leads: Lead[];
  quests: Quest[];
}

export function loadSeahavenSeed(): SeahavenSeedData {
  return {
    hub: seahavenHub,
    npcs: seahavenNPCs,
    leads: seahavenLeads,
    quests: seahavenQuests,
  };
}

