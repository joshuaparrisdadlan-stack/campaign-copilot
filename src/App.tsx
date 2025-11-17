import { useState, useEffect } from 'react';
import { SessionPanel } from './components/SessionPanel';
import { QuestTracker } from './components/QuestTracker';
import { NPCBusinessPanel } from './components/NPCBusinessPanel';
import { LeadsPanel } from './components/LeadsPanel';
import { CharacterPanel } from './components/CharacterPanel';
import { SessionTimeline } from './components/SessionTimeline';
import { HandoffSummary } from './components/HandoffSummary';
import { CampaignSwitcher } from './components/CampaignSwitcher';
import { SearchBar } from './components/SearchBar';
import { HelpModal } from './components/HelpModal';
import { CampaignProvider } from './contexts/CampaignContext';
import { ToastProvider } from './contexts/ToastContext';
import { useCampaign } from './contexts/CampaignContext';

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { quests, npcs, businessIdeas } = useCampaign();

  // Handle Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === '?' && !isHelpOpen) {
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Help Button */}
          <header className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">Campaign Copilot</h1>
              <p className="text-gray-400">Your D&D 5e session assistant</p>
            </div>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-700 transition-colors"
              aria-label="Show help"
              title="Press ? for help"
            >
              ?
            </button>
          </header>

          {/* Main Layout: Four Panels */}
          <main id="main-content" className="space-y-6">
            {/* Campaign Switcher */}
            <CampaignSwitcher />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Panel: Quest Tracker & Leads (on mobile, appears second) */}
              <div className="lg:order-1 order-2 space-y-6">
                <QuestTracker />
                <LeadsPanel />
              </div>

              {/* Center-Left Panel: Character (on mobile, appears fourth) */}
              <div className="lg:order-2 order-4">
                <CharacterPanel />
              </div>

              {/* Center Panel: Session Input & AI (on mobile, appears first) */}
              <div className="lg:order-3 order-1">
                <SessionPanel />
              </div>

              {/* Right Panel: NPC & Business (on mobile, appears third) */}
              <div className="lg:order-4 order-3">
                <NPCBusinessPanel />
              </div>
            </div>

            {/* Timeline and Handoff Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionTimeline />
              <HandoffSummary />
            </div>
          </main>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        quests={quests}
        npcs={npcs}
        businessIdeas={businessIdeas}
        onSelect={() => {}}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <CampaignProvider>
        <AppContent />
      </CampaignProvider>
    </ToastProvider>
  );
}

export default App;
