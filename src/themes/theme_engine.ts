/**
 * Odisea Dynamic Theme Engine
 * Controls hot-swappable themes, Windows 11 Mica glassmorphism,
 * custom typography, heading scales, and Ulysses 28-tag styling matrices.
 */

import { VisualThemeId, VISUAL_THEMES, HEADING_SCALES, WINDOWS_11_FONTS } from './presets';
import { UlthemePackage, UlthemeMode } from './ultheme_loader';

export class ThemeEngine {
  private static styleElement: HTMLStyleElement | null = null;

  /**
   * Applies one of the predefined visual themes in hot mode without reloading
   */
  public static applyPreset(presetId: VisualThemeId): void {
    const preset = VISUAL_THEMES[presetId] || VISUAL_THEMES.minimalist;
    const root = document.documentElement;
    const colors = preset.colors;

    // 1. Dark/Light class toggle
    if (colors.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Barely There preset class
    if (presetId === 'barely_there') {
      root.classList.add('theme-barely-there');
    } else {
      root.classList.remove('theme-barely-there');
    }

    // 3. Mica Acrylic Glassmorphism class
    if (colors.acrylic) {
      root.classList.add('theme-mica-glass');
    } else {
      root.classList.remove('theme-mica-glass');
    }

    // 4. Update CSS root variables
    root.style.setProperty('--color-bg-primary', colors.bgPrimary);
    root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--color-bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-selection', colors.selection);
    root.style.setProperty('--color-current-line', colors.currentLine);
  }

  /**
   * Applies typography, line spacing, text column max-width and heading scales
   */
  public static applyTypography(
    fontFamily: string,
    lineHeight: number = 1.75,
    maxWidth: string = '680px',
    headingScaleId: string = 'default'
  ): void {
    const root = document.documentElement;
    const scale = HEADING_SCALES.find((s) => s.id === headingScaleId) || HEADING_SCALES[0];

    root.style.setProperty('--editor-font', fontFamily);
    root.style.setProperty('--editor-line-height', String(lineHeight));
    root.style.setProperty('--editor-max-width', maxWidth);

    // Apply heading scale variables
    root.style.setProperty('--scale-h1', `${scale.h1}rem`);
    root.style.setProperty('--scale-h2', `${scale.h2}rem`);
    root.style.setProperty('--scale-h3', `${scale.h3}rem`);
    root.style.setProperty('--scale-h4', `${scale.h4}rem`);
    root.style.setProperty('--scale-h5', `${scale.h5}rem`);
    root.style.setProperty('--scale-h6', `${scale.h6}rem`);
  }

  /**
   * Applies an imported or custom Ultheme package with its 28-tag matrix
   */
  public static applyUltheme(theme: UlthemePackage, mode: 'light' | 'dark' = 'dark'): void {
    const root = document.documentElement;
    const activeConfig: UlthemeMode = mode === 'dark' ? theme.dark : theme.light;

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply base editor colors
    root.style.setProperty('--color-bg-primary', activeConfig.editor['background-color']);
    root.style.setProperty('--color-text-primary', activeConfig.editor['font-color']);
    root.style.setProperty('--color-accent', activeConfig.editor['insertion-point-color']);
    root.style.setProperty('--color-selection', activeConfig.editor['selection-color']);
    root.style.setProperty('--color-current-line', activeConfig.editor['current-line-color']);

    // Apply palette accents if present
    if (theme.palette?.accents) {
      for (const [key, color] of Object.entries(theme.palette.accents)) {
        root.style.setProperty(`--odisea-${key}`, color);
      }
    }

    // Inject dynamic stylesheet for the 28 tag styles
    this.injectTagStyles(activeConfig.markup);
  }

  /**
   * Injects or updates dynamic CSS rules for tag styling matrix
   */
  public static injectTagStyles(markup: UlthemeMode['markup']): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'odisea-ultheme-styles';
      document.head.appendChild(this.styleElement);
    }

    let css = '';
    for (const [tagKey, style] of Object.entries(markup)) {
      const selector = `.cm-${tagKey}, .cm-ulysses-${tagKey}`;
      const rules: string[] = [];

      if (style['font-color']) rules.push(`color: ${style['font-color']} !important;`);
      if (style['background-color']) rules.push(`background-color: ${style['background-color']} !important;`);
      if (style['font-weight']) rules.push(`font-weight: ${style['font-weight']} !important;`);
      if (style['font-style']) rules.push(`font-style: ${style['font-style']} !important;`);
      if (style['border-color']) rules.push(`border-color: ${style['border-color']} !important;`);
      if (style['font-size-scale']) rules.push(`font-size: ${style['font-size-scale']}em !important;`);

      if (rules.length > 0) {
        css += `${selector} { ${rules.join(' ')} }\n`;
      }

      // Syntax delimiter tag color
      if (style['markup-color']) {
        css += `.cm-${tagKey} .cm-ulysses-tag, .cm-ulysses-tag-${tagKey} { color: ${style['markup-color']} !important; }\n`;
      }
    }

    this.styleElement.textContent = css;
  }
}
