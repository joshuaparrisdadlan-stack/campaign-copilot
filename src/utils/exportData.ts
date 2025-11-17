import type { Quest, NPC, BusinessIdea, SessionNote, SessionEvent, Hub, Lead, CharacterProfile, Campaign } from '../types';

export interface CampaignData {
  campaign: Campaign;
  quests: Quest[];
  npcs: NPC[];
  businessIdeas: BusinessIdea[];
  sessionNotes: SessionNote[];
  sessionEvents: SessionEvent[];
  hubs: Hub[];
  leads: Lead[];
  characterProfile?: CharacterProfile;
  currentLocation: string;
  exportDate: number;
  version: string;
}

export function exportCampaignData(
  campaign: Campaign,
  quests: Quest[],
  npcs: NPC[],
  businessIdeas: BusinessIdea[],
  sessionNotes: SessionNote[],
  sessionEvents: SessionEvent[],
  hubs: Hub[],
  leads: Lead[],
  characterProfile?: CharacterProfile,
  currentLocation: string = ''
): string {
  const data: CampaignData = {
    campaign,
    quests,
    npcs,
    businessIdeas,
    sessionNotes,
    sessionEvents,
    hubs,
    leads,
    characterProfile,
    currentLocation,
    exportDate: Date.now(),
    version: '1.2',
  };

  return JSON.stringify(data, null, 2);
}

export function importCampaignData(jsonString: string): CampaignData | null {
  try {
    const data = JSON.parse(jsonString) as CampaignData;
    
    // Validate structure
    if (!data.quests || !data.npcs || !data.businessIdeas) {
      throw new Error('Invalid data structure');
    }

    // Handle legacy format (pre-v0.5, no campaign field)
    if (!data.campaign) {
      // Create a campaign from the export date or use a default name
      const campaignName = data.version === '1.1' || data.version === '1.0' 
        ? `Imported Campaign ${new Date(data.exportDate).toLocaleDateString()}`
        : 'Imported Campaign';
      
      data.campaign = {
        id: `imported-${Date.now()}`,
        name: campaignName,
        description: 'Imported from backup',
        createdAt: data.exportDate,
        updatedAt: Date.now(),
      };
    }

    return data;
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
}

export function downloadData(data: string, filename: string = 'campaign-copilot-backup.json') {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


