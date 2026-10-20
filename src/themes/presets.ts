/**
 * Odisea Predefined Visual Themes
 * Conforms to Ulysses macOS fidelity, Windows 11 Fluent Design, and Micro-UI standards.
 */

export type VisualThemeId =
  | 'minimalist'
  | 'carbon_dark'
  | 'oled_black'
  | 'solarized_light'
  | 'solarized_dark'
  | 'sepia'
  | 'win11_mica'
  | 'nordic_frost'
  | 'monokai'
  | 'barely_there';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  border: string;
  selection: string;
  currentLine: string;
  isDark: boolean;
  acrylic?: boolean;
}

export interface VisualThemeDef {
  id: VisualThemeId;
  name: string;
  description: string;
  category: 'Clásico' | 'Oscuro' | 'Editorial' | 'Moderno';
  colors: ThemeColors;
}

export const VISUAL_THEMES: Record<VisualThemeId, VisualThemeDef> = {
  // Modo 1: Minimalista (Por Defecto) - Ulysses macOS original
  minimalist: {
    id: 'minimalist',
    name: 'Minimalista (Ulysses)',
    description: 'Fiel a Ulysses macOS; lienzo blanco cálido y paneles sutiles.',
    category: 'Clásico',
    colors: {
      bgPrimary: '#fafafa',
      bgSecondary: '#f4f4f6',
      bgTertiary: '#ebebef',
      textPrimary: '#27272b',
      textSecondary: '#6e6e73',
      textMuted: '#8e8e93',
      accent: '#007aff',
      border: '#e5e5ea',
      selection: '#b4d8fd',
      currentLine: '#f2f2f7',
      isDark: false,
    },
  },

  // Modo 2A: Modo Oscuro (Carbon)
  carbon_dark: {
    id: 'carbon_dark',
    name: 'Modo Oscuro (Carbon)',
    description: 'Gris carbón profundo con alto contraste para escritura nocturna.',
    category: 'Oscuro',
    colors: {
      bgPrimary: '#18181b',
      bgSecondary: '#121214',
      bgTertiary: '#222226',
      textPrimary: '#e4e4e7',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      accent: '#0a84ff',
      border: '#27272a',
      selection: '#264f78',
      currentLine: '#202024',
      isDark: true,
    },
  },

  // Modo 2B: OLED Pure Black
  oled_black: {
    id: 'oled_black',
    name: 'OLED Negro Puro',
    description: 'Negro absoluto (#000000) ideal para pantallas OLED y máximo ahorro.',
    category: 'Oscuro',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#09090b',
      bgTertiary: '#121215',
      textPrimary: '#f4f4f5',
      textSecondary: '#a1a1aa',
      textMuted: '#52525b',
      accent: '#0a84ff',
      border: '#18181b',
      selection: '#1e3a5f',
      currentLine: '#0c0c0e',
      isDark: true,
    },
  },

  // Modo 3A: Solarized Light (Ethan Schoonover)
  solarized_light: {
    id: 'solarized_light',
    name: 'Solarized Claro',
    description: 'Paleta canónica de Ethan Schoonover optimizada para legibilidad científica.',
    category: 'Editorial',
    colors: {
      bgPrimary: '#fdf6e3',
      bgSecondary: '#eee8d5',
      bgTertiary: '#e0d9c5',
      textPrimary: '#657b83',
      textSecondary: '#586e75',
      textMuted: '#93a1a1',
      accent: '#268bd2',
      border: '#dcd5be',
      selection: '#d6d1b8',
      currentLine: '#f7f0dc',
      isDark: false,
    },
  },

  // Modo 3B: Solarized Dark (Ethan Schoonover)
  solarized_dark: {
    id: 'solarized_dark',
    name: 'Solarized Oscuro',
    description: 'Fondo azul petróleo oscuro con relaciones de luminancia calibradas.',
    category: 'Editorial',
    colors: {
      bgPrimary: '#002b36',
      bgSecondary: '#073642',
      bgTertiary: '#0f4351',
      textPrimary: '#839496',
      textSecondary: '#93a1a1',
      textMuted: '#586e75',
      accent: '#268bd2',
      border: '#0d404e',
      selection: '#1a5363',
      currentLine: '#05313d',
      isDark: true,
    },
  },

  // Modo 4: Modo Sepia (Pergamino Editorial)
  sepia: {
    id: 'sepia',
    name: 'Sepia Pergamino Editorial',
    description: 'Tinta sepia sobre pergamino clásico con acentos terracota y salvia.',
    category: 'Editorial',
    colors: {
      bgPrimary: '#f4ecd8',
      bgSecondary: '#eae0c8',
      bgTertiary: '#dcd0b6',
      textPrimary: '#433422',
      textSecondary: '#6e5842',
      textMuted: '#9e8972',
      accent: '#a0522d', // Terracotta
      border: '#d5c7a9',
      selection: '#ded2b7',
      currentLine: '#efe6d0',
      isDark: false,
    },
  },

  // Modo 5A: Windows 11 Liquid Glass / Mica
  win11_mica: {
    id: 'win11_mica',
    name: 'Windows 11 Liquid Mica',
    description: 'Efecto acrílico translúcido y micro-bordes luminosos Fluent Design.',
    category: 'Moderno',
    colors: {
      bgPrimary: '#1a1a24e6',
      bgSecondary: '#12121ce6',
      bgTertiary: '#242436e6',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      textMuted: '#888899',
      accent: '#0078d4',
      border: 'rgba(255, 255, 255, 0.12)',
      selection: 'rgba(0, 120, 212, 0.4)',
      currentLine: 'rgba(255, 255, 255, 0.05)',
      isDark: true,
      acrylic: true,
    },
  },

  // Modo 5B: Nordic Frost
  nordic_frost: {
    id: 'nordic_frost',
    name: 'Nordic Frost',
    description: 'Paleta ártica Nord con acentos cian y azul glacial.',
    category: 'Moderno',
    colors: {
      bgPrimary: '#2e3440',
      bgSecondary: '#3b4252',
      bgTertiary: '#434c5e',
      textPrimary: '#eceff4',
      textSecondary: '#d8dee9',
      textMuted: '#81a1c1',
      accent: '#88c0d0', // Frost Cyan
      border: '#4c566a',
      selection: '#434c5e',
      currentLine: '#353c4a',
      isDark: true,
    },
  },

  // Modo 5C: Monokai Editorial
  monokai: {
    id: 'monokai',
    name: 'Monokai Editorial',
    description: 'Contraste cálido sobre carbón con amarillo, magenta y cian vibrantes.',
    category: 'Moderno',
    colors: {
      bgPrimary: '#2d2a2e',
      bgSecondary: '#221f22',
      bgTertiary: '#3a373b',
      textPrimary: '#fcfcfa',
      textSecondary: '#c1c0c0',
      textMuted: '#727072',
      accent: '#ffd866', // Monokai Yellow
      border: '#403e41',
      selection: '#49454b',
      currentLine: '#343135',
      isDark: true,
    },
  },

  // Preset Especial: Barely There / Sin Etiquetas
  barely_there: {
    id: 'barely_there',
    name: 'Barely There (Sin Etiquetas)',
    description: 'Sintaxis casi invisible (opacidad 5%) para máxima inmersión en la prosa.',
    category: 'Clásico',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f7f7f8',
      bgTertiary: '#f0f0f2',
      textPrimary: '#1a1a1a',
      textSecondary: '#666666',
      textMuted: '#999999',
      accent: '#007aff',
      border: '#eaeaea',
      selection: '#cce5ff',
      currentLine: '#fafafa',
      isDark: false,
    },
  },
};

