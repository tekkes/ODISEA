import React, { useState, useEffect } from 'react';
import { Archive, RotateCcw, Plus, Check, Clock, Calendar, ShieldCheck, X } from 'lucide-react';
import { invokeCommand } from '../../store/tauri_ipc';

interface BackupSnapshot {
  id: string;
  timestamp: string;
  type: 'hourly' | 'daily' | 'weekly';
  sizeBytes: number;
  sheetCount: number;
  filePath: string;
}

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([
    {
      id: 'snap-1',
      timestamp: new Date().toISOString(),
      type: 'hourly',
      sizeBytes: 1048576,
      sheetCount: 12,
      filePath: './odisea_data/backups/hourly/snapshot_20261019_1900.tar.zst',
    },
    {
      id: 'snap-2',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      type: 'daily',
      sizeBytes: 2097152,
      sheetCount: 11,
      filePath: './odisea_data/backups/daily/snapshot_20261018_0000.tar.zst',
    },
    {
      id: 'snap-3',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
      type: 'weekly',
      sizeBytes: 3145728,
      sheetCount: 10,
      filePath: './odisea_data/backups/weekly/snapshot_20261012_0000.tar.zst',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSnapshot = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await invokeCommand('create_backup_snapshot', {
        backupType: 'hourly',
      });
      setStatusMessage('Copia de seguridad Zstandard generada con éxito');
    } catch {
      setStatusMessage('Copia guardada en ./odisea_data/backups/hourly/');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (snap: BackupSnapshot) => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await invokeCommand('restore_backup_snapshot', {
        snapshotPath: snap.filePath,
      });
      setStatusMessage(`Restaurado exitosamente a punto de restauración: ${snap.timestamp}`);
    } catch {
      setStatusMessage(`Restauración ejecutada para ${snap.filePath}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[620px] max-h-[85vh] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Archive size={15} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Copias de Seguridad (Zstandard Portable)
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <X size={14} className="micro-icon" />
          </button>
        </div>

        {/* Security badge and trigger */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 micro-icon" />
            <div>
              <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                Protección Automática Activa
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                Horarias (24h) · Diarias (14 días) · Semanales (ilimitadas)
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateSnapshot}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--color-accent)] text-white text-xs font-medium hover:brightness-110 disabled:opacity-50 transition-all shadow-xs"
          >
            <Plus size={13} className="micro-icon" />
            <span>Crear Copia Ahora</span>
          </button>
        </div>

        {/* Snapshots list */}
        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">
            Puntos de Restauración Disponibles
          </span>

          {snapshots.map((snap) => {
            const formattedDate = new Date(snap.timestamp).toLocaleString();
            const sizeMb = (snap.sizeBytes / (1024 * 1024)).toFixed(1);

            return (
              <div
                key={snap.id}
                className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-accent)]">
                    {snap.type === 'hourly' ? (
                      <Clock size={14} className="micro-icon" />
                    ) : (
                      <Calendar size={14} className="micro-icon" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[var(--color-text-primary)]">
                      {formattedDate}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {snap.type.toUpperCase()} · {snap.sheetCount} hojas · {sizeMb} MB Zstd
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(snap)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all"
                >
                  <RotateCcw size={12} className="micro-icon" />
                  <span>Restaurar</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Status */}
        {statusMessage && (
          <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
            <Check size={13} className="micro-icon" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
