import React, { useState, useRef, useEffect } from 'react';
import { GlobalFilters } from './GlobalFilters';
import { ProjectsSection } from './ProjectsSection';
import { NotesSection } from './NotesSection';
import { ExternalFolders } from './ExternalFolders';
import { SmartFilterModal } from './SmartFilterModal';
import { GroupIconPicker } from './GroupIconPicker';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { SlidersHorizontal, Plus, FolderPlus, History } from 'lucide-react';

const OdiseaLogo: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`micro-icon shrink-0 rounded-xs shadow-2xs ${className}`}
  >
    <defs>
      <linearGradient id="odiseaHeaderLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0A84FF" />
        <stop offset="100%" stopColor="#0066E6" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="96" fill="#ffffff" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 256 64 C 362 64 448 150 448 256 C 448 362 362 448 256 448 C 150 448 64 362 64 256 C 64 150 150 64 256 64 Z M 256 160 C 203 160 160 203 160 256 C 160 309 203 352 256 352 C 309 352 352 309 352 256 C 352 203 309 160 256 160 Z"
      fill="url(#odiseaHeaderLogoGrad)"
    />
  </svg>
);

export const LibraryTree: React.FC = () => {
  const { openModal, focusedPanel, setFocusedPanel, drillDown } = useOdiseaStore();
  const [isSmartFilterOpen, setIsSmartFilterOpen] = useState(false);
  const libraryRef = useRef<HTMLDivElement>(null);

  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    groupId?: string;
    icon: string;
    color: string;
  }>({
    isOpen: false,
    icon: 'folder',
    color: '#0a84ff',
  });

  useEffect(() => {
    const handleFocusPanel = (e: any) => {
      if (e.detail?.panel === 'library') {
        libraryRef.current?.focus();
      }
    };
    window.addEventListener('odisea-focus-panel', handleFocusPanel);
    return () => window.removeEventListener('odisea-focus-panel', handleFocusPanel);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Return: Drill-down to Sheet List
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      drillDown();
    }
  };

  const isPanelFocused = focusedPanel === 'library';

  return (
    <aside
      ref={libraryRef}
      tabIndex={0}
      onFocus={() => setFocusedPanel('library')}
      onKeyDown={handleKeyDown}
      className="w-64 h-full flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] select-none outline-none focus:ring-1 focus:ring-inset focus:ring-[var(--color-accent)]/30"
    >
      {/* Top Application Bar Header */}
      <div className={`h-10 px-3 flex items-center justify-between border-b border-[var(--color-border)] ${
        isPanelFocused ? 'border-b-[var(--color-accent)]/50' : ''
      }`}>
        <div className="flex items-center gap-2">
          <OdiseaLogo size={15} />
          <span className="text-xs font-bold tracking-wider text-[var(--color-text-primary)]">
            ODISEA
          </span>
          <span className="micro-badge bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold">
            PRO
          </span>
          {isPanelFocused && (
            <span className="micro-badge bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-mono text-[9px]">
              KBD
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Historial de Proyectos y Documentos (Ctrl+H)"
            onClick={() => openModal('history')}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            <History size={14} className="micro-icon" />
          </button>
          <button
            title="Crear Filtro Inteligente"
            onClick={() => setIsSmartFilterOpen(true)}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            <SlidersHorizontal size={14} className="micro-icon" />
          </button>
          <button
            title="Ajustes de Odisea"
            onClick={() => openModal('settings')}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            <FolderPlus size={14} className="micro-icon" />
          </button>
        </div>
      </div>

      {/* Scrollable Tree Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 text-xs font-medium">
        <GlobalFilters />
        <ProjectsSection />
        <NotesSection />
        <ExternalFolders />
      </div>

      {/* Footer Status Bar */}
      <div className="h-8 px-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SQLite Portable</span>
        </div>
        <button
          onClick={() => openModal('command_palette')}
          className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          Ctrl+K
        </button>
      </div>

      {/* Modals for Smart Filter & Icon Picking */}
      <SmartFilterModal
        isOpen={isSmartFilterOpen}
        onClose={() => setIsSmartFilterOpen(false)}
      />

      {iconPickerState.isOpen && (
        <GroupIconPicker
          currentIcon={iconPickerState.icon}
          currentColor={iconPickerState.color}
          onSelect={(icon, color) => {
            setIconPickerState((prev) => ({ ...prev, icon, color, isOpen: false }));
          }}
          onClose={() => setIconPickerState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </aside>
  );
};
