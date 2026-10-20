import React, { useState } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { Activity, Clock, FileText, ChevronUp } from 'lucide-react';

export const LiveCounterBadge: React.FC = () => {
  const { statistics, toggleDashboard } = useOdiseaStore();
  const [metricIndex, setMetricIndex] = useState<number>(0);

  const words = statistics?.word_count ?? 0;
  const chars = statistics?.character_count ?? 0;
  const readingTime = statistics?.estimated_reading_time_minutes ?? 0;

  const metrics = [
    { label: `${words} palabras`, short: `${words} pal.`, icon: FileText },
    { label: `${chars} caracteres`, short: `${chars} car.`, icon: Activity },
    { label: `${readingTime} min lectura`, short: `${readingTime} min`, icon: Clock },
  ];

  const currentMetric = metrics[metricIndex % metrics.length];
  const Icon = currentMetric.icon;

  const cycleMetric = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMetricIndex((prev) => (prev + 1) % metrics.length);
  };

  return (
    <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1 select-none">
      {/* Micro-Píldora Contador Flotante (Mandato Micro-UI: height 16px-18px, font-size 10px) */}
      <div
        onClick={cycleMetric}
        title="Clic para alternar métrica (palabras / caracteres / lectura)"
        className="h-[18px] flex items-center gap-1 px-1.5 rounded-[4px] bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer hover:border-[var(--color-accent)] transition-all shadow-xs"
      >
        <Icon size={11} strokeWidth={1.5} className="text-[var(--color-accent)] micro-icon" />
        <span className="font-mono font-medium leading-none">{currentMetric.label}</span>
      </div>

      <button
        onClick={toggleDashboard}
        title="Abrir panel de estadísticas e inspección (Ctrl+4)"
        className="h-[18px] w-[18px] flex items-center justify-center rounded-[4px] bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all cursor-pointer shadow-xs"
      >
        <ChevronUp size={11} strokeWidth={1.5} className="micro-icon" />
      </button>
    </div>
  );
};
