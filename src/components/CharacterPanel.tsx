import { useState, useEffect, useRef } from 'react';
import { useCampaign } from '../contexts/CampaignContext';
import { useToast } from '../contexts/ToastContext';
import { generateId } from '../utils/id';
import type { CharacterProfile } from '../types';

export function CharacterPanel() {
  const { characterProfile, setCharacterProfile, activeCampaignId } = useCampaign();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(!characterProfile);
  const [formData, setFormData] = useState<CharacterProfile>({
    id: characterProfile?.id || generateId(),
    campaignId: characterProfile?.campaignId || activeCampaignId || '',
    name: characterProfile?.name || '',
    classAndLevel: characterProfile?.classAndLevel || '',
    race: characterProfile?.race || '',
    background: characterProfile?.background || '',
    alignment: characterProfile?.alignment || '',
    summary: characterProfile?.summary || '',
    dndBeyondUrl: characterProfile?.dndBeyondUrl || '',
    createdAt: characterProfile?.createdAt || Date.now(),
    updatedAt: characterProfile?.updatedAt || Date.now(),
  });

  useEffect(() => {
    if (characterProfile) {
      setFormData(characterProfile);
    }
  }, [characterProfile]);

  // Autosave draft when user fills required fields (debounced)
  const autosaveTimer = useRef<number | null>(null);
  const lastAutosaveToast = useRef<number>(0);
  useEffect(() => {
    // Only autosave while editing and when required fields are present
    if (!isEditing) return;
    if (!formData.name?.trim() || !formData.classAndLevel?.trim()) return;

    // debounce
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }
    // Save after 1s of inactivity
    autosaveTimer.current = window.setTimeout(() => {
      try {
        const profile: CharacterProfile = {
          ...formData,
          updatedAt: Date.now(),
          createdAt: formData.createdAt || Date.now(),
        };
        // Use setCharacterProfile to persist without showing a toast
        setCharacterProfile(profile);
        // Show small toast to indicate autosave (throttle to avoid spam)
        try {
          const now = Date.now();
          if (now - lastAutosaveToast.current > 2000) {
            showSuccess('Character autosaved');
            lastAutosaveToast.current = now;
          }
        } catch (err) {
          console.warn('Autosave toast failed', err);
        }
      } catch (error) {
        console.error('Autosave character failed', error);
      }
    }, 1000);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [formData, isEditing, setCharacterProfile, showSuccess]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.classAndLevel.trim()) {
      showError('Name and Class & Level are required');
      return;
    }

    try {
      const profile: CharacterProfile = {
        ...formData,
        updatedAt: Date.now(),
      };
      setCharacterProfile(profile);
      setIsEditing(false);
      showSuccess('Character profile saved');
    } catch (error) {
      showError('Failed to save character profile');
      console.error('Error saving character:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete character profile?')) {
      try {
        setCharacterProfile(null);
        setIsEditing(true);
        setFormData({
          id: generateId(),
          campaignId: activeCampaignId || '',
          name: '',
          classAndLevel: '',
          race: '',
          background: '',
          alignment: '',
          summary: '',
          dndBeyondUrl: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        showSuccess('Character profile deleted');
      } catch (error) {
        showError('Failed to delete character profile');
        console.error('Error deleting character:', error);
      }
    }
  };

  if (!isEditing && characterProfile) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-100">My Character</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label="Edit character"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              aria-label="Delete character"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{characterProfile.name}</h3>
            <p className="text-gray-300">{characterProfile.classAndLevel}</p>
          </div>

          {characterProfile.race && (
            <div>
              <span className="text-sm text-gray-400">Race: </span>
              <span className="text-gray-200">{characterProfile.race}</span>
            </div>
          )}

          {characterProfile.background && (
            <div>
              <span className="text-sm text-gray-400">Background: </span>
              <span className="text-gray-200">{characterProfile.background}</span>
            </div>
          )}

          {characterProfile.alignment && (
            <div>
              <span className="text-sm text-gray-400">Alignment: </span>
              <span className="text-gray-200">{characterProfile.alignment}</span>
            </div>
          )}

          {characterProfile.summary && (
            <div>
              <span className="text-sm text-gray-400 block mb-1">Summary:</span>
              <p className="text-gray-200 whitespace-pre-wrap">{characterProfile.summary}</p>
            </div>
          )}

          {characterProfile.dndBeyondUrl && (
            <div>
              <a
                href={characterProfile.dndBeyondUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View on D&D Beyond →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">My Character</h2>

      <div className="space-y-4" role="form" aria-label="Character profile form">
        <div>
          <label htmlFor="char-name" className="block text-sm font-medium text-gray-300 mb-2">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="char-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Character name"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="char-class" className="block text-sm font-medium text-gray-300 mb-2">
            Class & Level <span className="text-red-400">*</span>
          </label>
          <input
            id="char-class"
            type="text"
            value={formData.classAndLevel}
            onChange={(e) => setFormData({ ...formData, classAndLevel: e.target.value })}
            placeholder="e.g. Paladin 5"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="char-race" className="block text-sm font-medium text-gray-300 mb-2">
            Race (optional)
          </label>
          <input
            id="char-race"
            type="text"
            value={formData.race}
            onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            placeholder="e.g. Human, Elf, Dwarf"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="char-background" className="block text-sm font-medium text-gray-300 mb-2">
            Background (optional)
          </label>
          <input
            id="char-background"
            type="text"
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
            placeholder="e.g. Noble, Acolyte, Folk Hero"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="char-alignment" className="block text-sm font-medium text-gray-300 mb-2">
            Alignment (optional)
          </label>
          <input
            id="char-alignment"
            type="text"
            value={formData.alignment}
            onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
            placeholder="e.g. Lawful Good, Chaotic Neutral"
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="char-summary" className="block text-sm font-medium text-gray-300 mb-2">
            Summary (optional)
          </label>
          <textarea
            id="char-summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Key spells, features, fighting style, etc."
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="char-dndbeyond" className="block text-sm font-medium text-gray-300 mb-2">
            D&D Beyond URL (optional)
          </label>
          <input
            id="char-dndbeyond"
            type="url"
            value={formData.dndBeyondUrl}
            onChange={(e) => setFormData({ ...formData, dndBeyondUrl: e.target.value })}
            placeholder="https://www.dndbeyond.com/characters/..."
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Save character profile"
          >
            Save Character
          </button>
          {characterProfile && (
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(characterProfile);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

