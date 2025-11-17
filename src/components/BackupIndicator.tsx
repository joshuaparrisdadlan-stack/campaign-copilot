import { useEffect, useState } from 'react';
import { getBackups, formatBytes, getBackupSizeBytes, getTimeAgo, restoreBackup, exportToFile } from '../utils/backup';

export function BackupIndicator() {
  const [backups, setBackups] = useState(getBackups());
  const [showBackupList, setShowBackupList] = useState(false);
  const [backupSize, setBackupSize] = useState(formatBytes(getBackupSizeBytes()));

  useEffect(() => {
    // Refresh backup list every 5 seconds
    const interval = setInterval(() => {
      setBackups(getBackups());
      setBackupSize(formatBytes(getBackupSizeBytes()));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const lastBackup = backups.length > 0 ? backups[backups.length - 1] : null;

  return (
    <div className="relative">
      {/* Backup Status Button */}
      <button
        onClick={() => setShowBackupList(!showBackupList)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-750 hover:bg-gray-700 rounded-lg border border-gray-600 text-xs text-gray-300 transition-colors relative"
        title={lastBackup ? `Last backup: ${getTimeAgo(lastBackup.timestamp)}` : 'No backups'}
      >
        <span className="text-lg">💾</span>
        <span className="hidden sm:inline">{backups.length} backup{backups.length !== 1 ? 's' : ''}</span>
        <span className="hidden md:inline text-gray-500">• {backupSize}</span>
        {lastBackup && (
          <span className="hidden lg:inline text-gray-500 text-xs">• {getTimeAgo(lastBackup.timestamp)}</span>
        )}
        {backups.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        )}
      </button>

      {/* Backup List Dropdown */}
      {showBackupList && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg border border-gray-600 shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-100">Campaign Backups</h3>

            {backups.length === 0 ? (
              <p className="text-sm text-gray-400">No backups yet. They are created automatically every 5 minutes.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...backups].reverse().map((backup, idx) => (
                  <div
                    key={backup.id}
                    className="p-3 bg-gray-750 rounded-lg border border-gray-600 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">{backup.campaignName}</p>
                        <p className="text-xs text-gray-400">{getTimeAgo(backup.timestamp)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {backup.questCount} quests • {backup.npcCount} NPCs • {backup.leadCount} leads
                        </p>
                      </div>
                      {idx === 0 && (
                        <span className="px-2 py-1 bg-green-900/40 text-green-300 text-xs rounded whitespace-nowrap">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          exportToFile(backup);
                          setShowBackupList(false);
                        }}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          const restored = restoreBackup(backup.id);
                          if (restored) {
                            // Reload to restore data
                            localStorage.setItem('restoreFromBackup', JSON.stringify(restored.data));
                            window.location.reload();
                          }
                        }}
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {backups.length > 0 && (
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-500">
                  Keeping last {Math.min(backups.length, 10)} backups • {backupSize} total
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Auto-backups every 5 minutes. Manual backups on demand.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
