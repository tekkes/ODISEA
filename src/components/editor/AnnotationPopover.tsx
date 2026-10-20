import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Check, X, Info } from 'lucide-react';

interface AnnotationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAnnotation: (annotationMarkdown: string) => void;
  initialAnchorText?: string;
  initialNote?: string;
  position?: { x: number; y: number } | null;
}

export const AnnotationPopover: React.FC<AnnotationPopoverProps> = ({
  isOpen,
  onClose,
  onInsertAnnotation,
  initialAnchorText = '',
  initialNote = '',
  position,
}) => {
  const [anchorText, setAnchorText] = useState(initialAnchorText);
  const [note, setNote] = useState(initialNote);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAnchorText(initialAnchorText);
      setNote(initialNote);
      setTimeout(() => noteInputRef.current?.focus(), 20);
    }
  }, [isOpen, initialAnchorText, initialNote]);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanAnchor = anchorText.trim();
    const cleanNote = note.trim();

    if (!cleanAnchor && !cleanNote) return;

    if (cleanAnchor && cleanNote) {
      onInsertAnnotation(`{${cleanAnchor}|${cleanNote}}`);
    } else if (cleanAnchor && !cleanNote) {
      onInsertAnnotation(`{${cleanAnchor}}`);
    } else {
      onInsertAnnotation(`{${cleanNote}}`);
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
        left: `${Math.min(Math.max(12, position.x), window.innerWidth - 360)}px`,
        top: `${Math.min(Math.max(12, position.y + 4), window.innerHeight - 280)}px`,
      }
    : undefined;

  return (
    <div
      className={position ? '' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs'}
      onClick={onClose}
    >
      <div
        style={stylePos}
        className="w-[350px] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] select-none">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} className="text-indigo-500 micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Anotación en Línea (Ulysses Annotation)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={12} className="micro-icon" />
          </button>
        </div>

        <div className="mt-2.5 space-y-2">
          {/* Anchor text */}
          <div>
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1 select-none">
              Texto del Documento (Ancla)
            </label>
            <input
              type="text"
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              placeholder="Palabra o frase resaltada en el texto..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:border-indigo-500 focus:outline-hidden placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Note content */}
          <div>
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1 select-none">
              Nota o Crítica Editorial
            </label>
            <textarea
              ref={noteInputRef}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Comentario extenso para revisión..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs text-[var(--color-text-primary)] focus:border-indigo-500 focus:outline-hidden placeholder:text-[var(--color-text-muted)] resize-none"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] select-none">
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
            disabled={!anchorText.trim() && !note.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Check size={12} className="micro-icon" />
            <span>Guardar Anotación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
