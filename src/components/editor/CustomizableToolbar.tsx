import React, { useState } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { TypewriterController } from './TypewriterController';
import { DIALECTS, MarkupDialect, convertMarkup } from '../../parser/markdown_xl/dialects';
import {
  Sidebar,
  Menu,
  Columns,
  Bold,
  Italic,
  Highlighter,
  Strikethrough,
  Code,
  Link,
  MessageSquare,
  FileSpreadsheet,
  Image,
  Sun,
  Moon,
  Share2,
  Hash,
  Bookmark,
  GripVertical,
  ChevronDown,
  Check,
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CustomizableToolbarProps {
  onInsertMarkup: (prefix: string, suffix?: string) => void;
  onOpenQuickMarkup: () => void;
  onOpenTableModal: () => void;
  onOpenImageModal: () => void;
  onOpenFootnoteModal?: () => void;
  onOpenAnnotationModal?: () => void;
  editorContent?: string;
  onUpdateContent?: (newContent: string) => void;
}

interface ToolbarButtonDef {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

export const CustomizableToolbar: React.FC<CustomizableToolbarProps> = ({
  onInsertMarkup,
  onOpenQuickMarkup,
  onOpenTableModal,
  onOpenImageModal,
  onOpenFootnoteModal,
  onOpenAnnotationModal,
  editorContent = '',
  onUpdateContent,
}) => {
  const {
    showLibrary,
    showSheetList,
    showDashboard,
    themeMode,
    activeSheet,
    toggleLibrary,
    toggleSheetList,
    toggleDashboard,
    toggleThemeMode,
    openModal,
    updateSheetContent,
  } = useOdiseaStore();

  const [isDialectDropdownOpen, setIsDialectDropdownOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isCleanView, setIsCleanView] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('theme-barely-there');
  });

  const toggleCleanView = () => {
    const next = !isCleanView;
    setIsCleanView(next);
    if (next) {
      document.documentElement.classList.add('theme-barely-there');
    } else {
      document.documentElement.classList.remove('theme-barely-there');
    }
  };

  // Default customizable markup tool order
  const [toolOrder, setToolOrder] = useState<string[]>([
    'bold',
    'italic',
    'mark',
    'delete',
    'code',
    'link',
    'annotation',
    'footnote',
    'table',
    'image',
    'quick_markup',
  ]);

  const buttonMap: Record<string, ToolbarButtonDef> = {
    bold: {
      id: 'bold',
      label: 'Negrita (**)',
      icon: Bold,
      action: () => onInsertMarkup('**', '**'),
      shortcut: 'Ctrl+B',
    },
    italic: {
      id: 'italic',
      label: 'Cursiva (_)',
      icon: Italic,
      action: () => onInsertMarkup('_', '_'),
      shortcut: 'Ctrl+I',
    },
    mark: {
      id: 'mark',
      label: 'Resaltado (::)',
      icon: Highlighter,
      action: () => onInsertMarkup('::', '::'),
    },
    delete: {
      id: 'delete',
      label: 'Tachado/Redacción (||)',
      icon: Strikethrough,
      action: () => onInsertMarkup('||', '||'),
    },
    code: {
      id: 'code',
      label: 'Código en línea (`)',
      icon: Code,
      action: () => onInsertMarkup('`', '`'),
    },
    link: {
      id: 'link',
      label: 'Enlace ([])',
      icon: Link,
      action: () => onInsertMarkup('[', '](https://)'),
      shortcut: 'Ctrl+K',
    },
    annotation: {
      id: 'annotation',
      label: 'Anotación ({})',
      icon: MessageSquare,
      action: () => (onOpenAnnotationModal ? onOpenAnnotationModal() : onInsertMarkup('{', '}')),
    },
    footnote: {
      id: 'footnote',
      label: 'Nota al pie (fn)',
      icon: Bookmark,
      action: () => (onOpenFootnoteModal ? onOpenFootnoteModal() : onInsertMarkup('(fn: ', ')')),
    },
    table: {
      id: 'table',
      label: 'Tabla Markdown XL',
      icon: FileSpreadsheet,
      action: onOpenTableModal,
    },
    image: {
      id: 'image',
      label: 'Imagen / Boceto',
      icon: Image,
      action: onOpenImageModal,
    },
    quick_markup: {
      id: 'quick_markup',
      label: 'Marcado Rápido (Ctrl+9)',
      icon: Hash,
      action: onOpenQuickMarkup,
    },
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...toolOrder];
    const item = newOrder.splice(draggedIndex, 1)[0];
    newOrder.splice(index, 0, item);
    setDraggedIndex(index);
    setToolOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Dialect conversion handler
  const handleConvertDialect = (targetDialect: MarkupDialect) => {
    if (!activeSheet) return;
    const currentDialect = (activeSheet.markup_dialect || 'markdown_xl') as MarkupDialect;
    if (currentDialect === targetDialect) {
      setIsDialectDropdownOpen(false);
      return;
    }

    const currentText = editorContent || activeSheet.content_mdxl;
    const converted = convertMarkup(currentText, currentDialect, targetDialect);

    if (onUpdateContent) {
      onUpdateContent(converted);
    }
    updateSheetContent(activeSheet.id, activeSheet.title, converted);

    setIsDialectDropdownOpen(false);
  };

  const currentDialectId = (activeSheet?.markup_dialect || 'markdown_xl') as MarkupDialect;
  const currentDialectDef = DIALECTS[currentDialectId] || DIALECTS.markdown_xl;

  return (
    <header className="h-10 px-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between select-none relative z-30">
      {/* Left: View Panel Toggles & Reorderable Markup Tools */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleLibrary}
          title={`${showLibrary ? 'Ocultar' : 'Mostrar'} Biblioteca (Ctrl+1)`}
          className={`p-1.5 rounded transition-colors ${
            showLibrary
              ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Sidebar size={14} className="micro-icon" />
        </button>

        <button
          onClick={toggleSheetList}
          title={`${showSheetList ? 'Ocultar' : 'Mostrar'} Lista de Hojas (Ctrl+2)`}
          className={`p-1.5 rounded transition-colors ${
            showSheetList
              ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Columns size={14} className="micro-icon" />
        </button>

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        {/* Drag & Drop Reorderable Markup Toolbar Items */}
        <div className="flex items-center gap-0.5 overflow-x-auto py-0.5">
          {toolOrder.map((toolId, index) => {
            const tool = buttonMap[toolId];
            if (!tool) return null;
            const Icon = tool.icon;

            return (
              <div
                key={tool.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="group relative flex items-center"
              >
                <button
                  onClick={tool.action}
                  title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''} - Arrastra para reordenar`}
                  className={`p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ${
                    draggedIndex === index ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <Icon size={14} className="micro-icon" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Dialect Badge with "Convert Markup" Dropdown */}
      <div className="relative flex items-center">
        <button
          onClick={() => setIsDialectDropdownOpen(!isDialectDropdownOpen)}
          title="Convertir dialecto de marcado (Edit > Convert Markup)"
          className="micro-badge bg-[var(--color-accent)]/12 text-[var(--color-accent)] font-mono text-[10px] hover:bg-[var(--color-accent)]/20 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{currentDialectDef.name}</span>
          <ChevronDown size={10} className="micro-icon opacity-70" />
        </button>

        {isDialectDropdownOpen && (
          <div className="absolute top-7 left-1/2 -translate-x-1/2 w-64 p-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl z-50 text-left">
            <div className="text-[10px] font-semibold text-[var(--color-text-muted)] px-2 py-1 uppercase tracking-wider">
              Convertir Marcado
            </div>
            {Object.values(DIALECTS).map((dialect) => {
              const isSelected = dialect.id === currentDialectId;
              return (
                <button
                  key={dialect.id}
                  onClick={() => handleConvertDialect(dialect.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div>
                    <div className="text-xs">{dialect.name}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] line-clamp-1">
                      {dialect.description}
                    </div>
                  </div>
                  {isSelected && <Check size={12} className="micro-icon text-[var(--color-accent)] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Typewriter, Theme, Export, Dashboard toggle */}
      <div className="flex items-center gap-1.5">
        <TypewriterController />

        <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />

        <button
          onClick={toggleThemeMode}
          title={`Modo visual rápido: ${themeMode === 'dark' ? 'Oscuro' : 'Claro'}`}
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
        >
          {themeMode === 'dark' ? (
            <Sun size={14} strokeWidth={1.5} className="micro-icon" />
          ) : (
            <Moon size={14} strokeWidth={1.5} className="micro-icon" />
          )}
        </button>

        <button
          onClick={() => openModal('theme_studio')}
          title="Theme Studio: Modos Visuales y Editor .ultheme (Ctrl+Alt+T)"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
        >
          <Palette size={14} strokeWidth={1.5} className="micro-icon" />
        </button>

        <button
          onClick={toggleCleanView}
          title={
            isCleanView
              ? 'Desactivar Vista Limpia (Mostrar marcas de código y sintaxis)'
              : 'Activar Vista Limpia / Sin Código (Oculta las marcas Markdown)'
          }
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isCleanView
              ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
          }`}
        >
          {isCleanView ? (
            <EyeOff size={14} strokeWidth={1.5} className="micro-icon" />
          ) : (
            <Eye size={14} strokeWidth={1.5} className="micro-icon" />
          )}
        </button>

        <button
          onClick={() => openModal('export_preview')}
          title="Vista Previa y Exportación Universal (Ctrl+Shift+E)"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
        >
          <Share2 size={14} className="micro-icon" />
        </button>

        <button
          onClick={toggleDashboard}
          title={`${showDashboard ? 'Ocultar' : 'Mostrar'} Panel de Control (Ctrl+4)`}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            showDashboard
              ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Menu size={14} className="micro-icon" />
        </button>
      </div>
    </header>
  );
};
