import { ThemeEngine } from './theme_engine';

export interface UlthemeTagStyle {
  'font-color'?: string;
  'font-weight'?: string;
  'font-style'?: string;
  'font-size-scale'?: number;
  'markup-color'?: string;
  'background-color'?: string;
  'border-color'?: string;
  'underline-color'?: string;
  'strikethrough-color'?: string;
}

export interface UlthemeMode {
  editor: {
    'background-color': string;
    'font-color': string;
    'insertion-point-color': string;
    'selection-color': string;
    'current-line-color': string;
  };
  markup: Record<string, UlthemeTagStyle>;
}

export interface UlthemePackage {
  themeVersion: number;
  name: string;
  author: string;
  palette?: {
    accents?: Record<string, string>;
  };
  light: UlthemeMode;
  dark: UlthemeMode;
}

/**
 * Parses a JSON string into an UlthemePackage structure
 */
export function parseUltheme(jsonOrText: string): UlthemePackage {
  try {
    const parsed = JSON.parse(jsonOrText);
    if (parsed.light && parsed.dark) {
      return parsed as UlthemePackage;
    }
    // Convert single mode or partial theme to dual mode
    return {
      themeVersion: parsed.themeVersion || 1,
      name: parsed.name || 'Tema Importado',
      author: parsed.author || 'Usuario',
      palette: parsed.palette || {},
      light: parsed.light || {
        editor: {
          'background-color': '#ffffff',
          'font-color': '#1d1d1f',
          'insertion-point-color': '#007aff',
          'selection-color': '#b4d8fd',
          'current-line-color': '#f8f9fa',
        },
        markup: parsed.markup || {},
      },
      dark: parsed.dark || {
        editor: {
          'background-color': '#1c1c1e',
          'font-color': '#f2f2f7',
          'insertion-point-color': '#0a84ff',
          'selection-color': '#264f78',
          'current-line-color': '#2c2c2e',
        },
        markup: parsed.markup || {},
      },
    };
  } catch (e) {
    console.error('Error parsing .ultheme format:', e);
    // Return standard default fallback
    return {
      themeVersion: 1,
      name: 'Tema Personalizado',
      author: 'Usuario',
      light: {
        editor: {
          'background-color': '#ffffff',
          'font-color': '#1d1d1f',
          'insertion-point-color': '#007aff',
          'selection-color': '#b4d8fd',
          'current-line-color': '#f8f9fa',
        },
        markup: {},
      },
      dark: {
        editor: {
          'background-color': '#1c1c1e',
          'font-color': '#f2f2f7',
          'insertion-point-color': '#0a84ff',
          'selection-color': '#264f78',
          'current-line-color': '#2c2c2e',
        },
        markup: {},
      },
    };
  }
}

/**
 * Serializes an UlthemePackage to formatted JSON (.ultheme)
 */
export function serializeUltheme(theme: UlthemePackage): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Applies an UlthemePackage dynamically
 */
export function applyUltheme(theme: UlthemePackage, mode: 'light' | 'dark' = 'dark') {
  ThemeEngine.applyUltheme(theme, mode);
}
