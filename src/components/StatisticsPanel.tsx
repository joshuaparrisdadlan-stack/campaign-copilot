import { useCampaign } from '../contexts/CampaignContext';
import { loadSessionNotes } from '../storage';

export function StatisticsPanel() {
  const { quests, npcs, businessIdeas } = useCampaign();
  const sessionNotes = loadSessionNotes();

  const stats = {
    totalQuests: quests.length,
    openQuests: quests.filter(q => q.status === 'Open').length,
    inProgressQuests: quests.filter(q => q.status === 'In Progress').length,
    resolvedQuests: quests.filter(q => q.status === 'Resolved').length,
    totalNPCs: npcs.length,
    totalBusinessIdeas: businessIdeas.length,
    sessionNotes: sessionNotes.length,
    uniqueLocations: new Set([
      ...quests.map(q => q.location),
      ...npcs.map(n => n.location),
      ...businessIdeas.map(b => b.location),
    ]).size,
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Quests</p>
          <p className="text-3xl font-bold text-blue-400">{stats.totalQuests}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Open Quests</p>
          <p className="text-3xl font-bold text-green-400">{stats.openQuests}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.inProgressQuests}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Resolved</p>
          <p className="text-3xl font-bold text-gray-400">{stats.resolvedQuests}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">NPCs Met</p>
          <p className="text-3xl font-bold text-purple-400">{stats.totalNPCs}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Business Ideas</p>
          <p className="text-3xl font-bold text-indigo-400">{stats.totalBusinessIdeas}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Session Notes</p>
          <p className="text-3xl font-bold text-cyan-400">{stats.sessionNotes}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Locations</p>
          <p className="text-3xl font-bold text-pink-400">{stats.uniqueLocations}</p>
        </div>
      </div>
    </div>
  );
}


