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

export { router as aiRouter };

