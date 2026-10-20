import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Check, X, Info } from 'lucide-react';

interface FootnotePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFootnote: (footnoteMarkdown: string) => void;
  initialText?: string;
  position?: { x: number; y: number } | null;
}

export const FootnotePopover: React.FC<FootnotePopoverProps> = ({
  isOpen,
  onClose,
  onInsertFootnote,
  initialText = '',
  position,
}) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onInsertFootnote('(fn)');
    } else {
      onInsertFootnote(`(fn: ${trimmed})`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const stylePos = position
    ? {
        position: 'fixed' as const,
        left: `${Math.min(Math.max(12, position.x), window.innerWidth - 340)}px`,
        top: `${Math.min(Math.max(12, position.y + 4), window.innerHeight - 240)}px`,
      }
    : undefined;

  return (
    <div
      className={position ? '' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs'}
      onClick={onClose}
    >
      <div
        style={stylePos}
        className="w-[330px] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] select-none">
          <div className="flex items-center gap-1.5">
            <Bookmark size={14} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Nota al Pie (Footnote)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={12} className="micro-icon" />
          </button>
        </div>

        <div className="mt-2.5">
          <textarea
            ref={inputRef}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aclaración, referencia o cita que se numerará automáticamente al exportar..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden placeholder:text-[var(--color-text-muted)] resize-none"
          />
        </div>

        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] select-none">
          <Info size={11} className="micro-icon" />
          <span>Ctrl+Enter para guardar o Esc para cerrar</span>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-2.5 select-none">
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
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded bg-[var(--color-accent)] text-white hover:brightness-110 cursor-pointer shadow-xs"
          >
            <Check size={12} className="micro-icon" />
            <span>Guardar Nota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
