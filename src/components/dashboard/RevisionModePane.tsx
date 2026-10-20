import React, { useState, useEffect, useMemo } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { invokeCommand } from '../../store/tauri_ipc';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Feather,
  Wand2,
  Copy,
  Check,
  Send,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';

interface RevisionIssue {
  id: string;
  category: string;
  message: string;
  context_snippet: string;
  line_number: number;
  start_offset: number;
  length: number;
  severity: string;
  replacements: string[];
}

export const RevisionModePane: React.FC = () => {
  const {
    activeSheet,
    updateSheetContent,
    isRevisionMode,
    toggleRevisionMode,
  } = useOdiseaStore();

  const [issues, setIssues] = useState<RevisionIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI Assistant state
  const [aiAction, setAiAction] = useState<string>('rewrite');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiCopied, setAiCopied] = useState(false);

  const runRevisionCheck = async () => {
    if (!activeSheet?.content_mdxl) {
      setIssues([]);
      return;
    }

    setIsChecking(true);
    try {
      const result = await invokeCommand<RevisionIssue[]>('cmd_run_revision_check', {
        text: activeSheet.content_mdxl,
      });
      if (Array.isArray(result)) {
        setIssues(result);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.warn('Backend revision check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runRevisionCheck();
  }, [activeSheet?.id, activeSheet?.content_mdxl]);

  // Apply suggestion directly to sheet content
  const handleApplyReplacement = async (issue: RevisionIssue, replacement: string) => {
    if (!activeSheet) return;
    const text = activeSheet.content_mdxl;
    const before = text.slice(0, issue.start_offset);
    const after = text.slice(issue.start_offset + issue.length);
    const newContent = `${before}${replacement}${after}`;

    await updateSheetContent(activeSheet.id, activeSheet.title, newContent);
    // Remove fixed issue from local list
    setIssues((prev) => prev.filter((i) => i.id !== issue.id || i.start_offset !== issue.start_offset));
  };

  const handleJumpToIssue = (line: number) => {
    if (!activeSheet) return;
    window.dispatchEvent(
      new CustomEvent('odisea-jump-to-line', {
        detail: { line, sheetId: activeSheet.id },
      })
    );
  };

  const handleRunAiAssist = async () => {
    if (!activeSheet?.content_mdxl) return;
    setIsAiLoading(true);
    setAiResult(null);

    try {
      const response = await invokeCommand<string>('cmd_llm_assist', {
        action: aiAction,
        text: activeSheet.content_mdxl,
        customPrompt: aiAction === 'custom' ? customPrompt : null,
      });
      setAiResult(response);
    } catch (err) {
      setAiResult(`Error del asistente de IA: ${err}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiResult = async () => {
    if (!activeSheet || !aiResult) return;
    await updateSheetContent(activeSheet.id, activeSheet.title, aiResult);
    setAiResult(null);
  };

  const handleCopyAiResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  // 10 categories
  const categories = [
    'all',
    'Ortografía',
    'Gramática',
    'Puntuación',
    'Estilo',
    'Redundancia',
    'Tipografía',
    'Semántica',
    'Mayúsculas',
    'Repetición',
    'Voz pasiva',
  ];

  const filteredIssues = useMemo(() => {
    if (selectedCategory === 'all') return issues;
    return issues.filter((i) => i.category === selectedCategory);
  }, [issues, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: issues.length };
    issues.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + 1;
    });
    return map;
  }, [issues]);

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Revision Mode Master Switch */}
      <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-semibold">
            <Feather size={14} className="text-[var(--color-accent)] micro-icon" />
            <span>Modo Revisión Editorial</span>
          </div>

          <button
            type="button"
            onClick={toggleRevisionMode}
            className={`py-1 px-2.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
              isRevisionMode
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {isRevisionMode ? <Eye size={12} className="micro-icon" /> : <EyeOff size={12} className="micro-icon" />}
            <span>{isRevisionMode ? 'ACTIVADO' : 'DESACTIVADO'}</span>
          </button>
        </div>

        <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
          {isRevisionMode
            ? 'Colores atenuados para máxima concentración; resaltando anotaciones {}, comentarios %%, tachados || y adiciones ++.'
            : 'Activa el Modo Revisión para atenuar el texto general y resaltar anotaciones, comentarios y sugerencias.'}
        </p>
      </div>

      {/* 10-Category Filter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1">
            <Filter size={12} className="micro-icon" />
            <span>Categorías de Revisión ({issues.length})</span>
          </div>
          <button
            onClick={runRevisionCheck}
            disabled={isChecking}
            title="Volver a analizar"
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={`micro-icon ${isChecking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (cat !== 'all' && count === 0) return null;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-0.5 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                <span>{cat === 'all' ? 'Todas' : cat}</span>
                <span
                  className={`text-[9px] px-1 rounded-full ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="p-6 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-center text-[var(--color-text-muted)] space-y-1.5">
          <CheckCircle2 size={24} className="mx-auto text-emerald-400 stroke-[1.5]" />
          <p className="text-xs font-semibold text-[var(--color-text-primary)]">
            Sin errores detectados
          </p>
          <p className="text-[11px] opacity-75">
            {selectedCategory === 'all'
              ? 'El documento está limpio en las 10 categorías de análisis.'
              : `No se encontraron incidencias en '${selectedCategory}'.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredIssues.map((issue) => (
            <div
              key={`${issue.id}-${issue.start_offset}`}
              className="p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    size={12}
                    className={`micro-icon shrink-0 ${
                      issue.severity === 'error'
                        ? 'text-red-400'
                        : issue.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-sky-400'
                    }`}
                  />
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {issue.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToIssue(issue.line_number)}
                  className="font-mono text-[9px] px-1 py-0.2 rounded bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                  title="Ir a línea en el editor"
                >
                  L{issue.line_number}
                </button>
              </div>

              <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
                {issue.message}
              </p>

              <div className="text-[10px] text-[var(--color-text-muted)] italic font-mono bg-[var(--color-bg-secondary)] px-1.5 py-0.5 rounded truncate">
                {issue.context_snippet}
              </div>

              {/* Replacements */}
              {issue.replacements.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[var(--color-text-muted)]">Aplicar:</span>
                  <div className="flex flex-wrap gap-1">
                    {issue.replacements.map((rep, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => handleApplyReplacement(issue, rep)}
                        className="micro-badge bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white font-medium transition-colors"
                        title={`Sustituir por "${rep}"`}
                      >
                        {rep}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Local LLM Writing Assistant (Ollama / Custom API) */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-[var(--color-text-primary)] font-semibold">
          <div className="flex items-center gap-1.5">
            <Wand2 size={13} className="text-[var(--color-accent)] micro-icon" />
            <span>Herramientas de IA (Ollama / Local)</span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-text-muted)]">
          Reescritura, síntesis o ajuste de tono mediante LLM configurado en config.toml.
        </p>

        <div className="space-y-1.5">
          <select
            value={aiAction}
            onChange={(e) => setAiAction(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
          >
            <option value="rewrite">Reescribir (Claridad y fluidez)</option>
            <option value="summarize">Resumir texto</option>
            <option value="tone_literary">Tono literario y poético</option>
            <option value="tone_concise">Máxima concisión (sin relleno)</option>
            <option value="passive_to_active">Convertir voz pasiva a activa</option>
            <option value="custom">Instrucción personalizada...</option>
          </select>

          {aiAction === 'custom' && (
            <input
              type="text"
              placeholder="Escribe tu instrucción para la IA..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
            />
          )}

          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleRunAiAssist}
            className="w-full py-1.5 rounded bg-[var(--color-accent)] text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-1.5 text-xs shadow-xs"
          >
            <Sparkles size={13} className={`micro-icon ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Procesando con IA...' : 'Ejecutar Asistente de IA'}</span>
          </button>
        </div>

        {/* AI Result Box */}
        {aiResult && (
          <div className="p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2 mt-2">
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-semibold">
              <span>RESULTADO DE IA:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyAiResult}
                  className="p-1 hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-0.5"
                  title="Copiar resultado"
                >
                  {aiCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{aiCopied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-text-primary)] max-h-36 overflow-y-auto leading-relaxed bg-[var(--color-bg-secondary)] p-2 rounded whitespace-pre-wrap">
              {aiResult}
            </p>

            <button
              type="button"
              onClick={handleApplyAiResult}
              className="w-full py-1 rounded bg-emerald-500 text-white font-medium hover:opacity-90 transition-opacity text-[11px] flex items-center justify-center gap-1"
            >
              <Check size={12} className="micro-icon" />
              <span>Reemplazar contenido de la hoja</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
