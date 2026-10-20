import React from 'react';
import { useOdiseaStore } from '@/store';
import { Files, Calendar, Star, Trash2 } from 'lucide-react';

export const GlobalFilters: React.FC = () => {
  const { activeGlobalFilter, setGlobalFilter } = useOdiseaStore();

  const filters = [
    { id: 'all', label: 'Todo', icon: Files, color: 'text-blue-400' },
    { id: 'last7days', label: 'Últimos 7 días', icon: Calendar, color: 'text-amber-400' },
    { id: 'favorites', label: 'Favoritos', icon: Star, color: 'text-yellow-400' },
    { id: 'trash', label: 'Papelera', icon: Trash2, color: 'text-red-400' },
  ];

  return (
    <div className="mb-3 px-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93] px-2 mb-1">
        Filtros Globales
      </div>
      <div className="space-y-0.5">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeGlobalFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setGlobalFilter(f.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                isActive
                  ? 'bg-[#007aff] text-white font-medium'
                  : 'text-[#aeaeb2] hover:bg-[#2c2c2e] hover:text-[#f2f2f7]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : f.color} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
