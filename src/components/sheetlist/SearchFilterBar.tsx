import React from 'react';
import { Search, ArrowUpDown, Filter, X } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'updated_at' | 'title' | 'sort_order';
  onSortChange: (sort: 'updated_at' | 'title' | 'sort_order') => void;
  showMaterialOnly: boolean;
  onToggleMaterialOnly: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showMaterialOnly,
  onToggleMaterialOnly,
}) => {
  return (
    <div className="p-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-1.5">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search
          size={13}
          className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none micro-icon"
        />
        <input
          type="text"
          placeholder="Buscar en estas hojas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-7 py-1 text-xs rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:border-[var(--color-accent)]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5"
          >
            <X size={12} className="micro-icon" />
          </button>
        )}
      </div>

      {/* Sorting & Filter controls */}
      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] px-0.5">
        <div className="flex items-center gap-1">
          <ArrowUpDown size={12} className="micro-icon text-[var(--color-text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as 'updated_at' | 'title' | 'sort_order')
            }
            className="bg-transparent border-none text-[var(--color-text-secondary)] cursor-pointer focus:outline-hidden hover:text-[var(--color-text-primary)]"
          >
            <option value="updated_at" className="bg-[var(--color-bg-secondary)]">
              Modificación
            </option>
            <option value="title" className="bg-[var(--color-bg-secondary)]">
              Título
            </option>
            <option value="sort_order" className="bg-[var(--color-bg-secondary)]">
              Manual
            </option>
          </select>
        </div>

        <button
          onClick={onToggleMaterialOnly}
          className={`micro-badge cursor-pointer transition-colors ${
            showMaterialOnly
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Alternar filtro de hojas de material / investigación"
        >
          Material
        </button>
      </div>
    </div>
  );
};
