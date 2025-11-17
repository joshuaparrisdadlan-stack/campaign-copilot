// Rule-based Next Options Engine for Campaign Copilot
// This provides intelligent suggestions based on session context, hubs, leads, and quests
import type { SessionContext, NextOption } from '../types';
import { generateId } from '../utils/id';

/**
 * Generates 3 next options based on session context using rule-based heuristics.
 * This is a placeholder that will be replaced by LLM calls in a future version.
 * 
 * @param ctx - Session context including text, hub, quests, leads, and NPCs
 * @returns Array of exactly 3 next options
 */
export function generateNextOptions(ctx: SessionContext): NextOption[] {
  const text = ctx.text.toLowerCase();
  const options: NextOption[] = [];

  // Rule 1: Keyword-based suggestions (Seahaven-aware)
  if (text.includes('ship') || text.includes('sleek sophia') || text.includes('captain') || text.includes('crew')) {
    options.push({
      id: generateId(),
      title: 'Investigate the Ship Situation',
      bullets: [
        'Talk to the captain about recent events',
        'Check the crew roster and see who\'s missing',
        'Inspect the ship for any suspicious activity',
        'Set up a night watch if the Sleek Sophia is at anchor'
      ]
    });
  }

  if (text.includes('missing') || text.includes('disappeared') || text.includes('gone')) {
    options.push({
      id: generateId(),
      title: 'Follow Up on Missing Persons',
      bullets: [
        'Ask NPCs about recent disappearances (Guard Captain, Quinn, Vitor)',
        'Check the quest log for related investigations',
        'Gather information from guards or authorities',
        'Look for patterns: time of day, location, who was last seen with them'
      ]
    });
  }

  if (text.includes('fishing') || text.includes('hole') || text.includes('water') || text.includes('griff') || text.includes('naomi')) {
    options.push({
      id: generateId(),
      title: 'Investigate the Fishing Hole',
      bullets: [
        'Visit Griff and Naomi to learn more about the dried/fouled fishing hole',
        'Inspect the fishing hole north of town for signs of foul play',
        'Check for tracks, unusual substances, or environmental clues',
        'Ask about who might have access to poison or alchemical substances'
      ]
    });
  }

  if (text.includes('mayor') || text.includes('paranoid')) {
    options.push({
      id: generateId(),
      title: 'Visit the Mayor',
      bullets: [
        'Ask about recent disappearances and any reward for evidence',
        'Inquire about dreams or premonitions if the mayor seems troubled',
        'Combine business license talk with mystery investigation',
        'Check the place of worship next to the mayor\'s residence'
      ]
    });
  }

  if (text.includes('storm') || text.includes('weather')) {
    options.push({
      id: generateId(),
      title: 'Prepare for the Storm',
      bullets: [
        'Secure horses and wagon if you have them',
        'Plan watch shifts for the night',
        'Use the bad weather as cover or tension for investigation',
        'Check on the Sleek Sophia and other ships at anchor'
      ]
    });
  }

  if (text.includes('business') || text.includes('venture') || text.includes('butcher') || text.includes('exotic')) {
    options.push({
      id: generateId(),
      title: 'Develop Business Venture',
      bullets: [
        'Review business ideas in your notes (exotic butchery)',
        'Talk to relevant NPCs about partnerships (hunters, fishmongers, shipwright cooks)',
        'Check what resources or permits you need from the mayor',
        'Consider cold storage and location options'
      ]
    });
  }

  if (text.includes('maple') || text.includes('sap') || text.includes('tapping') || text.includes('breth')) {
    options.push({
      id: generateId(),
      title: 'Follow Up on Maple Tapping',
      bullets: [
        'Talk to Breth about the maple tapping job tomorrow morning',
        'Investigate the conflict between alchemists and maple tappers',
        'Prepare for the expedition at first light',
        'Consider how this relates to other mysteries in Seahaven'
      ]
    });
  }

  // Rule 2: Check open leads (prioritize by importance)
  if (ctx.openLeads.length > 0) {
    const sortedLeads = [...ctx.openLeads]
      .filter(lead => lead.status === 'Open' || lead.status === 'In Progress')
      .sort((a, b) => (b.importance || 0) - (a.importance || 0));
    
    if (sortedLeads.length > 0) {
      const topLead = sortedLeads[0];
      options.push({
        id: generateId(),
        title: `Follow Up on Lead: ${topLead.title}`,
        bullets: [
          topLead.summary,
          'Review related NPCs and quests for this lead',
          'Decide on the best investigative approach',
          'Consider who to talk to or where to go next'
        ]
      });
    }
  }

  // Rule 3: Check open quests in current hub
  if (ctx.currentHubId && ctx.openQuests.length > 0) {
    const hubQuests = ctx.openQuests.filter(q => 
      (q.hubId === ctx.currentHubId || !q.hubId) && 
      (q.status === 'Open' || q.status === 'In Progress')
    );
    
    if (hubQuests.length > 0) {
      const quest = hubQuests[0];
      options.push({
        id: generateId(),
        title: `Follow Up on Quest: ${quest.title}`,
        bullets: [
          `Location: ${quest.location}`,
          quest.description || 'Review quest details and objectives',
          'Talk to NPCs related to this quest',
          'Check your notes for any clues or leads'
        ]
      });
    }
  }

  // Rule 4: Hub-specific NPC suggestions
  if (ctx.currentHubId && ctx.npcs.length > 0) {
    const hubNPCs = ctx.npcs.filter(npc => npc.hubId === ctx.currentHubId);
    if (hubNPCs.length > 0 && !text.includes('talk') && !text.includes('npc')) {
      const keyNPC = hubNPCs.find(npc => 
        npc.role.toLowerCase().includes('captain') || 
        npc.role.toLowerCase().includes('mayor') ||
        npc.role.toLowerCase().includes('guard')
      ) || hubNPCs[0];
      
      if (keyNPC) {
        options.push({
          id: generateId(),
          title: `Talk to ${keyNPC.name}`,
          bullets: [
            `${keyNPC.role} - ${keyNPC.location}`,
            keyNPC.notes || 'Gather information about current events',
            'Ask about recent developments and rumours',
            'See if they have leads on open quests'
          ]
        });
      }
    }
  }

  // Rule 5: Default suggestions if nothing specific matches
  if (options.length === 0) {
    options.push(
      {
        id: generateId(),
        title: 'Investigate Current Location',
        bullets: [
          `Explore ${ctx.currentLocationName || ctx.currentHubId || 'the area'}`,
          'Talk to local NPCs for information',
          'Look for clues or interesting locations',
          'Check your quest log and leads for things to follow up on'
        ]
      },
      {
        id: generateId(),
        title: 'Review Your Notes',
        bullets: [
          'Check your quest log for open items',
          'Review NPC relationships and information',
          'Look at open leads and prioritize by importance',
          'Update your notes with recent developments'
        ]
      },
      {
        id: generateId(),
        title: 'Ask the DM a Question',
        bullets: [
          'Clarify something about the current situation',
          'Ask about environmental details',
          'Inquire about character knowledge or history',
          'Check if there are any obvious leads you\'re missing'
        ]
      }
    );
  }

  // Always return exactly 3 options
  return options.slice(0, 3).map((opt, idx) => ({
    ...opt,
    id: String(idx + 1)
  }));
}

