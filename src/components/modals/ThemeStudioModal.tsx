import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  X,
  Sparkles,
  Upload,
  Download,
  Type,
  Maximize2,
  Sliders,
  Eye,
  FileCode,
  FolderOpen,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  VISUAL_THEMES,
  VisualThemeId,
  ACCENT_COLORS_11,
  HEADING_SCALES,
  WINDOWS_11_FONTS,
  VisualThemeDef,
} from '../../themes/presets';
import { ThemeEngine } from '../../themes/theme_engine';
import {
  UlthemePackage,
  parseUltheme,
  serializeUltheme,
  applyUltheme,
  UlthemeTagStyle,
} from '../../themes/ultheme_loader';
import { useOdiseaStore } from '../../store/useOdiseaStore';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StudioTab = 'gallery' | 'typography' | 'matrix' | 'export_import';

const TAG_KEYS_28 = [
  { id: 'heading-1', label: 'Encabezado 1 (#)' },
  { id: 'heading-2', label: 'Encabezado 2 (##)' },
  { id: 'heading-3', label: 'Encabezado 3 (###)' },
  { id: 'heading-4', label: 'Encabezado 4 (####)' },
  { id: 'heading-5', label: 'Encabezado 5 (#####)' },
  { id: 'heading-6', label: 'Encabezado 6 (######)' },
  { id: 'paragraph', label: 'Párrafo estándar' },
  { id: 'inline-strong', label: 'Negrita (**)' },
  { id: 'inline-emphasis', label: 'Cursiva (_)' },
  { id: 'inline-mark', label: 'Resaltado (::)' },
  { id: 'inline-delete', label: 'Tachado/Redactar (||)' },
  { id: 'inline-comment', label: 'Comentario en línea (++)' },
  { id: 'inline-annotation', label: 'Anotación ({})' },
  { id: 'inline-code', label: 'Código en línea (`)' },
  { id: 'inline-raw', label: 'Raw en línea (~)' },
  { id: 'inline-link', label: 'Enlace web ([])' },
  { id: 'inline-footnote', label: 'Nota al pie (fn)' },
  { id: 'block-quote', label: 'Cita en bloque (>)' },
  { id: 'block-verse', label: 'Bloque de verso (|")' },
  { id: 'block-code', label: 'Bloque de código (\'\')' },
  { id: 'block-raw', label: 'Bloque raw (~~)' },
  { id: 'block-comment', label: 'Bloque de comentario (%%)' },
  { id: 'list-unordered', label: 'Lista viñetas (-)' },
  { id: 'list-ordered', label: 'Lista numerada (1.)' },
  { id: 'list-task', label: 'Lista tareas ([ ])' },
  { id: 'table', label: 'Tabla Markdown XL' },
  { id: 'divider', label: 'Separador horizontal (----)' },
  { id: 'table-of-contents', label: 'Tabla de Contenidos (toc)' },
];

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({ isOpen, onClose }) => {
  const { themeMode, activeThemeId, setActiveTheme } = useOdiseaStore();

  const [activeTab, setActiveTab] = useState<StudioTab>('gallery');
  const [selectedPresetId, setSelectedPresetId] = useState<VisualThemeId>(activeThemeId || 'carbon_dark');

  // Typography & Layout settings
  const [selectedFont, setSelectedFont] = useState('system-ui, "Segoe UI Variable Text", sans-serif');
  const [lineHeight, setLineHeight] = useState<number>(1.75);
  const [maxWidth, setMaxWidth] = useState<string>('680px');
  const [headingScaleId, setHeadingScaleId] = useState<string>('default');
  const [selectedAccentHex, setSelectedAccentHex] = useState<string>('#007aff');
  const [barelyThereActive, setBarelyThereActive] = useState<boolean>(false);

  // 28-tag styling matrix state
  const [selectedTagId, setSelectedTagId] = useState<string>('heading-1');
  const [tagStyles, setTagStyles] = useState<Record<string, UlthemeTagStyle>>({
    'heading-1': { 'markup-color': '#007aff', 'font-color': '#1d1d1f', 'font-weight': 'bold', 'font-size-scale': 1.45 },
    'inline-strong': { 'markup-color': '#8e8e93', 'font-weight': 'bold' },
    'inline-emphasis': { 'markup-color': '#8e8e93', 'font-style': 'italic' },
    'inline-mark': { 'markup-color': '#ff9500', 'background-color': '#ffea79' },
    'inline-delete': { 'markup-color': '#ff3b30', 'strikethrough-color': '#ff3b30' },
    'inline-code': { 'markup-color': '#8e8e93', 'font-color': '#ff2d55', 'background-color': '#f2f2f7' },
    'inline-annotation': { 'markup-color': '#5856d6', 'font-color': '#5856d6' },
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Sync state with active theme and saved typography
  useEffect(() => {
    if (activeThemeId) {
      setSelectedPresetId(activeThemeId);
      setBarelyThereActive(activeThemeId === 'barely_there');
    }
  }, [activeThemeId, isOpen]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const savedTypo = localStorage.getItem('odisea_typography');
    if (savedTypo) {
      try {
        const parsed = JSON.parse(savedTypo);
        if (parsed.font) setSelectedFont(parsed.font);
        if (parsed.lineHeight) setLineHeight(parsed.lineHeight);
        if (parsed.maxWidth) setMaxWidth(parsed.maxWidth);
        if (parsed.headingScaleId) setHeadingScaleId(parsed.headingScaleId);
        if (parsed.accentHex) setSelectedAccentHex(parsed.accentHex);
        if (parsed.barelyThere !== undefined) setBarelyThereActive(parsed.barelyThere);
      } catch {}
    }
    const savedStyles = localStorage.getItem('odisea_tag_styles');
    if (savedStyles) {
      try {
        setTagStyles(JSON.parse(savedStyles));
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const persistTypography = (
    font: string,
    lh: number,
    mw: string,
    hs: string,
    accent: string,
    barelyThere: boolean
  ) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'odisea_typography',
        JSON.stringify({
          font,
          lineHeight: lh,
          maxWidth: mw,
          headingScaleId: hs,
          accentHex: accent,
          barelyThere,
        })
      );
    }
  };

  // 1. Hot apply and persist preset
  const handleSelectPreset = (presetId: VisualThemeId) => {
    setSelectedPresetId(presetId);
    setBarelyThereActive(presetId === 'barely_there');
    setActiveTheme(presetId);
    showNotice(`Tema "${VISUAL_THEMES[presetId].name}" aplicado y guardado.`);
  };

  // 2. Hot apply and persist typography & scale
  const handleUpdateTypography = (
    font: string = selectedFont,
    lh: number = lineHeight,
    mw: string = maxWidth,
    hs: string = headingScaleId
  ) => {
    setSelectedFont(font);
    setLineHeight(lh);
    setMaxWidth(mw);
    setHeadingScaleId(hs);
    ThemeEngine.applyTypography(font, lh, mw, hs);
    persistTypography(font, lh, mw, hs, selectedAccentHex, barelyThereActive);
  };

  // 3. Hot apply and persist accent color
  const handleSelectAccent = (hex: string) => {
    setSelectedAccentHex(hex);
    document.documentElement.style.setProperty('--color-accent', hex);
    persistTypography(selectedFont, lineHeight, maxWidth, headingScaleId, hex, barelyThereActive);
    showNotice(`Color de acento actualizado a ${hex}`);
  };

  // 4. Toggle and persist Barely There
  const handleToggleBarelyThere = (active: boolean) => {
    setBarelyThereActive(active);
    if (active) {
      document.documentElement.classList.add('theme-barely-there');
      showNotice('Modo "Barely There" activado: delimitadores de sintaxis atenuados al 4%.');
    } else {
      document.documentElement.classList.remove('theme-barely-there');
      showNotice('Modo "Barely There" desactivado.');
    }
    persistTypography(selectedFont, lineHeight, maxWidth, headingScaleId, selectedAccentHex, active);
  };

  // 5. Update tag style in matrix and persist
  const handleUpdateTagStyle = (field: keyof UlthemeTagStyle, value: any) => {
    const updated = {
      ...tagStyles,
      [selectedTagId]: {
        ...tagStyles[selectedTagId],
        [field]: value,
      },
    };
    setTagStyles(updated);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('odisea_tag_styles', JSON.stringify(updated));
    }

    // Apply live via theme engine
    ThemeEngine.applyUltheme(
      {
        themeVersion: 1,
        name: 'Custom Studio Theme',
        author: 'Odisea User',
        palette: { accents: { 'accent-blue': selectedAccentHex } },
        light: {
          editor: {
            'background-color': getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim(),
            'font-color': getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
            'insertion-point-color': selectedAccentHex,
            'selection-color': '#b4d8fd',
            'current-line-color': '#f8f9fa',
          },
          markup: updated,
        },
        dark: {
          editor: {
            'background-color': getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim(),
            'font-color': getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
            'insertion-point-color': selectedAccentHex,
            'selection-color': '#264f78',
            'current-line-color': '#202024',
          },
          markup: updated,
        },
      },
      themeMode
    );
  };

  // 6. Import .ultheme JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseUltheme(text);
        applyUltheme(parsed, themeMode);
        if (parsed.light.markup) {
          setTagStyles(parsed.light.markup);
        }
        showNotice(`Tema "${parsed.name}" importado y aplicado correctamente.`);
      } catch (err) {
        showNotice('Error al importar el archivo .ultheme.');
      }
    };
    reader.readAsText(file);
  };

  // 7. Export .ultheme JSON
  const handleExportFile = () => {
    const themePkg: UlthemePackage = {
      themeVersion: 1,
      name: `Odisea Custom ${new Date().toLocaleDateString()}`,
      author: 'Odisea Author',
      palette: {
        accents: {
          'accent-blue': selectedAccentHex,
        },
      },
      light: {
        editor: {
          'background-color': '#ffffff',
          'font-color': '#1d1d1f',
          'insertion-point-color': selectedAccentHex,
          'selection-color': '#b4d8fd',
          'current-line-color': '#f8f9fa',
        },
        markup: tagStyles,
      },
      dark: {
        editor: {
          'background-color': '#18181b',
          'font-color': '#e4e4e7',
          'insertion-point-color': selectedAccentHex,
          'selection-color': '#264f78',
          'current-line-color': '#202024',
        },
        markup: tagStyles,
      },
    };

    const json = serializeUltheme(themePkg);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odisea_custom_theme.ultheme';
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Archivo "odisea_custom_theme.ultheme" exportado.');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentTagStyle = tagStyles[selectedTagId] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-[840px] max-w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Theme Studio & Diseñador Visual Micro-UI (.ultheme)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
          >
            <X size={14} className="micro-icon" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-2.5 flex gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
          {[
            { id: 'gallery', label: 'Modos Predefinidos', icon: Eye },
            { id: 'typography', label: 'Tipografía y Escalas', icon: Type },
            { id: 'matrix', label: 'Matriz 28 Etiquetas', icon: Sliders },
            { id: 'export_import', label: 'Importar / Exportar .ultheme', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon size={13} className="micro-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="bg-[var(--color-accent)]/15 border-b border-[var(--color-accent)]/30 px-4 py-1.5 text-xs text-[var(--color-accent)] flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <Sparkles size={12} className="micro-icon" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: PREDEFINED THEMES GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              <div className="text-[11px] text-[var(--color-text-muted)]">
                Selecciona uno de los modos de visualización canónicos. Todos se aplican en caliente sin recargar:
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(VISUAL_THEMES).map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const c = preset.colors;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] bg-[var(--color-bg-primary)] shadow-sm'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-text-muted)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                          {preset.name}
                        </span>
                        {isSelected && <Check size={12} className="text-[var(--color-accent)] micro-icon shrink-0" />}
                      </div>

                      <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 mb-2.5 h-7">
                        {preset.description}
                      </p>

                      {/* Color swatches */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.bgPrimary }}
                          title="Fondo"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.bgSecondary }}
                          title="Paneles"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.textPrimary }}
                          title="Texto"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: c.accent }}
                          title="Acento"
                        />
                        {preset.category && (
                          <span className="micro-badge bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] text-[9px] ml-auto">
                            {preset.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY, ACCENTS & SCALES */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              {/* 11 Apple/Ulysses Accent Colors */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1.5">
                  11 Colores de Acento Ulysses
                </label>
                <div className="flex items-center gap-2">
                  {ACCENT_COLORS_11.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccent(acc.hex)}
                      title={`${acc.label} (${acc.hex})`}
                      style={{ backgroundColor: acc.hex }}
                      className={`w-6 h-6 rounded-full border border-black/20 shadow-xs transition-transform cursor-pointer ${
                        selectedAccentHex === acc.hex ? 'scale-125 ring-2 ring-[var(--color-text-primary)]' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Windows 11 Fonts */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1.5">
                  Tipografía del Editor (Fuentes Instaladas en Windows 11)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {WINDOWS_11_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => handleUpdateTypography(font.font)}
                      style={{ fontFamily: font.font }}
                      className={`px-3 py-1.5 rounded-md border text-xs text-left transition-colors cursor-pointer ${
                        selectedFont === font.font
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heading Scale */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1.5">
                  Escala de Encabezados (H1 a H6)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {HEADING_SCALES.map((scale) => (
                    <button
                      key={scale.id}
                      type="button"
                      onClick={() => handleUpdateTypography(undefined, undefined, undefined, scale.id)}
                      className={`px-2.5 py-1.5 rounded-md border text-xs text-left transition-colors cursor-pointer ${
                        headingScaleId === scale.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      <div className="font-medium text-xs">{scale.label.split(' ')[0]}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">{scale.label.split('(')[1]?.replace(')', '') || ''}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Line Height & Column Width */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                    <span>Interlineado: {lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.4"
                    max="2.3"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => handleUpdateTypography(undefined, parseFloat(e.target.value))}
                    className="w-full accent-[var(--color-accent)] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                    <span>Ancho de Columna de Lectura: {maxWidth}</span>
                  </div>
                  <div className="flex gap-1">
                    {['600px', '680px', '760px', '840px', '100%'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleUpdateTypography(undefined, undefined, w)}
                        className={`flex-1 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                          maxWidth === w
                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-medium'
                            : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barely There Preset Switch */}
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Preset "Barely There" / Sin Etiquetas
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    Atenúa al 4% los caracteres de sintaxis (#, **, _, ::, ||, {}) hasta que el cursor se posa sobre la palabra.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={barelyThereActive}
                  onChange={(e) => handleToggleBarelyThere(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 28-TAG STYLING MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-3">
              <div className="text-[11px] text-[var(--color-text-muted)]">
                Configura individualmente la apariencia semántica y el delimitador de cada una de las 28 etiquetas de Markdown XL:
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Tag list */}
                <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-primary)] p-1 max-h-72 overflow-y-auto space-y-0.5 no-scrollbar">
                  {TAG_KEYS_28.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTagId(t.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        selectedTagId === t.id
                          ? 'bg-[var(--color-accent)] text-white font-medium'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tag styling controls */}
                <div className="col-span-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-primary)] p-3.5 space-y-3">
                  <div className="text-xs font-semibold text-[var(--color-text-primary)] pb-2 border-b border-[var(--color-border)]">
                    Propiedades de: <span className="text-[var(--color-accent)]">{TAG_KEYS_28.find((t) => t.id === selectedTagId)?.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Delimiter Tag Color */}
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                        Color Delimitador (Markup Tag)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentTagStyle['markup-color'] || '#007aff'}
                          onChange={(e) => handleUpdateTagStyle('markup-color', e.target.value)}
                          className="w-7 h-7 rounded border border-[var(--color-border)] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentTagStyle['markup-color'] || '#007aff'}
                          onChange={(e) => handleUpdateTagStyle('markup-color', e.target.value)}
                          className="w-full text-xs font-mono bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>

                    {/* Content Text Color */}
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                        Color de Texto Semántico
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentTagStyle['font-color'] || '#1d1d1f'}
                          onChange={(e) => handleUpdateTagStyle('font-color', e.target.value)}
                          className="w-7 h-7 rounded border border-[var(--color-border)] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentTagStyle['font-color'] || '#1d1d1f'}
                          onChange={(e) => handleUpdateTagStyle('font-color', e.target.value)}
                          className="w-full text-xs font-mono bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>

                    {/* Background / Highlight Color */}
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                        Fondo / Resaltado (Opcional)
                      </label>
                      <input
                        type="text"
                        value={currentTagStyle['background-color'] || ''}
                        onChange={(e) => handleUpdateTagStyle('background-color', e.target.value)}
                        placeholder="e.g. #ffea79 o rgba(...)"
                        className="w-full text-xs font-mono bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-primary)]"
                      />
                    </div>

                    {/* Font Weight & Style */}
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">
                        Peso y Estilo
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTagStyle('font-weight', currentTagStyle['font-weight'] === 'bold' ? 'normal' : 'bold')
                          }
                          className={`flex-1 py-1 text-xs font-bold rounded border transition-colors cursor-pointer ${
                            currentTagStyle['font-weight'] === 'bold'
                              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          Negrita
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTagStyle('font-style', currentTagStyle['font-style'] === 'italic' ? 'normal' : 'italic')
                          }
                          className={`flex-1 py-1 text-xs italic rounded border transition-colors cursor-pointer ${
                            currentTagStyle['font-style'] === 'italic'
                              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          Cursiva
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMPORT / EXPORT .ULTHEME */}
          {activeTab === 'export_import' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] space-y-3">
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-[var(--color-accent)] micro-icon" />
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Importar Tema Ulysses (.ultheme)
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Puedes importar cualquier archivo .ultheme descargado desde la galería oficial de Ulysses (styles.ulysses.app) o creado previamente.
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-accent)] text-white hover:brightness-110 cursor-pointer shadow-xs">
                  <FolderOpen size={13} className="micro-icon" />
                  <span>Seleccionar archivo .ultheme</span>
                  <input type="file" accept=".ultheme,.json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] space-y-3">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-emerald-500 micro-icon" />
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Exportar Tema Actual (.ultheme)
                  </h4>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Exporta tu configuración personalizada completa (paleta, acentos, tipografía y matriz de 28 etiquetas) a un archivo .ultheme canónico y compatible con Ulysses macOS.
                </p>
                <button
                  type="button"
                  onClick={handleExportFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-xs"
                >
                  <Save size={13} className="micro-icon" />
                  <span>Descargar como .ultheme</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
                Directorio portable de temas de Odisea: <code className="font-mono text-[var(--color-accent)]">./odisea_data/themes/</code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="text-[11px] text-[var(--color-text-muted)]">
            Los cambios se guardan y aplican instantáneamente en tiempo real.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-accent)] text-white hover:brightness-110 cursor-pointer shadow-xs"
          >
            <Check size={13} className="micro-icon" />
            <span>Cerrar Theme Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
