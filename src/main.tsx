import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'katex/dist/katex.min.css';
import { ThemeEngine } from './themes/theme_engine';
import { VisualThemeId, VISUAL_THEMES } from './themes/presets';

// Synchronously apply saved theme and typography before React mount to prevent flash of wrong colors
try {
  const savedTheme = localStorage.getItem('odisea_active_theme') as VisualThemeId;
  if (savedTheme && VISUAL_THEMES[savedTheme]) {
    ThemeEngine.applyPreset(savedTheme);
  }
  const savedTypo = localStorage.getItem('odisea_typography');
  if (savedTypo) {
    const parsed = JSON.parse(savedTypo);
    ThemeEngine.applyTypography(parsed.font, parsed.lineHeight, parsed.maxWidth, parsed.headingScaleId);
    if (parsed.accentHex) {
      document.documentElement.style.setProperty('--color-accent', parsed.accentHex);
    }
    if (parsed.barelyThere) {
      document.documentElement.classList.add('theme-barely-there');
    }
  }
  const savedStyles = localStorage.getItem('odisea_tag_styles');
  if (savedStyles) {
    ThemeEngine.injectTagStyles(JSON.parse(savedStyles));
  }
} catch (e) {
  console.warn('Could not restore theme synchronously on startup:', e);
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
