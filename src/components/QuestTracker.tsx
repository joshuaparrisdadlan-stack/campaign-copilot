import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import { QuestBadge } from './ImportanceBadge';
import type { Quest } from '../types';

export function QuestTracker() {
  const { quests, addQuest, updateQuest, deleteQuest, loadSeahavenSeed, activeHubId, hubs } = useCampaign();
  const { showSuccess, showError } = useToast();
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestLocation, setNewQuestLocation] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [newQuestHubId, setNewQuestHubId] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [selectedQuests, setSelectedQuests] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const handleAddQuest = () => {
    if (!newQuestTitle.trim()) {
      showError('Quest title is required');
      return;
    }

    try {
      addQuest({
        title: newQuestTitle.trim(),
        location: newQuestLocation.trim() || 'Unknown',
        description: newQuestDescription.trim() || undefined,
        hubId: newQuestHubId || activeHubId || undefined,
        status: 'Open',
      });
      setNewQuestTitle('');
      setNewQuestLocation('');
      setNewQuestDescription('');
      setNewQuestHubId('');
      setShowAddForm(false);
      showSuccess('Quest added successfully');
    } catch (error) {
      showError('Failed to add quest');
      console.error('Error adding quest:', error);
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuestId(quest.id);
  };

  const handleSaveEdit = (questId: string, updates: Partial<Quest>) => {
    try {
      updateQuest(questId, updates);
      setEditingQuestId(null);
      showSuccess('Quest updated');
    } catch (error) {
      showError('Failed to update quest');
      console.error('Error updating quest:', error);
    }
  };

  const handleToggleStatus = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const statusOrder: Quest['status'][] = ['Open', 'In Progress', 'Resolved'];
    const currentIndex = statusOrder.indexOf(quest.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    updateQuest(questId, { status: nextStatus });
  };

  const handleDeleteQuest = (questId: string) => {
    if (window.confirm('Delete this quest?')) {
      try {
        deleteQuest(questId);
        showSuccess('Quest deleted');
      } catch (error) {
        showError('Failed to delete quest');
        console.error('Error deleting quest:', error);
      }
    }
  };

  const handleToggleSelect = (questId: string) => {
    setSelectedQuests(prev => {
      const next = new Set(prev);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedQuests.size === 0) return;
    if (window.confirm(`Delete ${selectedQuests.size} quest(s)?`)) {
      try {
        selectedQuests.forEach(id => deleteQuest(id));
        setSelectedQuests(new Set());
        setBulkMode(false);
        showSuccess(`${selectedQuests.size} quest(s) deleted`);
      } catch (error) {
        showError('Failed to delete quests');
        console.error('Error deleting quests:', error);
      }
    }
  };

  const handleBulkStatusChange = (status: Quest['status']) => {
    if (selectedQuests.size === 0) return;
    try {
      selectedQuests.forEach(id => updateQuest(id, { status }));
      setSelectedQuests(new Set());
      setBulkMode(false);
      showSuccess(`${selectedQuests.size} quest(s) updated`);
    } catch (error) {
      showError('Failed to update quests');
      console.error('Error updating quests:', error);
    }
  };

  const filteredQuests = filterLocation
    ? quests.filter(q => q.location.toLowerCase().includes(filterLocation.toLowerCase()))
    : quests;

  const statusColors = {
    'Open': 'bg-green-600',
    'In Progress': 'bg-yellow-600',
    'Resolved': 'bg-gray-600'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Quests & Rumours</h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (window.confirm('Load Seahaven demo data? This will add NPCs, quests, and leads for Seahaven.')) {
                try {
                  await loadSeahavenSeed();
                  showSuccess('Seahaven demo data loaded!');
                } catch (error) {
                  showError('Failed to load Seahaven data');
                  console.error('Error loading seed:', error);
                }
              }
            }}
            className="px-3 py-1 rounded text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            aria-label="Load Seahaven demo data"
            title="Load Seahaven demo data (NPCs, quests, leads)"
          >
            Load Seahaven
          </button>
          {filteredQuests.length > 0 && (
            <button
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedQuests(new Set());
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                bulkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={bulkMode ? 'Exit bulk mode' : 'Enter bulk mode'}
            >
              {bulkMode ? 'Cancel' : 'Select'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkMode && selectedQuests.size > 0 && (
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-200">{selectedQuests.size} selected</span>
          <button
            onClick={() => handleBulkStatusChange('Open')}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
          >
            Mark Open
          </button>
          <button
            onClick={() => handleBulkStatusChange('In Progress')}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => handleBulkStatusChange('Resolved')}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
          >
            Mark Resolved
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Filter */}
      <div>
        <label htmlFor="quest-filter" className="sr-only">
          Filter quests by location
        </label>
        <input
          id="quest-filter"
          type="text"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          placeholder="Filter by location..."
          className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter quests by location"
        />
      </div>

      {/* Add Quest Form */}
      {showAddForm ? (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3" role="form" aria-label="Add new quest">
          <label htmlFor="quest-title" className="sr-only">
            Quest title
          </label>
          <input
            id="quest-title"
            type="text"
            value={newQuestTitle}
            onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Quest title..."
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddQuest();
              }
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setNewQuestTitle('');
                setNewQuestLocation('');
                setNewQuestDescription('');
              }
            }}
            autoFocus
            aria-required="true"
          />
          {hubs.length > 0 && (
            <div>
              <label htmlFor="quest-hub" className="block text-sm text-gray-300 mb-1">
                Hub (optional)
              </label>
              <select
                id="quest-hub"
                value={newQuestHubId}
                onChange={(e) => setNewQuestHubId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowAddForm(false);
                    setNewQuestTitle('');
                    setNewQuestLocation('');
                    setNewQuestDescription('');
                    setNewQuestHubId('');
                  }
                }}
              >
                <option value="">No hub</option>
                {hubs.map(hub => (
                  <option key={hub.id} value={hub.id}>{hub.name}</option>
                ))}
              </select>
            </div>
          )}
          <label htmlFor="quest-location" className="sr-only">
            Quest location
          </label>
          <input
            id="quest-location"
            type="text"
            value={newQuestLocation}
            onChange={(e) => setNewQuestLocation(e.target.value)}
            placeholder="Location (optional)..."
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setNewQuestTitle('');
                setNewQuestLocation('');
                setNewQuestDescription('');
                setNewQuestHubId('');
              }
            }}
          />
          <label htmlFor="quest-description" className="sr-only">
            Quest description
          </label>
          <textarea
            id="quest-description"
            value={newQuestDescription}
            onChange={(e) => setNewQuestDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setNewQuestTitle('');
                setNewQuestLocation('');
                setNewQuestDescription('');
                setNewQuestHubId('');
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddQuest}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add quest"
            >
              Add Quest
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewQuestTitle('');
                setNewQuestLocation('');
                setNewQuestDescription('');
                setNewQuestHubId('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel adding quest"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Add new quest"
        >
          Add Quest
        </button>
      )}

      {/* Quest List */}
      <div className="space-y-3 max-h-96 overflow-y-auto" aria-label="Quest list">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            {filterLocation ? (
              <>
                <p className="text-gray-400 mb-2">No quests found for "{filterLocation}".</p>
                <p className="text-sm text-gray-500">Try a different location or clear the filter.</p>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-2">No quests yet.</p>
                <p className="text-sm text-gray-500">Add your first quest to start tracking your adventures!</p>
              </>
            )}
          </div>
        ) : (
          filteredQuests.map(quest => {
            const isEditing = editingQuestId === quest.id;
            const isSelected = selectedQuests.has(quest.id);

            if (isEditing) {
              return <QuestEditForm
                key={quest.id}
                quest={quest}
                onSave={(updates) => handleSaveEdit(quest.id, updates)}
                onCancel={() => setEditingQuestId(null)}
              />;
            }

            return (
              <div
                key={quest.id}
                className={`bg-gray-700 rounded-lg p-4 border ${
                  isSelected ? 'border-blue-500' : 'border-gray-600'
                }`}
              >
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(quest.id)}
                    className="mb-2"
                    aria-label={`Select quest: ${quest.title}`}
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-100 flex-1">{quest.title}</h3>
                  <div className="flex gap-2">
                    {!bulkMode && (
                      <button
                        onClick={() => handleEditQuest(quest)}
                        className="text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        title="Edit quest"
                        aria-label={`Edit quest: ${quest.title}`}
                      >
                        ✎
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      title="Delete quest"
                      aria-label={`Delete quest: ${quest.title}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  <span aria-hidden="true">📍</span> <span className="sr-only">Location:</span> {quest.location}
                </p>
                {quest.description && (
                  <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
                )}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <QuestBadge quest={quest} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(quest.id)}
                    className={`px-3 py-1 rounded text-sm font-medium text-white min-h-[32px] min-w-[100px] ${statusColors[quest.status]} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:opacity-90`}
                    aria-label={`Change quest status from ${quest.status}`}
                    title={`Click to cycle status: ${quest.status} → ${quest.status === 'Open' ? 'In Progress' : quest.status === 'In Progress' ? 'Resolved' : 'Open'}`}
                  >
                    {quest.status}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface QuestEditFormProps {
  quest: Quest;
  onSave: (updates: Partial<Quest>) => void;
  onCancel: () => void;
}

function QuestEditForm({ quest, onSave, onCancel }: QuestEditFormProps) {
  const [title, setTitle] = useState(quest.title);
  const [location, setLocation] = useState(quest.location);
  const [description, setDescription] = useState(quest.description || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      location: location.trim() || 'Unknown',
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-blue-500">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Quest title..."
        className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        autoFocus
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location..."
        className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)..."
        rows={3}
        className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
