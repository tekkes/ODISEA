import React, { useState, useMemo } from 'react';
import { History, FileText, Folder, Search, Trash2, X, Clock, ExternalLink } from 'lucide-react';
import { useOdiseaStore, HistoryItem } from '../../store/useOdiseaStore';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { history, clearHistory, openHistoryItem } = useOdiseaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sheet' | 'project'>('all');

  const filteredHistory = useMemo(() => {
    const list = Array.isArray(history) ? history : [];
    return list.filter((item) => {
      const matchesType = filterType === 'all' || item.item_type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.context.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [history, filterType, searchQuery]);

  if (!isOpen) return null;

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Justo ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[var(--color-accent)]" />
            <h2 id="history-modal-title" className="text-sm font-semibold text-[var(--color-text-primary)]">
              Historial de Proyectos y Documentos
            </h2>
            <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--color-border)] h-[18px] flex items-center">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                title="Limpiar historial completo"
                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-[var(--color-border)] flex flex-col gap-2 bg-[var(--color-bg-primary)]">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en el historial de proyectos y documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-0.5 text-[11px] rounded-md font-medium transition-colors h-[18px] flex items-center ${
                filterType === 'all'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              Todos ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('sheet')}
              className={`px-2.5 py-0.5 text-[11px] rounded-md font-medium transition-colors h-[18px] flex items-center gap-1 ${
                filterType === 'sheet'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <FileText size={12} />
              Documentos ({history.filter((h) => h.item_type === 'sheet').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('project')}
              className={`px-2.5 py-0.5 text-[11px] rounded-md font-medium transition-colors h-[18px] flex items-center gap-1 ${
                filterType === 'project'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Folder size={12} />
              Proyectos ({history.filter((h) => h.item_type === 'project').length})
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--color-border)]/50">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--color-text-muted)]">
              <Clock size={32} className="opacity-30 mb-2" />
              <p className="text-xs font-medium">No hay elementos en el historial</p>
              <p className="text-[11px] opacity-75 mt-0.5">
                {searchQuery
                  ? 'Ningún resultado coincide con la búsqueda'
                  : 'Los proyectos y documentos que abras aparecerán aquí'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={`${item.item_type}-${item.id}`}
                onClick={() => openHistoryItem(item)}
                className="group flex items-center justify-between px-3 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors shrink-0">
                    {item.item_type === 'project' ? <Folder size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors">
                      {item.title || 'Sin título'}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {item.context || (item.item_type === 'project' ? 'Proyecto' : 'Documento')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    {formatTimestamp(item.timestamp)}
                  </span>
                  <ExternalLink
                    size={12}
                    className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
          <span>Persistido en ./odisea_data/config.toml</span>
          <span>Pulsa un elemento para abrirlo directamente</span>
        </div>
      </div>
    </div>
  );
};
