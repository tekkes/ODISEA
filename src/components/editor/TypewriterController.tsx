import React from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  MoveVertical,
  Focus,
  SunMedium,
  Check,
} from 'lucide-react';

export type TypewriterPosition = 'top' | 'center' | 'bottom' | 'band';
export type FocusMode = 'none' | 'line' | 'sentence' | 'paragraph';

export const TypewriterController: React.FC = () => {
  const {
    typewriterEnabled,
    typewriterPosition,
    focusMode,
    toggleTypewriter,
    setFocusMode,
  } = useOdiseaStore();

  const [isTypewriterMenuOpen, setIsTypewriterMenuOpen] = React.useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = React.useState(false);

  const typewriterPositions: Array<{ id: TypewriterPosition; label: string; icon: any; desc: string }> = [
    { id: 'top', label: 'Superior (25%)', icon: AlignVerticalJustifyStart, desc: 'Línea activa fijada arriba' },
    { id: 'center', label: 'Central (50%)', icon: AlignVerticalJustifyCenter, desc: 'Línea activa en el centro exacto' },
    { id: 'bottom', label: 'Inferior (75%)', icon: AlignVerticalJustifyEnd, desc: 'Línea activa fijada abajo' },
    { id: 'band', label: 'Banda Variable', icon: MoveVertical, desc: 'Zona elástica flotante' },
  ];

  const focusModes: Array<{ id: FocusMode; label: string; desc: string }> = [
    { id: 'none', label: 'Sin Atenuación', desc: 'Todo el documento con brillo uniforme' },
    { id: 'line', label: 'Línea Actual', desc: 'Atenúa todo excepto la línea del cursor al 30%' },
    { id: 'sentence', label: 'Frase Actual', desc: 'Atenúa todo excepto la oración en curso al 30%' },
    { id: 'paragraph', label: 'Párrafo Actual', desc: 'Atenúa todo excepto el bloque en curso al 30%' },
  ];

  const handleSelectPosition = (pos: TypewriterPosition) => {
    useOdiseaStore.setState({ typewriterPosition: pos as any });
    if (!typewriterEnabled) {
      toggleTypewriter();
    }
    setIsTypewriterMenuOpen(false);
  };

  const handleSelectFocus = (mode: FocusMode) => {
    setFocusMode(mode);
    setIsFocusMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md px-1 py-0.5 text-xs text-[var(--color-text-secondary)] select-none relative">
      {/* 1. Typewriter Scroll Toggle & Position Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsTypewriterMenuOpen(!isTypewriterMenuOpen)}
          title={`Modo Máquina de Escribir (${typewriterEnabled ? `Activado: ${typewriterPosition}` : 'Desactivado'})`}
          className={`px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            typewriterEnabled
              ? 'bg-[var(--color-accent)] text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
          }`}
        >
          <AlignVerticalJustifyCenter size={13} className="micro-icon" />
          <span>Máquina</span>
          {typewriterEnabled && (
            <span className="font-mono text-[9px] uppercase opacity-90 ml-0.5">
              {typewriterPosition}
            </span>
          )}
        </button>

        {isTypewriterMenuOpen && (
          <div className="absolute top-7 right-0 w-48 p-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] font-semibold text-[var(--color-text-muted)] px-2 py-1 uppercase tracking-wider">
              Desplazamiento Máquina
            </div>

            <button
              type="button"
              onClick={() => {
                toggleTypewriter();
                setIsTypewriterMenuOpen(false);
              }}
              className="w-full text-left px-2 py-1 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded flex items-center justify-between cursor-pointer"
            >
              <span>{typewriterEnabled ? 'Desactivar Máquina' : 'Activar Máquina'}</span>
            </button>

            <div className="w-full h-[1px] bg-[var(--color-border)] my-1" />

            {typewriterPositions.map((pos) => {
              const isSelected = typewriterEnabled && typewriterPosition === pos.id;
              const Icon = pos.icon;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => handleSelectPosition(pos.id)}
                  className={`w-full flex items-center justify-between px-2 py-1 text-xs rounded text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="micro-icon" />
                    <span>{pos.label}</span>
                  </div>
                  {isSelected && <Check size={11} className="micro-icon text-[var(--color-accent)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-[1px] h-3.5 bg-[var(--color-border)] mx-0.5" />

      {/* 2. Focus Mode Highlight Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsFocusMenuOpen(!isFocusMenuOpen)}
          title={`Modo Enfoque (${focusMode === 'none' ? 'Desactivado' : focusMode})`}
          className={`px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            focusMode !== 'none'
              ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
          }`}
        >
          <Focus size={13} className="micro-icon" />
          <span className="capitalize">{focusMode === 'none' ? 'Enfoque' : focusMode}</span>
        </button>

        {isFocusMenuOpen && (
          <div className="absolute top-7 right-0 w-52 p-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] font-semibold text-[var(--color-text-muted)] px-2 py-1 uppercase tracking-wider">
              Modo Enfoque (Focus Highlight)
            </div>

            {focusModes.map((m) => {
              const isSelected = focusMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectFocus(m.id)}
                  className={`w-full flex items-center justify-between px-2 py-1 text-xs rounded text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div>
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[9.5px] text-[var(--color-text-muted)]">{m.desc}</div>
                  </div>
                  {isSelected && <Check size={11} className="micro-icon text-[var(--color-accent)] ml-1 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
