import React from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Bold,
  Italic,
  Highlighter,
  Strikethrough,
  MessageSquare,
  Bookmark,
  Link,
  Sigma,
  FileSpreadsheet,
  Image,
  Scroll,
} from 'lucide-react';

export type CursorContextType = 'empty-line' | 'inside-text' | 'has-selection' | 'inside-list' | 'inside-quote';

interface MarkupBarBottomProps {
  contextType: CursorContextType;
  onApplyTag: (prefix: string, suffix?: string) => void;
  onOpenQuickMarkup: () => void;
}

interface MarkupSuggestion {
  id: string;
  label: string;
  syntax: string;
  prefix: string;
  suffix?: string;
  icon: any;
}

export const MarkupBarBottom: React.FC<MarkupBarBottomProps> = ({
  contextType,
  onApplyTag,
  onOpenQuickMarkup,
}) => {
  // Compute context-sensitive suggestions
  const getSuggestions = (): MarkupSuggestion[] => {
    if (contextType === 'empty-line') {
      return [
        { id: 'h1', label: 'H1', syntax: '#', prefix: '# ', icon: Heading1 },
        { id: 'h2', label: 'H2', syntax: '##', prefix: '## ', icon: Heading2 },
        { id: 'h3', label: 'H3', syntax: '###', prefix: '### ', icon: Heading3 },
        { id: 'ul', label: 'Viñeta', syntax: '-', prefix: '- ', icon: List },
        { id: 'ol', label: 'Numerada', syntax: '1.', prefix: '1. ', icon: ListOrdered },
        { id: 'task', label: 'Tarea', syntax: '[ ]', prefix: '- [ ] ', icon: CheckSquare },
        { id: 'quote', label: 'Cita', syntax: '>', prefix: '> ', icon: Quote },
        { id: 'verse', label: 'Verso', syntax: '|"', prefix: '|" ', icon: Scroll },
        { id: 'codeblock', label: 'Código', syntax: "''", prefix: "''\n", suffix: "\n''", icon: Code },
        { id: 'table', label: 'Tabla', syntax: '|', prefix: '| Columna 1 | Columna 2 |\n|---|---|\n| Dato 1 | Dato 2 |\n', icon: FileSpreadsheet },
        { id: 'divider', label: 'Separador', syntax: '----', prefix: '----\n', icon: Minus },
      ];
    }

    if (contextType === 'inside-list') {
      return [
        { id: 'task_toggle', label: 'Tarea [ ]', syntax: '[ ]', prefix: '[ ] ', icon: CheckSquare },
        { id: 'strong', label: 'Negrita', syntax: '**', prefix: '**', suffix: '**', icon: Bold },
        { id: 'emph', label: 'Cursiva', syntax: '_', prefix: '_', suffix: '_', icon: Italic },
        { id: 'code', label: 'Código', syntax: '`', prefix: '`', suffix: '`', icon: Code },
        { id: 'link', label: 'Enlace', syntax: '[]', prefix: '[', suffix: '](https://)', icon: Link },
        { id: 'annotation', label: 'Nota', syntax: '{}', prefix: '{', suffix: '}', icon: MessageSquare },
      ];
    }

    // inside-text or has-selection
    return [
      { id: 'strong', label: 'Negrita', syntax: '**', prefix: '**', suffix: '**', icon: Bold },
      { id: 'emph', label: 'Cursiva', syntax: '_', prefix: '_', suffix: '_', icon: Italic },
      { id: 'mark', label: 'Resaltado', syntax: '::', prefix: '::', suffix: '::', icon: Highlighter },
      { id: 'delete', label: 'Tachado', syntax: '||', prefix: '||', suffix: '||', icon: Strikethrough },
      { id: 'inline-comment', label: 'Comentario', syntax: '++', prefix: '++', suffix: '++', icon: MessageSquare },
      { id: 'annotation', label: 'Anotación', syntax: '{}', prefix: '{', suffix: '}', icon: MessageSquare },
      { id: 'code', label: 'Código', syntax: '`', prefix: '`', suffix: '`', icon: Code },
      { id: 'link', label: 'Enlace', syntax: '[]', prefix: '[', suffix: '](https://)', icon: Link },
      { id: 'wiki', label: 'Hoja interna', syntax: '[[]]', prefix: '[[', suffix: ']]', icon: Link },
      { id: 'footnote', label: 'Nota al pie', syntax: '(fn)', prefix: '(fn: ', suffix: ')', icon: Bookmark },
      { id: 'image', label: 'Imagen', syntax: '(img)', prefix: '(img: ', suffix: ')', icon: Image },
      { id: 'math', label: 'Fórmula', syntax: '$', prefix: '$', suffix: '$', icon: Sigma },
    ];
  };

  const suggestions = getSuggestions();

  return (
    <footer className="h-7 px-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between select-none text-xs">
      {/* Context indicator */}
      <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[var(--color-border)] mr-2 text-[var(--color-text-muted)] text-[10.5px]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
        <span className="font-mono uppercase tracking-wider text-[9.5px]">
          {contextType === 'empty-line'
            ? 'Línea vacía'
            : contextType === 'has-selection'
            ? 'Selección'
            : contextType === 'inside-list'
            ? 'Lista'
            : 'Texto'}
        </span>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onApplyTag(s.prefix, s.suffix)}
              title={`${s.label} (${s.syntax})`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors shrink-0 cursor-pointer"
            >
              <Icon size={12} className="micro-icon opacity-80" />
              <span>{s.label}</span>
              <span className="font-mono text-[9.5px] opacity-40 ml-0.5">{s.syntax}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Markup Ctrl+9 Button */}
      <button
        onClick={onOpenQuickMarkup}
        title="Abrir paleta de marcado completa (Ctrl+9)"
        className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 transition-colors shrink-0 cursor-pointer"
      >
        Ctrl+9
      </button>
    </footer>
  );
};
