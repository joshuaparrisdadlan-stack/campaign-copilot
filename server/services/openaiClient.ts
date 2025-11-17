// OpenAI API client for Campaign Copilot
import type { SessionContext, NextOption } from '../../src/types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Calls OpenAI API to generate next options
 */
export async function callOpenAI(context: SessionContext): Promise<NextOption[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(context);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI JSON response: ${error}`);
  }

  // Extract options array
  const options = parsed.options || parsed;
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('OpenAI response missing options array');
  }

  // Map to NextOption format
  return options.slice(0, 3).map((opt: any, idx: number) => ({
    id: opt.id || String(idx + 1),
    title: opt.title || 'Option',
    bullets: Array.isArray(opt.bullets) ? opt.bullets : [opt.explanation || 'No details'].flat(),
  }));
}

function buildSystemPrompt(context: SessionContext): string {
  const modeInstructions = getModeInstructions(context.mode);
  
  return `You are Campaign Copilot, an assistant helping a D&D 5e player think clearly about their next move in the current scene.

You are NOT the DM.
You do NOT know secret information, hidden monsters, or the DM's prep beyond what is given in the context.
You never narrate outcomes or reveal "what's really going on behind the scenes".

Your job is to:
- Suggest 3 strong, distinct options for what the player could do next.
- Help them decide:
  - Which lead to follow.
  - Which question to ask the DM or an NPC.
  - Which spell, class feature, or ability might be useful.
  - How to progress their business ventures (e.g. exotic butcher shop) in-character.
- Think in D&D 5e terms: actions, checks, spells, risk, resources, and story beats.

${modeInstructions}

Always:
- Stay grounded in the provided context.
- Treat all unknowns as genuinely unknown – encourage investigating or asking the DM.
- Respect the player's character concept, level, and class when suggesting spells/abilities.
- Keep your tone encouraging, practical, and concise.
- Never take over narrative control: the DM decides what happens, you only suggest.

You answer ONLY in JSON format with this exact structure:
{
  "options": [
    {
      "id": "1",
      "title": "Short title of the option",
      "bullets": ["First bullet point", "Second bullet point", "Third bullet point"]
    },
    {
      "id": "2",
      "title": "Another option title",
      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"]
    },
    {
      "id": "3",
      "title": "Third option title",
      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"]
    }
  ]
}

Return exactly 3 options. Each option should have a clear title and 2-4 bullet points explaining the idea.`;
}

function getModeInstructions(mode: SessionContext['mode']): string {
  switch (mode) {
    case 'interrogate-npc':
      return `CURRENT MODE: The player is currently talking to an NPC and wants the best next questions or conversational moves.
Focus on:
- Questions that reveal useful information
- Social tactics (Insight checks, Persuasion, Deception)
- Building rapport or detecting lies
- Following up on hints or inconsistencies`;
    
    case 'investigate-lead':
      return `CURRENT MODE: The player is following up an investigation lead and wants 3 concrete investigative actions.
Focus on:
- Where to look for evidence
- Who to talk to
- What ability checks might help (Investigation, Perception, Insight)
- Following physical or social clues`;
    
    case 'business-planning':
      return `CURRENT MODE: The player is thinking about in-world business/commerce/logistics.
Focus on:
- Steps to grow their business venture
- Securing licenses, partnerships, or resources
- Managing risk and logistics
- Balancing business with adventuring`;
    
    case 'combat-spells':
      return `CURRENT MODE: The player is in a D&D 5e combat scene and wants high-level tactical/spell ideas.
Focus on:
- Positioning and movement
- Spell selection based on situation
- Class features and abilities
- Protecting allies or controlling the battlefield
Do NOT give exact damage numbers; suggest concepts and tactics.`;
    
    default:
      return `CURRENT MODE: General exploration and decision-making.
Focus on balanced options that consider investigation, social interaction, and tactical choices.`;
  }
}

function buildUserPrompt(context: SessionContext): string {
  const parts: string[] = [];
  
  parts.push(`Latest session text: "${context.text}"`);
  
  if (context.currentLocationName) {
    parts.push(`Current location: ${context.currentLocationName}`);
  }
  
  // Add recent events context
  if (context.recentEvents && context.recentEvents.length > 0) {
    parts.push(`\nRecent events (for context):`);
    context.recentEvents.slice(0, 5).forEach((event, idx) => {
      const preview = event.text.length > 80 ? event.text.substring(0, 80) + '...' : event.text;
      parts.push(`${idx + 1}. [${event.mode}] ${preview}`);
    });
  }
  
  if (context.characterProfile) {
    parts.push(`\nCharacter: ${context.characterProfile.name}`);
    parts.push(`- ${context.characterProfile.classAndLevel}`);
    if (context.characterProfile.race) {
      parts.push(`- Race: ${context.characterProfile.race}`);
    }
    if (context.characterProfile.summary) {
      parts.push(`- Key abilities: ${context.characterProfile.summary}`);
    }
  }
  
  if (context.openQuests.length > 0) {
    parts.push(`\nOpen quests:`);
    context.openQuests.slice(0, 5).forEach(quest => {
      parts.push(`- ${quest.title} (${quest.status}) - ${quest.location}`);
    });
  }
  
  if (context.openLeads.length > 0) {
    parts.push(`\nOpen leads (by importance):`);
    context.openLeads
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 5)
      .forEach(lead => {
        parts.push(`- ${lead.title} (Priority ${lead.importance || '?'}): ${lead.summary}`);
      });
  }
  
  if (context.npcs.length > 0) {
    parts.push(`\nKey NPCs in area:`);
    context.npcs.slice(0, 10).forEach(npc => {
      parts.push(`- ${npc.name} (${npc.role}) - ${npc.location}`);
    });
  }
  
  return parts.join('\n');
}

