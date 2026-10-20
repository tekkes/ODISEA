import { create } from 'zustand';
import { invokeCommand } from './tauri_ipc';
import { ThemeEngine } from '../themes/theme_engine';
import { VisualThemeId, VISUAL_THEMES } from '../themes/presets';

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_archived: boolean;
  export_style_id: string | null;
  export_format: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  project_id: string | null;
  parent_group_id: string | null;
  section_type: string;
  name: string;
  icon: string;
  color: string;
  writing_goal_json: string | null;
  sort_order: number;
}

export interface Sheet {
  id: string;
  group_id: string | null;
  title: string;
  content_mdxl: string;
  markup_dialect: string;
  is_favorite: boolean;
  is_material: boolean;
  glued_with_next: boolean;
  sort_order: number;
  writing_goal_json: string | null;
  publish_status_json: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TextStatistics {
  word_count: number;
  character_count: number;
  character_count_no_spaces: number;
  sentence_count: number;
  paragraph_count: number;
  line_count?: number;
  page_count?: number;
  reading_time_slow_minutes?: number;
  reading_time_medium_minutes?: number;
  reading_time_fast_minutes?: number;
  speaking_time_minutes?: number;
  estimated_reading_time_minutes?: number;
  estimated_speaking_time_minutes?: number;
}

export interface DailyProgress {
  date: string;
  word_count: number;
  words_added: number;
}

export interface WritingGoalData {
  target_words: number;
  goal_mode: 'at_least' | 'at_most' | 'exact';
  deadline_date: string | null;
  daily_quota: number;
  progress_percent: number;
  status_color: 'orange' | 'blue' | 'green' | 'red';
  history: DailyProgress[];
}

export interface WordPressAccount {
  name: string;
  endpoint: string;
  username: string;
  app_password: string;
}

export interface GhostAccount {
  name: string;
  endpoint: string;
  admin_api_key: string;
}

export interface MediumAccount {
  name: string;
  token: string;
}

export interface MicroBlogAccount {
  name: string;
  app_token: string;
}

export interface PublishersConfig {
  wordpress: WordPressAccount[];
  ghost: GhostAccount[];
  medium: MediumAccount[];
  microblog: MicroBlogAccount[];
}

export interface PublishResult {
  platform: string;
  post_id: string;
  url: string;
  status: string;
  published_at: string;
}

export interface SubstackCopyResult {
  html: string;
  markdown: string;
  char_count: number;
  word_count: number;
}

export type FocusedPanel = 'library' | 'sheetlist' | 'editor';

interface OdiseaState {
  projects: Project[];
  groups: Group[];
  sheets: Sheet[];
  activeProjectId: string | null;
  activeGroupId: string | null;
  activeSheetId: string | null;
  activeSheet: Sheet | null;
  activeGlobalFilter: string | null;
  statistics: TextStatistics | null;

  // View state & Focus navigation
  focusedPanel: FocusedPanel;
  showLibrary: boolean;
  showSheetList: boolean;
  showDashboard: boolean;
  isRevisionMode: boolean;
  activeDashboardTab: string;
  typewriterEnabled: boolean;
  typewriterPosition: 'top' | 'center' | 'bottom' | 'band';
  focusMode: 'none' | 'line' | 'sentence' | 'paragraph';
  themeMode: 'dark' | 'light';
  activeThemeId: VisualThemeId;

  // Modals
  activeModal: string | null;

  // Publishing
  publishAccounts: PublishersConfig | null;

