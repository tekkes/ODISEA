import React, { useState, useEffect, useRef } from 'react';
import {
  Hash,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Scroll,
  Code,
  Minus,
  Bold,
  Italic,
  Highlighter,
  Strikethrough,
  MessageSquare,
  Link,
  Bookmark,
  FileSpreadsheet,
  Image,
  Video,
  Sigma,
  Search,
  X,
  CornerDownLeft,
  Space,
} from 'lucide-react';

interface QuickMarkupPopoverCmd9Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag: (syntaxPrefix: string, syntaxSuffix?: string) => void;
  position?: { x: number; y: number } | null;
}

interface TagItem {
  id: string;
  name: string;
  syntax: string;
  prefix: string;
  suffix?: string;
  category: 'Encabezados' | 'Listas' | 'Bloques' | 'En línea' | 'Objetos';
  icon: any;
  description: string;
}

export const CANONICAL_28_TAGS: TagItem[] = [
  // Encabezados
  { id: 'h1', name: 'Encabezado 1', syntax: '# ', prefix: '# ', category: 'Encabezados', icon: Hash, description: 'Título principal H1' },
  { id: 'h2', name: 'Encabezado 2', syntax: '## ', prefix: '## ', category: 'Encabezados', icon: Hash, description: 'Subtítulo de sección H2' },
  { id: 'h3', name: 'Encabezado 3', syntax: '### ', prefix: '### ', category: 'Encabezados', icon: Hash, description: 'Subsección nivel 3' },
  { id: 'h4', name: 'Encabezado 4', syntax: '#### ', prefix: '#### ', category: 'Encabezados', icon: Hash, description: 'Apartado nivel 4' },
  { id: 'h5', name: 'Encabezado 5', syntax: '##### ', prefix: '##### ', category: 'Encabezados', icon: Hash, description: 'Apartado nivel 5' },
  { id: 'h6', name: 'Encabezado 6', syntax: '###### ', prefix: '###### ', category: 'Encabezados', icon: Hash, description: 'Subsección menor H6' },

  // Listas
  { id: 'ul', name: 'Lista viñetas', syntax: '- ', prefix: '- ', category: 'Listas', icon: List, description: 'Elemento de lista no ordenada' },
  { id: 'ol', name: 'Lista numerada', syntax: '1. ', prefix: '1. ', category: 'Listas', icon: ListOrdered, description: 'Smart List auto-numerada' },
  { id: 'task', name: 'Lista tareas', syntax: '- [ ] ', prefix: '- [ ] ', category: 'Listas', icon: CheckSquare, description: 'Checklist interactivo' },

  // Bloques
  { id: 'quote', name: 'Cita en bloque', syntax: '> ', prefix: '> ', category: 'Bloques', icon: Quote, description: 'Cita multinivel' },
  { id: 'verse', name: 'Bloque de verso', syntax: '|" ', prefix: '|" ', category: 'Bloques', icon: Scroll, description: 'Poesía y versos con quiebres preservados' },
  { id: 'codeblock', name: 'Bloque de código (Ulysses)', syntax: "''lang", prefix: "''\n", suffix: "\n''", category: 'Bloques', icon: Code, description: "Bloque de código Ulysses" },
  { id: 'codeblock_std', name: 'Bloque de código (MD)', syntax: '```lang', prefix: '```\n', suffix: '\n```', category: 'Bloques', icon: Code, description: 'Bloque de código estándar' },
  { id: 'rawblock', name: 'Bloque Raw', syntax: '~~', prefix: '~~\n', suffix: '\n~~', category: 'Bloques', icon: Code, description: 'Exportación directa passthrough' },
  { id: 'commentblock', name: 'Bloque de comentario', syntax: '%% ', prefix: '%% ', category: 'Bloques', icon: MessageSquare, description: 'Notas internas del autor no exportadas' },
  { id: 'divider', name: 'Separador horizontal', syntax: '----', prefix: '----\n', category: 'Bloques', icon: Minus, description: 'Línea divisoria de sección' },
  { id: 'toc', name: 'Tabla de Contenidos', syntax: '(toc)', prefix: '(toc)\n', category: 'Bloques', icon: List, description: 'Generador automático de índice' },

  // En línea
  { id: 'strong', name: 'Negrita', syntax: '**texto**', prefix: '**', suffix: '**', category: 'En línea', icon: Bold, description: 'Énfasis fuerte' },
  { id: 'emph', name: 'Cursiva', syntax: '_texto_', prefix: '_', suffix: '_', category: 'En línea', icon: Italic, description: 'Énfasis regular' },
  { id: 'mark', name: 'Resaltado', syntax: '::texto::', prefix: '::', suffix: '::', category: 'En línea', icon: Highlighter, description: 'Marca de color tipo marcador' },
  { id: 'delete', name: 'Tachado / Redactar', syntax: '||texto||', prefix: '||', suffix: '||', category: 'En línea', icon: Strikethrough, description: 'Texto eliminado o censurado' },
  { id: 'inline_comment', name: 'Comentario en línea', syntax: '++texto++', prefix: '++', suffix: '++', category: 'En línea', icon: MessageSquare, description: 'Comentario privado inline' },
  { id: 'annotation', name: 'Anotación', syntax: '{texto|nota}', prefix: '{', suffix: '}', category: 'En línea', icon: MessageSquare, description: 'Nota al margen con texto ancla' },
  { id: 'inline_code', name: 'Código en línea', syntax: '`código`', prefix: '`', suffix: '`', category: 'En línea', icon: Code, description: 'Monospace en línea' },
  { id: 'inline_raw', name: 'Raw en línea', syntax: '~raw~', prefix: '~', suffix: '~', category: 'En línea', icon: Code, description: 'Passthrough inline' },
  { id: 'wiki_link', name: 'Hoja interna (Wiki)', syntax: '[[Hoja]]', prefix: '[[', suffix: ']]', category: 'En línea', icon: Link, description: 'Vínculo interno a otra hoja' },

  // Objetos
  { id: 'link', name: 'Enlace web', syntax: '[texto](url)', prefix: '[', suffix: '](https://)', category: 'Objetos', icon: Link, description: 'Hipervínculo externo' },
  { id: 'footnote', name: 'Nota al pie', syntax: '(fn: texto)', prefix: '(fn: ', suffix: ')', category: 'Objetos', icon: Bookmark, description: 'Nota al pie con renumeración' },
  { id: 'image', name: 'Imagen', syntax: '(img: ruta)', prefix: '(img: ', suffix: ')', category: 'Objetos', icon: Image, description: 'Referencia a imagen adjunta o URL' },
  { id: 'video', name: 'Video', syntax: '(vid: url)', prefix: '(vid: ', suffix: ')', category: 'Objetos', icon: Video, description: 'Video incrustado' },
  { id: 'math', name: 'Fórmula TeX (inline)', syntax: '$formula$', prefix: '$', suffix: '$', category: 'Objetos', icon: Sigma, description: 'Ecuación matemática en línea' },
  { id: 'mathblock', name: 'Ecuación TeX (bloque)', syntax: '$$formula$$', prefix: '$$\n', suffix: '\n$$', category: 'Objetos', icon: Sigma, description: 'Ecuación centrada en display' },
  { id: 'table', name: 'Tabla Markdown XL', syntax: '| Col | Col |', prefix: '| Columna 1 | Columna 2 |\n|-----------|-----------|\n| Dato 1    | Dato 2    |\n', category: 'Objetos', icon: FileSpreadsheet, description: 'Rejilla tabular' },
  { id: 'linebreak', name: 'Salto de línea manual', syntax: '\\', prefix: '\\\n', category: 'Objetos', icon: CornerDownLeft, description: 'Salto suave sin nuevo párrafo' },
  { id: 'nbsp', name: 'Espacio protegido (Alt+Space)', syntax: '·', prefix: '\u00A0', category: 'Objetos', icon: Space, description: 'Espacio no rompible con micropunto' },
];

