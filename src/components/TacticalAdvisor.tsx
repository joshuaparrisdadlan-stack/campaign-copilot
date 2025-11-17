import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';

interface TacticalTip {
  id: string;
  title: string;
  description: string;
  category: 'spell' | 'action' | 'defense' | 'feature' | 'strategy';
  resourcesUsed?: string;
}

export function TacticalAdvisor() {
  const { characterProfile } = useCampaign();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tactics, setTactics] = useState<TacticalTip[]>([]);
  const [situationText, setSituationText] = useState('');

  if (!characterProfile) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
        <p>Add your character profile to get tactical advice</p>
      </div>
    );
  }

  const getTacticalAdvice = async () => {
    if (!situationText.trim()) {
      showError('Describe the combat situation');
      return;
    }

    setIsLoading(true);
    try {
      // Call backend for tactical suggestions
      const response = await fetch('/api/ai/tactical-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situationText,
          character: characterProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get tactical advice');
      }

      const data = await response.json();
      setTactics(data.tips || generateFallbackTactics(characterProfile, situationText));
      setSituationText('');
    } catch (error) {
      console.error('Tactical advice error:', error);
      // Fallback to rule-based tactics
      setTactics(generateFallbackTactics(characterProfile, situationText));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">Tactical Advisor</h2>

      {/* Character Summary */}
      <div className="bg-gray-750 rounded-lg p-3">
        <div className="text-sm">
          <p className="font-semibold text-gray-100">{characterProfile.name}</p>
          <p className="text-xs text-gray-400">{characterProfile.classAndLevel}</p>
        </div>
      </div>

      {/* Situation Input */}
      <div>
        <label htmlFor="situation" className="block text-sm font-medium text-gray-300 mb-2">
          What's the combat situation?
        </label>
        <textarea
          id="situation"
          value={situationText}
          onChange={(e) => setSituationText(e.target.value)}
          placeholder="e.g. 'Fighting 3 goblins. I have 2 first-level spells left. Ally is down to 5 HP.'"
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Get Advice Button */}
      <button
        onClick={getTacticalAdvice}
        disabled={isLoading || !situationText.trim()}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        aria-busy={isLoading}
      >
        {isLoading ? 'Analyzing...' : 'Get Tactical Tips'}
      </button>

      {/* Tactics Display */}
      {tactics.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-200">Suggested Actions:</h3>
          {tactics.map((tactic) => {
            const categoryColors: Record<string, string> = {
              spell: 'border-blue-500 bg-blue-900/20',
              action: 'border-green-500 bg-green-900/20',
              defense: 'border-orange-500 bg-orange-900/20',
              feature: 'border-purple-500 bg-purple-900/20',
              strategy: 'border-cyan-500 bg-cyan-900/20',
            };

            const categoryLabel: Record<string, string> = {
              spell: '✨ Spell',
              action: '⚡ Action',
              defense: '🛡️ Defense',
              feature: '🎭 Feature',
              strategy: '🎯 Strategy',
            };

            return (
              <div
                key={tactic.id}
                className={`rounded-lg border-l-4 p-3 ${categoryColors[tactic.category]}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-100">{tactic.title}</h4>
                  <span className="text-xs text-gray-400">{categoryLabel[tactic.category]}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{tactic.description}</p>
                {tactic.resourcesUsed && (
                  <div className="text-xs text-gray-400">
                    <strong>Resources:</strong> {tactic.resourcesUsed}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Tips */}
      {tactics.length === 0 && (
        <div className="bg-gray-750 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-100 text-sm">Combat Tips:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✓ Keep your character profile updated with current spells</li>
            <li>✓ Describe the enemy count and positioning for better advice</li>
            <li>✓ Mention ally status to get defense-focused suggestions</li>
            <li>✓ Include how many spell slots/features you have left</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Fallback tactic generation based on character class
function generateFallbackTactics(character: any, _situation: string): TacticalTip[] {
  const classLower = character.classAndLevel?.toLowerCase() || '';
  const tips: TacticalTip[] = [];

  // Generic tips
  tips.push({
    id: '1',
    title: 'Assess Resources',
    description: 'Check hit points, spell slots, and action uses. Conserve limited resources for critical moments.',
    category: 'strategy',
  });

  // Class-specific tips
  if (classLower.includes('wizard') || classLower.includes('sorcerer')) {
    tips.push({
      id: '2',
      title: 'Position Safely',
      description: 'Stay 60+ feet from enemies. Use allies as shields. Be ready to use Misty Step or similar if threatened.',
      category: 'strategy',
      resourcesUsed: 'Position-based',
    });
    tips.push({
      id: '3',
      title: 'Control the Battlefield',
      description: 'Use area control spells (Web, Entangle, Fireball) to manage multiple enemies or protect allies.',
      category: 'spell',
    });
  } else if (classLower.includes('fighter') || classLower.includes('barbarian')) {
    tips.push({
      id: '2',
      title: 'Protect Allies',
      description: 'Position between fragile allies and enemies. Use your AC advantage to draw attacks.',
      category: 'strategy',
    });
    tips.push({
      id: '3',
      title: 'Action Surge / Rage',
      description: 'Use powerful action abilities on your turn when you have advantage or multiple targets.',
      category: 'feature',
    });
  } else if (classLower.includes('rogue')) {
    tips.push({
      id: '2',
      title: 'Get Flanking Advantage',
      description: 'Position to flank enemies for Sneak Attack. Attack from stealth if possible.',
      category: 'strategy',
    });
    tips.push({
      id: '3',
      title: 'Evasion or Disengage',
      description: 'Use Disengage to reposition safely or Evasion to dodge area effects.',
      category: 'feature',
    });
  } else if (classLower.includes('cleric')) {
    tips.push({
      id: '2',
      title: 'Manage Healing',
      description: 'Treat healing as a resource. Use spell slots efficiently. Sometimes attacking is better than healing.',
      category: 'strategy',
    });
    tips.push({
      id: '3',
      title: 'Channel Divinity',
      description: 'Use Channel Divinity abilities for powerful turns without using spell slots.',
      category: 'feature',
    });
  }

  tips.push({
    id: '4',
    title: 'Communicate Tactics',
    description: 'Tell your allies what you plan to do. Coordination beats individual optimization.',
    category: 'strategy',
  });

  return tips;
}