  // Actions
  loadInitialData: () => Promise<void>;
  setActiveProject: (id: string | null) => Promise<void>;
  setActiveGroup: (id: string | null) => Promise<void>;
  setActiveSheet: (sheet: Sheet | null) => void;
  setGlobalFilter: (filter: string) => Promise<void>;
  updateSheetContent: (id: string, title: string, content: string) => Promise<void>;
  createNewSheet: (groupId?: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleGlue: (id: string) => Promise<void>;
  deleteSheet: (id: string) => Promise<void>;
  updateWritingGoal: (sheetId: string, goalJson: string | null) => Promise<void>;
  updateSheetCreatedAt: (sheetId: string, newDate: string) => Promise<void>;

  // Keyboard Navigation
  setFocusedPanel: (panel: FocusedPanel) => void;
  drillDown: () => void;
  drillUp: () => void;
  navigateSheets: (direction: 'up' | 'down') => void;

  // Publishing Actions
  loadPublishAccounts: () => Promise<void>;
  savePublishAccounts: (cfg: PublishersConfig) => Promise<void>;
  publishToWordPress: (params: {
    sheetId: string;
    accountIndex: number;
    status: string;
    scheduledDate?: string;
    categories: string[];
    tags: string[];
    featuredImageUrl?: string;
  }) => Promise<PublishResult>;
  publishToGhost: (params: {
    sheetId: string;
    accountIndex: number;
    status: string;
    scheduledDate?: string;
    tags: string[];
    featureImageUrl?: string;
  }) => Promise<PublishResult>;
  publishToMedium: (params: {
    sheetId: string;
    accountIndex: number;
    publishStatus: string;
    tags: string[];
    canonicalUrl?: string;
  }) => Promise<PublishResult>;
  publishToMicroBlog: (params: {
    sheetId: string;
    accountIndex: number;
    categories: string[];
    slug?: string;
  }) => Promise<PublishResult>;
  copyForSubstack: (sheetId: string) => Promise<SubstackCopyResult>;
  updateActiveSheetPublishStatus: (result: PublishResult) => void;

  toggleLibrary: () => void;
  toggleSheetList: () => void;
  toggleDashboard: () => void;
  toggleRevisionMode: () => void;
  setActiveDashboardTab: (tab: string) => void;
  toggleTypewriter: () => void;
  setFocusMode: (mode: 'none' | 'line' | 'sentence' | 'paragraph') => void;
  toggleThemeMode: () => void;
  setActiveTheme: (themeId: VisualThemeId) => Promise<void>;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useOdiseaStore = create<OdiseaState>((set, get) => ({
  projects: [],
  groups: [],
  sheets: [],
  activeProjectId: null,
  activeGroupId: null,
  activeSheetId: null,
  activeSheet: null,
  activeGlobalFilter: 'all',
  statistics: null,

  showLibrary: true,
  showSheetList: true,
  showDashboard: false,
  isRevisionMode: false,
  activeDashboardTab: 'stats',
  typewriterEnabled: false,
  typewriterPosition: 'center',
  focusMode: 'none',
  themeMode: (typeof localStorage !== 'undefined' && (localStorage.getItem('odisea_theme_mode') as 'dark' | 'light')) || 'dark',
  activeThemeId: (typeof localStorage !== 'undefined' && (localStorage.getItem('odisea_active_theme') as VisualThemeId)) || 'carbon_dark',

  activeModal: null,

  loadInitialData: async () => {
    try {
      // 1. Fetch persisted config from ./odisea_data/config.toml
      let config: any = null;
      try {
        config = await invokeCommand('cmd_get_config');
      } catch (e) {
        console.warn('Could not read config.toml', e);
      }

      // 2. Resolve theme mode priority: localStorage > config.toml > default
      const localMode = typeof localStorage !== 'undefined' ? (localStorage.getItem('odisea_theme_mode') as 'dark' | 'light') : null;
      const resolvedMode: 'dark' | 'light' = localMode || (config?.theme_mode === 'light' ? 'light' : 'dark');

      // 3. Resolve active theme ID
      const localTheme = typeof localStorage !== 'undefined' ? (localStorage.getItem('odisea_active_theme') as VisualThemeId) : null;
      let resolvedThemeId: VisualThemeId = resolvedMode === 'light' ? 'minimalist' : 'carbon_dark';

      if (localTheme && VISUAL_THEMES[localTheme]) {
        resolvedThemeId = localTheme;
      } else if (config?.active_theme && VISUAL_THEMES[config.active_theme as VisualThemeId]) {
        resolvedThemeId = config.active_theme as VisualThemeId;
      }

      const isDark = VISUAL_THEMES[resolvedThemeId]?.colors?.isDark ?? (resolvedMode === 'dark');

      // 4. Apply Theme preset
      ThemeEngine.applyPreset(resolvedThemeId);

      // 4. Restore custom typography if saved
      if (typeof localStorage !== 'undefined') {
        const savedTypo = localStorage.getItem('odisea_typography');
        if (savedTypo) {
          try {
            const parsed = JSON.parse(savedTypo);
            ThemeEngine.applyTypography(parsed.font, parsed.lineHeight, parsed.maxWidth, parsed.headingScaleId);
            if (parsed.accentHex) {
              document.documentElement.style.setProperty('--color-accent', parsed.accentHex);
            }
            if (parsed.barelyThere) {
              document.documentElement.classList.add('theme-barely-there');
            }
          } catch {}
        }
        const savedStyles = localStorage.getItem('odisea_tag_styles');
        if (savedStyles) {
          try {
            ThemeEngine.injectTagStyles(JSON.parse(savedStyles));
          } catch {}
        }
      }

      const projects = await invokeCommand<Project[]>('cmd_list_projects');
      const groups = await invokeCommand<Group[]>('cmd_list_groups', { projectId: null });
      const sheets = await invokeCommand<Sheet[]>('cmd_list_global_filter', { filter: 'all' });

      const activeSheet = sheets.length > 0 ? sheets[0] : null;
      let statistics: TextStatistics | null = null;
      if (activeSheet) {
        statistics = await invokeCommand<TextStatistics>('cmd_get_statistics', { text: activeSheet.content_mdxl });
      }

      set({
        activeThemeId: validThemeId,
        themeMode: isDark ? 'dark' : 'light',
        projects,
        groups,
        sheets,
        activeSheetId: activeSheet ? activeSheet.id : null,
        activeSheet,
        statistics,
      });

      // Load publishing configuration
      await get().loadPublishAccounts();
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  },

  setActiveProject: async (id) => {
    set({ activeProjectId: id, activeGlobalFilter: null });
    const groups = await invokeCommand<Group[]>('cmd_list_groups', { projectId: id });
    set({ groups });
  },

  setActiveGroup: async (id) => {
    set({ activeGroupId: id, activeGlobalFilter: null });
    if (id) {
      const sheets = await invokeCommand<Sheet[]>('cmd_list_sheets', { groupId: id });
      set({ sheets });
      if (sheets.length > 0) {
        get().setActiveSheet(sheets[0]);
      } else {
        set({ activeSheetId: null, activeSheet: null, statistics: null });
      }
    }
  },

  setActiveSheet: async (sheet) => {
    if (sheet) {
      const statistics = await invokeCommand<TextStatistics>('cmd_get_statistics', { text: sheet.content_mdxl });
      set({ activeSheetId: sheet.id, activeSheet: sheet, statistics });
    } else {
      set({ activeSheetId: null, activeSheet: null, statistics: null });
    }
  },

  setGlobalFilter: async (filter) => {
    set({ activeGlobalFilter: filter, activeGroupId: null, activeProjectId: null });
    const sheets = await invokeCommand<Sheet[]>('cmd_list_global_filter', { filter });
    set({ sheets });
    if (sheets.length > 0) {
      get().setActiveSheet(sheets[0]);
    } else {
      set({ activeSheetId: null, activeSheet: null, statistics: null });
    }
  },

  updateSheetContent: async (id, title, content) => {
    await invokeCommand('cmd_update_sheet', { id, title, content });
    const stats = await invokeCommand<TextStatistics>('cmd_get_statistics', { text: content });

    set((state) => {
      const updatedSheets = state.sheets.map((s) =>
        s.id === id ? { ...s, title, content_mdxl: content, updated_at: new Date().toISOString() } : s
      );
      const active = state.activeSheet && state.activeSheet.id === id
        ? { ...state.activeSheet, title, content_mdxl: content, updated_at: new Date().toISOString() }
        : state.activeSheet;

      return { sheets: updatedSheets, activeSheet: active, statistics: stats };
    });
  },

  createNewSheet: async (groupId) => {
    const targetGroup = groupId || get().activeGroupId;
    const newSheet = await invokeCommand<Sheet>('cmd_create_sheet', {
      groupId: targetGroup,
      title: 'Nueva Hoja',
      content: '# Nueva Hoja\n\nEmpieza a escribir aquí...',
    });

    set((state) => ({
      sheets: [newSheet, ...state.sheets],
      activeSheetId: newSheet.id,
      activeSheet: newSheet,
    }));
  },

  toggleFavorite: async (id) => {
    const isFav = await invokeCommand<boolean>('cmd_toggle_favorite', { id });
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === id ? { ...s, is_favorite: isFav } : s)),
      activeSheet: state.activeSheet && state.activeSheet.id === id
        ? { ...state.activeSheet, is_favorite: isFav }
        : state.activeSheet,
    }));
  },

