import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Quest, NPC, BusinessIdea } from '../types';

interface HistoryState {
  quests: Quest[];
  npcs: NPC[];
  businessIdeas: BusinessIdea[];
}

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: (state: HistoryState) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const MAX_HISTORY = 50;

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((state: HistoryState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  return (
    <HistoryContext.Provider
      value={{
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        undo,
        redo,
        saveState,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}


