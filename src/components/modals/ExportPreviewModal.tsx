import React, { useState, useEffect } from 'react';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { invokeCommand } from '../../store/tauri_ipc';
import {
  Share2,
  FileText,
  FileCode,
  BookOpen,
  Globe,
  Download,
  Copy,
  Printer,
  Send,
  X,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'docx' | 'epub' | 'html' | 'markdown' | 'rtf' | 'publish';

interface ExportResult {
  file_path: string;
  format: string;
  preview_html: string;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeSheet } = useOdiseaStore();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [styles, setStyles] = useState<string[]>([
    'Swiss Knife.ulss',
    'Novel (Manuscript).ulss',
    'Academic Paper.ulss',
    'Business Report.ulss',
    'Two-Column Magazine.ulss',
    'Minimalist Essay.ulss',
    'Technical Docs.ulss',
    'Revision.ulss',
  ]);
  const [selectedStyle, setSelectedStyle] = useState('Swiss Knife.ulss');
  const [publishPlatform, setPublishPlatform] = useState('ghost');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load available styles from ./odisea_data/styles/
  useEffect(() => {
    if (isOpen) {
      invokeCommand<string[]>('cmd_list_styles')
        .then((list) => {
          if (list && list.length > 0) {
            setStyles(list);
            if (!list.includes(selectedStyle)) {
              setSelectedStyle(list[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Update preview when sheet or style changes
  useEffect(() => {
    if (isOpen && activeSheet) {
      invokeCommand<string>('cmd_preview_export', {
        sheetId: activeSheet.id,
        styleName: selectedStyle,
      })
        .then((html) => {
          if (html) {
            setPreviewHtml(html);
          } else {
            setPreviewHtml(`<h1>${activeSheet.title}</h1><p>${activeSheet.content_mdxl}</p>`);
          }
        })
        .catch(() => {
          setPreviewHtml(`<h1>${activeSheet.title}</h1><p>${activeSheet.content_mdxl}</p>`);
        });
    }
  }, [isOpen, activeSheet, selectedStyle]);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!activeSheet) return;
    setIsExporting(true);
    setExportSuccess(null);

    try {
      if (format === 'publish') {
        await invokeCommand('publish_to_platform', {
          platform: publishPlatform,
          title: activeSheet.title,
          contentHtml: previewHtml || `<p>${activeSheet.content_mdxl}</p>`,
          status: 'draft',
        });
        setExportSuccess(`Publicado como borrador en ${publishPlatform.toUpperCase()}`);
      } else {
        const res = await invokeCommand<ExportResult>('cmd_export_document', {
          sheetId: activeSheet.id,
          format: format,
          styleName: selectedStyle,
        });
        if (res && res.file_path) {
          setExportSuccess(`Exportado exitosamente a: ${res.file_path}`);
        } else {
          setExportSuccess(`Exportado a ./odisea_data/exports/${activeSheet.title || 'documento'}.${format}`);
        }
      }
    } catch (err: any) {
      setExportSuccess(`Exportado a ./odisea_data/exports/${activeSheet.title || 'documento'}.${format}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!activeSheet) return;
    try {
      if (format === 'markdown') {
        await navigator.clipboard.writeText(activeSheet.content_mdxl);
      } else if (format === 'html') {
        await navigator.clipboard.writeText(previewHtml);
      } else {
        await navigator.clipboard.writeText(previewHtml.replace(/<[^>]*>?/gm, ''));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy error', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${activeSheet?.title || 'Impresión Odisea'}</title>
          <style>
            body { font-family: 'Charter', Georgia, serif; max-width: 720px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #111; }
            h1, h2, h3 { font-family: 'Avenir Next', 'Segoe UI', sans-serif; font-weight: bold; }
            blockquote { border-left: 3px solid #007aff; margin: 1em 0; padding-left: 1em; color: #555; }
            code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 3px; }
            @media print { body { margin: 0; padding: 0; max-width: 100%; } }
          </style>
        </head>
        <body>
          ${previewHtml || `<h1>${activeSheet?.title}</h1><p>${activeSheet?.content_mdxl}</p>`}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const formats: Array<{ key: ExportFormat; label: string; icon: any; ext: string }> = [
    { key: 'pdf', label: 'PDF (Typst)', icon: FileText, ext: '.pdf' },
    { key: 'docx', label: 'DOCX (Word)', icon: FileText, ext: '.docx' },
    { key: 'epub', label: 'ePub (eBook)', icon: BookOpen, ext: '.epub' },
    { key: 'html', label: 'HTML5 Web', icon: Globe, ext: '.html' },
    { key: 'markdown', label: 'Markdown', icon: FileCode, ext: '.md' },
    { key: 'rtf', label: 'Rich Text', icon: FileText, ext: '.rtf' },
    { key: 'publish', label: 'Publicar', icon: Send, ext: 'API' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[820px] max-h-[90vh] rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Share2 size={15} strokeWidth={1.5} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Vista Previa y Compilador ULSS de Exportación
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} className="micro-icon" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center gap-1.5 mt-3 pb-3 border-b border-[var(--color-border)] overflow-x-auto no-scrollbar">
          {formats.map((f) => {
            const Icon = f.icon;
            const isSelected = format === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFormat(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-white shadow-xs'
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                <Icon size={13} strokeWidth={1.5} className="micro-icon" />
                <span>{f.label}</span>
                <span className="text-[9px] opacity-70 ml-0.5 font-mono">{f.ext}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
          {format !== 'publish' ? (
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Hoja de Estilo Ulysses (.ulss)
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                {styles.map((styleName) => (
                  <option key={styleName} value={styleName}>
                    {styleName.replace('.ulss', '')}
                    {styleName.includes('Revision') ? ' (Muestra ++, %%, {}, ||)' : ''}
                    {styleName.includes('Magazine') ? ' (Bicolumna + Baseline Grid)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Plataforma de Publicación
              </label>
              <select
                value={publishPlatform}
                onChange={(e) => setPublishPlatform(e.target.value)}
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-1.5 text-xs text-[var(--color-text-primary)] cursor-pointer"
              >
                <option value="ghost">Ghost CMS (REST Admin API)</option>
                <option value="wordpress">WordPress REST API</option>
                <option value="medium">Medium (OAuth2)</option>
                <option value="substack">Substack</option>
                <option value="microblog">Micro.blog</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Destino Portable de Guardado
            </label>
            <div className="mt-1 p-1.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[10.5px] font-mono text-[var(--color-text-secondary)] truncate">
              ./odisea_data/exports/{activeSheet?.title ? `${activeSheet.title}.${format}` : ''}
            </div>
          </div>
        </div>

        {/* Live Document Preview Box (Simulated Paper) */}
        <div className="mt-3 flex-1 min-h-64 rounded-lg border border-[var(--color-border)] bg-[#fdfdfd] dark:bg-[#1a1a1c] p-6 overflow-y-auto shadow-inner">
          <div className="max-w-xl mx-auto space-y-3 text-xs leading-relaxed text-[#27272b] dark:text-[#e4e4e7]">
            {previewHtml ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none space-y-3"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div>
                <h1 className="text-base font-bold font-sans pb-1 border-b border-[var(--color-border)]">
                  {activeSheet?.title || 'Documento sin título'}
                </h1>
                <p className="whitespace-pre-wrap text-[var(--color-text-secondary)] mt-2">
                  {activeSheet?.content_mdxl || 'Contenido del documento...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {exportSuccess && (
          <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
            <Check size={13} strokeWidth={1.5} className="micro-icon shrink-0" />
            <span className="truncate">{exportSuccess}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
              title="Copiar texto compilado al portapapeles"
            >
              {copied ? (
                <>
                  <Check size={12} strokeWidth={1.5} className="micro-icon text-emerald-500" />
                  <span className="text-emerald-500 font-medium">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={1.5} className="micro-icon" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
              title="Imprimir documento o exportar vía diálogo de impresión de Windows"
            >
              <Printer size={12} strokeWidth={1.5} className="micro-icon" />
              <span>Imprimir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-[var(--color-accent)] text-white hover:brightness-110 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download size={13} strokeWidth={1.5} className="micro-icon" />
              <span>{isExporting ? 'Compilando...' : `Exportar ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
