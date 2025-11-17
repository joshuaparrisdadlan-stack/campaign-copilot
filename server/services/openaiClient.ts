// OpenAI-compatible LLM client for Campaign Copilot
// Note: the app may use different providers (OpenAI or Groq's OpenAI-compatible API).
// This module implements the OpenAI-compatible call path.
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
  const structuredContext = buildPromptContext(context);

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
        { role: 'user', content: `CONTEXT_JSON:\n${structuredContext}\n\nSUMMARY:\n${userPrompt}` },
      ],
      temperature: 0.7,
      // Use function calling to strongly encourage a structured JSON response
      functions: [
        {
          name: 'return_options',
          description: 'Return exactly 3 option objects as JSON according to the documented schema',
          parameters: {
            type: 'object',
            properties: {
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    bullets: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['id', 'title', 'bullets']
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ['options']
          }
        }
      ],
      function_call: { name: 'return_options' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // The model may return a function_call with arguments containing the JSON
  const message = data.choices[0]?.message || {};
  let raw = '';
  if (message.function_call && message.function_call.arguments) {
    raw = message.function_call.arguments;
  } else if (message.content) {
    raw = message.content;
  }

  if (!raw) {
    throw new Error('No content in OpenAI response');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
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

// `buildPromptContext` is exported later in this file; the earlier duplicate
// definition was removed to avoid a duplicate-symbol build error.

function buildSystemPrompt(context: SessionContext): string {
  const modeInstructions = getModeInstructions(context.mode);
  const loreContext = buildSeahavenLoreContext(context);
  
  return `You are Campaign Copilot, an AI assistant helping a D&D 5e Dungeon Master and player think clearly about the next move in a live session.

You are NOT the DM and do NOT know hidden information.
You never narrate outcomes or reveal what's behind the scenes.

## YOUR JOB

Generate 3 **strong, distinct options** for what could happen next or what the player should do. Help them decide:
- Which lead to follow or investigation to pursue
- Which question to ask an NPC or the DM
- Which spell, ability, or tactical maneuver to use
- How to progress business ventures or interpersonal goals
- What risks are present and how to mitigate them

## D&D 5e CONTEXT

Think in terms of:
- **Actions:** What can the character actually do? (action, bonus action, reaction, movement)
- **Spells & Abilities:** Suggest options that fit the character's level, class, and known capabilities
- **Checks:** What ability checks would help? (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma + skills)
- **Resources:** Track spell slots, hit points, class features, and limited-use abilities
- **Risk:** Consider consequences, difficulty, and what could go wrong
- **Factions:** Understand that NPCs have allegiances and motivations that create tension
- **Narrative Momentum:** Help maintain pacing and story tension

${loreContext}

${modeInstructions}

## GUIDELINES

✓ Ground suggestions in the provided context only
✓ Treat unknowns as genuinely unknown—encourage asking the DM
✓ Respect character level, class, and abilities when suggesting tactics
✓ Suggest **concrete, actionable options** (not vague ideas)
✓ Keep tone encouraging, practical, and concise
✓ Never take narrative control—the DM decides outcomes
✓ Vary suggestions: social, tactical, investigative, and exploratory options

## OUTPUT FORMAT

You answer ONLY in JSON format with this exact structure:
{
  "options": [
    {
      "id": "1",
      "title": "Clear, actionable title",
      "bullets": ["Specific action or approach", "Expected outcome or check", "Why this might work"]
    },
    { "id": "2", "title": "...", "bullets": [...] },
    { "id": "3", "title": "...", "bullets": [...] }
  ]
}

Return exactly 3 options. Each has a title and 2-4 specific bullet points.`;
}

function buildSeahavenLoreContext(context: SessionContext): string {
  // If the session is in or mentions Seahaven, add campaign-specific lore
  const text = context.text?.toLowerCase() || '';
  const location = context.currentLocationName?.toLowerCase() || '';
  
  const isSeahaven = text.includes('seahaven') || location.includes('seahaven');
  
  if (!isSeahaven) {
    return '';
  }
  
  return `## SEAHAVEN CONTEXT

Seahaven is a coastal trading hub with multiple factions and interests:
- **The Harbor Guard:** Organized, loyal to the mayor's office
- **Merchant Guilds:** Competitive, focused on trade routes and profit
- **Fishing Community:** Tight-knit, suspicious of outsiders, central to economy
- **Underworld Elements:** Smuggling, organized crime, blackmail
- **Exotic Imports:** Pet trade, rare goods, dangerous shipments

Key Themes in Seahaven:
- **Resource Scarcity:** Food, water, skilled labor are competitive
- **Factions in Tension:** Different groups want conflicting things
- **Secrets:** Everyone has something to hide
- **Opportunity:** Quick fortunes or ruin possible for ambitious folks
- **Danger:** Sea monsters, shipwrecks, sabotage, and betrayal lurk`;
}

function getModeInstructions(mode: SessionContext['mode']): string {
  switch (mode) {
    case 'interrogate-npc':
      return `## INTERROGATE-NPC MODE

The player is talking to an NPC. Suggest **conversational tactics** and **questions**:
- Questions that extract useful information without being obvious
- Social tactics: Insight checks, Persuasion, Deception, Intimidation
- Body language clues: How does the NPC react to questions?
- Building rapport or detecting lies
- Extracting hidden information through clever questions
- Understanding the NPC's motivations and what they want
- Following up on evasions, contradictions, or hints

Prioritize:
1. Questions that move the story forward
2. Checks that feel natural in conversation
3. Respect the NPC's agency—they have their own goals`;
    
    case 'investigate-lead':
      return `## INVESTIGATE-LEAD MODE

The player is following up a lead. Suggest **concrete investigative actions**:
- Specific locations to search and what to look for
- NPCs to interview and what to ask them
- Ability checks: Investigation, Perception, Arcana, History, Insight, etc.
- Following physical or social trails
- Gathering evidence that links pieces together
- Assessing credibility of information
- Identifying contradictions or inconsistencies
- Developing leads from clues

Prioritize:
1. Actions that uncover new information
2. Checks that feel earned (not trivial)
3. Multiple investigative paths (not just one solution)`;
    
    case 'business-planning':
      return `## BUSINESS-PLANNING MODE

The player is thinking about **in-world commerce, crafting, or ventures**:
- Concrete steps to establish or grow a business
- Securing licenses, partnerships, suppliers, or customers
- Managing logistics: inventory, transport, pricing
- Balancing business operations with adventuring
- Mitigating business risks and market competition
- Building reputation and customer loyalty
- Dealing with rivals, theft, or sabotage
- Reinvesting profits for growth

Prioritize:
1. Practical, realistic business steps
2. Narrative hooks and complications
3. Options that vary: expansion, defense, relationship-building`;
    
    case 'combat-spells':
      return `## COMBAT-SPELLS MODE

The player is in **active D&D 5e combat**. Suggest **tactical and spell ideas**:
- Positioning: How should the character move this turn?
- Spell selection: Which spell fits the situation? (respect known spells and slots)
- Class features and abilities: Action Surge, Bardic Inspiration, Channel Divinity, etc.
- Action economy: Action, bonus action, reaction, movement—what's optimal?
- Protecting allies or controlling the battlefield
- Suggested ability checks to accomplish actions
- Risk vs. reward of tactical choices

Prioritize:
1. Concrete tactical concepts (not damage numbers)
2. Respecting character abilities and resources
3. Options that vary: offense, defense, control, utility`;
    
    default:
      return `## GENERAL MODE

Balanced options considering multiple approaches:
- Investigation and discovery
- Social interaction and diplomacy
- Tactical positioning and resource management
- Narrative choices that affect story
- Mix of direct and creative problem-solving`;
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

// Exported for testing
export function buildPromptContext(context: SessionContext) {
  // Build a compact structured JSON to give the model machine-readable context
  const ctx = {
    id: context.sessionId || undefined,
    mode: context.mode || 'default',
    location: context.currentLocationName || null,
    text: context.text || '',
    character: context.characterProfile ? {
      id: context.characterProfile.id,
      name: context.characterProfile.name,
      classAndLevel: context.characterProfile.classAndLevel,
      race: context.characterProfile.race,
      summary: context.characterProfile.summary,
      dndBeyondUrl: context.characterProfile.dndBeyondUrl || null,
    } : null,
    openQuests: (context.openQuests || []).slice(0, 10).map(q => ({ id: q.id, title: q.title, status: q.status, location: q.location })),
    openLeads: (context.openLeads || []).slice(0, 10).map(l => ({ id: l.id, title: l.title, importance: l.importance })),
    npcs: (context.npcs || []).slice(0, 20).map(n => ({ id: n.id, name: n.name, role: n.role, location: n.location })),
    recentEvents: (context.recentEvents || []).slice(0, 10).map(e => ({ id: e.id, mode: e.mode, text: e.text })),
  };

  return JSON.stringify(ctx);
}

