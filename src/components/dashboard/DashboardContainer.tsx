import React from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { ProgressStatsPane } from './ProgressStatsPane';
import { OutlinePane } from './OutlinePane';
import { OverviewPane } from './OverviewPane';
import { BacklinksPane } from './BacklinksPane';
import { KeywordsAttachmentsPane } from './KeywordsAttachmentsPane';
import { RevisionModePane } from './RevisionModePane';
import { PublishPane } from './PublishPane';
import {
  BarChart2,
  ListTree,
  Info,
  Link2,
  Tag,
  Sparkles,
  Send,
  X,
  Feather,
} from 'lucide-react';

type TabKey = 'stats' | 'outline' | 'overview' | 'backlinks' | 'keywords' | 'revision' | 'publish';

export const DashboardContainer: React.FC = () => {
  const {
    showDashboard,
    toggleDashboard,
    activeDashboardTab,
    setActiveDashboardTab,
    isRevisionMode,
  } = useOdiseaStore();

  if (!showDashboard) return null;

  const currentTab = (activeDashboardTab as TabKey) || 'stats';

  const tabs: Array<{ key: TabKey; label: string; icon: any }> = [
    { key: 'stats', label: 'Estadísticas y Objetivos (1)', icon: BarChart2 },
    { key: 'outline', label: 'Esquema y Navegación (2)', icon: ListTree },
    { key: 'overview', label: 'Elementos y Tareas (3)', icon: Info },
    { key: 'backlinks', label: 'Enlaces y Backlinks (4)', icon: Link2 },
    { key: 'keywords', label: 'Palabras Clave y Adjuntos (5)', icon: Tag },
    { key: 'revision', label: 'Modo Revisión (6)', icon: Sparkles },
    { key: 'publish', label: 'Publicación Web (7)', icon: Send },
  ];

  return (
    <aside className="w-84 h-full flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] select-none">
      {/* Top Tab Bar */}
      <div className="h-10 px-2 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.key;
            const isRevTab = tab.key === 'revision';
            const isPubTab = tab.key === 'publish';

            return (
              <button
                key={tab.key}
                onClick={() => setActiveDashboardTab(tab.key)}
                title={tab.label}
                className={`p-1.5 rounded transition-all relative ${
                  isActive
                    ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]/50'
                }`}
              >
                <Icon size={14} className={`micro-icon ${isPubTab ? 'rotate-45' : ''}`} />
                {isRevTab && isRevisionMode && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={toggleDashboard}
          title="Cerrar panel de control (Ctrl+4)"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <X size={14} className="micro-icon" />
        </button>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === 'stats' && <ProgressStatsPane />}
        {currentTab === 'outline' && <OutlinePane />}
        {currentTab === 'overview' && <OverviewPane />}
        {currentTab === 'backlinks' && <BacklinksPane />}
        {currentTab === 'keywords' && <KeywordsAttachmentsPane />}
        {currentTab === 'revision' && <RevisionModePane />}
        {currentTab === 'publish' && <PublishPane />}
      </div>
    </aside>
  );
};
