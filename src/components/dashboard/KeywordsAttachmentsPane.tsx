import React, { useState, useEffect, useMemo } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { invokeCommand } from '../../store/tauri_ipc';
import {
  Tag,
  Plus,
  X,
  FileText,
  Paperclip,
  Calendar,
  Clock,
  Trash2,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';

interface KeywordItem {
  id: string;
  name: string;
  color: string;
}

interface AttachmentItem {
  id: string;
  sheet_id: string;
  file_type: string;
  file_name: string;
  file_hash: string;
  created_at: string;
}

export const KeywordsAttachmentsPane: React.FC = () => {
  const { activeSheet, activeProjectId, updateSheetCreatedAt } = useOdiseaStore();

  const [attachedKeywords, setAttachedKeywords] = useState<KeywordItem[]>([]);
  const [projectPoolKeywords, setProjectPoolKeywords] = useState<KeywordItem[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0a84ff');

  const [sheetNote, setSheetNote] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  // Date correction state
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [dateSavedMessage, setDateSavedMessage] = useState(false);

  // Initialize date correction inputs when active sheet changes
  useEffect(() => {
    if (activeSheet) {
      const d = new Date(activeSheet.created_at);
      if (!isNaN(d.getTime())) {
        setEditDate(d.toISOString().split('T')[0]);
        setEditTime(d.toTimeString().slice(0, 5));
      }
      // Load scratchpad note from localStorage
      const savedNote = localStorage.getItem(`odisea_note_${activeSheet.id}`) || '';
      setSheetNote(savedNote);
    }
  }, [activeSheet?.id, activeSheet?.created_at]);

  // Load attached keywords and project pool keywords
  const loadKeywords = async () => {
    if (!activeSheet) return;
    try {
      const attached = await invokeCommand<KeywordItem[]>('cmd_list_keywords_for_sheet', {
        sheetId: activeSheet.id,
      });
      setAttachedKeywords(Array.isArray(attached) ? attached : []);

      const pool = await invokeCommand<KeywordItem[]>('cmd_list_keywords', {
        projectId: activeProjectId,
      });
      setProjectPoolKeywords(Array.isArray(pool) ? pool : []);
    } catch (err) {
      console.warn('Failed to load keywords:', err);
    }
  };

  // Load attachments
  const loadAttachments = async () => {
    if (!activeSheet) return;
    try {
      const list = await invokeCommand<AttachmentItem[]>('cmd_list_sheet_attachments', {
        sheetId: activeSheet.id,
      });
      setAttachments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load attachments:', err);
    }
  };

  useEffect(() => {
    loadKeywords();
    loadAttachments();
  }, [activeSheet?.id, activeProjectId]);

  const handleAddKeyword = async (name: string, color?: string) => {
    if (!activeSheet || !name.trim()) return;
    const finalColor = color || selectedColor;
    try {
      await invokeCommand('cmd_attach_keyword', {
        sheetId: activeSheet.id,
        keywordName: name.trim(),
        color: finalColor,
      });
      setNewTagInput('');
      await loadKeywords();
    } catch (err) {
      console.error('Error attaching keyword:', err);
    }
  };

  const handleRemoveKeyword = async (keywordId: string) => {
    if (!activeSheet) return;
    try {
      await invokeCommand('cmd_detach_keyword', {
        sheetId: activeSheet.id,
        keywordId,
      });
      await loadKeywords();
    } catch (err) {
      console.error('Error detaching keyword:', err);
    }
  };

  const handleSaveNote = (text: string) => {
    setSheetNote(text);
    if (activeSheet) {
      localStorage.setItem(`odisea_note_${activeSheet.id}`, text);
    }
  };

  const handleSaveDateCorrection = async () => {
    if (!activeSheet || !editDate) return;
    const time = editTime || '12:00';
    const newDateTime = new Date(`${editDate}T${time}:00`).toISOString();
    await updateSheetCreatedAt(activeSheet.id, newDateTime);
    setDateSavedMessage(true);
    setTimeout(() => setDateSavedMessage(false), 2000);
  };

  const handleAddAttachmentMock = async () => {
    if (!activeSheet) return;
    const sampleNames = ['referencia_mapa.png', 'esquema_trama.pdf', 'foto_personaje.jpg'];
    const chosen = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    try {
      await invokeCommand('cmd_create_sheet_attachment', {
        sheetId: activeSheet.id,
        fileName: chosen,
        fileType: chosen.endsWith('.png') || chosen.endsWith('.jpg') ? 'image' : 'document',
        fileHash: `hash-${Date.now()}`,
      });
      await loadAttachments();
    } catch (err) {
      console.error('Error creating attachment:', err);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await invokeCommand('cmd_delete_sheet_attachment', { attachmentId: id });
      await loadAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  // Keywords in pool not yet attached
  const poolSuggestions = useMemo(() => {
    const attachedIds = new Set(attachedKeywords.map((k) => k.id));
    return projectPoolKeywords.filter((k) => !attachedIds.has(k.id));
  }, [projectPoolKeywords, attachedKeywords]);

  const palette = ['#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff', '#ffd60a'];

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Keywords Management */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[var(--color-text-primary)] font-semibold">
          <div className="flex items-center gap-1.5">
            <Tag size={13} className="text-[var(--color-accent)] micro-icon" />
            <span>Palabras Clave ({attachedKeywords.length})</span>
          </div>
        </div>

        {/* Attached Keywords List */}
        <div className="flex flex-wrap gap-1.5 min-h-6">
          {attachedKeywords.map((tag) => (
            <span
              key={tag.id}
              className="micro-keyword border border-[var(--color-border)] inline-flex items-center gap-1.5"
              style={{
                backgroundColor: `${tag.color}15`,
                borderColor: `${tag.color}40`,
                color: tag.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium">{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(tag.id)}
                className="hover:opacity-75 transition-opacity"
                title="Quitar palabra clave"
              >
                <X size={10} className="micro-icon" />
              </button>
            </span>
          ))}

          {attachedKeywords.length === 0 && (
            <span className="text-[11px] text-[var(--color-text-muted)] italic">
              Sin palabras clave asignadas.
            </span>
          )}
        </div>

        {/* Project Pool Suggestions */}
        {poolSuggestions.length > 0 && (
          <div className="pt-1 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--color-text-muted)]">
              Pool del Proyecto (clic para añadir):
            </span>
            <div className="flex flex-wrap gap-1">
              {poolSuggestions.slice(0, 6).map((kw) => (
                <button
                  key={kw.id}
                  type="button"
                  onClick={() => handleAddKeyword(kw.name, kw.color)}
                  className="micro-badge border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors flex items-center gap-1"
                  style={{ color: kw.color }}
                >
                  <Plus size={9} className="micro-icon" />
                  <span>{kw.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Tag Input with Color Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Nueva palabra clave..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(newTagInput)}
              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
            />
            <button
              onClick={() => handleAddKeyword(newTagInput)}
              className="p-1.5 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
              title="Añadir palabra clave"
            >
              <Plus size={13} className="micro-icon" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-125 ring-2 ring-[var(--color-text-primary)]' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Date Correction Section */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-[var(--color-text-primary)] font-semibold">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-400 micro-icon" />
            <span>Corrección de Fecha (Date Correction)</span>
          </div>
          {dateSavedMessage && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <Check size={11} className="micro-icon" />
              Guardada
            </span>
          )}
        </div>

        <p className="text-[10px] text-[var(--color-text-muted)]">
          Modifica la fecha de creación original registrada para esta hoja.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] uppercase font-semibold text-[var(--color-text-muted)] block mb-0.5">
              Fecha
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase font-semibold text-[var(--color-text-muted)] block mb-0.5">
              Hora
            </label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveDateCorrection}
          className="w-full py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] text-[11px] font-medium transition-colors"
        >
          Actualizar Fecha de Creación
        </button>
      </div>

      {/* Author Attached Scratchpad Note */}
      <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-[var(--color-text-primary)] font-semibold">
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-sky-400 micro-icon" />
            <span>Nota Adjunta de Hoja</span>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-text-muted)]">
          Bloc de notas para el autor. Se preserva con la hoja pero no se incluye en la exportación final.
        </p>

        <textarea
          rows={3}
          value={sheetNote}
          onChange={(e) => handleSaveNote(e.target.value)}
          placeholder="Anotaciones rápidas de investigación, fuentes o recordatorios..."
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-hidden resize-y"
        />
      </div>

      {/* Attached Reference Images & Files */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-[var(--color-text-primary)] font-semibold">
          <div className="flex items-center gap-1.5">
            <Paperclip size={13} className="text-purple-400 micro-icon" />
            <span>Archivos e Imágenes Adjuntas ({attachments.length})</span>
          </div>
        </div>

        <div
          onClick={handleAddAttachmentMock}
          className="p-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer space-y-1"
        >
          <ImageIcon size={18} className="mx-auto stroke-[1.5] opacity-50 text-[var(--color-accent)]" />
          <p className="text-[11px] font-medium text-[var(--color-text-primary)]">
            Adjuntar imagen o archivo de referencia
          </p>
          <p className="text-[9px] opacity-75">Haz clic para agregar archivo</p>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-1 pt-1 max-h-40 overflow-y-auto pr-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="p-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ImageIcon size={12} className="text-purple-400 micro-icon shrink-0" />
                  <span className="truncate text-[11px] font-medium">{att.file_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                  title="Eliminar adjunto"
                >
                  <Trash2 size={11} className="micro-icon" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