export const ACCENT_COLORS_11 = [
  { id: 'blue', label: 'Azul', hex: '#007aff' },
  { id: 'red', label: 'Rojo', hex: '#ff3b30' },
  { id: 'orange', label: 'Naranja', hex: '#ff9500' },
  { id: 'yellow', label: 'Amarillo', hex: '#ffcc00' },
  { id: 'green', label: 'Verde', hex: '#34c759' },
  { id: 'teal', label: 'Verde azulado', hex: '#30b0c7' },
  { id: 'indigo', label: 'Índigo', hex: '#5856d6' },
  { id: 'purple', label: 'Púrpura', hex: '#af52de' },
  { id: 'pink', label: 'Rosa', hex: '#ff2d55' },
  { id: 'brown', label: 'Marrón', hex: '#a2845e' },
  { id: 'gray', label: 'Gris', hex: '#8e8e93' },
];

export const HEADING_SCALES = [
  { id: 'default', label: 'Por defecto (1.0x - 1.7x)', h1: 1.7, h2: 1.4, h3: 1.2, h4: 1.1, h5: 1.0, h6: 0.9 },
  { id: 's', label: 'Compacta S (1.0x - 1.3x)', h1: 1.3, h2: 1.2, h3: 1.1, h4: 1.05, h5: 1.0, h6: 0.95 },
  { id: 'm', label: 'Media M (1.0x - 1.5x)', h1: 1.5, h2: 1.3, h3: 1.18, h4: 1.1, h5: 1.0, h6: 0.9 },
  { id: 'l', label: 'Grande L (1.1x - 1.9x)', h1: 1.9, h2: 1.55, h3: 1.3, h4: 1.15, h5: 1.05, h6: 0.95 },
  { id: 'xl', label: 'Extra Grande XL (1.2x - 2.2x)', h1: 2.2, h2: 1.75, h3: 1.45, h4: 1.25, h5: 1.1, h6: 1.0 },
  { id: '2xl', label: 'Titular 2XL (1.3x - 2.6x)', h1: 2.6, h2: 2.0, h3: 1.6, h4: 1.35, h5: 1.15, h6: 1.0 },
  { id: '3xl', label: 'Póster 3XL (1.4x - 3.0x)', h1: 3.0, h2: 2.3, h3: 1.8, h4: 1.45, h5: 1.2, h6: 1.05 },
  { id: '4xl', label: 'Editorial 4XL (1.5x - 3.5x)', h1: 3.5, h2: 2.6, h3: 2.0, h4: 1.6, h5: 1.3, h6: 1.1 },
];

export const WINDOWS_11_FONTS = [
  { id: 'system', name: 'Sistema (Segoe UI Variable)', font: 'system-ui, "Segoe UI Variable Text", sans-serif' },
  { id: 'inter', name: 'Inter', font: '"Inter", sans-serif' },
  { id: 'cascadia', name: 'Cascadia Code', font: '"Cascadia Code", "Cascadia Mono", monospace' },
  { id: 'georgia', name: 'Georgia (Serif Clásica)', font: 'Georgia, "Times New Roman", serif' },
  { id: 'cambria', name: 'Cambria', font: 'Cambria, serif' },
  { id: 'merriweather', name: 'Merriweather', font: '"Merriweather", Georgia, serif' },
  { id: 'consolas', name: 'Consolas', font: 'Consolas, "Courier New", monospace' },
  { id: 'aptos', name: 'Aptos (Office 365)', font: '"Aptos", sans-serif' },
  { id: 'charter', name: 'Charter', font: '"Charter", Georgia, serif' },
];
