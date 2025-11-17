import { useState, useEffect } from 'react';
import { SessionPanel } from './components/SessionPanel';
import { QuestTracker } from './components/QuestTracker';
import { NPCBusinessPanel } from './components/NPCBusinessPanel';
import { LeadsPanel } from './components/LeadsPanel';
import { CharacterPanel } from './components/CharacterPanel';
import { SessionTimeline } from './components/SessionTimeline';
import { HandoffSummary } from './components/HandoffSummary';
import { HubDashboard } from './components/HubDashboard';
import { CampaignSwitcher } from './components/CampaignSwitcher';
import { SearchBar } from './components/SearchBar';
import { HelpModal } from './components/HelpModal';
import { LiveSessionLog } from './components/LiveSessionLog';
import { TacticalAdvisor } from './components/TacticalAdvisor';
import { EncounterMode } from './components/EncounterMode';
import { QuestWeb } from './components/QuestWeb';
import { PresetLoader } from './components/PresetLoader';
import { BackupIndicator } from './components/BackupIndicator';
import { CampaignProvider } from './contexts/CampaignContext';
import { ToastProvider } from './contexts/ToastContext';
import { useCampaign } from './contexts/CampaignContext';

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tactical' | 'encounter' | 'quest-web' | 'presets'>('tactical');
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
            <div className="flex gap-3 items-center">
              <BackupIndicator />
              <button
                onClick={() => setIsHelpOpen(true)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-700 transition-colors"
                aria-label="Show help"
                title="Press ? for help"
              >
                ?
              </button>
            </div>
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

            {/* Timeline, Handoff, and Live Log Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SessionTimeline />
              <HandoffSummary />
              <LiveSessionLog />
            </div>

            {/* Hub Dashboard - Full Width */}
            <HubDashboard />

            {/* Advanced Features Tabs */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-700 bg-gray-750">
                <button
                  onClick={() => setActiveTab('tactical')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'tactical'
                      ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🎯 Tactical Advisor
                </button>
                <button
                  onClick={() => setActiveTab('encounter')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'encounter'
                      ? 'bg-gray-800 text-red-400 border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ⚔️ Encounter Mode
                </button>
                <button
                  onClick={() => setActiveTab('quest-web')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'quest-web'
                      ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  ◈ Quest Web
                </button>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'presets'
                      ? 'bg-gray-800 text-green-400 border-b-2 border-green-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📦 Presets
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'tactical' && <TacticalAdvisor />}
                {activeTab === 'encounter' && <EncounterMode />}
                {activeTab === 'quest-web' && <QuestWeb />}
                {activeTab === 'presets' && <PresetLoader />}
              </div>
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
