// AI Service for Campaign Copilot
// Handles OpenAI API calls with rule-based fallback
import type { SessionContext, NextOption } from '../../src/types';
import { generateNextOptions } from '../../src/logic/nextOptionsEngine';
import { callOpenAI } from './openaiClient';

/**
 * Gets next options using OpenAI if available, otherwise falls back to rule-based engine
 */
export async function getNextOptions(context: SessionContext): Promise<NextOption[]> {
  // Try OpenAI first if API key is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const options = await callOpenAI(context);
      if (options && options.length > 0) {
        return options.map(opt => ({ ...opt, source: 'llm' as const }));
      }
    } catch (error) {
      console.warn('OpenAI API failed, falling back to rules:', error);
      // Fall through to rule-based engine
    }
  }

  // Fallback to rule-based engine
  const ruleOptions = generateNextOptions(context);
  return ruleOptions.map(opt => ({ ...opt, source: 'rules-fallback' as const }));
}

