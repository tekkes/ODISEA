import React from 'react';
import { HardDrive, Plus } from 'lucide-react';
import { useOdiseaStore } from '@/store';

export const ExternalFolders: React.FC = () => {
  const { openModal } = useOdiseaStore();

  return (
    <div className="mb-3 px-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93] px-2 mb-1">
        <span>Carpetas Externas</span>
        <button
          onClick={() => openModal('addExternalFolder')}
          className="text-[#8e8e93] hover:text-[#f2f2f7] p-0.5 rounded transition-colors"
          title="Vincular Carpeta del Disco"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="rounded border border-dashed border-[#38383a] p-2 text-center text-xs text-[#8e8e93]">
        <HardDrive size={16} className="mx-auto mb-1 text-[#636366]" />
        <span>Arrastra carpetas locales o repositorios Git</span>
      </div>
    </div>
  );
};