export const QuickMarkupPopoverCmd9: React.FC<QuickMarkupPopoverCmd9Props> = ({
  isOpen,
  onClose,
  onSelectTag,
  position,
}) => {
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFilter('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTags = CANONICAL_28_TAGS.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.syntax.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase()) ||
      t.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredTags.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredTags.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredTags[selectedIndex];
      if (selected) {
        onSelectTag(selected.prefix, selected.suffix);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const stylePos = position
    ? {
        position: 'fixed' as const,
        left: `${Math.min(Math.max(10, position.x), window.innerWidth - 420)}px`,
        top: `${Math.min(Math.max(10, position.y), window.innerHeight - 450)}px`,
      }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        style={stylePos}
        className="w-[400px] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 shadow-2xl flex flex-col max-h-[460px] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Marcado Rápido (Ctrl+9) - 28 Etiquetas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={13} className="micro-icon" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative mt-2.5 mb-2">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)] micro-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por nombre, sintaxis o categoría..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 no-scrollbar">
          {filteredTags.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
              No se encontraron etiquetas para "{filter}"
            </div>
          ) : (
            filteredTags.map((tag, idx) => {
              const Icon = tag.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    onSelectTag(tag.prefix, tag.suffix);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1 rounded ${
                        isSelected
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <Icon size={13} className="micro-icon" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{tag.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {tag.description}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10.5px] text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border)] ml-2 shrink-0">
                    {tag.syntax}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)] select-none">
          <span>↑↓ Navegar</span>
          <span>↵ Insertar</span>
          <span>Esc Cancelar</span>
        </div>
      </div>
    </div>
  );
};
