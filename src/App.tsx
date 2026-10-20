import React, { useEffect } from 'react';
import { useOdiseaStore } from './store/useOdiseaStore';
import { LibraryTree } from './components/library';
import { SheetList } from './components/sheetlist';
import { OdiseaEditor } from './components/editor';
import { DashboardContainer } from './components/dashboard';
import {
  ExportPreviewModal,
  ThemeStudioModal,
  BackupRestoreModal,
  SettingsModal,
  CommandPalette,
  HistoryModal,
} from './components/modals';

export const App: React.FC = () => {
  const {
    showLibrary,
    showSheetList,
    showDashboard,
    activeModal,
    focusedPanel,
    drillDown,
    drillUp,
    navigateSheets,
    loadInitialData,
    toggleLibrary,
    toggleSheetList,
    toggleDashboard,
    createNewSheet,
    openModal,
    closeModal,
  } = useOdiseaStore();

  // Load initial projects, groups, and sheets from SQLite
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Global application keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Ctrl+Space / Ctrl+P / Ctrl+K: Global Quick Launcher (Spotlight)
      if (
        (isCtrlOrCmd && (e.key === ' ' || e.code === 'Space')) ||
        (isCtrlOrCmd && e.key.toLowerCase() === 'p') ||
        (isCtrlOrCmd && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        openModal('command_palette');
        return;
      }

      // 2. Ctrl+Return: Drill-up (Editor -> Sheet List -> Library)
      if (isCtrlOrCmd && e.key === 'Enter') {
        if (!activeModal) {
          e.preventDefault();
          drillUp();
          return;
        }
      }

      // 3. Return (Enter): Drill-down (Library -> Sheet List -> Editor)
      if (e.key === 'Enter' && !isCtrlOrCmd && !e.shiftKey && !e.altKey) {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.classList.contains('cm-content');
        if (!isInput && !activeModal) {
          e.preventDefault();
          drillDown();
          return;
        }
      }

      // 4. Arrow navigation between sheets when not inside an input/CodeMirror
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !activeModal) {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.classList.contains('cm-content');
        if (!isInput && focusedPanel === 'sheetlist') {
          e.preventDefault();
          navigateSheets(e.key === 'ArrowDown' ? 'down' : 'up');
          return;
        }
      }

      // Ctrl+1: Toggle Library
      if (isCtrlOrCmd && e.key === '1') {
        e.preventDefault();
        toggleLibrary();
        return;
      }

      // Ctrl+2: Toggle Sheet List
      if (isCtrlOrCmd && e.key === '2') {
        e.preventDefault();
        toggleSheetList();
        return;
      }

      // Ctrl+4: Toggle Dashboard
      if (isCtrlOrCmd && e.key === '4') {
        e.preventDefault();
        toggleDashboard();
        return;
      }

      // Ctrl+N: New Sheet
      if (isCtrlOrCmd && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        createNewSheet();
        return;
      }

      // Ctrl+Shift+E: Export Preview
      if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        openModal('export_preview');
        return;
      }

      // Ctrl+,: Settings
      if (isCtrlOrCmd && e.key === ',') {
        e.preventDefault();
        openModal('settings');
        return;
      }

      // Ctrl+H: History of Projects and Documents
      if (isCtrlOrCmd && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        openModal('history');
        return;
      }

      // Ctrl+Alt+T: Theme Studio
      if (isCtrlOrCmd && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        openModal('theme_studio');
        return;
      }

      // Esc: Close modal
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    activeModal,
    focusedPanel,
    drillDown,
    drillUp,
    navigateSheets,
    openModal,
    closeModal,
    toggleLibrary,
    toggleSheetList,
    toggleDashboard,
    createNewSheet,
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Panel 1: Library Tree */}
      {showLibrary && <LibraryTree />}

      {/* Panel 2: Sheet List */}
      {showSheetList && <SheetList />}

      {/* Panel 3: Odisea Core Editor */}
      <OdiseaEditor />

      {/* Panel 4: Inspection & Dashboard */}
      {showDashboard && <DashboardContainer />}

      {/* Application Modals */}
      <ExportPreviewModal
        isOpen={activeModal === 'export_preview'}
        onClose={closeModal}
      />

      <ThemeStudioModal
        isOpen={activeModal === 'theme_studio'}
        onClose={closeModal}
      />

      <BackupRestoreModal
        isOpen={activeModal === 'backup_restore'}
        onClose={closeModal}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={closeModal}
      />

      <CommandPalette
        isOpen={activeModal === 'command_palette'}
        onClose={closeModal}
      />

      <HistoryModal
        isOpen={activeModal === 'history'}
        onClose={closeModal}
      />
    </div>
  );
};
export default App;
