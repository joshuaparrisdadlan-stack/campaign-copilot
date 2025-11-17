import { useState, useEffect, useRef } from 'react';
import type { Quest, NPC, BusinessIdea } from '../types';

interface SearchResult {
  type: 'quest' | 'npc' | 'business';
  id: string;
  title: string;
  subtitle?: string;
  item: Quest | NPC | BusinessIdea;
}

interface SearchBarProps {
  quests: Quest[];
  npcs: NPC[];
  businessIdeas: BusinessIdea[];
  onSelect: (result: SearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ quests, npcs, businessIdeas, onSelect, isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search quests
    quests.forEach(quest => {
      if (
        quest.title.toLowerCase().includes(searchTerm) ||
        quest.location.toLowerCase().includes(searchTerm) ||
        quest.description?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          type: 'quest',
          id: quest.id,
          title: quest.title,
          subtitle: quest.location,
          item: quest,
        });
      }
    });

    // Search NPCs
    npcs.forEach(npc => {
      if (
        npc.name.toLowerCase().includes(searchTerm) ||
        npc.role.toLowerCase().includes(searchTerm) ||
        npc.location.toLowerCase().includes(searchTerm) ||
        npc.notes?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          type: 'npc',
          id: npc.id,
          title: npc.name,
          subtitle: `${npc.role} - ${npc.location}`,
          item: npc,
        });
      }
    });

    // Search business ideas
    businessIdeas.forEach(business => {
      if (
        business.title.toLowerCase().includes(searchTerm) ||
        business.location.toLowerCase().includes(searchTerm) ||
        business.description?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          type: 'business',
          id: business.id,
          title: business.title,
          subtitle: business.location,
          item: business,
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [query, quests, npcs, businessIdeas]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelect(results[selectedIndex]);
      setQuery('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search quests, NPCs, business ideas..."
            className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            aria-label="Search"
          />
        </div>
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  onSelect(result);
                  setQuery('');
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                  idx === selectedIndex ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    result.type === 'quest' ? 'bg-blue-600' :
                    result.type === 'npc' ? 'bg-green-600' :
                    'bg-purple-600'
                  }`}>
                    {result.type === 'quest' ? 'Quest' : result.type === 'npc' ? 'NPC' : 'Business'}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-100 font-medium">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-400 mt-1">{result.subtitle}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400">
            No results found
          </div>
        )}
        {!query && (
          <div className="px-4 py-8 text-center text-gray-400">
            Start typing to search...
          </div>
        )}
      </div>
    </div>
  );
}


