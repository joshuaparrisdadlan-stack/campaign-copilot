import { useState } from 'react';
import { loadSessionNotes } from '../storage';
import type { SessionNote } from '../types';

interface SessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionHistory({ isOpen, onClose }: SessionHistoryProps) {
  const [notes] = useState<SessionNote[]>(loadSessionNotes());

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">Session History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close session history"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No session notes yet.</p>
              <p className="text-sm mt-2">Your session notes will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {note.location && (
                        <p className="text-sm text-blue-400 font-medium mb-1">
                          📍 {note.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(note.timestamp)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


