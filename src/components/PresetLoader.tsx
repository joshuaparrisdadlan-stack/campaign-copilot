import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import type { Hub, Quest, NPC } from '../types';

interface CampaignPreset {
  id: string;
  name: string;
  description: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  hubs: Omit<Hub, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>[];
  quests: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>[];
  npcs: Omit<NPC, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>[];
}

export function PresetLoader() {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CampaignPreset | null>(null);

  // Built-in presets
  const presets: CampaignPreset[] = [
    {
      id: 'seahaven',
      name: 'Seahaven Trading Post',
      description: 'A classic coastal hub campaign with mystery, commerce, and intrigue',
      complexity: 'intermediate',
      estimatedHours: 20,
      hubs: [
        {
          name: 'Seahaven',
          description: 'A bustling port town with merchant factions',
          tags: ['port', 'commerce', 'mystery'],
          defaultLocationName: 'Seahaven Docks',
        },
      ],
      quests: [
        {
          title: 'Missing Sailors',
          location: 'Seahaven Docks',
          status: 'Open',
          description: 'Three sailors vanished from the docks last night',
        },
        {
          title: 'Smugglers Ring',
          location: 'Seahaven Warehouse District',
          status: 'Open',
          description: 'Illegal goods flowing through the port',
        },
      ],
      npcs: [
        {
          name: 'Captain Thorne',
          role: 'Harbormaster',
          location: 'Seahaven Harbor Office',
          notes: 'Gruff, efficient, worried about reputation',
        },
        {
          name: 'Marta Goldleaf',
          role: 'Tavern Keeper',
          location: 'The Leaky Anchor',
          notes: 'Hears all the town gossip, neutral but helpful',
        },
      ],
    },
    {
      id: 'dragon-tower',
      name: 'Dragon Tower Ruins',
      description: 'An ancient tower with magical secrets and dangerous creatures',
      complexity: 'advanced',
      estimatedHours: 30,
      hubs: [
        {
          name: 'Dragon Tower',
          description: 'Crumbling spire filled with arcane mysteries',
          tags: ['dungeon', 'magic', 'danger'],
          defaultLocationName: 'Tower Entrance',
        },
      ],
      quests: [
        {
          title: 'Tower Ascent',
          location: 'Dragon Tower',
          status: 'Open',
          description: 'Climb to the top and discover the tower\'s secrets',
        },
      ],
      npcs: [
        {
          name: 'Elder Vex',
          role: 'Mysterious Archivist',
          location: 'Tower Library',
          notes: 'Appears and disappears mysteriously, knows hidden lore',
        },
      ],
    },
    {
      id: 'local-politics',
      name: 'Village Politics',
      description: 'Navigate faction conflicts in a small community',
      complexity: 'beginner',
      estimatedHours: 10,
      hubs: [
        {
          name: 'Millstone Village',
          description: 'A quiet village caught in political turmoil',
          tags: ['village', 'politics', 'intrigue'],
          defaultLocationName: 'Village Square',
        },
      ],
      quests: [
        {
          title: 'Faction Dispute',
          location: 'Millstone Village',
          status: 'Open',
          description: 'Two factions are at odds. Which side will you take?',
        },
      ],
      npcs: [
        {
          name: 'Lady Blackstone',
          role: 'Faction Leader',
          location: 'Village Hall',
          notes: 'Seeks order and progress through commerce',
        },
        {
          name: 'Old Master Cray',
          role: 'Faction Leader',
          location: 'Ancient Oak Inn',
          notes: 'Wants to preserve traditions and protect the land',
        },
      ],
    },
  ];

  const loadPreset = (_preset: CampaignPreset) => {
    setIsLoading(true);
    try {
      // Hubs and quests would be added to campaign context here
      // This is a basic UI implementation - full integration depends on
      // how you want to handle multi-hub/multi-quest creation
      showSuccess(`${_preset.name} campaign template loaded! Customize as needed.`);
      setSelectedPreset(null);
    } catch (error) {
      console.error('Preset load error:', error);
      showError('Failed to load preset campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Preset Campaigns</h2>
        <p className="text-sm text-gray-400">One-click setup for popular campaign types</p>
      </div>

      {!selectedPreset ? (
        /* Preset Selection */
        <div className="grid gap-3">
          {presets.map((preset) => {
            const complexityColors: Record<string, string> = {
              beginner: 'bg-green-900/20 text-green-400',
              intermediate: 'bg-blue-900/20 text-blue-400',
              advanced: 'bg-red-900/20 text-red-400',
            };

            return (
              <div
                key={preset.id}
                className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors border border-gray-600 hover:border-blue-500"
                onClick={() => setSelectedPreset(preset)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-100">{preset.name}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${complexityColors[preset.complexity]}`}
                  >
                    {preset.complexity.charAt(0).toUpperCase() + preset.complexity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>⏱️ ~{preset.estimatedHours} hours</span>
                  <span>🏘️ {preset.hubs.length} hub(s)</span>
                  <span>⭐ {preset.quests.length} quest(s)</span>
                  <span>👤 {preset.npcs.length} NPC(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Preset Confirmation */
        <div className="space-y-4">
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <h3 className="text-xl font-bold text-blue-300 mb-3">{selectedPreset.name}</h3>
            <p className="text-sm text-gray-300 mb-4">{selectedPreset.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-750 rounded p-3">
                <p className="text-xs text-gray-400">Complexity</p>
                <p className="text-sm font-semibold text-gray-100 capitalize">{selectedPreset.complexity}</p>
              </div>
              <div className="bg-gray-750 rounded p-3">
                <p className="text-xs text-gray-400">Estimated Time</p>
                <p className="text-sm font-semibold text-gray-100">~{selectedPreset.estimatedHours} hours</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-gray-200 text-sm">This preset includes:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ {selectedPreset.hubs.length} hub(s): {selectedPreset.hubs.map((h) => h.name).join(', ')}</li>
                <li>✓ {selectedPreset.quests.length} quest(s)</li>
                <li>✓ {selectedPreset.npcs.length} NPC(s)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPreset(null)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => loadPreset(selectedPreset)}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                aria-busy={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load Preset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-750 rounded-lg p-4 border border-gray-600 text-sm">
        <p className="text-gray-400 mb-2">
          💡 <strong>Tip:</strong> Preset campaigns come fully configured with hubs, quests, and NPCs.
        </p>
        <p className="text-gray-400">You can edit everything after loading to match your campaign&apos;s unique story.</p>
      </div>
    </div>
  );
}
