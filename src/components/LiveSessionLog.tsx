import { useState, useRef, useEffect } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';

const QUICK_TAGS = [
  'Combat', 'Social', 'Exploration', 'Discovery',
  'Death', 'Victory', 'Betrayal', 'Twist',
  'Insight', 'Mystery', 'Resource', 'Injury'
];

export function LiveSessionLog() {
  const { sessionEvents, addSessionEvent, quests, npcs, leads } = useCampaign();
  const { showSuccess } = useToast();
  const [quickEntry, setQuickEntry] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Quick templates for common session events
  const TEMPLATES = [
    { label: 'Combat Round', text: 'Initiative called. ' },
    { label: 'NPC Interaction', text: 'Talked to ' },
    { label: 'Discovery', text: 'Found out: ' },
    { label: 'Decision Point', text: 'Group decided to ' },
    { label: 'Plot Twist', text: 'Unexpected: ' },
    { label: 'Failed Check', text: 'Failed a ' },
  ];

  const handleQuickAdd = () => {
    if (!quickEntry.trim()) return;

    // Auto-detect linked entities
    const linkedQuestIds: string[] = [];
    const linkedNpcIds: string[] = [];
    const linkedLeadIds: string[] = [];

    const textLower = quickEntry.toLowerCase();

    // Find mentioned quests
    quests.forEach(q => {
      if (textLower.includes(q.title.toLowerCase())) {
        linkedQuestIds.push(q.id);
      }
    });

    // Find mentioned NPCs
    npcs.forEach(n => {
      if (textLower.includes(n.name.toLowerCase())) {
        linkedNpcIds.push(n.id);
      }
    });

    // Find mentioned leads
    leads.forEach(l => {
      if (textLower.includes(l.title.toLowerCase())) {
        linkedLeadIds.push(l.id);
      }
    });

    // Add event
    addSessionEvent({
      text: quickEntry,
      mode: 'default',
      tags: selectedTags,
      linkedQuestIds,
      linkedNpcIds,
      linkedLeadIds,
    });

    showSuccess(`Event logged${selectedTags.length > 0 ? ` [${selectedTags.join(', ')}]` : ''}`);
    setQuickEntry('');
    setSelectedTags([]);
    inputRef.current?.focus();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const applyTemplate = (template: { label: string; text: string }) => {
    setQuickEntry(template.text);
    setShowTemplates(false);
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(template.text.length, template.text.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAdd();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-100">Live Log</h3>
        <span className="text-xs text-gray-500">{sessionEvents.length} events</span>
      </div>

      {/* Quick Entry */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={quickEntry}
              onChange={(e) => setQuickEntry(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What just happened? (Enter to log)"
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              aria-label="Quick event entry"
            />
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={!quickEntry.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            aria-label="Log event"
          >
            Log
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-2 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
            title="Quick templates"
            aria-label="Show templates"
          >
            📋
          </button>
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-750 rounded-lg border border-gray-600">
            {TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => applyTemplate(template)}
                className="text-left px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                {template.label}
              </button>
            ))}
          </div>
        )}

        {/* Quick Tags */}
        <div className="flex flex-wrap gap-1">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="border-t border-gray-700 pt-3">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sessionEvents.slice().reverse().slice(0, 5).map((event, idx) => (
            <div
              key={event.id}
              className="text-xs bg-gray-750 rounded p-2 border-l-2 border-blue-500"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-gray-200 line-clamp-2">{event.text}</p>
                <span className="text-gray-500 ml-2 whitespace-nowrap text-right">
                  {idx === 0 ? 'now' : idx === 1 ? '1 ago' : `${idx} ago`}
                </span>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-blue-900 text-blue-200 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {sessionEvents.length === 0 && (
            <p className="text-center text-gray-500 text-xs py-2">No events logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
