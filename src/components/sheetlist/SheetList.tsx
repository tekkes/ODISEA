import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { SheetCard } from './SheetCard';
import { SearchFilterBar } from './SearchFilterBar';
import { Plus, Layers, FilePlus, Sparkles } from 'lucide-react';

export const SheetList: React.FC = () => {
  const {
    sheets,
    activeSheetId,
    activeGroupId,
    activeProjectId,
    focusedPanel,
    setFocusedPanel,
    drillDown,
    drillUp,
    setActiveSheet,
    createNewSheet,
    toggleFavorite,
    toggleGlue,
  } = useOdiseaStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'title' | 'sort_order'>('updated_at');
  const [showMaterialOnly, setShowMaterialOnly] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter sheets
  const filteredSheets = useMemo(() => {
    let result = [...sheets];

    if (showMaterialOnly) {
      result = result.filter((s) => s.is_material);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content_mdxl.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'sort_order') {
        return a.sort_order - b.sort_order;
      }
      // default: updated_at desc
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [sheets, searchQuery, sortBy, showMaterialOnly]);

  const handleCreateSheet = async () => {
    await createNewSheet(activeGroupId || undefined);
  };

  // Scroll active sheet into view smoothly
  const scrollToActiveSheet = useCallback((sheetId: string) => {
    const el = listContainerRef.current?.querySelector(`[data-sheet-id="${sheetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Listen for panel focus and scroll events
  useEffect(() => {
    const handleFocusPanel = (e: any) => {
      if (e.detail?.panel === 'sheetlist') {
        listContainerRef.current?.focus();
        if (activeSheetId) {
          scrollToActiveSheet(activeSheetId);
        }
      }
    };

    const handleScrollEvent = (e: any) => {
      if (e.detail?.sheetId) {
        scrollToActiveSheet(e.detail.sheetId);
      }
    };

    window.addEventListener('odisea-focus-panel', handleFocusPanel);
    window.addEventListener('odisea-scroll-to-sheet', handleScrollEvent);

    return () => {
      window.removeEventListener('odisea-focus-panel', handleFocusPanel);
      window.removeEventListener('odisea-scroll-to-sheet', handleScrollEvent);
    };
  }, [activeSheetId, scrollToActiveSheet]);

  // Keyboard navigation inside Sheet List
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSheets.length === 0) return;

    const currentIndex = filteredSheets.findIndex((s) => s.id === activeSheetId);

    // Ctrl+Return -> Drill-up (to Library)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      drillUp();
      return;
    }

    // Return -> Drill-down (to Editor)
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      drillDown();
      return;
    }

    // ArrowDown -> Next sheet
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < filteredSheets.length - 1 ? currentIndex + 1 : currentIndex;
      const target = filteredSheets[nextIndex];
      if (target) {
        setActiveSheet(target);
        scrollToActiveSheet(target.id);
      }
      return;
    }

    // ArrowUp -> Previous sheet
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      const target = filteredSheets[prevIndex];
      if (target) {
        setActiveSheet(target);
        scrollToActiveSheet(target.id);
      }
      return;
    }
  };

  const isPanelFocused = focusedPanel === 'sheetlist';

  return (
    <section className="w-72 h-full flex flex-col bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] select-none">
      {/* Header */}
      <div className={`h-10 px-3 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] ${
        isPanelFocused ? 'border-b-[var(--color-accent)]/50' : ''
      }`}>
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-[var(--color-accent)] micro-icon" />
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            Hojas ({filteredSheets.length})
          </span>
          {isPanelFocused && (
            <span className="micro-badge bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-mono text-[9px]">
              KBD
            </span>
          )}
        </div>
        <button
          onClick={handleCreateSheet}
          title="Crear nueva hoja (Ctrl+N)"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)] text-white hover:brightness-110 shadow-xs cursor-pointer"
        >
          <Plus size={13} className="micro-icon" />
          <span>Nueva</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showMaterialOnly={showMaterialOnly}
        onToggleMaterialOnly={() => setShowMaterialOnly((prev) => !prev)}
      />

      {/* Sheet List Body with keyboard focus listener */}
      <div
        ref={listContainerRef}
        tabIndex={0}
        onFocus={() => setFocusedPanel('sheetlist')}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)] outline-none focus:ring-1 focus:ring-inset focus:ring-[var(--color-accent)]/30"
      >
        {filteredSheets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[var(--color-text-muted)] space-y-3">
            <FilePlus size={28} className="stroke-[1.5] text-[var(--color-text-muted)] opacity-40" />
            <p className="text-xs">No hay hojas en esta vista.</p>
            <button
              onClick={handleCreateSheet}
              className="text-xs text-[var(--color-accent)] hover:underline font-medium"
            >
              Crear primera hoja
            </button>
          </div>
        ) : (
          filteredSheets.map((sheet) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              isSelected={sheet.id === activeSheetId}
              onSelect={() => {
                setActiveSheet(sheet);
                setFocusedPanel('sheetlist');
              }}
              onToggleFavorite={() => toggleFavorite(sheet.id)}
              onToggleGlue={() => toggleGlue(sheet.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};
