import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Highlighter, MessageSquare } from 'lucide-react';

interface ContextMarkupBarProps {
  position: { x: number; y: number } | null;
  onApplyFormat: (format: 'bold' | 'italic' | 'code' | 'highlight' | 'delete' | 'link' | 'annotation') => void;
}

export const ContextMarkupBar: React.FC<ContextMarkupBarProps> = ({
  position,
  onApplyFormat,
}) => {
  if (!position) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y - 38}px`,
      }}
      className="fixed z-40 flex items-center gap-0.5 px-1 py-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl backdrop-blur-md transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <button
        onClick={() => onApplyFormat('bold')}
        title="Negrita (**)"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Bold size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('italic')}
        title="Cursiva (_)"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Italic size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('highlight')}
        title="Resaltado (::)"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Highlighter size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('delete')}
        title="Tachado (--)"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Strikethrough size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('code')}
        title="Código (`)"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Code size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('link')}
        title="Enlace ([])"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <Link size={13} className="micro-icon" />
      </button>

      <button
        onClick={() => onApplyFormat('annotation')}
        title="Anotación ({})"
        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
      >
        <MessageSquare size={13} className="micro-icon" />
      </button>
    </div>
  );
};
