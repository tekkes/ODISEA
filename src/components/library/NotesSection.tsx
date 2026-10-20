import React from 'react';
import { useOdiseaStore } from '@/store';
import { Inbox, Folder, Plus } from 'lucide-react';

export const NotesSection: React.FC = () => {
  const { groups, activeGroupId, setActiveGroup, openModal } = useOdiseaStore();
  const noteGroups = groups.filter((g) => !g.project_id);

  return (
    <div className="mb-3 px-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93] px-2 mb-1">
        <span>Notas</span>
        <button
          onClick={() => openModal('newGroup')}
          className="text-[#8e8e93] hover:text-[#f2f2f7] p-0.5 rounded transition-colors"
          title="Crear Grupo"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-0.5">
        <button
          onClick={() => setActiveGroup(null)}
          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
            activeGroupId === null
              ? 'bg-[#2c2c2e] text-[#f2f2f7] font-medium'
              : 'text-[#aeaeb2] hover:bg-[#252528] hover:text-[#f2f2f7]'
          }`}
        >
          <Inbox size={14} className="text-teal-400" />
          <span>Bandeja de Entrada (Inbox)</span>
        </button>

        {noteGroups.map((g) => {
          const isActive = activeGroupId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                isActive
                  ? 'bg-[#007aff] text-white font-medium'
                  : 'text-[#aeaeb2] hover:bg-[#2c2c2e] hover:text-[#f2f2f7]'
              }`}
            >
              <Folder size={14} className={isActive ? 'text-white' : 'text-[#8e8e93]'} />
              <span className="truncate">{g.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
