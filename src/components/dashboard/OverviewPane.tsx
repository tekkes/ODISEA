import React, { useState, useMemo } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import {
  Link2,
  FileText,
  StickyNote,
  MessageSquare,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Filter,
  ExternalLink,
} from 'lucide-react';

type OverviewCategory = 'all' | 'tasks' | 'footnotes' | 'annotations' | 'links' | 'images' | 'comments';

interface DocumentElement {
  id: string;
  category: 'task' | 'footnote' | 'annotation' | 'link' | 'image' | 'comment';
  text: string;
  line: number;
  completed?: boolean;
  rawMatch: string;
}

export const OverviewPane: React.FC = () => {
  const { activeSheet, updateSheetContent } = useOdiseaStore();
  const [activeCategory, setActiveCategory] = useState<OverviewCategory>('all');

  const elements = useMemo<DocumentElement[]>(() => {
    if (!activeSheet?.content_mdxl) return [];
    const text = activeSheet.content_mdxl;
    const lines = text.split('\n');
    const items: DocumentElement[] = [];

    lines.forEach((line, lineIdx) => {
      const lineNum = lineIdx + 1;

      // 1. Checklists: - [ ] or - [x]
      const taskMatch = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/);
      if (taskMatch) {
        items.push({
          id: `task-${lineNum}`,
          category: 'task',
          text: taskMatch[2].trim(),
          line: lineNum,
          completed: taskMatch[1].toLowerCase() === 'x',
          rawMatch: taskMatch[0],
        });
      }

      // 2. Footnotes: (fn:...) or (fn) or [^...]
      const fnRegex = /\(fn(?::\s*([^)]*))?\)|\[\^([^\]]+)\]/g;
      let fnMatch;
      while ((fnMatch = fnRegex.exec(line)) !== null) {
        const noteText = fnMatch[1] || fnMatch[2] || 'Nota al pie';
        items.push({
          id: `fn-${lineNum}-${fnMatch.index}`,
          category: 'footnote',
          text: noteText.trim(),
          line: lineNum,
          rawMatch: fnMatch[0],
        });
      }

      // 3. Annotations: {annotation}
      const annRegex = /\{([^}]+)\}/g;
      let annMatch;
      while ((annMatch = annRegex.exec(line)) !== null) {
        items.push({
          id: `ann-${lineNum}-${annMatch.index}`,
          category: 'annotation',
          text: annMatch[1].trim(),
          line: lineNum,
          rawMatch: annMatch[0],
        });
      }

      // 4. Comments: %%comment%%
      const commentRegex = /%%([^%]+)%%/g;
      let commMatch;
      while ((commMatch = commentRegex.exec(line)) !== null) {
        items.push({
          id: `comm-${lineNum}-${commMatch.index}`,
          category: 'comment',
          text: commMatch[1].trim(),
          line: lineNum,
          rawMatch: commMatch[0],
        });
      }

      // 5. Links: [text](url) or [[Wikilink]]
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|\[\[(.*?)\]\]/g;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(line)) !== null) {
        const linkLabel = linkMatch[1] || linkMatch[3] || 'Enlace';
        const target = linkMatch[2] || linkMatch[3] || '';
        items.push({
          id: `link-${lineNum}-${linkMatch.index}`,
          category: 'link',
          text: `${linkLabel} -> ${target}`,
          line: lineNum,
          rawMatch: linkMatch[0],
        });
      }

      // 6. Images: (img:...) or ![alt](url)
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)|\(img(?::\s*([^)]*))?\)/g;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(line)) !== null) {
        const imgLabel = imgMatch[1] || imgMatch[3] || 'Imagen adjunta';
        items.push({
          id: `img-${lineNum}-${imgMatch.index}`,
          category: 'image',
          text: imgLabel.trim(),
          line: lineNum,
          rawMatch: imgMatch[0],
        });
      }
    });

    return items;
  }, [activeSheet?.content_mdxl]);

  // Toggle checklist checkbox directly in editor markdown content
  const handleToggleTask = async (task: DocumentElement) => {
    if (!activeSheet) return;
    const lines = activeSheet.content_mdxl.split('\n');
    const targetLineIdx = task.line - 1;
    if (targetLineIdx < 0 || targetLineIdx >= lines.length) return;

    const currentLine = lines[targetLineIdx];
    let newLine: string;
    if (task.completed) {
      newLine = currentLine.replace(/-\s*\[[xX]\]/, '- [ ]');
    } else {
      newLine = currentLine.replace(/-\s*\[\s*\]/, '- [x]');
    }

    lines[targetLineIdx] = newLine;
    const newContent = lines.join('\n');
    await updateSheetContent(activeSheet.id, activeSheet.title, newContent);
  };

  const handleJumpToLine = (line: number) => {
    if (!activeSheet) return;
    window.dispatchEvent(
      new CustomEvent('odisea-jump-to-line', {
        detail: { line, sheetId: activeSheet.id },
      })
    );
  };

  const filteredElements = useMemo(() => {
    if (activeCategory === 'all') return elements;
    if (activeCategory === 'tasks') return elements.filter((e) => e.category === 'task');
    if (activeCategory === 'footnotes') return elements.filter((e) => e.category === 'footnote');
    if (activeCategory === 'annotations') return elements.filter((e) => e.category === 'annotation');
    if (activeCategory === 'links') return elements.filter((e) => e.category === 'link');
    if (activeCategory === 'images') return elements.filter((e) => e.category === 'image');
    if (activeCategory === 'comments') return elements.filter((e) => e.category === 'comment');
    return elements;
  }, [elements, activeCategory]);

  const counts = useMemo(() => {
    return {
      all: elements.length,
      tasks: elements.filter((e) => e.category === 'task').length,
      footnotes: elements.filter((e) => e.category === 'footnote').length,
      annotations: elements.filter((e) => e.category === 'annotation').length,
      links: elements.filter((e) => e.category === 'link').length,
      images: elements.filter((e) => e.category === 'image').length,
      comments: elements.filter((e) => e.category === 'comment').length,
    };
  }, [elements]);

  return (
    <div className="p-3 space-y-3 text-xs select-none">
      {/* Category Pills Filter Bar */}
      <div className="flex flex-wrap gap-1 pb-1 border-b border-[var(--color-border)]">
        {[
          { key: 'all', label: 'Todo', count: counts.all },
          { key: 'tasks', label: 'Tareas', count: counts.tasks },
          { key: 'footnotes', label: 'Notas', count: counts.footnotes },
          { key: 'annotations', label: 'Anotaciones', count: counts.annotations },
          { key: 'links', label: 'Enlaces', count: counts.links },
          { key: 'images', label: 'Imágenes', count: counts.images },
          { key: 'comments', label: 'Comentarios', count: counts.comments },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as OverviewCategory)}
            className={`py-0.5 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
              activeCategory === tab.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-[9px] px-1 rounded-full ${
                  activeCategory === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Elements List */}
      {filteredElements.length === 0 ? (
        <div className="py-8 text-center text-[var(--color-text-muted)] space-y-1.5">
          <Filter size={20} className="mx-auto opacity-40 text-[var(--color-accent)]" />
          <p className="font-medium text-[var(--color-text-primary)]">Sin elementos</p>
          <p className="text-[11px] opacity-75">
            No hay elementos de esta categoría en la hoja actual.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          {filteredElements.map((item) => {
            const isTask = item.category === 'task';

            let Icon = FileText;
            let iconColor = 'text-[var(--color-accent)]';
            let categoryLabel = 'Elemento';

            switch (item.category) {
              case 'task':
                Icon = item.completed ? CheckSquare : Square;
                iconColor = item.completed ? 'text-emerald-400' : 'text-amber-400';
                categoryLabel = 'Tarea';
                break;
              case 'footnote':
                Icon = StickyNote;
                iconColor = 'text-sky-400';
                categoryLabel = 'Nota al pie';
                break;
              case 'annotation':
                Icon = MessageSquare;
                iconColor = 'text-amber-400';
                categoryLabel = 'Anotación';
                break;
              case 'link':
                Icon = Link2;
                iconColor = 'text-indigo-400';
                categoryLabel = 'Enlace';
                break;
              case 'image':
                Icon = ImageIcon;
                iconColor = 'text-purple-400';
                categoryLabel = 'Imagen';
                break;
              case 'comment':
                Icon = MessageSquare;
                iconColor = 'text-rose-400';
                categoryLabel = 'Comentario';
                break;
            }

            return (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors flex items-start justify-between gap-2 group"
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {isTask ? (
                    <button
                      type="button"
                      onClick={() => handleToggleTask(item)}
                      className="mt-0.5 text-[var(--color-text-muted)] hover:text-emerald-400 transition-colors shrink-0"
                      title={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      <Icon size={14} className={`micro-icon ${iconColor}`} />
                    </button>
                  ) : (
                    <Icon size={14} className={`micro-icon shrink-0 mt-0.5 ${iconColor}`} />
                  )}

                  <div
                    onClick={() => handleJumpToLine(item.line)}
                    className="flex-1 min-w-0 cursor-pointer"
                    title={`Ir a línea ${item.line}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                        {categoryLabel}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--color-text-muted)] opacity-60">
                        L{item.line}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] leading-tight break-words ${
                        item.completed
                          ? 'line-through text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors'
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToLine(item.line)}
                  title="Saltar a esta posición en el editor"
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink size={11} className="micro-icon" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
