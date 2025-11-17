// AI API routes for Campaign Copilot
import { Router } from 'express';
import { getNextOptions } from '../services/aiService';

const router = Router();

router.post('/next-options', async (req, res) => {
  try {
    const incoming = req.body;

    // Validate minimal context
    if (!incoming || typeof incoming.text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid context. Expected { text: string, ... }' 
      });
    }

    // Normalize context with safe defaults for the rule engine
    const context = {
      text: incoming.text,
      currentHubId: incoming.currentHubId ?? null,
      currentLocationName: incoming.currentLocationName ?? '',
      openLeads: Array.isArray(incoming.openLeads) ? incoming.openLeads : [],
      openQuests: Array.isArray(incoming.openQuests) ? incoming.openQuests : [],
      npcs: Array.isArray(incoming.npcs) ? incoming.npcs : [],
    };

    const options = await getNextOptions(context as any);

    res.json({ 
      options,
      source: options[0]?.source || 'rules-fallback'
    });
  } catch (error) {
    console.error('Error in /api/next-options:', error);
    res.status(500).json({ 
      error: 'Failed to generate options',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/summarize-session', async (req, res) => {
  try {
    const { events, quests, npcs, activeHub } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing or invalid events array' });
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return fallback summary if no API key
      return res.json({ 
        summary: 'AI summaries require OpenAI API key. Please configure OPENAI_API_KEY environment variable.',
        source: 'fallback'
      });
    }

    // Build a summary prompt
    const recentEvents = events.slice(0, 10)
      .map((e: any) => typeof e === 'string' ? e : e.text || JSON.stringify(e))
      .join('\n- ');

    const openQuestsList = (quests || [])
      .filter((q: any) => q.status !== 'Resolved')
      .map((q: any) => `${q.title} (${q.status})`)
      .join(', ');

    const prompt = `You are a D&D 5e Dungeon Master's assistant. Generate a brief session handoff summary.

Recent Events:
- ${recentEvents || 'No events recorded'}

Open Quests: ${openQuestsList || 'None'}

${activeHub ? `Current Hub: ${activeHub.name}` : ''}

${npcs && npcs.length > 0 ? `NPCs Involved: ${npcs.slice(0, 5).map((n: any) => n.name).join(', ')}` : ''}

Generate a 2-3 paragraph session summary highlighting:
1. What happened (key moments)
2. Open threads and plot hooks
3. What to prepare for next session

Keep it concise and actionable for a busy DM.`;

    // Call OpenAI API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful D&D 5e session assistant. Generate clear, actionable session summaries for dungeon masters.' 
          },
          { 
            role: 'user', 
            content: prompt 
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const summary = data.choices?.[0]?.message?.content || 'Failed to generate summary';

    res.json({ 
      summary,
      source: 'openai'
    });
  } catch (error) {
    console.error('Error in /api/summarize-session:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRouter };

