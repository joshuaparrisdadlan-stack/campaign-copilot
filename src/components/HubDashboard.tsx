import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';

interface HubTimer {
  id: string;
  hubId: string;
  name: string;
  description?: string;
  createdAt: Date;
  durationMinutes: number;
  isActive: boolean;
}

export function HubDashboard() {
  const { hubs, activeHubId, quests, npcs, leads, businessIdeas } = useCampaign();
  const [hubTimers, setHubTimers] = useState<HubTimer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState(60);

  const activeHub = activeHubId ? hubs.find(h => h.id === activeHubId) : null;

  if (!activeHub) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
        <p>Select a hub from the Session Brain to view its dashboard</p>
      </div>
    );
  }

  // Get hub-specific entities
  const hubQuests = quests.filter(q => q.hubId === activeHub.id);
  const hubNPCs = npcs.filter(n => n.location === activeHub.defaultLocationName);
  const hubBusinesses = businessIdeas.filter(b => b.location === activeHub.defaultLocationName);
  const hubLeads = leads.filter(l => l.hubId === activeHub.id);

  // Calculate hub progress
  const resolvedQuests = hubQuests.filter(q => q.status === 'Resolved').length;
  const questProgress = hubQuests.length > 0 ? Math.round((resolvedQuests / hubQuests.length) * 100) : 0;

  const resolvedLeads = hubLeads.filter(l => l.status === 'Resolved').length;
  const leadsProgress = hubLeads.length > 0 ? Math.round((resolvedLeads / hubLeads.length) * 100) : 0;

  const addTimer = () => {
    if (!newTimerName.trim()) return;

    const timer: HubTimer = {
      id: `timer-${Date.now()}`,
      hubId: activeHub.id,
      name: newTimerName,
      createdAt: new Date(),
      durationMinutes: newTimerMinutes,
      isActive: true,
    };

    setHubTimers([...hubTimers, timer]);
    setNewTimerName('');
  };

  const removeTimer = (timerId: string) => {
    setHubTimers(hubTimers.filter(t => t.id !== timerId));
  };

  const getTimerStatus = (timer: HubTimer) => {
    const elapsed = (Date.now() - timer.createdAt.getTime()) / (1000 * 60); // minutes
    const remaining = timer.durationMinutes - elapsed;

    if (remaining <= 0) {
      return { text: 'EXPIRED', color: 'bg-red-900 text-red-100' };
    } else if (remaining <= 5) {
      return { text: `${Math.ceil(remaining)}m left`, color: 'bg-orange-900 text-orange-100' };
    }
    return { text: `${Math.ceil(remaining)}m left`, color: 'bg-blue-900 text-blue-100' };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Hub Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-gray-100 mb-1">{activeHub.name}</h2>
        <p className="text-gray-400 text-sm">{activeHub.description}</p>
        {activeHub.tags && activeHub.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activeHub.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Quests */}
        <div className="bg-gray-750 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{hubQuests.length}</div>
          <div className="text-xs text-gray-400 mb-2">Quests</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${questProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{questProgress}% resolved</div>
        </div>

        {/* Leads */}
        <div className="bg-gray-750 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{hubLeads.length}</div>
          <div className="text-xs text-gray-400 mb-2">Leads</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${leadsProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{leadsProgress}% resolved</div>
        </div>

        {/* NPCs */}
        <div className="bg-gray-750 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{hubNPCs.length}</div>
          <div className="text-xs text-gray-400">NPCs Here</div>
          <div className="text-xs text-gray-500 mt-3">Met locally</div>
        </div>

        {/* Business */}
        <div className="bg-gray-750 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">{hubBusinesses.length}</div>
          <div className="text-xs text-gray-400">Business Ideas</div>
          <div className="text-xs text-gray-500 mt-3">Ventures here</div>
        </div>
      </div>

      {/* Timers Section */}
      <div className="bg-gray-750 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-100">Timers & Events</h3>

        {/* Add Timer */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTimerName}
            onChange={(e) => setNewTimerName(e.target.value)}
            placeholder="Event name (e.g. 'Guard patrol')"
            className="flex-1 px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addTimer()}
          />
          <input
            type="number"
            value={newTimerMinutes}
            onChange={(e) => setNewTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="480"
            className="w-16 px-2 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={addTimer}
            disabled={!newTimerName.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            Add
          </button>
        </div>

        {/* Timers List */}
        {hubTimers.length > 0 ? (
          <div className="space-y-2">
            {hubTimers.map((timer) => {
              const status = getTimerStatus(timer);
              return (
                <div
                  key={timer.id}
                  className="flex items-center justify-between bg-gray-700 rounded p-2"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-100">{timer.name}</div>
                    <div className="text-xs text-gray-400">Set {Math.round((Date.now() - timer.createdAt.getTime()) / 1000)}s ago</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                    {status.text}
                  </div>
                  <button
                    onClick={() => removeTimer(timer.id)}
                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove timer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No timers set</p>
        )}
      </div>

      {/* Connected Leads */}
      {hubLeads.length > 0 && (
        <div className="bg-gray-750 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-100">Active Leads</h3>
          <div className="space-y-2">
            {hubLeads.filter(l => l.status !== 'Resolved').slice(0, 5).map((lead) => (
              <div key={lead.id} className="text-sm bg-gray-700 rounded p-2">
                <div className="font-medium text-amber-300">{lead.title}</div>
                <div className="text-xs text-gray-400">{lead.summary}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Notes */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-700 pt-4">
        <p>Update your main Session Brain for quest changes and detailed notes</p>
      </div>
    </div>
  );
}
