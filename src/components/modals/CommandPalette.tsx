import React, { useState, useEffect } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import {
  Search,
  FileText,
  Plus,
  Share2,
  Palette,
  Archive,
  Settings,
  Sidebar,
  Columns,
  Focus,
  Sun,
  X,
  Send,
  Copy,
  Folder,
  Book,
  Sparkles,
  Bookmark,
  Star,
  Paperclip,
  Check,
  History,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    projects,
    groups,
    sheets,
    activeSheet,
    showDashboard,
    setActiveProject,
    setActiveGroup,
    setActiveSheet,
    setGlobalFilter,
    setFocusedPanel,
    createNewSheet,
    toggleGlue,
    toggleFavorite,
    toggleLibrary,
    toggleSheetList,
    toggleDashboard,
    toggleRevisionMode,
    toggleTypewriter,
    setFocusMode,
    toggleThemeMode,
    setActiveDashboardTab,
    copyForSubstack,
    openModal,
  } = useOdiseaStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setCopiedNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Static Actions
  const baseActions = [
    {
      id: 'new_sheet',
      title: 'Nueva Hoja (Ctrl+N)',
      category: 'Acciones',
      icon: Plus,
      run: () => {
        createNewSheet();
        setFocusedPanel('editor');
      },
    },
    {
      id: 'open_history',
      title: 'Historial de Proyectos y Documentos (Ctrl+H)',
      category: 'Navegación',
      icon: History,
      run: () => openModal('history'),
    },
    {
      id: 'export_preview',
      title: 'Exportar Documento (PDF, DOCX, ePub, HTML, Markdown)',
      category: 'Exportación',
      icon: Share2,
      run: () => openModal('export_preview'),
    },
    {
      id: 'publish_web',
      title: 'Publicación Web: WordPress, Ghost, Medium, Micro.blog',
      category: 'Publicación',
      icon: Send,
      run: () => {
        setActiveDashboardTab('publish');
        if (!showDashboard) toggleDashboard();
      },
    },
    {
      id: 'copy_substack',
      title: 'Copiar para Substack (Portapapeles Enriquecido)',
      category: 'Publicación',
      icon: Copy,
      run: async () => {
        if (activeSheet) {
          const res = await copyForSubstack(activeSheet.id);
          setCopiedNotification(`¡Copiado para Substack! (${res.word_count} palabras)`);
          setTimeout(() => setCopiedNotification(null), 3000);
        }
      },
    },
    {
      id: 'toggle_revision',
      title: 'Alternar Modo Revisión (Gramática y Estilo)',
      category: 'Revisión',
      icon: Sparkles,
      run: () => toggleRevisionMode(),
    },
    {
      id: 'toggle_glue',
      title: 'Pegar / Despegar Hoja con la Siguiente',
      category: 'Organización',
      icon: Paperclip,
      run: () => {
        if (activeSheet) toggleGlue(activeSheet.id);
      },
    },
    {
      id: 'toggle_fav',
      title: 'Marcar / Desmarcar como Favorita',
      category: 'Organización',
      icon: Star,
      run: () => {
        if (activeSheet) toggleFavorite(activeSheet.id);
      },
    },
    // Visual Modes
    {
      id: 'mode_minimalist',
      title: 'Modo Visual: Minimalista (Ulysses Original)',
      category: 'Modo Visual',
      icon: Focus,
      run: () => setFocusMode('none'),
    },
    {
      id: 'mode_focus_line',
      title: 'Modo Visual: Enfoque por Línea',
      category: 'Modo Visual',
      icon: Focus,
      run: () => setFocusMode('line'),
    },
    {
      id: 'mode_focus_sentence',
      title: 'Modo Visual: Enfoque por Oración',
      category: 'Modo Visual',
      icon: Focus,
      run: () => setFocusMode('sentence'),
    },
    {
      id: 'mode_focus_para',
      title: 'Modo Visual: Enfoque por Párrafo',
      category: 'Modo Visual',
      icon: Focus,
      run: () => setFocusMode('paragraph'),
    },
    {
      id: 'toggle_typewriter',
      title: 'Alternar Modo Máquina de Escribir (Línea Fija)',
      category: 'Modo Visual',
      icon: Focus,
      run: () => toggleTypewriter(),
    },
    {
      id: 'toggle_theme',
      title: 'Alternar Modo Oscuro / Claro',
      category: 'Modo Visual',
      icon: Sun,
      run: () => toggleThemeMode(),
    },
    {
      id: 'theme_studio',
      title: 'Estudio de Temas de Edición (.ultheme)',
      category: 'Ajustes',
      icon: Palette,
      run: () => openModal('theme_studio'),
    },
    {
      id: 'backup_restore',
      title: 'Copias de Seguridad Portables (Zstandard)',
      category: 'Ajustes',
      icon: Archive,
      run: () => openModal('backup_restore'),
    },
    {
      id: 'settings',
      title: 'Preferencias de Odisea (Ctrl+,)',
      category: 'Ajustes',
      icon: Settings,
      run: () => openModal('settings'),
    },
    {
      id: 'toggle_lib',
      title: 'Mostrar / Ocultar Biblioteca (Ctrl+1)',
      category: 'Vista',
      icon: Sidebar,
      run: () => toggleLibrary(),
    },
    {
      id: 'toggle_sheets',
      title: 'Mostrar / Ocultar Lista de Hojas (Ctrl+2)',
      category: 'Vista',
      icon: Columns,
      run: () => toggleSheetList(),
    },
    {
      id: 'toggle_dashboard',
      title: 'Mostrar / Ocultar Panel de Control (Ctrl+4)',
      category: 'Vista',
      icon: Sidebar,
      run: () => toggleDashboard(),
    },
  ];

  // 2. Dynamic Projects (Spotlight Jump)
  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    title: `Saltar a Proyecto: ${p.name}`,
    category: 'Proyectos',
    icon: Book,
    run: () => {
      setActiveProject(p.id);
      setFocusedPanel('sheetlist');
    },
  }));

  // 3. Dynamic Groups (Spotlight Jump)
  const groupItems = groups.map((g) => ({
    id: `grp-${g.id}`,
    title: `Saltar a Grupo: ${g.name}`,
    category: 'Grupos',
    icon: Folder,
    run: () => {
      setActiveGroup(g.id);
      setFocusedPanel('sheetlist');
    },
  }));

  // 4. Global Filters
  const filterItems = [
    {
      id: 'filt-all',
      title: 'Ver Todas las Hojas',
      category: 'Filtros',
      icon: Bookmark,
      run: () => {
        setGlobalFilter('all');
        setFocusedPanel('sheetlist');
      },
    },
    {
      id: 'filt-fav',
      title: 'Ver Hojas Favoritas',
      category: 'Filtros',
      icon: Star,
      run: () => {
        setGlobalFilter('favorites');
        setFocusedPanel('sheetlist');
      },
    },
    {
      id: 'filt-recent',
      title: 'Ver Hojas Recientes (Últimos 7 días)',
      category: 'Filtros',
      icon: Bookmark,
      run: () => {
        setGlobalFilter('last7days');
        setFocusedPanel('sheetlist');
      },
    },
    {
      id: 'filt-trash',
      title: 'Ver Papelera de Hojas',
      category: 'Filtros',
      icon: Bookmark,
      run: () => {
        setGlobalFilter('trash');
        setFocusedPanel('sheetlist');
      },
    },
  ];

  // 5. Dynamic Sheets (Full text or title match)
  const matchingSheets = query.trim()
    ? sheets
        .filter(
          (s) =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.content_mdxl.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 15)
        .map((s) => ({
          id: `sheet-${s.id}`,
          title: s.title || 'Hoja sin título',
          category: 'Hojas',
          icon: FileText,
          run: () => {
            setActiveSheet(s);
            setFocusedPanel('editor');
          },
        }))
    : [];

  const allItems = [
    ...baseActions,
    ...projectItems,
    ...groupItems,
    ...filterItems,
    ...matchingSheets,
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-xs">
      <div className="w-[560px] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col">
        {/* Search header (Spotlight style) */}
        <div className="flex items-center px-3.5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/50">
          <Search size={15} className="text-[var(--color-accent)] mr-2.5 micro-icon shrink-0" />
          <input
            type="text"
            placeholder="Escribe para buscar comandos, proyectos, grupos o saltar a hojas... (Ctrl+Espacio / Ctrl+P)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border-none focus:outline-hidden"
          />
          <kbd className="text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-hover)] px-1.5 py-0.5 rounded mr-2">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <X size={13} className="micro-icon" />
          </button>
        </div>

        {/* Quick notification banner */}
        {copiedNotification && (
          <div className="px-3 py-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1.5 border-b border-emerald-500/20">
            <Check size={12} className="micro-icon" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-84 overflow-y-auto p-1.5 space-y-0.5">
          {allItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
              No se encontraron comandos o documentos coincidentes con "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-[var(--color-selection-bg)] text-white'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon size={14} className="micro-icon shrink-0 opacity-80" />
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white font-semibold'
                        : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-3 py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navegar</span>
            <span>·</span>
            <span>↵ Ejecutar / Saltar</span>
            <span>·</span>
            <span>Ctrl+↵ Drill-up</span>
          </div>
          <span>{allItems.length} resultados</span>
        </div>
      </div>
    </div>
  );
};
