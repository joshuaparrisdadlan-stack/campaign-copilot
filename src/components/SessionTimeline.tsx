import { useState, useMemo } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import type { SessionEvent, SessionMode } from '../types';

interface SessionTimelineProps {
  maxEvents?: number;
}

export function SessionTimeline({ maxEvents = 20 }: SessionTimelineProps) {
  const { 
    sessionEvents, hubs, quests, leads, npcs, 
    updateSessionEvent, deleteSessionEvent,
    addQuest, addLead, setActiveHubId
  } = useCampaign();
  const { showSuccess } = useToast();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [linkingEventId, setLinkingEventId] = useState<string | null>(null);
  const [filterHubId, setFilterHubId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<SessionMode | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [displayCount, setDisplayCount] = useState(maxEvents);
  const [editingText, setEditingText] = useState('');
  const [editingMode, setEditingMode] = useState<SessionMode>('default');
  const [editingTags, setEditingTags] = useState('');
  const [linkQuestIds, setLinkQuestIds] = useState<Set<string>>(new Set());
  const [linkLeadIds, setLinkLeadIds] = useState<Set<string>>(new Set());
  const [linkNpcIds, setLinkNpcIds] = useState<Set<string>>(new Set());

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sessionEvents.forEach(event => {
      event.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [sessionEvents]);

  // Filter events with enhanced search
  const filteredEvents = useMemo(() => {
    let filtered = [...sessionEvents];

    if (filterHubId) {
      filtered = filtered.filter(e => e.hubId === filterHubId);
    }

    if (filterMode) {
      filtered = filtered.filter(e => e.mode === filterMode);
    }

    if (filterTag) {
      filtered = filtered.filter(e => e.tags?.includes(filterTag));
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(e => {
        // Search event text and tags
        if (e.text.toLowerCase().includes(searchLower) ||
            e.tags?.some(tag => tag.toLowerCase().includes(searchLower))) {
          return true;
        }
        // Search linked quest titles
        const linkedQuests = e.linkedQuestIds?.map(id => quests.find(q => q.id === id)).filter(Boolean) || [];
        if (linkedQuests.some(q => q.title.toLowerCase().includes(searchLower))) {
          return true;
        }
        // Search linked NPC names
        const linkedNPCs = e.linkedNpcIds?.map(id => npcs.find(n => n.id === id)).filter(Boolean) || [];
        if (linkedNPCs.some(n => n.name.toLowerCase().includes(searchLower))) {
          return true;
        }
        // Search linked lead titles
        const linkedLeads = e.linkedLeadIds?.map(id => leads.find(l => l.id === id)).filter(Boolean) || [];
        if (linkedLeads.some(l => l.title.toLowerCase().includes(searchLower))) {
          return true;
        }
        // Search hub names
        const hubName = hubs.find(h => h.id === e.hubId)?.name.toLowerCase();
        if (hubName?.includes(searchLower)) {
          return true;
        }
        return false;
      });
    }

    return filtered;
  }, [sessionEvents, filterHubId, filterMode, filterTag, searchText, quests, npcs, leads, hubs]);

  const displayedEvents = filteredEvents.slice(0, displayCount);

  // Event statistics
  const stats = useMemo(() => {
    const modeCounts: Record<SessionMode, number> = {
      'default': 0,
      'interrogate-npc': 0,
      'investigate-lead': 0,
      'business-planning': 0,
      'combat-spells': 0,
    };
    const hubCounts: Record<string, number> = {};
    
    sessionEvents.forEach(event => {
      modeCounts[event.mode]++;
      if (event.hubId) {
        hubCounts[event.hubId] = (hubCounts[event.hubId] || 0) + 1;
      }
    });

    return { modeCounts, hubCounts, total: sessionEvents.length };
  }, [sessionEvents, hubs]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getModeLabel = (mode: SessionMode) => {
    const labels: Record<SessionMode, string> = {
      'default': 'General',
      'interrogate-npc': 'NPC',
      'investigate-lead': 'Investigate',
      'business-planning': 'Business',
      'combat-spells': 'Combat/Spells',
    };
    return labels[mode];
  };

  const getModeColor = (mode: SessionMode) => {
    const colors: Record<SessionMode, string> = {
      'default': 'bg-blue-600',
      'interrogate-npc': 'bg-green-600',
      'investigate-lead': 'bg-yellow-600',
      'business-planning': 'bg-purple-600',
      'combat-spells': 'bg-red-600',
    };
    return colors[mode];
  };

  const getHubName = (hubId?: string) => {
    if (!hubId) return null;
    return hubs.find(h => h.id === hubId)?.name;
  };

  const handleEdit = (event: SessionEvent) => {
    setEditingEventId(event.id);
    setEditingText(event.text);
    setEditingMode(event.mode);
    setEditingTags(event.tags?.join(', ') || '');
    setExpandedEventId(event.id);
  };

  const handleSaveEdit = () => {
    if (!editingEventId) return;
    
    const tags = editingTags.split(',').map(t => t.trim()).filter(Boolean);
    updateSessionEvent(editingEventId, {
      text: editingText,
      mode: editingMode,
      tags,
    });
    
    setEditingEventId(null);
    setEditingText('');
    setEditingTags('');
    showSuccess('Event updated');
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditingText('');
    setEditingTags('');
  };

  const handleStartLinking = (event: SessionEvent) => {
    setLinkingEventId(event.id);
    setLinkQuestIds(new Set(event.linkedQuestIds || []));
    setLinkLeadIds(new Set(event.linkedLeadIds || []));
    setLinkNpcIds(new Set(event.linkedNpcIds || []));
    setExpandedEventId(event.id);
  };

  const handleSaveLinks = () => {
    if (!linkingEventId) return;
    
    updateSessionEvent(linkingEventId, {
      linkedQuestIds: Array.from(linkQuestIds),
      linkedLeadIds: Array.from(linkLeadIds),
      linkedNpcIds: Array.from(linkNpcIds),
    });
    
    setLinkingEventId(null);
    setLinkQuestIds(new Set());
    setLinkLeadIds(new Set());
    setLinkNpcIds(new Set());
    showSuccess('Links updated');
  };

  const handleCancelLinking = () => {
    setLinkingEventId(null);
    setLinkQuestIds(new Set());
    setLinkLeadIds(new Set());
    setLinkNpcIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedEventIds.size === 0) return;
    selectedEventIds.forEach(id => deleteSessionEvent(id));
    setSelectedEventIds(new Set());
    setBulkMode(false);
    showSuccess(`Deleted ${selectedEventIds.size} event${selectedEventIds.size > 1 ? 's' : ''}`);
  };

  const handleToggleSelect = (eventId: string) => {
    const newSelected = new Set(selectedEventIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEventIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEventIds.size === displayedEvents.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(displayedEvents.map(e => e.id)));
    }
  };

  const handleCreateQuestFromEvent = (event: SessionEvent) => {
    const questTitle = event.text.length > 50 ? event.text.substring(0, 50) + '...' : event.text;
    addQuest({
      title: questTitle,
      location: event.locationName || 'Unknown',
      hubId: event.hubId,
      status: 'Open',
      description: event.text,
    });
    showSuccess('Quest created from event');
  };

  const handleCreateLeadFromEvent = (event: SessionEvent) => {
    const leadTitle = event.text.length > 50 ? event.text.substring(0, 50) + '...' : event.text;
    if (!event.hubId) {
      showSuccess('Event must have a hub to create a lead');
      return;
    }
    addLead({
      title: leadTitle,
      hubId: event.hubId,
      summary: event.text,
      status: 'Open',
      importance: 3,
    });
    showSuccess('Lead created from event');
  };

  const handleJumpToHub = (hubId: string) => {
    setActiveHubId(hubId);
    showSuccess('Switched to hub');
  };

  const handleCopyEvent = (event: SessionEvent) => {
    const text = `${event.text}\n\nMode: ${getModeLabel(event.mode)}\nTime: ${formatTime(event.createdAt)}`;
    navigator.clipboard.writeText(text);
    showSuccess('Event copied to clipboard');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-100">Session Timeline</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedEventIds(new Set());
            }}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            {bulkMode ? 'Cancel' : 'Bulk'} Select
          </button>
          <span className="text-sm text-gray-400">
            {displayedEvents.length} of {filteredEvents.length} shown ({sessionEvents.length} total)
          </span>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Event Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
            </div>
            {Object.entries(stats.modeCounts).map(([mode, count]) => (
              <div key={mode}>
                <p className="text-xs text-gray-400 mb-1">{getModeLabel(mode as SessionMode)}</p>
                <p className="text-xl font-bold text-gray-100">{count}</p>
              </div>
            ))}
          </div>
          {Object.keys(stats.hubCounts).length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Events by Hub</p>
              <div className="space-y-1">
                {Object.entries(stats.hubCounts).map(([hubId, count]) => {
                  const hub = hubs.find(h => h.id === hubId);
                  return hub ? (
                    <div key={hubId} className="flex justify-between text-sm">
                      <span className="text-gray-300">{hub.name}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Hub Filter */}
          <select
            value={filterHubId || ''}
            onChange={(e) => setFilterHubId(e.target.value || null)}
            className="px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Hubs</option>
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>

          {/* Mode Filter */}
          <select
            value={filterMode || ''}
            onChange={(e) => setFilterMode(e.target.value as SessionMode || null)}
            className="px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Modes</option>
            <option value="default">General</option>
            <option value="interrogate-npc">NPC</option>
            <option value="investigate-lead">Investigate</option>
            <option value="business-planning">Business</option>
            <option value="combat-spells">Combat/Spells</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <input
            type="text"
            placeholder="Search events, quests, NPCs..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Bulk Actions */}
        {bulkMode && selectedEventIds.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
            <span className="text-sm text-gray-300">
              {selectedEventIds.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedEventIds(new Set())}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {displayedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No events found.</p>
            <p className="text-sm mt-2">Events will appear here when you use "Suggest Next 3 Options".</p>
          </div>
        ) : (
          <>
            {bulkMode && (
              <div className="mb-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {selectedEventIds.size === displayedEvents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
            {displayedEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const isEditing = editingEventId === event.id;
              const isLinking = linkingEventId === event.id;
              const isSelected = selectedEventIds.has(event.id);
              const hubName = getHubName(event.hubId);
              const linkedQuests = event.linkedQuestIds?.map(id => quests.find(q => q.id === id)).filter(Boolean) || [];
              const linkedLeads = event.linkedLeadIds?.map(id => leads.find(l => l.id === id)).filter(Boolean) || [];
              const linkedNPCs = event.linkedNpcIds?.map(id => npcs.find(n => n.id === id)).filter(Boolean) || [];

              return (
                <div
                  key={event.id}
                  className={`bg-gray-700 rounded-lg p-4 border transition-colors ${
                    isSelected ? 'border-blue-500 bg-gray-600' : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {bulkMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(event.id)}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-xs text-gray-400">{formatTime(event.createdAt)}</span>
                        <span className={`text-xs px-2 py-1 ${getModeColor(event.mode)} text-white rounded`}>
                          {getModeLabel(event.mode)}
                        </span>
                        {hubName && (
                          <span className="text-xs px-2 py-1 bg-gray-600 text-gray-200 rounded">
                            {hubName}
                          </span>
                        )}
                        {event.linkedQuestIds && event.linkedQuestIds.length > 0 && (
                          <span className="text-xs text-gray-400">
                            +{event.linkedQuestIds.length} quest{event.linkedQuestIds.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-600 text-sm"
                            rows={4}
                          />
                          <select
                            value={editingMode}
                            onChange={(e) => setEditingMode(e.target.value as SessionMode)}
                            className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-600 text-sm"
                          >
                            <option value="default">General</option>
                            <option value="interrogate-npc">NPC</option>
                            <option value="investigate-lead">Investigate</option>
                            <option value="business-planning">Business</option>
                            <option value="combat-spells">Combat/Spells</option>
                          </select>
                          <input
                            type="text"
                            value={editingTags}
                            onChange={(e) => setEditingTags(e.target.value)}
                            placeholder="Tags (comma-separated)"
                            className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded border border-gray-600 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-200 text-sm line-clamp-2">
                            {event.text}
                          </p>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.tags.map((tag, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setFilterTag(tag)}
                                  className="text-xs px-2 py-0.5 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded cursor-pointer"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex gap-2 ml-2 flex-wrap">
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                          className="text-xs px-2 py-1 text-blue-400 hover:text-blue-300"
                        >
                          {isExpanded ? 'Collapse' : 'View'}
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-xs px-2 py-1 text-yellow-400 hover:text-yellow-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSessionEvent(event.id)}
                          className="text-xs px-2 py-1 text-red-400 hover:text-red-300"
                          aria-label="Delete event"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && !isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                      <div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.text}</p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleCreateQuestFromEvent(event)}
                          className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
                        >
                          Create Quest
                        </button>
                        {event.hubId && (
                          <button
                            onClick={() => handleCreateLeadFromEvent(event)}
                            className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                          >
                            Create Lead
                          </button>
                        )}
                        {event.hubId && (
                          <button
                            onClick={() => handleJumpToHub(event.hubId!)}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            Jump to Hub
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyEvent(event)}
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleStartLinking(event)}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          {isLinking ? 'Cancel Linking' : 'Link Entities'}
                        </button>
                      </div>
                      
                      {/* Linking UI */}
                      {isLinking && (
                        <div className="bg-gray-800 rounded p-3 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-200">Link Entities</h4>
                          
                          {/* Link Quests */}
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Quests</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {quests.map(quest => (
                                <label key={quest.id} className="flex items-center gap-2 text-sm text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={linkQuestIds.has(quest.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(linkQuestIds);
                                      if (e.target.checked) {
                                        newSet.add(quest.id);
                                      } else {
                                        newSet.delete(quest.id);
                                      }
                                      setLinkQuestIds(newSet);
                                    }}
                                  />
                                  <span>{quest.title}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Link Leads */}
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Leads</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {leads.map(lead => (
                                <label key={lead.id} className="flex items-center gap-2 text-sm text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={linkLeadIds.has(lead.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(linkLeadIds);
                                      if (e.target.checked) {
                                        newSet.add(lead.id);
                                      } else {
                                        newSet.delete(lead.id);
                                      }
                                      setLinkLeadIds(newSet);
                                    }}
                                  />
                                  <span>{lead.title}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Link NPCs */}
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">NPCs</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {npcs.map(npc => (
                                <label key={npc.id} className="flex items-center gap-2 text-sm text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={linkNpcIds.has(npc.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(linkNpcIds);
                                      if (e.target.checked) {
                                        newSet.add(npc.id);
                                      } else {
                                        newSet.delete(npc.id);
                                      }
                                      setLinkNpcIds(newSet);
                                    }}
                                  />
                                  <span>{npc.name} ({npc.role})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveLinks}
                              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              Save Links
                            </button>
                            <button
                              onClick={handleCancelLinking}
                              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {linkedQuests.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">Linked Quests:</p>
                          <div className="flex flex-wrap gap-1">
                            {linkedQuests.map(quest => (
                              <span key={quest.id} className="text-xs px-2 py-1 bg-purple-600 text-white rounded">
                                {quest.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {linkedLeads.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">Linked Leads:</p>
                          <div className="flex flex-wrap gap-1">
                            {linkedLeads.map(lead => (
                              <span key={lead.id} className="text-xs px-2 py-1 bg-yellow-600 text-white rounded">
                                {lead.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {linkedNPCs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">Linked NPCs:</p>
                          <div className="flex flex-wrap gap-1">
                            {linkedNPCs.map(npc => (
                              <span key={npc.id} className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                                {npc.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Load More */}
      {filteredEvents.length > displayCount && (
        <div className="text-center">
          <button
            onClick={() => setDisplayCount(prev => prev + maxEvents)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Load More ({filteredEvents.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
