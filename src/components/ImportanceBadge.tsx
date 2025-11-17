import type { Quest, NPC, Lead } from '../types';

interface ImportanceBadgeProps {
  importance?: number;
  npcRole?: string;
  status?: 'Open' | 'In Progress' | 'Resolved';
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export function ImportanceBadge({ importance, npcRole, status, size = 'md', compact = false }: ImportanceBadgeProps) {
  if (npcRole) {
    const roleEmojis: Record<string, string> = {
      'ally': '⚔️',
      'Ally': '⚔️',
      'neutral': '🤝',
      'Neutral': '🤝',
      'merchant': '🏪',
      'Merchant': '🏪',
      'enemy': '👹',
      'Enemy': '👹',
      'quest-giver': '❓',
      'Quest-Giver': '❓',
      'quest giver': '❓',
      'villain': '🎭',
      'Villain': '🎭',
    };

    const roleColors: Record<string, { bg: string; text: string }> = {
      'ally': { bg: 'bg-green-900/40', text: 'text-green-300' },
      'Ally': { bg: 'bg-green-900/40', text: 'text-green-300' },
      'neutral': { bg: 'bg-gray-700/40', text: 'text-gray-300' },
      'Neutral': { bg: 'bg-gray-700/40', text: 'text-gray-300' },
      'merchant': { bg: 'bg-amber-900/40', text: 'text-amber-300' },
      'Merchant': { bg: 'bg-amber-900/40', text: 'text-amber-300' },
      'enemy': { bg: 'bg-red-900/40', text: 'text-red-300' },
      'Enemy': { bg: 'bg-red-900/40', text: 'text-red-300' },
      'quest-giver': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
      'Quest-Giver': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
      'quest giver': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
      'villain': { bg: 'bg-purple-900/40', text: 'text-purple-300' },
      'Villain': { bg: 'bg-purple-900/40', text: 'text-purple-300' },
    };

    const emoji = roleEmojis[npcRole] || '👤';
    const colors = roleColors[npcRole] || { bg: 'bg-gray-700/40', text: 'text-gray-300' };
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';
    const label = compact ? npcRole.charAt(0) : npcRole;

    return (
      <span className={`inline-block rounded ${colors.bg} ${colors.text} ${sizeClass} font-medium`}>
        {emoji} {label}
      </span>
    );
  }

  if (importance !== undefined) {
    const importanceConfig = [
      { bg: 'bg-green-900/30', text: 'text-green-400', dot: 'bg-green-500', label: 'Low' },
      { bg: 'bg-yellow-900/30', text: 'text-yellow-400', dot: 'bg-yellow-500', label: 'Medium' },
      { bg: 'bg-orange-900/30', text: 'text-orange-400', dot: 'bg-orange-500', label: 'High' },
      { bg: 'bg-red-900/30', text: 'text-red-400', dot: 'bg-red-600', label: 'Critical' },
    ];

    const level = Math.min(Math.max(Math.round(importance) - 1, 0), 3);
    const config = importanceConfig[level];
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded ${config.bg} ${config.text} ${sizeClass} font-medium`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {compact ? config.label.charAt(0) : config.label}
      </span>
    );
  }

  if (status) {
    const statusConfig: Record<string, { bg: string; text: string; emoji: string }> = {
      'Open': { bg: 'bg-blue-900/30', text: 'text-blue-400', emoji: '🔵' },
      'In Progress': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', emoji: '⚙️' },
      'Resolved': { bg: 'bg-green-900/30', text: 'text-green-400', emoji: '✅' },
    };

    const config = statusConfig[status] || statusConfig['Open'];
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';

    return (
      <span className={`inline-flex items-center gap-1 rounded ${config.bg} ${config.text} ${sizeClass} font-medium`}>
        {config.emoji} {compact ? status.charAt(0) : status}
      </span>
    );
  }

  return null;
}

interface QuestBadgeProps {
  quest: Quest;
  compact?: boolean;
}

export function QuestBadge({ quest, compact = false }: QuestBadgeProps) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <ImportanceBadge status={quest.status} size="sm" compact={compact} />
    </div>
  );
}

interface NPCBadgeProps {
  npc: NPC;
  compact?: boolean;
}

export function NPCBadge({ npc, compact = false }: NPCBadgeProps) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {npc.role && <ImportanceBadge npcRole={npc.role} size="sm" compact={compact} />}
    </div>
  );
}

interface LeadBadgeProps {
  lead: Lead;
  compact?: boolean;
}

export function LeadBadge({ lead, compact = false }: LeadBadgeProps) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <ImportanceBadge importance={lead.importance} size="sm" compact={compact} />
      <ImportanceBadge status={lead.status} size="sm" compact={compact} />
    </div>
  );
}
