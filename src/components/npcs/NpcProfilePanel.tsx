import React from 'react';
import type { NPC, Hub } from '../../types';

interface NpcProfilePanelProps {
  npc: NPC | null;
  hubForNpc?: Hub | null;
}

export const NpcProfilePanel: React.FC<NpcProfilePanelProps> = ({ npc, hubForNpc }) => {
  if (!npc) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 px-4 py-6 text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-1">NPC Profile</p>
        <p>Select an NPC on the left to see their profile here.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-5 flex flex-col gap-4 sm:min-w-[340px]">
      {/* Textual profile first */}
      <div className="flex-1 text-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">NPC Profile</p>
        <h3 className="text-lg font-semibold text-slate-50 mb-1">{npc.name}</h3>
        {npc.role && (
          <p className="text-slate-300 mb-1">
            <span className="font-medium text-slate-200">Role: </span>
            {npc.role}
          </p>
        )}

        {(hubForNpc?.name || npc.location) && (
          <p className="text-slate-300 mb-2">
            <span className="font-medium text-slate-200">Based in: </span>
            {npc.location || hubForNpc?.name}
          </p>
        )}

        {/* Notes */}
        {npc.notes ? (
          <p className="text-slate-300/90 leading-snug whitespace-pre-line">{npc.notes}</p>
        ) : (
          <p className="text-slate-400">No notes for this NPC.</p>
        )}
      </div>

      {/* Silhouette avatar moved to bottom to reduce 'top-heavy' look */}
      <div className="flex items-center justify-center mt-2">
        <div className="relative w-28 h-28 rounded-full bg-slate-800/90 shadow-inner shadow-black/60">
          {/* Head */}
          <div className="absolute inset-x-7 top-5 h-8 rounded-full bg-slate-600/90" />
          {/* Shoulders / torso */}
          <div className="absolute inset-x-5 bottom-3 h-10 rounded-t-full rounded-b-3xl bg-slate-700/90" />
        </div>
      </div>
    </div>
  );
};

export default NpcProfilePanel;
