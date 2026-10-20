import React, { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, Globe, FileText, Check, X, Search, Info } from 'lucide-react';
import { useOdiseaStore } from '../../store/useOdiseaStore';

interface LinkPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertLink: (linkMarkdown: string) => void;
  initialText?: string;
  initialUrl?: string;
  position?: { x: number; y: number } | null;
}

export const LinkPopover: React.FC<LinkPopoverProps> = ({
  isOpen,
  onClose,
  onInsertLink,
  initialText = '',
  initialUrl = '',
  position,
}) => {
  const { sheets } = useOdiseaStore();
  const [tab, setTab] = useState<'web' | 'internal'>('web');
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [sheetSearch, setSheetSearch] = useState('');
  const [selectedSheetTitle, setSelectedSheetTitle] = useState('');

  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl(initialUrl || 'https://');
      setSheetSearch('');
      setSelectedSheetTitle('');
      setTimeout(() => urlInputRef.current?.focus(), 20);
    }
  }, [isOpen, initialText, initialUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    const label = text.trim() || 'Enlace';
    if (tab === 'web') {
      const targetUrl = url.trim();
      if (!targetUrl) return;
      onInsertLink(`[${label}](${targetUrl})`);
    } else {
      const sheetName = selectedSheetTitle || sheetSearch.trim();
      if (!sheetName) return;
      if (text.trim() && text.trim() !== sheetName) {
        onInsertLink(`[[${sheetName}|${text.trim()}]]`);
      } else {
        onInsertLink(`[[${sheetName}]]`);
      }
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const filteredSheets = sheets.filter((s) =>
    s.title.toLowerCase().includes(sheetSearch.toLowerCase())
  );

  const stylePos = position
    ? {
        position: 'fixed' as const,
        left: `${Math.min(Math.max(12, position.x), window.innerWidth - 360)}px`,
        top: `${Math.min(Math.max(12, position.y + 4), window.innerHeight - 300)}px`,
      }
    : undefined;

  return (
    <div
      className={position ? '' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs'}
      onClick={onClose}
    >
      <div
        style={stylePos}
        className="w-[350px] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-1.5">
            <LinkIcon size={14} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Insertar Enlace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={12} className="micro-icon" />
          </button>
        </div>

        {/* Tab switch: Web vs Internal Sheet */}
        <div className="flex gap-1 mt-2.5 bg-[var(--color-bg-primary)] p-0.5 rounded-lg border border-[var(--color-border)] text-xs">
          <button
            type="button"
            onClick={() => setTab('web')}
            className={`flex-1 py-1 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'web'
                ? 'bg-[var(--color-accent)] text-white font-medium'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Globe size={12} className="micro-icon" />
            <span>Enlace Web</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('internal')}
            className={`flex-1 py-1 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'internal'
                ? 'bg-[var(--color-accent)] text-white font-medium'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FileText size={12} className="micro-icon" />
            <span>Hoja Interna ([[ ]])</span>
          </button>
        </div>

        {/* Tab 1: Web Link */}
        {tab === 'web' ? (
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                Texto del Enlace
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Texto visible..."
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                Dirección URL
              </label>
              <input
                ref={urlInputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://..."
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden font-mono"
              />
            </div>
          </div>
        ) : (
          /* Tab 2: Internal Sheet Link */
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                Buscar Hoja de la Biblioteca
              </label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-[var(--color-text-muted)] micro-icon" />
                <input
                  type="text"
                  value={sheetSearch}
                  onChange={(e) => setSheetSearch(e.target.value)}
                  placeholder="Escribe el nombre de la hoja..."
                  className="w-full pl-7 pr-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
                />
              </div>
            </div>

            {/* List of matching sheets */}
            <div className="max-h-28 overflow-y-auto border border-[var(--color-border)] rounded-md bg-[var(--color-bg-primary)] p-1 space-y-0.5 no-scrollbar">
              {filteredSheets.length === 0 ? (
                <div className="text-[11px] text-[var(--color-text-muted)] text-center py-2">
                  No se encontraron hojas coincidentes
                </div>
              ) : (
                filteredSheets.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSheetTitle(s.title);
                      setSheetSearch(s.title);
                      if (!text.trim()) setText(s.title);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs text-left cursor-pointer transition-colors ${
                      selectedSheetTitle === s.title
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    <span className="truncate">{s.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={tab === 'web' ? !url.trim() : !selectedSheetTitle && !sheetSearch.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Check size={12} className="micro-icon" />
            <span>Insertar Enlace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
