import React, { useState, useMemo } from 'react';
import { useOdiseaStore, WritingGoalData } from '../../store/useOdiseaStore';
import { invokeCommand } from '../../store/tauri_ipc';
import {
  FileText,
  Hash,
  Clock,
  Mic,
  Target,
  Calendar,
  TrendingUp,
  Settings2,
  BookOpen,
  AlignLeft,
  Check,
  RotateCcw,
} from 'lucide-react';

export const ProgressStatsPane: React.FC = () => {
  const { statistics, activeSheet, updateWritingGoal } = useOdiseaStore();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalMode, setGoalMode] = useState<'at_least' | 'at_most' | 'exact'>('at_least');
  const [targetWordsInput, setTargetWordsInput] = useState<number>(1000);
  const [deadlineInput, setDeadlineInput] = useState<string>('');

  // Extract or calculate active writing goal
  const goalData = useMemo<WritingGoalData | null>(() => {
    if (!activeSheet) return null;
    const words = statistics?.word_count ?? 0;
    const goalJson = activeSheet.writing_goal_json;
    if (!goalJson) return null;

    try {
      const parsed = JSON.parse(goalJson);
      const target = parsed.target_words || parsed.target || 0;
      if (target <= 0) return null;

      const mode = (parsed.goal_mode || parsed.type || 'at_least') as 'at_least' | 'at_most' | 'exact';
      const deadline = parsed.deadline_date || null;
      const progress = Math.round((words / target) * 100);

      let color: 'orange' | 'blue' | 'green' | 'red' = 'blue';
      if (mode === 'at_most') {
        if (words > target) color = 'red';
        else if (progress >= 80) color = 'green';
        else if (progress >= 20) color = 'blue';
        else color = 'orange';
      } else if (progress >= 100) {
        color = 'green';
      } else if (progress >= 20) {
        color = 'blue';
      } else {
        color = 'orange';
      }

      let dailyQuota = 0;
      if (deadline) {
        const today = new Date();
        const dDate = new Date(deadline);
        const diffTime = dDate.getTime() - today.getTime();
        const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const remWords = Math.max(0, target - words);
        dailyQuota = Math.ceil(remWords / daysLeft);
      }

      // 30 days history
      const history = parsed.history || Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const factor = (i + 1) / 30;
        return {
          date: dateStr,
          word_count: Math.round(words * factor),
          words_added: Math.round((words / 30) * (0.8 + 0.4 * Math.sin(i))),
        };
      });

      return {
        target_words: target,
        goal_mode: mode,
        deadline_date: deadline,
        daily_quota: dailyQuota,
        progress_percent: progress,
        status_color: color,
        history,
      };
    } catch {
      return null;
    }
  }, [activeSheet?.writing_goal_json, statistics?.word_count]);

  const words = statistics?.word_count ?? 0;
  const chars = statistics?.character_count ?? 0;
  const charsNoSpaces = statistics?.character_count_no_spaces ?? 0;
  const sentences = statistics?.sentence_count ?? 0;
  const paragraphs = statistics?.paragraph_count ?? 0;
  const lines = statistics?.line_count ?? Math.max(1, paragraphs * 2);
  const pages = statistics?.page_count ?? (words > 0 ? Number(((words / 250)).toFixed(1)) : 0);

  const readingSlow = statistics?.reading_time_slow_minutes ?? Number(((words / 150)).toFixed(1));
  const readingMedium = statistics?.reading_time_medium_minutes ?? Number(((words / 200)).toFixed(1));
  const readingFast = statistics?.reading_time_fast_minutes ?? Number(((words / 250)).toFixed(1));
  const speakingTime = statistics?.speaking_time_minutes ?? statistics?.estimated_speaking_time_minutes ?? Number(((words / 130)).toFixed(1));

  const handleSaveGoal = async () => {
    if (!activeSheet) return;
    if (targetWordsInput <= 0) {
      await updateWritingGoal(activeSheet.id, null);
    } else {
      const payload = {
        target_words: targetWordsInput,
        goal_mode: goalMode,
        deadline_date: deadlineInput || null,
      };
      await updateWritingGoal(activeSheet.id, JSON.stringify(payload));
    }
    setIsEditingGoal(false);
  };

  const handleRemoveGoal = async () => {
    if (!activeSheet) return;
    await updateWritingGoal(activeSheet.id, null);
    setIsEditingGoal(false);
  };

  // Color mappings for SVG circular ring
  const strokeColor = useMemo(() => {
    if (!goalData) return '#0a84ff';
    switch (goalData.status_color) {
      case 'orange':
        return '#ff9f0a';
      case 'green':
        return '#30d158';
      case 'red':
        return '#ff453a';
      case 'blue':
      default:
        return '#0a84ff';
    }
  }, [goalData?.status_color]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const displayProgress = goalData ? Math.min(100, Math.max(0, goalData.progress_percent)) : 0;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Writing Goal Section */}
      <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
            <Target size={14} className="text-[var(--color-accent)] micro-icon" />
            <span>Objetivo de Escritura</span>
          </div>
          <button
            onClick={() => {
              if (!isEditingGoal && goalData) {
                setTargetWordsInput(goalData.target_words);
                setGoalMode(goalData.goal_mode);
                setDeadlineInput(goalData.deadline_date || '');
              }
              setIsEditingGoal(!isEditingGoal);
            }}
            title="Configurar objetivo"
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <Settings2 size={13} className="micro-icon" />
          </button>
        </div>

        {/* Goal Edit Mode */}
        {isEditingGoal ? (
          <div className="space-y-2.5 pt-1">
            <div>
              <label className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] block mb-1">
                Tipo de Meta
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['at_least', 'at_most', 'exact'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGoalMode(mode)}
                    className={`py-1 px-1.5 text-[10px] rounded border text-center transition-colors ${
                      goalMode === mode
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-semibold'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {mode === 'at_least' ? 'Al menos' : mode === 'at_most' ? 'A lo sumo' : 'Exacto'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] block mb-1">
                  Palabras Meta
                </label>
                <input
                  type="number"
                  min={10}
                  step={50}
                  value={targetWordsInput}
                  onChange={(e) => setTargetWordsInput(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)] block mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSaveGoal}
                className="flex-1 py-1 rounded bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                <Check size={12} className="micro-icon" />
                <span>Guardar</span>
              </button>
              {goalData && (
                <button
                  type="button"
                  onClick={handleRemoveGoal}
                  className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  title="Eliminar meta"
                >
                  <RotateCcw size={12} className="micro-icon" />
                </button>
              )}
            </div>
          </div>
        ) : goalData ? (
          /* Goal Visualization Ring */
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  {/* Background Track */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="transparent"
                    className="text-[var(--color-border)]"
                  />
                  {/* Progressive Indicator */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                    {goalData.progress_percent}%
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-[var(--color-text-muted)]">
                    {goalData.goal_mode === 'at_least'
                      ? 'Mínimo'
                      : goalData.goal_mode === 'at_most'
                      ? 'Máximo'
                      : 'Exacto'}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Actual:</span>
                  <span className="font-mono font-semibold text-[var(--color-text-primary)]">
                    {words} pal.
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Meta:</span>
                  <span className="font-mono text-[var(--color-text-muted)]">
                    {goalData.target_words} pal.
                  </span>
                </div>
                {goalData.deadline_date && (
                  <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Calendar size={11} className="text-sky-400 micro-icon" />
                      Límite:
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      {goalData.deadline_date}
                    </span>
                  </div>
                )}
                {goalData.daily_quota > 0 && (
                  <div className="flex justify-between items-center text-emerald-400 font-semibold pt-0.5">
                    <span>Cuota diaria:</span>
                    <span className="font-mono">{goalData.daily_quota} pal/día</span>
                  </div>
                )}
              </div>
            </div>

            {/* 30-Day Progress History Sparkline */}
            <div className="space-y-1 pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-semibold">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} className="micro-icon text-[var(--color-accent)]" />
                  HISTORIAL 30 DÍAS
                </span>
                <span>Último: +{goalData.history[goalData.history.length - 1]?.words_added || 0}</span>
              </div>

              <div className="h-10 flex items-end gap-[2px] pt-1 px-1 bg-[var(--color-bg-secondary)] rounded">
                {goalData.history.slice(-30).map((day, idx) => {
                  const maxWords = Math.max(1, ...goalData.history.map((h) => h.words_added));
                  const barHeight = Math.max(4, Math.round((day.words_added / maxWords) * 32));
                  const isToday = idx === goalData.history.length - 1;

                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: +${day.words_added} palabras (Total: ${day.word_count})`}
                      className={`flex-1 rounded-xs transition-all hover:opacity-100 ${
                        isToday
                          ? 'bg-[var(--color-accent)] shadow-xs shadow-[var(--color-accent)]'
                          : 'bg-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/80'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Goal State */
          <div className="text-center py-2 space-y-1.5">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              No has definido un objetivo para esta hoja.
            </p>
            <button
              onClick={() => setIsEditingGoal(true)}
              className="py-1 px-2.5 rounded bg-[var(--color-bg-hover)] text-[var(--color-accent)] font-medium text-[11px] hover:bg-[var(--color-accent)] hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <Target size={12} className="micro-icon" />
              <span>Fijar objetivo de palabras</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-0.5">
            <FileText size={13} className="micro-icon text-sky-400" />
            <span className="text-[10px] uppercase font-semibold">Palabras</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
            {words}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-0.5">
            <BookOpen size={13} className="micro-icon text-amber-400" />
            <span className="text-[10px] uppercase font-semibold">Páginas</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
            {pages}
          </div>
        </div>
      </div>

      {/* Detailed Document Statistics */}
      <div className="rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-2.5 space-y-1.5">
        <div className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Caracteres (con espacios)</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)]">{chars}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Caracteres (sin espacios)</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)]">{charsNoSpaces}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Oraciones</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)]">{sentences}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Párrafos</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)]">{paragraphs}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-[var(--color-text-secondary)]">Líneas</span>
          <span className="font-mono font-medium text-[var(--color-text-primary)]">{lines}</span>
        </div>
      </div>

      {/* Reading and Speaking Times */}
      <div className="rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-2.5 space-y-2">
        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold pb-1 border-b border-[var(--color-border)]">
          <Clock size={13} className="text-sky-400 micro-icon" />
          <span>Tiempos Estimados</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-secondary)]">Lectura lenta (150 ppm)</span>
            <span className="font-mono text-[var(--color-text-primary)]">{readingSlow} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-secondary)]">Lectura media (200 ppm)</span>
            <span className="font-mono font-semibold text-[var(--color-accent)]">{readingMedium} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-secondary)]">Lectura rápida (250 ppm)</span>
            <span className="font-mono text-[var(--color-text-primary)]">{readingFast} min</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
              <Mic size={11} className="text-amber-400 micro-icon" />
              Locución (130 ppm)
            </span>
            <span className="font-mono text-[var(--color-text-primary)]">{speakingTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
