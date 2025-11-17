import { useState, useEffect } from 'react';
import { getNextOptions } from '../aiClient';
import { saveSessionNote, saveCurrentLocation, loadCurrentLocation, loadSessionMode, saveSessionMode } from '../storage';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import type { NextOption, SessionContext, SessionMode } from '../types';

export function SessionPanel() {
  const { quests, npcs, leads, activeHubId, hubs, setActiveHubId, characterProfile, sessionEvents, addSessionEvent } = useCampaign();
  const { showError } = useToast();
  const [sessionText, setSessionText] = useState('');
  const [currentLocation, setCurrentLocation] = useState(loadCurrentLocation());
  const [suggestions, setSuggestions] = useState<NextOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>(loadSessionMode());

  const activeHub = activeHubId ? hubs.find(h => h.id === activeHubId) : null;

  // Save mode when it changes
  useEffect(() => {
    saveSessionMode(sessionMode);
  }, [sessionMode]);

  // Auto-suggest links based on text content
  const suggestLinks = (text: string) => {
    const textLower = text.toLowerCase();
    const suggestedQuestIds: string[] = [];
    const suggestedLeadIds: string[] = [];
    const suggestedNpcIds: string[] = [];
    const suggestedTags: string[] = [];

    // Find matching quests
    quests.forEach(quest => {
      if (textLower.includes(quest.title.toLowerCase()) || 
          (quest.description && textLower.includes(quest.description.toLowerCase()))) {
        suggestedQuestIds.push(quest.id);
      }
    });

    // Find matching leads
    leads.forEach(lead => {
      if (textLower.includes(lead.title.toLowerCase()) || 
          textLower.includes(lead.summary.toLowerCase())) {
        suggestedLeadIds.push(lead.id);
      }
    });

    // Find matching NPCs
    npcs.forEach(npc => {
      if (textLower.includes(npc.name.toLowerCase()) || 
          (npc.role && textLower.includes(npc.role.toLowerCase()))) {
        suggestedNpcIds.push(npc.id);
      }
    });

    // Suggest tags based on keywords
    const keywordTags: Record<string, string> = {
      'seahaven': 'Seahaven',
      'sleek sophia': 'Sleek Sophia',
      'mayor': 'Mayor',
      'ship': 'Ship',
      'missing': 'Missing',
      'fishing': 'Fishing',
      'storm': 'Storm',
      'business': 'Business',
      'maple': 'Maple',
      'combat': 'Combat',
      'spell': 'Spell',
    };

    Object.entries(keywordTags).forEach(([keyword, tag]) => {
      if (textLower.includes(keyword) && !suggestedTags.includes(tag)) {
        suggestedTags.push(tag);
      }
    });

    // Add hub name as tag if active
    if (activeHub && !suggestedTags.includes(activeHub.name)) {
      suggestedTags.push(activeHub.name);
    }

    return { suggestedQuestIds, suggestedLeadIds, suggestedNpcIds, suggestedTags };
  };

  const handleSuggestOptions = async () => {
    if (!sessionText.trim()) {
      showError('Please describe what happened first');
      return;
    }

    setIsLoading(true);
    try {
      // Auto-suggest links and tags
      const { suggestedQuestIds, suggestedLeadIds, suggestedNpcIds, suggestedTags } = suggestLinks(sessionText);

      // Create SessionEvent
      const event = addSessionEvent({
        hubId: activeHubId || undefined,
        locationName: currentLocation || activeHub?.defaultLocationName,
        mode: sessionMode,
        text: sessionText,
        tags: suggestedTags,
        linkedQuestIds: suggestedQuestIds,
        linkedLeadIds: suggestedLeadIds,
        linkedNpcIds: suggestedNpcIds,
      });

      // Save session note (for backward compatibility)
      saveSessionNote({
        id: event.id,
        text: sessionText,
        location: currentLocation,
        timestamp: new Date(event.createdAt).getTime()
      });

      // Get recent events (last 10) for context - include the new event
      const recentEvents = [event, ...sessionEvents].slice(0, 10);

      // Get suggestions
      const ctx: SessionContext = {
        text: sessionText,
        currentHubId: activeHubId || undefined,
        currentLocationName: currentLocation || activeHub?.defaultLocationName,
        mode: sessionMode,
        recentEvents,
        openQuests: quests.filter(q => q.status !== 'Resolved'),
        openLeads: leads.filter(l => l.status !== 'Resolved'),
        npcs,
        characterProfile: characterProfile || undefined,
      };

      const options = await getNextOptions(ctx);
      setSuggestions(options);
      
      // Clear session text after successful suggestion
      setSessionText('');
    } catch (error) {
      showError('Failed to get suggestions. Please try again.');
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location);
    saveCurrentLocation(location);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Session Brain</h2>
      
      {/* Hub Selector */}
      {hubs.length > 0 && (
        <div>
          <label htmlFor="hub-select" className="block text-sm font-medium text-gray-300 mb-2">
            Current Hub
          </label>
          <select
            id="hub-select"
            value={activeHubId || ''}
            onChange={(e) => {
              setActiveHubId(e.target.value || null);
              if (e.target.value) {
                const hub = hubs.find(h => h.id === e.target.value);
                if (hub?.defaultLocationName) {
                  handleLocationChange(hub.defaultLocationName);
                }
              }
            }}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select current hub"
          >
            <option value="">No hub selected</option>
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>
          {activeHub && activeHub.description && (
            <p className="text-xs text-gray-400 mt-1">{activeHub.description}</p>
          )}
        </div>
      )}

      {/* Location Input */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
          Current Location
        </label>
        <input
          id="location"
          type="text"
          value={currentLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder={activeHub?.defaultLocationName || "e.g. Seahaven, Grove Village, Two Weeks at Sea"}
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Current location"
        />
      </div>

      {/* Session Mode Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Session Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'default' as SessionMode, label: 'General' },
            { value: 'interrogate-npc' as SessionMode, label: 'NPC' },
            { value: 'investigate-lead' as SessionMode, label: 'Investigate' },
            { value: 'business-planning' as SessionMode, label: 'Business' },
            { value: 'combat-spells' as SessionMode, label: 'Combat/Spells' },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setSessionMode(mode.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                sessionMode === mode.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-pressed={sessionMode === mode.value}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session Text Input */}
      <div>
        <label htmlFor="session-text" className="block text-sm font-medium text-gray-300 mb-2">
          What just happened?
        </label>
        <textarea
          id="session-text"
          value={sessionText}
          onChange={(e) => setSessionText(e.target.value)}
          placeholder="Describe the most recent development or situation..."
          rows={6}
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          aria-label="Describe what just happened in the session"
          aria-required="true"
        />
      </div>

      {/* Suggest Button */}
      <button
        onClick={handleSuggestOptions}
        disabled={isLoading || !sessionText.trim()}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] flex items-center justify-center"
        aria-label="Get AI suggestions for next actions"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Thinking...</span>
          </span>
        ) : (
          'Suggest Next 3 Options'
        )}
      </button>

      {/* Suggestions Output */}
      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4 animate-fadeIn" role="region" aria-label="AI suggestions">
          <h3 className="text-xl font-semibold text-gray-200">Suggestions:</h3>
          <ol className="space-y-4" aria-label="List of suggested actions">
            {suggestions.map((option, idx) => (
              <li key={option.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-blue-400">
                    {idx + 1}. {option.title}
                  </h4>
                  {option.source && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      option.source === 'llm' ? 'bg-green-600' : 'bg-yellow-600'
                    } text-white`} title={option.source === 'llm' ? 'Generated by AI' : 'Rule-based suggestion'}>
                      {option.source === 'llm' ? 'AI' : 'Rules'}
                    </span>
                  )}
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-300" aria-label={`Details for ${option.title}`}>
                  {option.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx}>{bullet}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {/* Empty state when no suggestions yet */}
      {!isLoading && suggestions.length === 0 && sessionText.trim() && (
        <div className="mt-6 text-center py-4" role="status" aria-live="polite">
          <p className="text-gray-400 text-sm">Click "Suggest Next 3 Options" to get AI-powered suggestions based on your session notes.</p>
        </div>
      )}
    </div>
  );
}
