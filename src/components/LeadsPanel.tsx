import { useState } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import { LeadBadge } from './ImportanceBadge';
import type { Lead } from '../types';

export function LeadsPanel() {
  const { leads, activeHubId, addLead, updateLead, deleteLead } = useCampaign();
  const { showSuccess, showError } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({ title: '', summary: '', importance: 3 });

  const hubLeads = activeHubId 
    ? leads.filter(l => l.hubId === activeHubId)
    : leads;

  const handleAddLead = () => {
    if (!newLead.title.trim() || !activeHubId) {
      showError('Lead title is required and a hub must be selected');
      return;
    }

    try {
      addLead({
        hubId: activeHubId,
        title: newLead.title.trim(),
        summary: newLead.summary.trim(),
        status: 'Open',
        importance: newLead.importance,
      });
      setNewLead({ title: '', summary: '', importance: 3 });
      setShowAddForm(false);
      showSuccess('Lead added successfully');
    } catch (error) {
      showError('Failed to add lead');
      console.error('Error adding lead:', error);
    }
  };

  const handleToggleStatus = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const statusOrder: Lead['status'][] = ['Open', 'In Progress', 'Resolved'];
    const currentIndex = statusOrder.indexOf(lead.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    updateLead(leadId, { status: nextStatus });
  };

  const handleDeleteLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (window.confirm(`Delete lead: ${lead?.title || 'this lead'}?`)) {
      try {
        deleteLead(leadId);
        showSuccess('Lead deleted');
      } catch (error) {
        showError('Failed to delete lead');
        console.error('Error deleting lead:', error);
      }
    }
  };

  const statusColors = {
    'Open': 'bg-green-600',
    'In Progress': 'bg-yellow-600',
    'Resolved': 'bg-gray-600'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Leads</h2>

      {!activeHubId && (
        <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-3 text-yellow-200 text-sm">
          Select a hub to view and manage leads for that location.
        </div>
      )}

      {/* Add Lead Form */}
      {activeHubId && showAddForm ? (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3" role="form" aria-label="Add new lead">
          <label htmlFor="lead-title" className="sr-only">
            Lead title
          </label>
          <input
            id="lead-title"
            type="text"
            value={newLead.title}
            onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
            placeholder="Lead title..."
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            aria-required="true"
          />
          <label htmlFor="lead-summary" className="sr-only">
            Lead summary
          </label>
          <textarea
            id="lead-summary"
            value={newLead.summary}
            onChange={(e) => setNewLead({ ...newLead, summary: e.target.value })}
            placeholder="Summary..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          />
          <div>
            <label htmlFor="lead-importance" className="block text-sm text-gray-300 mb-1">
              Importance (1-5)
            </label>
            <input
              id="lead-importance"
              type="number"
              min="1"
              max="5"
              value={newLead.importance}
              onChange={(e) => setNewLead({ ...newLead, importance: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-2 bg-gray-600 text-gray-100 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddLead}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add lead"
            >
              Add Lead
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewLead({ title: '', summary: '', importance: 3 });
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel adding lead"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : activeHubId ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Add new lead"
        >
          Add Lead
        </button>
      ) : null}

      {/* Leads List */}
      <div className="space-y-3 max-h-96 overflow-y-auto" aria-label="Leads list">
        {hubLeads.length === 0 ? (
          <div className="text-center py-8" role="status" aria-live="polite">
            {activeHubId ? (
              <>
                <p className="text-gray-400 mb-2">No leads yet for this hub.</p>
                <p className="text-sm text-gray-500">Add a lead to track important threads and rumours!</p>
              </>
            ) : (
              <p className="text-gray-400">Select a hub to view leads.</p>
            )}
          </div>
        ) : (
          hubLeads
            .sort((a, b) => (b.importance || 0) - (a.importance || 0))
            .map(lead => (
              <div
                key={lead.id}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100">{lead.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{lead.summary}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="text-red-400 hover:text-red-300 ml-2 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    title="Delete lead"
                    aria-label={`Delete lead: ${lead.title}`}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <LeadBadge lead={lead} compact />
                  <button
                    onClick={() => handleToggleStatus(lead.id)}
                    className={`px-3 py-1 rounded text-sm font-medium text-white ${statusColors[lead.status]} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:opacity-90`}
                    aria-label={`Change lead status from ${lead.status}`}
                  >
                    {lead.status}
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

