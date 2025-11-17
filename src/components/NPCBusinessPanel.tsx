import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import NpcProfilePanel from './npcs/NpcProfilePanel';

export function NPCBusinessPanel() {
  const { npcs, businessIdeas, hubs, addNPC, deleteNPC, addBusinessIdea, deleteBusinessIdea } = useCampaign();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'npcs' | 'business'>('npcs');
  const [showNPCForm, setShowNPCForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [newNPC, setNewNPC] = useState({ name: '', role: '', location: '', notes: '' });
  const [newBusiness, setNewBusiness] = useState({ title: '', location: '', description: '' });
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs: ('npcs' | 'business')[] = ['npcs', 'business'];
      const currentIndex = tabs.indexOf(activeTab);
      let nextIndex: number;
      
      if (e.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      
      setActiveTab(tabs[nextIndex]);
      // Focus the newly active tab
      const nextTabId = tabs[nextIndex] === 'npcs' ? 'npcs-tab' : 'business-tab';
      setTimeout(() => {
        document.getElementById(nextTabId)?.focus();
      }, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab('npcs');
      document.getElementById('npcs-tab')?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab('business');
      document.getElementById('business-tab')?.focus();
    }
  };

  const handleAddNPC = () => {
    if (!newNPC.name.trim()) {
      showError('NPC name is required');
      return;
    }

    try {
      addNPC({
        name: newNPC.name.trim(),
        role: newNPC.role.trim() || 'Unknown',
        location: newNPC.location.trim() || 'Unknown',
        notes: newNPC.notes.trim(),
      });
      setNewNPC({ name: '', role: '', location: '', notes: '' });
      setShowNPCForm(false);
      showSuccess('NPC added successfully');
    } catch (error) {
      showError('Failed to add NPC');
      console.error('Error adding NPC:', error);
    }
  };

  const handleAddBusiness = () => {
    if (!newBusiness.title.trim()) {
      showError('Business idea title is required');
      return;
    }

    try {
      addBusinessIdea({
        title: newBusiness.title.trim(),
        location: newBusiness.location.trim() || 'Unknown',
        description: newBusiness.description.trim(),
      });
      setNewBusiness({ title: '', location: '', description: '' });
      setShowBusinessForm(false);
      showSuccess('Business idea added successfully');
    } catch (error) {
      showError('Failed to add business idea');
      console.error('Error adding business idea:', error);
    }
  };

  const handleDeleteNPC = (id: string) => {
    const npc = npcs.find(n => n.id === id);
    if (window.confirm(`Delete NPC: ${npc?.name || 'this NPC'}?`)) {
      try {
        deleteNPC(id);
        // Clear selection if we deleted the currently selected NPC
        if (selectedNpcId === id) setSelectedNpcId(null);
        showSuccess('NPC deleted');
      } catch (error) {
        showError('Failed to delete NPC');
        console.error('Error deleting NPC:', error);
      }
    }
  };

  const handleDeleteBusiness = (id: string) => {
    const business = businessIdeas.find(b => b.id === id);
    if (window.confirm(`Delete business idea: ${business?.title || 'this business idea'}?`)) {
      try {
        deleteBusinessIdea(id);
        showSuccess('Business idea deleted');
      } catch (error) {
        showError('Failed to delete business idea');
        console.error('Error deleting business idea:', error);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">NPCs & Business</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700" role="tablist" aria-label="NPCs and Business Ideas tabs">
        <button
          onClick={() => setActiveTab('npcs')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          aria-selected={activeTab === 'npcs'}
          aria-controls="npcs-panel"
          id="npcs-tab"
          tabIndex={activeTab === 'npcs' ? 0 : -1}
          className={`px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'npcs'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          NPCs
        </button>
        <button
          onClick={() => setActiveTab('business')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          aria-selected={activeTab === 'business'}
          aria-controls="business-panel"
          id="business-tab"
          tabIndex={activeTab === 'business' ? 0 : -1}
          className={`px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'business'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Business Ideas
        </button>
      </div>

      {/* NPCs Tab */}
      {activeTab === 'npcs' && (
        <div className="space-y-4" role="tabpanel" id="npcs-panel" aria-labelledby="npcs-tab">
          <div className="mt-4 grid gap-3 sm:grid-cols-1">
            {/* Left: NPC list + profile underneath */}
            <div>
              <h2 className="text-sm font-semibold text-slate-100 mb-2">NPCs in this hub</h2>
          {showNPCForm ? (
            <div className="bg-gray-700 rounded-lg p-4 space-y-3" role="form" aria-label="Add new NPC">
              <label htmlFor="npc-name" className="sr-only">
                NPC name
              </label>
              <input
                id="npc-name"
                type="text"
                value={newNPC.name}
                onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                placeholder="NPC name..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                aria-required="true"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newNPC.name.trim()) {
                    e.preventDefault();
                    handleAddNPC();
                  }
                  if (e.key === 'Escape') {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }
                }}
              />
              <label htmlFor="npc-role" className="sr-only">
                NPC role
              </label>
              <input
                id="npc-role"
                type="text"
                value={newNPC.role}
                onChange={(e) => setNewNPC({ ...newNPC, role: e.target.value })}
                placeholder="Role (e.g. Guard Captain, Tavern Owner)..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newNPC.name.trim()) {
                    e.preventDefault();
                    handleAddNPC();
                  }
                  if (e.key === 'Escape') {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }
                }}
              />
              <label htmlFor="npc-location" className="sr-only">
                NPC location
              </label>
              <input
                id="npc-location"
                type="text"
                value={newNPC.location}
                onChange={(e) => setNewNPC({ ...newNPC, location: e.target.value })}
                placeholder="Location..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newNPC.name.trim()) {
                    e.preventDefault();
                    handleAddNPC();
                  }
                  if (e.key === 'Escape') {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }
                }}
              />
              <label htmlFor="npc-notes" className="sr-only">
                NPC notes
              </label>
              <textarea
                id="npc-notes"
                value={newNPC.notes}
                onChange={(e) => setNewNPC({ ...newNPC, notes: e.target.value })}
                placeholder="Notes (optional)..."
                rows={2}
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNPC}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Add NPC"
                >
                  Add NPC
                </button>
                <button
                  onClick={() => {
                    setShowNPCForm(false);
                    setNewNPC({ name: '', role: '', location: '', notes: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Cancel adding NPC"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNPCForm(true)}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Add new NPC"
            >
              Add NPC
            </button>
          )}

              <div className="space-y-3 max-h-[40vh] overflow-y-auto" aria-label="NPC list">
                {npcs.length === 0 ? (
                  <div className="text-center py-8" role="status" aria-live="polite">
                    <p className="text-gray-400 mb-2">No NPCs yet.</p>
                    <p className="text-sm text-gray-500">Add your first NPC to start tracking characters you meet!</p>
                  </div>
                ) : (
                  npcs.map(npc => {
                    const isSelected = selectedNpcId === npc.id;
                    return (
                      <div key={npc.id} className={`bg-gray-700 rounded-lg p-1 border ${isSelected ? 'border-emerald-400 bg-emerald-400/6' : 'border-gray-600'}`}>
                        <div className="flex items-start justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedNpcId(npc.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition ${isSelected ? 'text-emerald-200' : 'text-gray-100 hover:text-gray-50'}`}
                            aria-pressed={isSelected}
                          >
                            <div className="flex-1">
                              <h3 className="text-base font-semibold">{npc.name}</h3>
                              <p className="text-xs text-gray-400">{npc.role}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => handleDeleteNPC(npc.id)}
                            className="ml-2 text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2"
                            title="Delete NPC"
                            aria-label={`Delete NPC: ${npc.name}`}
                          >
                            ×
                          </button>
                        </div>
                        <div className="px-3 pb-2">
                          <p className="text-sm text-gray-400 mb-1"><span aria-hidden="true">📍</span> <span className="sr-only">Location:</span> {npc.location}</p>
                          {npc.notes && <p className="text-sm text-gray-300 mt-2">{npc.notes}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Profile placed below the scroll area but outside it so it stays visible without scrolling the list */}
              <div className="mt-3">
                {(() => {
                  const selectedNpc = npcs.find(n => n.id === selectedNpcId) ?? null;
                  const hubForNpc = selectedNpc ? hubs.find(h => h.id === selectedNpc.hubId) ?? null : null;
                  return <NpcProfilePanel npc={selectedNpc} hubForNpc={hubForNpc} />;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Ideas Tab */}
      {activeTab === 'business' && (
        <div className="space-y-4" role="tabpanel" id="business-panel" aria-labelledby="business-tab">
          {showBusinessForm ? (
            <div className="bg-gray-700 rounded-lg p-4 space-y-3" role="form" aria-label="Add new business idea">
              <label htmlFor="business-title" className="sr-only">
                Business idea title
              </label>
              <input
                id="business-title"
                type="text"
                value={newBusiness.title}
                onChange={(e) => setNewBusiness({ ...newBusiness, title: e.target.value })}
                placeholder="Business idea title..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                aria-required="true"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newBusiness.title.trim()) {
                    e.preventDefault();
                    handleAddBusiness();
                  }
                  if (e.key === 'Escape') {
                    setShowBusinessForm(false);
                    setNewBusiness({ title: '', location: '', description: '' });
                  }
                }}
              />
              <label htmlFor="business-location" className="sr-only">
                Business location
              </label>
              <input
                id="business-location"
                type="text"
                value={newBusiness.location}
                onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                placeholder="Location..."
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newBusiness.title.trim()) {
                    e.preventDefault();
                    handleAddBusiness();
                  }
                  if (e.key === 'Escape') {
                    setShowBusinessForm(false);
                    setNewBusiness({ title: '', location: '', description: '' });
                  }
                }}
              />
              <label htmlFor="business-description" className="sr-only">
                Business description
              </label>
              <textarea
                id="business-description"
                value={newBusiness.description}
                onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                placeholder="Description (optional)..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && newBusiness.title.trim()) {
                    e.preventDefault();
                    handleAddBusiness();
                  }
                  if (e.key === 'Escape') {
                    setShowBusinessForm(false);
                    setNewBusiness({ title: '', location: '', description: '' });
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBusiness}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Add business idea"
                >
                  Add Business Idea
                </button>
                <button
                  onClick={() => {
                    setShowBusinessForm(false);
                    setNewBusiness({ title: '', location: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Cancel adding business idea"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBusinessForm(true)}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Add new business idea"
            >
              Add Business Idea
            </button>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto" aria-label="Business ideas list">
            {businessIdeas.length === 0 ? (
              <div className="text-center py-8" role="status" aria-live="polite">
                <p className="text-gray-400 mb-2">No business ideas yet.</p>
                <p className="text-sm text-gray-500">Track potential business ventures and opportunities here!</p>
              </div>
            ) : (
              businessIdeas.map(business => (
                <div key={business.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">{business.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteBusiness(business.id)}
                      className="text-red-400 hover:text-red-300 ml-2 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      title="Delete business idea"
                      aria-label={`Delete business idea: ${business.title}`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    <span aria-hidden="true">📍</span> <span className="sr-only">Location:</span> {business.location}
                  </p>
                  {business.description && (
                    <p className="text-sm text-gray-300 mt-2">{business.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
