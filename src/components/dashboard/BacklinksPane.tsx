import React, { useState, useEffect, useMemo } from 'react';
import { useOdiseaStore, Sheet } from '../../store/useOdiseaStore';
import { invokeCommand } from '../../store/tauri_ipc';
import {
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Plus,
  ExternalLink,
  Folder,
} from 'lucide-react';

interface BacklinkWithContext {
  id: string;
  source_sheet_id: string;
  source_title: string;
  group_name: string | null;
  project_name: string | null;
  line_number: number;
  anchor_text: string;
  snippet: string;
}

export const BacklinksPane: React.FC = () => {
  const { activeSheet, sheets, setActiveSheet, createNewSheet } = useOdiseaStore();
  const [backlinks, setBacklinks] = useState<BacklinkWithContext[]>([]);
  const [loadingBacklinks, setLoadingBacklinks] = useState(false);

  // Load incoming backlinks with paragraph context
  useEffect(() => {
    let isMounted = true;
    if (!activeSheet) {
      setBacklinks([]);
      return;
    }

    setLoadingBacklinks(true);
    invokeCommand<BacklinkWithContext[]>('cmd_get_backlinks_with_context', {
      sheetId: activeSheet.id,
    })
      .then((res) => {
        if (isMounted) {
          setBacklinks(Array.isArray(res) ? res : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load backlinks with context:', err);
        // Fallback: search sheets in store
        if (isMounted && activeSheet) {
          const title = activeSheet.title.toLowerCase();
          const id = activeSheet.id;
          const found: BacklinkWithContext[] = [];

          sheets.forEach((s) => {
            if (s.id === activeSheet.id) return;
            s.content_mdxl.split('\n').forEach((line, idx) => {
              if (
                line.toLowerCase().includes(`[[${title}]]`) ||
                line.includes(`[[${id}]]`)
              ) {
                found.push({
                  id: `${s.id}-${idx}`,
                  source_sheet_id: s.id,
                  source_title: s.title,
                  group_name: null,
                  project_name: null,
                  line_number: idx + 1,
                  anchor_text: activeSheet.title,
                  snippet: line.trim(),
                });
              }
            });
          });
          setBacklinks(found);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingBacklinks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSheet?.id, activeSheet?.title, sheets]);

  // Outgoing links parsed from [[Target]]
  const outgoingLinks = useMemo(() => {
    if (!activeSheet?.content_mdxl) return [];
    const matches = activeSheet.content_mdxl.match(/\[\[(.*?)\]\]/g) || [];
    return Array.from(new Set(matches.map((m) => m.slice(2, -2).trim())));
  }, [activeSheet?.content_mdxl]);

  const handleOpenSourceSheet = (bl: BacklinkWithContext) => {
    const targetSheet = sheets.find((s) => s.id === bl.source_sheet_id);
    if (targetSheet) {
      setActiveSheet(targetSheet);
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('odisea-jump-to-line', {
            detail: { line: bl.line_number, sheetId: targetSheet.id },
          })
        );
      }, 50);
    }
  };

  const handleCreateTargetSheet = async (targetTitle: string) => {
    await createNewSheet();
    // Update newly created sheet's title
    const latestSheet = useOdiseaStore.getState().activeSheet;
    if (latestSheet) {
      await useOdiseaStore
        .getState()
        .updateSheetContent(
          latestSheet.id,
          targetTitle,
          `# ${targetTitle}\n\nCreada a partir de un enlace desde [[${activeSheet?.title}]].\n`
        );
    }
  };

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Incoming Backlinks Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
            <ArrowDownLeft size={14} className="text-emerald-400 micro-icon" />
            <span>Enlaces Entrantes ({backlinks.length})</span>
          </div>
          {loadingBacklinks && (
            <span className="text-[10px] text-[var(--color-text-muted)] animate-pulse">
              Cargando...
            </span>
          )}
        </div>

        {backlinks.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-center text-[var(--color-text-muted)] space-y-1">
            <p className="text-[11px]">
              Ninguna otra hoja de tu biblioteca enlaza a este documento.
            </p>
            <p className="text-[10px] opacity-75">
              Usa [[{activeSheet?.title || 'Título'}]] en otras hojas para crear una conexión bidireccional.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {backlinks.map((bl) => (
              <div
                key={bl.id}
                onClick={() => handleOpenSourceSheet(bl)}
                className="p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-emerald-400/50 hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors space-y-1.5 group"
                title={`Abrir ${bl.source_title} en línea ${bl.line_number}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText size={12} className="text-emerald-400 micro-icon shrink-0" />
                    <span className="font-semibold text-[var(--color-text-primary)] truncate group-hover:text-emerald-400 transition-colors">
                      {bl.source_title}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 shrink-0">
                    L{bl.line_number}
                  </span>
                </div>

                {bl.group_name && (
                  <div className="flex items-center gap-1 text-[9px] text-[var(--color-text-muted)]">
                    <Folder size={10} className="micro-icon" />
                    <span>
                      {bl.project_name ? `${bl.project_name} / ` : ''}
                      {bl.group_name}
                    </span>
                  </div>
                )}

                {/* Paragraph Snippet with Highlight */}
                <p className="text-[11px] text-[var(--color-text-secondary)] italic leading-tight pl-2 border-l-2 border-emerald-400/40">
                  "...{bl.snippet}..."
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Links Section */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
          <ArrowUpRight size={14} className="text-sky-400 micro-icon" />
          <span>Enlaces Salientes ({outgoingLinks.length})</span>
        </div>

        {outgoingLinks.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] italic pl-1">
            No has incluido enlaces wiki [[Título]] en esta hoja.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {outgoingLinks.map((targetTitle, i) => {
              const targetSheet = sheets.find(
                (s) => s.title.toLowerCase() === targetTitle.toLowerCase()
              );

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                    targetSheet
                      ? 'bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-primary)]'
                      : 'bg-[var(--color-bg-primary)]/50 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                  onClick={() => targetSheet && setActiveSheet(targetSheet)}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Link2 size={12} className="micro-icon text-sky-400 shrink-0" />
                    <span className="truncate font-medium">{targetTitle}</span>
                  </div>

                  {targetSheet ? (
                    <span className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-0.5">
                      Abrir
                      <ExternalLink size={10} className="micro-icon" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateTargetSheet(targetTitle);
                      }}
                      className="py-0.5 px-1.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors text-[10px] font-medium flex items-center gap-1"
                      title="Crear esta hoja ahora"
                    >
                      <Plus size={10} className="micro-icon" />
                      <span>Crear</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
