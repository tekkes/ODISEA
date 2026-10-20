import React, { useState } from 'react';
import { Settings, HardDrive, Type, Shield, Key, Check, X } from 'lucide-react';
import { useOdiseaStore } from '../../store/useOdiseaStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'storage' | 'backups' | 'publishing'>('general');
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[640px] max-h-[85vh] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Preferencias de Odisea
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <X size={14} className="micro-icon" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 mt-3 pb-3 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            <Type size={13} className="micro-icon" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'storage'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            <HardDrive size={13} className="micro-icon" />
            <span>Portabilidad</span>
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'backups'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            <Shield size={13} className="micro-icon" />
            <span>Copias Seguridad</span>
          </button>

          <button
            onClick={() => setActiveTab('publishing')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'publishing'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            <Key size={13} className="micro-icon" />
            <span>Cuentas y APIs</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">
                  Tipografía del Editor
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs text-[var(--color-text-primary)]"
                >
                  <option value="Inter, sans-serif">Inter (Sans-serif moderna)</option>
                  <option value="Georgia, serif">Georgia (Serifa clásica)</option>
                  <option value="JetBrains Mono, monospace">JetBrains Mono (Monospace)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">
                  Tamaño de Fuente: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full mt-1 accent-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">
                  Interlineado: {lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full mt-1 accent-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2">
                <span className="text-[11px] font-semibold text-emerald-400">
                  Directorio Raíz Portable Activo
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  Todo el almacenamiento reside en la carpeta local de la aplicación. Cero escritura en %APPDATA% o registro.
                </p>
                <div className="space-y-1 font-mono text-[11px] text-[var(--color-text-muted)] pt-1">
                  <div>· Base SQLite: <span className="text-[var(--color-text-primary)]">./odisea_data/library.odiseadb</span></div>
                  <div>· Configuración: <span className="text-[var(--color-text-primary)]">./odisea_data/config.toml</span></div>
                  <div>· Perfil WebView2: <span className="text-[var(--color-text-primary)]">./odisea_data/webview_profile/</span></div>
                  <div>· Temas y Estilos: <span className="text-[var(--color-text-primary)]">./odisea_data/themes/ | styles/</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2">
                <span className="text-[11px] font-semibold text-[var(--color-text-primary)]">
                  Frecuencia de Instantáneas Zstandard
                </span>
                <div className="space-y-2 text-[11px] text-[var(--color-text-secondary)]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                    <span>Copias Horarias (guardar últimas 24 horas)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                    <span>Copias Diarias (guardar últimos 14 días)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-[var(--color-accent)]" />
                    <span>Copias Semanales (sin límite de retención)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'publishing' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Ghost Admin API Key</label>
                  <input
                    type="password"
                    placeholder="65a...:..."
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1.5 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">WordPress Application Password</label>
                  <input
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1.5 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--color-text-secondary)]">Medium Integration Token</label>
                  <input
                    type="password"
                    placeholder="2..."
                    className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1.5 text-xs text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--color-accent)] text-white hover:brightness-110"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
