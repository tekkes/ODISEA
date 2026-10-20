import React, { useMemo } from 'react';
import { useOdiseaStore, Sheet } from '../../store/useOdiseaStore';
import { ListTree, Hash, Link2, FileText, ChevronRight } from 'lucide-react';

interface HeadingItem {
  sheetId: string;
  sheetTitle: string;
  level: number;
  text: string;
  line: number;
}

export const OutlinePane: React.FC = () => {
  const { activeSheet, sheets, setActiveSheet } = useOdiseaStore();

  // Find all glued sheets in the current sequence (if glued)
  const gluedSequence = useMemo<Sheet[]>(() => {
    if (!activeSheet) return [];
    if (!activeSheet.group_id) return [activeSheet];

    const groupSheets = sheets.filter((s) => s.group_id === activeSheet.group_id);
    const currentIndex = groupSheets.findIndex((s) => s.id === activeSheet.id);
    if (currentIndex === -1) return [activeSheet];

    // Find start of glued sequence
    let startIndex = currentIndex;
    while (startIndex > 0 && groupSheets[startIndex - 1].glued_with_next) {
      startIndex--;
    }

    // Find end of glued sequence
    let endIndex = currentIndex;
    while (endIndex < groupSheets.length - 1 && groupSheets[endIndex].glued_with_next) {
      endIndex++;
    }

    if (startIndex === endIndex) {
      return [activeSheet];
    }

    return groupSheets.slice(startIndex, endIndex + 1);
  }, [activeSheet, sheets]);

  // Extract headings from either single active sheet or glued sequence
  const headings = useMemo<HeadingItem[]>(() => {
    if (!activeSheet) return [];
    const items: HeadingItem[] = [];

    gluedSequence.forEach((sheet) => {
      const lines = sheet.content_mdxl.split('\n');
      lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          items.push({
            sheetId: sheet.id,
            sheetTitle: sheet.title,
            level: match[1].length,
            text: match[2].trim(),
            line: index + 1,
          });
        }
      });
    });

    return items;
  }, [gluedSequence, activeSheet]);

  const handleJumpToHeading = (item: HeadingItem) => {
    // If the heading belongs to another sheet in the glued sequence, switch to it
    if (activeSheet && item.sheetId !== activeSheet.id) {
      const targetSheet = sheets.find((s) => s.id === item.sheetId);
      if (targetSheet) {
        setActiveSheet(targetSheet);
      }
    }

    // Dispatch global event for CodeMirror to jump to line
    window.dispatchEvent(
      new CustomEvent('odisea-jump-to-line', {
        detail: { line: item.line, sheetId: item.sheetId },
      })
    );
  };

  const isGlued = gluedSequence.length > 1;

  if (headings.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[var(--color-text-muted)] space-y-2 select-none">
        <ListTree size={24} className="mx-auto stroke-[1.5] opacity-40 text-[var(--color-accent)]" />
        <p className="font-medium text-[var(--color-text-primary)]">Sin encabezados</p>
        <p className="text-[11px] opacity-75">
          Escribe encabezados #, ## o ### para generar automáticamente el esquema navegable de tu documento.
        </p>
      </div>
    );
  }

  let currentSheetId = '';

  return (
    <div className="p-2 space-y-1 text-xs select-none">
      {isGlued && (
        <div className="px-2 py-1.5 mb-2 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-between text-[11px] text-[var(--color-accent)]">
          <div className="flex items-center gap-1.5 font-medium">
            <Link2 size={13} className="micro-icon" />
            <span>Esquema de Hojas Pegadas ({gluedSequence.length})</span>
          </div>
        </div>
      )}

      {headings.map((item, idx) => {
        const isNewSheetHeader = isGlued && item.sheetId !== currentSheetId;
        if (isNewSheetHeader) {
          currentSheetId = item.sheetId;
        }

        const indentClass =
          item.level === 1
            ? 'pl-2 font-semibold text-[var(--color-text-primary)]'
            : item.level === 2
            ? 'pl-5 font-medium text-[var(--color-text-primary)]'
            : item.level === 3
            ? 'pl-8 text-[var(--color-text-secondary)]'
            : item.level === 4
            ? 'pl-11 text-[var(--color-text-secondary)]'
            : 'pl-14 text-[var(--color-text-muted)]';

        return (
          <React.Fragment key={`${item.sheetId}-${item.line}-${idx}`}>
            {isNewSheetHeader && (
              <div className="pt-2 pb-1 px-1 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                <FileText size={10} className="micro-icon text-[var(--color-accent)]" />
                <span className="truncate">{item.sheetTitle}</span>
              </div>
            )}

            <div
              onClick={() => handleJumpToHeading(item)}
              title={`Saltar a línea ${item.line} de ${item.sheetTitle}`}
              className={`py-1.5 pr-2 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer flex items-center justify-between transition-colors group ${indentClass}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)] shrink-0 font-bold">
                  H{item.level}
                </span>
                <span className="truncate group-hover:text-[var(--color-accent)] transition-colors">
                  {item.text}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100">
                  L{item.line}
                </span>
                <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 text-[var(--color-accent)] transition-opacity" />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
