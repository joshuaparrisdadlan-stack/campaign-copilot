import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';

interface HandoffSummaryProps {
  eventCount?: number;
}

export function HandoffSummary({ eventCount = 20 }: HandoffSummaryProps) {
  const { sessionEvents, hubs, quests, leads, activeHubId } = useCampaign();
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [customEventCount, setCustomEventCount] = useState(eventCount);
  const [summary, setSummary] = useState<{
    whatHappened: string[];
    openThreads: string[];
    nextSessionPriorities: string[];
  } | null>(null);

  const activeHub = activeHubId ? hubs.find(h => h.id === activeHubId) : null;
  const recentEvents = sessionEvents.slice(0, customEventCount);
  const openQuests = quests.filter(q => q.status !== 'Resolved');
  const openLeads = leads.filter(l => l.status !== 'Resolved');
  const hubQuests = activeHubId 
    ? openQuests.filter(q => q.hubId === activeHubId)
    : openQuests;
  const hubLeads = activeHubId
    ? openLeads.filter(l => l.hubId === activeHubId)
    : openLeads;

  const exportSummary = () => {
    if (!summary) return;
    
    const markdown = `# Session Handoff Summary
${activeHub ? `**Hub:** ${activeHub.name}\n` : ''}**Generated:** ${new Date().toLocaleString()}

## What Just Happened
${summary.whatHappened.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

## Open Threads ${activeHub ? `in ${activeHub.name}` : ''}
${summary.openThreads.map((item) => `- ${item}`).join('\n')}

## Top 3 Priorities for Next Session
${summary.nextSessionPriorities.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handoff-summary-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    
    // TODO: If useAI is true, call backend API for AI-enhanced summary
    // For now, always use rule-based
    if (useAI) {
      // Future: Call /api/session-summary endpoint
      console.log('AI summary not yet implemented, using rule-based');
    }
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
      const whatHappened: string[] = [];
      const openThreads: string[] = [];
      const nextSessionPriorities: string[] = [];

      // Extract key events (most recent first, limit to 5)
      const keyEvents = recentEvents.slice(0, 5);
      keyEvents.forEach(event => {
        const preview = event.text.length > 100 
          ? event.text.substring(0, 100) + '...'
          : event.text;
        whatHappened.push(preview);
      });

      // Open threads in current hub
      hubQuests.forEach(quest => {
        openThreads.push(`Quest: ${quest.title} (${quest.status})`);
      });

      hubLeads.forEach(lead => {
        if (lead.status !== 'Resolved') {
          openThreads.push(`Lead: ${lead.title} (${lead.status})`);
        }
      });

      // Generate priorities (simple rule-based)
      if (hubLeads.length > 0) {
        const topLead = hubLeads.sort((a, b) => (b.importance || 0) - (a.importance || 0))[0];
        nextSessionPriorities.push(`Follow up on lead: "${topLead.title}"`);
      }

      if (hubQuests.length > 0) {
        const inProgressQuest = hubQuests.find(q => q.status === 'In Progress');
        if (inProgressQuest) {
          nextSessionPriorities.push(`Continue quest: "${inProgressQuest.title}"`);
        } else {
          const topQuest = hubQuests[0];
          nextSessionPriorities.push(`Start or investigate: "${topQuest.title}"`);
        }
      }

      // Add a general priority if we have recent events
      if (recentEvents.length > 0) {
        const lastEvent = recentEvents[0];
        if (lastEvent.mode === 'investigate-lead' || lastEvent.mode === 'interrogate-npc') {
          nextSessionPriorities.push('Continue investigation based on recent discoveries');
        }
      }

      // Ensure we have at least 3 priorities
      while (nextSessionPriorities.length < 3 && (hubQuests.length > 0 || hubLeads.length > 0)) {
        if (hubQuests.length > nextSessionPriorities.length) {
          nextSessionPriorities.push(`Review quest: "${hubQuests[nextSessionPriorities.length].title}"`);
        } else if (hubLeads.length > nextSessionPriorities.length - hubQuests.length) {
          const leadIdx = nextSessionPriorities.length - hubQuests.length;
          nextSessionPriorities.push(`Check lead: "${hubLeads[leadIdx].title}"`);
        } else {
          break;
        }
      }

      setSummary({
        whatHappened: whatHappened.length > 0 ? whatHappened : ['No recent events recorded.'],
        openThreads: openThreads.length > 0 ? openThreads : ['No open threads in current hub.'],
        nextSessionPriorities: nextSessionPriorities.length > 0 
          ? nextSessionPriorities.slice(0, 3)
          : ['Review session timeline', 'Check for new quests or leads', 'Plan next steps'],
      });

      setIsGenerating(false);
    }, 300);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-100">Handoff Summary</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Events:</label>
            <input
              type="number"
              min="5"
              max="50"
              value={customEventCount}
              onChange={(e) => setCustomEventCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
              className="w-16 px-2 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Use AI</span>
          </label>
          <button
            onClick={generateSummary}
            disabled={isGenerating || recentEvents.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>
          {summary && (
            <button
              onClick={exportSummary}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Export
            </button>
          )}
        </div>
      </div>

      {recentEvents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No events yet.</p>
          <p className="text-sm mt-2">Use "Suggest Next 3 Options" to create events, then generate a summary.</p>
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          {/* What Just Happened */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">What Just Happened</h3>
            <ul className="space-y-2">
              {summary.whatHappened.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 bg-gray-700 rounded p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Open Threads */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">
              Open Threads {activeHub && `in ${activeHub.name}`}
            </h3>
            <ul className="space-y-2">
              {summary.openThreads.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 bg-gray-700 rounded p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Session Priorities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Top 3 Priorities for Next Session</h3>
            <ol className="space-y-2">
              {summary.nextSessionPriorities.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 bg-gray-700 rounded p-3 flex items-start gap-2">
                  <span className="font-bold text-blue-400">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!summary && recentEvents.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Click "Generate Summary" to create a handoff summary.</p>
        </div>
      )}
    </div>
  );
}

