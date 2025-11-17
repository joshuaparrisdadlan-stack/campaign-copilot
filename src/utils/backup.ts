// Backup and restore functionality for Campaign Copilot
// Provides auto-backup, manual backup, and restore capabilities

export interface CampaignBackup {
  id: string;
  timestamp: number;
  campaignName: string;
  questCount: number;
  npcCount: number;
  leadCount: number;
  data: {
    quests: any[];
    npcs: any[];
    leads: any[];
    businessIdeas: any[];
    hubs: any[];
    campaigns: any[];
    characterProfiles: any[];
    sessionEvents: any[];
  };
}

const BACKUP_STORAGE_KEY = 'campaign-backups';
const MAX_BACKUPS = 10;
const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get all stored backups
 */
export function getBackups(): CampaignBackup[] {
  try {
    const backupsJSON = localStorage.getItem(BACKUP_STORAGE_KEY);
    return backupsJSON ? JSON.parse(backupsJSON) : [];
  } catch (error) {
    console.error('Error loading backups:', error);
    return [];
  }
}

/**
 * Create a backup of current campaign data
 */
export function createBackup(
  campaignName: string,
  campaignData: {
    quests: any[];
    npcs: any[];
    leads: any[];
    businessIdeas: any[];
    hubs: any[];
    campaigns: any[];
    characterProfiles: any[];
    sessionEvents: any[];
  }
): CampaignBackup {
  const backup: CampaignBackup = {
    id: Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    campaignName,
    questCount: campaignData.quests.length,
    npcCount: campaignData.npcs.length,
    leadCount: campaignData.leads.length,
    data: campaignData,
  };

  // Get existing backups
  const backups = getBackups();
  backups.push(backup);

  // Keep only the most recent MAX_BACKUPS
  const trimmedBackups = backups.slice(-MAX_BACKUPS);

  // Save to localStorage
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(trimmedBackups));
  } catch (error) {
    console.error('Error saving backup:', error);
    // If storage is full, remove oldest backup and try again
    if (trimmedBackups.length > 1) {
      trimmedBackups.shift();
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(trimmedBackups));
    }
  }

  return backup;
}

/**
 * Restore campaign data from a backup
 */
export function restoreBackup(backupId: string): CampaignBackup | null {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);

  if (!backup) {
    console.error(`Backup with id ${backupId} not found`);
    return null;
  }

  return backup;
}

/**
 * Delete a backup
 */
export function deleteBackup(backupId: string): boolean {
  const backups = getBackups();
  const filtered = backups.filter(b => b.id !== backupId);

  if (filtered.length === backups.length) {
    console.warn(`Backup with id ${backupId} not found`);
    return false;
  }

  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get size of all backups in bytes
 */
export function getBackupSizeBytes(): number {
  try {
    const backupsJSON = localStorage.getItem(BACKUP_STORAGE_KEY) || '';
    return new Blob([backupsJSON]).size;
  } catch (error) {
    console.error('Error calculating backup size:', error);
    return 0;
  }
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Export campaign data as JSON file
 */
export function exportToFile(backup: CampaignBackup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campaign-${backup.campaignName}-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Get time ago string (e.g., "5 minutes ago")
 */
export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Enable auto-backup with specified interval
 */
export function startAutoBackup(
  campaignName: string,
  getCampaignData: () => {
    quests: any[];
    npcs: any[];
    leads: any[];
    businessIdeas: any[];
    hubs: any[];
    campaigns: any[];
    characterProfiles: any[];
    sessionEvents: any[];
  },
  intervalMs: number = BACKUP_INTERVAL_MS
): () => void {
  // Perform initial backup
  createBackup(campaignName, getCampaignData());

  // Set up interval
  const intervalId = setInterval(() => {
    createBackup(campaignName, getCampaignData());
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
