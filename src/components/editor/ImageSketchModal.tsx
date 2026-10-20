import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Edit2,
  PenTool,
  Highlighter,
  Square,
  Circle,
  MoveRight,
  Type,
  Eraser,
  Undo2,
  RotateCcw,
  Check,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface ImageSketchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageMarkdown: string) => void;
  initialImagePath?: string;
  initialCaption?: string;
}

type SketchTool = 'pen' | 'highlighter' | 'rect' | 'circle' | 'arrow' | 'text' | 'eraser';

const COLOR_PALETTE = [
  '#007aff', // Accent Blue
  '#ff3b30', // Red
  '#34c759', // Green
  '#ff9500', // Orange
  '#af52de', // Purple
  '#1c1c1e', // Black
  '#ffffff', // White
];

export const ImageSketchModal: React.FC<ImageSketchModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  initialImagePath = '',
  initialCaption = '',
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'sketch'>('url');
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [caption, setCaption] = useState(initialCaption);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

  // Sketch Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<SketchTool>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#007aff');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    if (isOpen) {
      setImagePath(initialImagePath);
      setCaption(initialCaption);
      setHistory([]);
    }
  }, [isOpen, initialImagePath, initialCaption]);

  // Initialize canvas
  useEffect(() => {
    if (activeTab === 'sketch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && history.length === 0) {
        // White canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Save initial state
        const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initial]);

        // If an image URL exists, load it onto the canvas as background
        if (imagePath.trim() && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const stateWithImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initial, stateWithImg]);
          };
          img.src = imagePath.trim();
        }
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev, current]);
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const newHistory = history.slice(0, -1);
      const prevState = newHistory[newHistory.length - 1];
      ctx.putImageData(prevState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    }
  };

  // Canvas drawing events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'text') {
      const userText = prompt('Escribe el texto para la anotación:');
      if (userText) {
        ctx.fillStyle = strokeColor;
        ctx.font = `${strokeWidth * 5 + 10}px sans-serif`;
        ctx.fillText(userText, x, y);
        saveCanvasState();
      }
      setIsDrawing(false);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'highlighter') {
      ctx.strokeStyle = strokeColor + '60'; // 40% alpha
      ctx.lineWidth = strokeWidth * 4;
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = strokeWidth * 5;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx || !startPos) return;

    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'rect' || currentTool === 'circle' || currentTool === 'arrow') {
      // Restore last snapshot while dragging
      if (history.length > 0) {
        ctx.putImageData(history[history.length - 1], 0, 0);
      }
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;

      if (currentTool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === 'arrow') {
        drawArrow(ctx, startPos.x, startPos.y, x, y);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    saveCanvasState();
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleInsert = () => {
    let finalSource = imagePath.trim();

    if (activeTab === 'sketch' && canvasRef.current) {
      finalSource = canvasRef.current.toDataURL('image/png');
    }

    if (!finalSource) return;

    const cleanCaption = caption.trim() ? ` "${caption.trim()}"` : '';
    const alignTag = align !== 'center' ? ` [${align}]` : '';
    const md = `\n(img: ${finalSource}${cleanCaption}${alignTag})\n`;

    onInsertImage(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-[680px] max-w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Imágenes y Lienzo de Bocetos (Scribble & Sketch)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={14} className="micro-icon" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-4 pt-3 flex gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <ImageIcon size={13} className="micro-icon" />
            <span>Insertar Imagen / URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sketch')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sketch'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <PenTool size={13} className="micro-icon" />
            <span>Dibujo y Anotaciones (Boceto)</span>
          </button>
        </div>

        {/* Tab 1: Image URL & Preview */}
        {activeTab === 'url' ? (
          <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
            <div>
              <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] block mb-1">
                Ruta Local o URL de la Imagen
              </label>
              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="assets/esquema.png o https://images.unsplash.com/..."
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
              />
            </div>

            {/* Live Inline Image Preview */}
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                Previsualización en Línea (Inline Preview)
              </label>
              <div className="w-full h-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-center overflow-hidden shadow-inner p-2">
                {imagePath.trim() ? (
                  <img
                    src={imagePath.trim()}
                    alt={caption || 'Previsualización'}
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center text-[var(--color-text-muted)] text-xs">
                    Introduce una URL o ruta para ver la imagen renderizada
                  </div>
                )}
              </div>
            </div>

            {/* Caption & Alignment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
                  Pie de Foto (Caption)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Figura 1: Arquitectura de Odisea..."
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
                  Alineación
                </label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAlign(a)}
                      className={`flex-1 py-1 rounded text-xs border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        align === a
                          ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-medium'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      {a === 'left' ? <AlignLeft size={12} className="micro-icon" /> : a === 'center' ? <AlignCenter size={12} className="micro-icon" /> : <AlignRight size={12} className="micro-icon" />}
                      <span className="capitalize">{a}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Scribble & Sketch Canvas */
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs">
              {/* Tool selector */}
              <div className="flex items-center gap-0.5">
                {[
                  { id: 'pen', label: 'Pluma', icon: PenTool },
                  { id: 'highlighter', label: 'Resaltador', icon: Highlighter },
                  { id: 'rect', label: 'Rectángulo', icon: Square },
                  { id: 'circle', label: 'Círculo', icon: Circle },
                  { id: 'arrow', label: 'Flecha', icon: MoveRight },
                  { id: 'text', label: 'Texto', icon: Type },
                  { id: 'eraser', label: 'Goma', icon: Eraser },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = currentTool === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCurrentTool(t.id as SketchTool)}
                      title={t.label}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <Icon size={13} className="micro-icon" />
                    </button>
                  );
                })}
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-1 border-l border-r border-[var(--color-border)] px-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setStrokeColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-3.5 h-3.5 rounded-full border border-black/20 transition-transform cursor-pointer ${
                      strokeColor === c ? 'scale-125 ring-2 ring-[var(--color-accent)]' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Stroke width */}
              <div className="flex items-center gap-1">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setStrokeWidth(w)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      strokeWidth === w
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>

              {/* Undo & Clear */}
              <div className="flex items-center gap-0.5 border-l border-[var(--color-border)] pl-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  title="Deshacer"
                  className="p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
                >
                  <Undo2 size={13} className="micro-icon" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title="Limpiar lienzo"
                  className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <RotateCcw size={13} className="micro-icon" />
                </button>
              </div>
            </div>

            {/* Canvas Surface */}
            <div className="flex-1 flex items-center justify-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 p-1">
              <canvas
                ref={canvasRef}
                width={620}
                height={260}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="bg-white rounded shadow-md cursor-crosshair max-w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="text-[11px] text-[var(--color-text-muted)]">
            Inserta la imagen como token semántico (img) en el documento Markdown XL.
          </div>

          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-accent)] text-white hover:brightness-110 cursor-pointer shadow-xs"
            >
              <Check size={13} className="micro-icon" />
              <span>Insertar Imagen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