  toggleGlue: async (id) => {
    const isGlued = await invokeCommand<boolean>('cmd_toggle_glue', { id });
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === id ? { ...s, glued_with_next: isGlued } : s)),
      activeSheet: state.activeSheet && state.activeSheet.id === id
        ? { ...state.activeSheet, glued_with_next: isGlued }
        : state.activeSheet,
    }));
  },

  deleteSheet: async (id) => {
    await invokeCommand('cmd_delete_sheet', { id });
    set((state) => {
      const remaining = state.sheets.filter((s) => s.id !== id);
      const nextActive = remaining.length > 0 ? remaining[0] : null;
      return {
        sheets: remaining,
        activeSheetId: nextActive ? nextActive.id : null,
        activeSheet: nextActive,
      };
    });
  },

  updateWritingGoal: async (sheetId: string, goalJson: string | null) => {
    await invokeCommand('cmd_set_sheet_writing_goal', { sheetId, goalJson });
    set((state) => {
      const updatedSheets = state.sheets.map((s) =>
        s.id === sheetId ? { ...s, writing_goal_json: goalJson } : s
      );
      const active = state.activeSheet && state.activeSheet.id === sheetId
        ? { ...state.activeSheet, writing_goal_json: goalJson }
        : state.activeSheet;
      return { sheets: updatedSheets, activeSheet: active };
    });
  },

  updateSheetCreatedAt: async (sheetId: string, newDate: string) => {
    await invokeCommand('cmd_update_sheet_date', { id: sheetId, created_at: newDate });
    set((state) => {
      const updatedSheets = state.sheets.map((s) =>
        s.id === sheetId ? { ...s, created_at: newDate } : s
      );
      const active = state.activeSheet && state.activeSheet.id === sheetId
        ? { ...state.activeSheet, created_at: newDate }
        : state.activeSheet;
      return { sheets: updatedSheets, activeSheet: active };
    });
  },

  // Focus & Keyboard Navigation
  focusedPanel: 'sheetlist',
  setFocusedPanel: (panel: FocusedPanel) => {
    set({ focusedPanel: panel });
    window.dispatchEvent(new CustomEvent('odisea-focus-panel', { detail: { panel } }));
  },

  drillDown: () => {
    const { focusedPanel, sheets, activeSheetId } = get();
    if (focusedPanel === 'library') {
      set({ focusedPanel: 'sheetlist' });
      window.dispatchEvent(new CustomEvent('odisea-focus-panel', { detail: { panel: 'sheetlist' } }));
      if (sheets.length > 0 && !activeSheetId) {
        get().setActiveSheet(sheets[0]);
      }
    } else if (focusedPanel === 'sheetlist') {
      set({ focusedPanel: 'editor' });
      window.dispatchEvent(new CustomEvent('odisea-focus-panel', { detail: { panel: 'editor' } }));
    }
  },

  drillUp: () => {
    const { focusedPanel } = get();
    if (focusedPanel === 'editor') {
      set({ focusedPanel: 'sheetlist' });
      window.dispatchEvent(new CustomEvent('odisea-focus-panel', { detail: { panel: 'sheetlist' } }));
    } else if (focusedPanel === 'sheetlist') {
      set({ focusedPanel: 'library' });
      window.dispatchEvent(new CustomEvent('odisea-focus-panel', { detail: { panel: 'library' } }));
    }
  },

  navigateSheets: (direction: 'up' | 'down') => {
    const { sheets, activeSheetId } = get();
    if (sheets.length === 0) return;
    const currentIndex = sheets.findIndex((s) => s.id === activeSheetId);
    let nextIndex = 0;
    if (currentIndex >= 0) {
      if (direction === 'down') {
        nextIndex = Math.min(sheets.length - 1, currentIndex + 1);
      } else {
        nextIndex = Math.max(0, currentIndex - 1);
      }
    }
    const targetSheet = sheets[nextIndex];
    if (targetSheet) {
      get().setActiveSheet(targetSheet);
      window.dispatchEvent(new CustomEvent('odisea-scroll-to-sheet', { detail: { sheetId: targetSheet.id } }));
    }
  },

  // Publishing
  publishAccounts: null,

  loadPublishAccounts: async () => {
    try {
      const cfg = await invokeCommand<PublishersConfig>('cmd_get_publish_accounts');
      set({ publishAccounts: cfg });
    } catch (e) {
      console.error('Failed to load publish accounts:', e);
    }
  },

  savePublishAccounts: async (cfg: PublishersConfig) => {
    await invokeCommand('cmd_save_publish_accounts', { publishers: cfg });
    set({ publishAccounts: cfg });
  },

  publishToWordPress: async (params) => {
    const result = await invokeCommand<PublishResult>('cmd_publish_to_wordpress', {
      sheetId: params.sheetId,
      accountIndex: params.accountIndex,
      status: params.status,
      scheduledDate: params.scheduledDate,
      categories: params.categories,
      tags: params.tags,
      featuredImageUrl: params.featuredImageUrl,
    });
    get().updateActiveSheetPublishStatus(result);
    return result;
  },

  publishToGhost: async (params) => {
    const result = await invokeCommand<PublishResult>('cmd_publish_to_ghost', {
      sheetId: params.sheetId,
      accountIndex: params.accountIndex,
      status: params.status,
      scheduledDate: params.scheduledDate,
      tags: params.tags,
      featureImageUrl: params.featureImageUrl,
    });
    get().updateActiveSheetPublishStatus(result);
    return result;
  },

  publishToMedium: async (params) => {
    const result = await invokeCommand<PublishResult>('cmd_publish_to_medium', {
      sheetId: params.sheetId,
      accountIndex: params.accountIndex,
      publishStatus: params.publishStatus,
      tags: params.tags,
      canonicalUrl: params.canonicalUrl,
    });
    get().updateActiveSheetPublishStatus(result);
    return result;
  },

  publishToMicroBlog: async (params) => {
    const result = await invokeCommand<PublishResult>('cmd_publish_to_microblog', {
      sheetId: params.sheetId,
      accountIndex: params.accountIndex,
      categories: params.categories,
      slug: params.slug,
    });
    get().updateActiveSheetPublishStatus(result);
    return result;
  },

  copyForSubstack: async (sheetId: string) => {
    const result = await invokeCommand<SubstackCopyResult>('cmd_copy_for_substack', { sheetId });
    if (navigator.clipboard) {
      try {
        const blobHtml = new Blob([result.html], { type: 'text/html' });
        const blobText = new Blob([result.markdown], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
        await navigator.clipboard.write(data);
      } catch {
        // Fallback to text copy
        await navigator.clipboard.writeText(result.markdown);
      }
    }
    return result;
  },

  updateActiveSheetPublishStatus: (result: PublishResult) => {
    const jsonStr = JSON.stringify(result);
    set((state) => {
      const updatedSheets = state.sheets.map((s) =>
        s.id === (state.activeSheet?.id) ? { ...s, publish_status_json: jsonStr } : s
      );
      const active = state.activeSheet ? { ...state.activeSheet, publish_status_json: jsonStr } : null;
      return { sheets: updatedSheets, activeSheet: active };
    });
  },

  toggleLibrary: () => set((state) => ({ showLibrary: !state.showLibrary })),
  toggleSheetList: () => set((state) => ({ showSheetList: !state.showSheetList })),
  toggleDashboard: () => set((state) => ({ showDashboard: !state.showDashboard })),
  toggleRevisionMode: () => set((state) => ({ isRevisionMode: !state.isRevisionMode })),
  setActiveDashboardTab: (tab: string) => set({ activeDashboardTab: tab }),
  toggleTypewriter: () => set((state) => ({ typewriterEnabled: !state.typewriterEnabled })),
  setFocusMode: (mode) => set({ focusMode: mode }),
  setActiveTheme: async (themeId: VisualThemeId) => {
    const validThemeId = VISUAL_THEMES[themeId] ? themeId : 'carbon_dark';
    const isDark = VISUAL_THEMES[validThemeId]?.colors?.isDark ?? false;

    ThemeEngine.applyPreset(validThemeId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('odisea_active_theme', validThemeId);
      localStorage.setItem('odisea_theme_mode', isDark ? 'dark' : 'light');
    }

    set({ activeThemeId: validThemeId, themeMode: isDark ? 'dark' : 'light' });

    try {
      await invokeCommand('cmd_set_theme', {
        themeId: validThemeId,
        themeMode: isDark ? 'dark' : 'light',
      });
    } catch (e) {
      console.warn('Could not save theme to config.toml', e);
    }
  },

  toggleThemeMode: async () => {
    const currentTheme = get().activeThemeId;
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    let targetTheme: VisualThemeId = 'minimalist';
    if (isCurrentlyDark) {
      if (currentTheme === 'solarized_dark') targetTheme = 'solarized_light';
      else targetTheme = 'minimalist';
    } else {
      if (currentTheme === 'solarized_light') targetTheme = 'solarized_dark';
      else targetTheme = 'carbon_dark';
    }
    await get().setActiveTheme(targetTheme);
  },
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));

