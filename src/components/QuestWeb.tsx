import { useCampaign } from '../contexts/CampaignContext';

interface QuestNode {
  id: string;
  name: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  relatedCount: number;
}

interface Connection {
  source: string;
  target: string;
  type: 'leads-to' | 'blocks' | 'rewards' | 'related';
}

export function QuestWeb() {
  const { quests } = useCampaign();

  // Build graph from quests
  const nodes: QuestNode[] = quests.map((q) => ({
    id: q.id,
    name: q.title,
    status: q.status,
    relatedCount: 0, // Simplified: would need additional data for connections
  }));

  const connections: Connection[] = [];
  // Simplified: no relation tracking yet
  quests.forEach((_q) => {
    // Placeholder for future relation tracking
  });

  const statusColors: Record<string, string> = {
    'Open': 'bg-blue-600 ring-blue-400',
    'In Progress': 'bg-green-600 ring-green-400',
    'Resolved': 'bg-green-600 ring-green-400',
  };

  const statusLabels: Record<string, string> = {
    'Open': '⭐ Open',
    'In Progress': '◯ In Progress',
    'Resolved': '✓ Resolved',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Quest Web</h2>
        <p className="text-sm text-gray-400">All quests and connections</p>
      </div>

      {nodes.length === 0 ? (
        <div className="bg-gray-750 rounded-lg p-8 text-center">
          <p className="text-gray-400">No quests yet. Create a quest to see the web.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-750 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{nodes.filter(n => n.status === 'Open').length}</p>
              <p className="text-xs text-gray-400">Open</p>
            </div>
            <div className="bg-gray-750 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{nodes.filter(n => n.status === 'In Progress').length}</p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
            <div className="bg-gray-750 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{nodes.filter(n => n.status === 'Resolved').length}</p>
              <p className="text-xs text-gray-400">Resolved</p>
            </div>
            <div className="bg-gray-750 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-400">{connections.length}</p>
              <p className="text-xs text-gray-400">Connections</p>
            </div>
          </div>

          {/* Quest Nodes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-200 text-sm">Quest Nodes:</h3>
            <div className="flex flex-wrap gap-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border-2 ring-2 text-xs font-medium transition-all hover:scale-105 cursor-pointer ${statusColors[node.status]} text-white`}
                  title={`${node.relatedCount} connections`}
                >
                  <div>{node.name}</div>
                  <div className="text-xs opacity-75">{statusLabels[node.status]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Connections List */}
          {connections.length > 0 && (
            <div className="bg-gray-750 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-200 text-sm mb-3">Connections:</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {connections.map((conn, idx) => {
                  const source = nodes.find(n => n.id === conn.source);
                  const target = nodes.find(n => n.id === conn.target);
                  const connectionSymbols: Record<string, string> = {
                    'leads-to': '→',
                    'blocks': '⊗',
                    'rewards': '⭐',
                    'related': '◈',
                  };
                  
                  return (
                    <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="font-medium">{source?.name}</span>
                      <span className="text-gray-500">{connectionSymbols[conn.type]}</span>
                      <span className="font-medium">{target?.name}</span>
                      <span className="text-gray-600 ml-auto text-xs">{conn.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Graph Notes */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30 space-y-2">
            <h3 className="font-semibold text-blue-300 text-sm">About Quest Web:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Shows all quests and their interconnections</li>
              <li>✓ Color-coded by status (blue = active, green = complete)</li>
              <li>✓ Connection count shown on each node</li>
              <li>✓ Helps identify quest chains and blocked paths</li>
              <li>ℹ️ Full graph visualization coming in phase 2</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
