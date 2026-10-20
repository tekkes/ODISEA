import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { Sigma, Check, X, AlertCircle, Copy, BookOpen } from 'lucide-react';

interface EquationWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertEquation: (eqMarkdown: string) => void;
  initialLatex?: string;
  defaultBlock?: boolean;
}

const MATH_SNIPPETS = [
  { label: 'Fracción', code: '\\frac{a}{b}' },
  { label: 'Raíz cuadrada', code: '\\sqrt{x}' },
  { label: 'Superíndice', code: 'x^{2}' },
  { label: 'Subíndice', code: 'x_{i}' },
  { label: 'Sumatoria', code: '\\sum_{i=1}^{n} x_i' },
  { label: 'Integral', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'Límite', code: '\\lim_{x \\to \\infty}' },
  { label: 'Matriz 2x2', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'α Beta', code: '\\alpha, \\beta, \\gamma' },
  { label: 'π Pi', code: '\\pi' },
  { label: 'Vector', code: '\\vec{v}' },
  { label: 'Paréntesis grande', code: '\\left( \\frac{x}{y} \\right)' },
];

export const EquationWidget: React.FC<EquationWidgetProps> = ({
  isOpen,
  onClose,
  onInsertEquation,
  initialLatex = 'E = mc^2',
  defaultBlock = false,
}) => {
  const [latex, setLatex] = useState(initialLatex);
  const [isBlock, setIsBlock] = useState(defaultBlock);

  // Live KaTeX rendering
  const { renderedHtml, error } = useMemo(() => {
    try {
      const html = katex.renderToString(latex.trim() || 'f(x)', {
        displayMode: isBlock,
        throwOnError: true,
      });
      return { renderedHtml: html, error: null };
    } catch (err: any) {
      return { renderedHtml: '', error: err.message || 'Error de sintaxis TeX' };
    }
  }, [latex, isBlock]);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!latex.trim()) return;
    const formula = isBlock ? `\n$$\n${latex.trim()}\n$$\n` : `$${latex.trim()}$`;
    onInsertEquation(formula);
    onClose();
  };

  const handleInsertSnippet = (code: string) => {
    setLatex((prev) => (prev ? `${prev} ${code}` : code));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-[520px] max-w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] select-none">
          <div className="flex items-center gap-2">
            <Sigma size={16} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Editor de Ecuaciones Matemáticas (KaTeX)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={13} className="micro-icon" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Live Preview Screen */}
          <div>
            <div className="flex items-center justify-between mb-1.5 select-none">
              <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Previsualización en Vivo
              </label>
              <span className="micro-badge bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-mono text-[10px]">
                {isBlock ? 'Bloque ($$)' : 'En línea ($)'}
              </span>
            </div>

            <div className="w-full min-h-[90px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 flex items-center justify-center overflow-x-auto shadow-inner">
              {error ? (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono">
                  <AlertCircle size={14} className="micro-icon shrink-0" />
                  <span className="line-clamp-2">{error}</span>
                </div>
              ) : (
                <div
                  className="katex-preview text-[var(--color-text-primary)] select-none"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              )}
            </div>
          </div>

          {/* Quick math symbol snippets */}
          <div>
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider select-none mb-1 block">
              Símbolos y Estructuras Rápidas
            </label>
            <div className="flex flex-wrap gap-1">
              {MATH_SNIPPETS.map((snip) => (
                <button
                  key={snip.label}
                  type="button"
                  onClick={() => handleInsertSnippet(snip.code)}
                  title={snip.code}
                  className="px-2 py-0.5 rounded text-[11px] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-colors cursor-pointer"
                >
                  {snip.label}
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX Input */}
          <div>
            <label className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1 block select-none">
              Código LaTeX / TeX
            </label>
            <textarea
              rows={3}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="e.g. \\oint_{\\partial \\Omega} \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q}{\\varepsilon_0}"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2.5 font-mono text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
              autoFocus
              spellCheck={false}
            />
          </div>

          {/* Mode switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBlock}
              onChange={(e) => setIsBlock(e.target.checked)}
              className="rounded accent-[var(--color-accent)]"
            />
            <span className="text-xs text-[var(--color-text-primary)]">
              Ecuación centrada en bloque de visualización ($$)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--color-border)] select-none">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!latex.trim() || Boolean(error)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-accent)] text-white hover:brightness-110 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Check size={13} className="micro-icon" />
            <span>Insertar Fórmula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
