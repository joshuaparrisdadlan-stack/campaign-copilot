export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-100">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-2xl"
              aria-label="Close help"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-gray-300">
            {/* Search */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                  Ctrl + K
                </kbd>
                <span>or</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                  Cmd + K
                </kbd>
              </div>
              <p className="text-gray-400 ml-2">Open global search</p>
            </div>

            {/* Help */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">?</kbd>
              </div>
              <p className="text-gray-400 ml-2">Show this help menu</p>
            </div>

            {/* Session Panel Shortcuts */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-gray-100 mb-3">Session Panel</h3>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                    Enter
                  </kbd>
                  <span>(in location field)</span>
                </div>
                <p className="text-gray-400 ml-2">Focus session description</p>
              </div>
            </div>

            {/* Forms Shortcuts */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                  Enter
                </kbd>
                <span>(in form fields)</span>
              </div>
              <p className="text-gray-400 ml-2">Submit quest/NPC/business form</p>
            </div>

            {/* Tips */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-gray-100 mb-3">Tips</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Use search (Ctrl+K) to quickly find quests, NPCs, and business ideas</li>
                <li>• Your data is automatically saved to your browser</li>
                <li>• Export your campaign at the end of a session for backups</li>
                <li>• Dark theme is optimized for low-light gaming sessions</li>
                <li>• Click on any item to view or edit its details</li>
              </ul>
            </div>

            {/* Closing */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">Esc</kbd> or click outside to close this menu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
