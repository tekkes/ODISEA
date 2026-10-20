import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditorState, Extension, Prec, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { useOdiseaStore } from '../../store/useOdiseaStore';
import { CustomizableToolbar } from './CustomizableToolbar';
import { ContextMarkupBar } from './ContextMarkupBar';
import { MarkupBarBottom, CursorContextType } from './MarkupBarBottom';
import { QuickMarkupPopoverCmd9 } from './QuickMarkupPopoverCmd9';
import { TableWidget } from './TableWidget';
import { EquationWidget } from './EquationWidget';
import { FootnotePopover } from './FootnotePopover';
import { AnnotationPopover } from './AnnotationPopover';
import { LinkPopover } from './LinkPopover';
import { ImageSketchModal } from './ImageSketchModal';
import { LiveCounterBadge } from './LiveCounterBadge';
import {
  markdownXlPlugin,
  smartListsKeymap,
  smartPairsExtension,
  odiseaShortcutsKeymap,
  focusModeFacet,
} from '../../parser/markdown_xl/codemirror_decorations';
import { Edit3 } from 'lucide-react';

export const OdiseaEditor: React.FC = () => {
  const {
    activeSheet,
    updateSheetContent,
    typewriterEnabled,
    typewriterPosition,
    focusMode,
    isRevisionMode,
    drillUp,
    setFocusedPanel,
  } = useOdiseaStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const focusCompartmentRef = useRef(new Compartment());

  const typewriterRef = useRef({ enabled: typewriterEnabled, position: typewriterPosition });
  useEffect(() => {
    typewriterRef.current = { enabled: typewriterEnabled, position: typewriterPosition };
  }, [typewriterEnabled, typewriterPosition]);

  const alignTypewriter = useCallback((view: EditorView, smooth: boolean = false) => {
    if (!typewriterRef.current.enabled) return;
    const sel = view.state.selection.main;
    const coords = view.coordsAtPos(sel.head);
    const container = scrollContainerRef.current;
    if (!coords || !container) return;

    const containerRect = container.getBoundingClientRect();
    const currentCursorY = coords.top - containerRect.top;
    const pos = typewriterRef.current.position;

    let delta = 0;
    if (pos === 'top') {
      const targetY = containerRect.height * 0.25;
      delta = currentCursorY - targetY;
    } else if (pos === 'bottom') {
      const targetY = containerRect.height * 0.75;
      delta = currentCursorY - targetY;
    } else if (pos === 'band') {
      const minY = containerRect.height * 0.35;
      const maxY = containerRect.height * 0.65;
      if (currentCursorY < minY) {
        delta = currentCursorY - minY;
      } else if (currentCursorY > maxY) {
        delta = currentCursorY - maxY;
      } else {
        delta = 0;
      }
    } else {
      // center (50%)
      const targetY = containerRect.height * 0.50;
      delta = currentCursorY - targetY;
    }

    if (Math.abs(delta) > 8) {
      if (smooth) {
        container.scrollBy({ top: delta, behavior: 'smooth' });
      } else {
        container.scrollTop += delta;
      }
    }
  }, []);

  // When typewriter mode or position changes, immediately scroll smoothly to target
  useEffect(() => {
    if (typewriterEnabled && editorViewRef.current) {
      alignTypewriter(editorViewRef.current, true);
    }
  }, [typewriterEnabled, typewriterPosition, alignTypewriter]);

  // When focus mode changes, reconfigure CodeMirror without destroying the editor
  useEffect(() => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: focusCompartmentRef.current.reconfigure(focusModeFacet.of(focusMode)),
      });
    }
  }, [focusMode]);

  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');

  // Floating Context bar on text selection
  const [contextBarPos, setContextBarPos] = useState<{ x: number; y: number } | null>(null);

  // Bottom Markup Bar context
  const [cursorContext, setCursorContext] = useState<CursorContextType>('empty-line');

  // Modals & Popovers state
  const [isQuickMarkupOpen, setIsQuickMarkupOpen] = useState(false);
  const [quickMarkupPos, setQuickMarkupPos] = useState<{ x: number; y: number } | null>(null);

  const [isTableOpen, setIsTableOpen] = useState(false);
  const [tableInitialMd, setTableInitialMd] = useState('');

  const [isEquationOpen, setIsEquationOpen] = useState(false);
  const [equationInitialLatex, setEquationInitialLatex] = useState('E = mc^2');
  const [equationDefaultBlock, setEquationDefaultBlock] = useState(false);

  const [isFootnoteOpen, setIsFootnoteOpen] = useState(false);
  const [footnoteText, setFootnoteText] = useState('');
  const [footnotePos, setFootnotePos] = useState<{ x: number; y: number } | null>(null);

  const [isAnnotationOpen, setIsAnnotationOpen] = useState(false);
  const [annotationAnchor, setAnnotationAnchor] = useState('');
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationPos, setAnnotationPos] = useState<{ x: number; y: number } | null>(null);

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState('');
  const [linkInitialUrl, setLinkInitialUrl] = useState('');
  const [linkPos, setLinkPos] = useState<{ x: number; y: number } | null>(null);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageInitialPath, setImageInitialPath] = useState('');

  // 1. Helper to insert or wrap markdown tags directly inside CodeMirror
  const insertMarkup = useCallback((prefix: string, suffix: string = '') => {
    const view = editorViewRef.current;
    if (!view) return;

    view.focus();
    const sel = view.state.selection.main;
    if (!sel.empty) {
      const selected = view.state.sliceDoc(sel.from, sel.to);
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: `${prefix}${selected}${suffix}` },
        selection: { anchor: sel.from + prefix.length, head: sel.to + prefix.length },
      });
    } else {
      view.dispatch({
        changes: { from: sel.head, insert: `${prefix}${suffix}` },
        selection: { anchor: sel.head + prefix.length },
      });
    }
  }, []);

  // 2. Open quick markup menu (Ctrl+9) with cursor coordinates
  const openQuickMarkupAtCursor = useCallback(() => {
    const view = editorViewRef.current;
    if (view) {
      const coords = view.coordsAtPos(view.state.selection.main.head);
      if (coords) {
        setQuickMarkupPos({ x: coords.left, y: coords.bottom + 6 });
      } else {
        setQuickMarkupPos(null);
      }
    }
    setIsQuickMarkupOpen(true);
  }, []);

  // 3. Register custom widget event listeners
  useEffect(() => {
    const handleOpenFootnote = (e: any) => {
      setFootnoteText(e.detail?.payload || '');
      setFootnotePos(e.detail?.coords || null);
      setIsFootnoteOpen(true);
    };

    const handleOpenAnnotation = (e: any) => {
      setAnnotationAnchor(e.detail?.anchor || '');
      setAnnotationNote(e.detail?.note || '');
      setAnnotationPos(e.detail?.coords || null);
      setIsAnnotationOpen(true);
    };

    const handleOpenLink = (e: any) => {
      setLinkInitialText(e.detail?.text || '');
      setLinkInitialUrl(e.detail?.url || '');
      setLinkPos(e.detail?.coords || null);
      setIsLinkOpen(true);
    };

    const handleOpenImage = (e: any) => {
      setImageInitialPath(e.detail?.path || '');
      setIsImageOpen(true);
    };

    const handleOpenTable = () => {
      setIsTableOpen(true);
    };

    window.addEventListener('odisea:open-footnote', handleOpenFootnote);
    window.addEventListener('odisea:open-annotation', handleOpenAnnotation);
    window.addEventListener('odisea:open-link', handleOpenLink);
    window.addEventListener('odisea:open-image', handleOpenImage);
    window.addEventListener('odisea:open-table', handleOpenTable);

    return () => {
      window.removeEventListener('odisea:open-footnote', handleOpenFootnote);
      window.removeEventListener('odisea:open-annotation', handleOpenAnnotation);
      window.removeEventListener('odisea:open-link', handleOpenLink);
      window.removeEventListener('odisea:open-image', handleOpenImage);
      window.removeEventListener('odisea:open-table', handleOpenTable);
    };
  }, []);

  // 4. Initialize & Mount CodeMirror 6 Editor
  useEffect(() => {
    if (!containerRef.current) return;

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    const initialContent = activeSheet ? activeSheet.content_mdxl : '';
    setEditorContent(initialContent);

    // Dynamic CodeMirror theme matching Ulysses clean aesthetic
    const ulyssesTheme = EditorView.theme(
      {
        '&': {
          height: '100%',
          fontSize: '15px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: 'var(--color-text-primary)',
          backgroundColor: 'transparent',
          lineHeight: '1.75',
        },
        '.cm-scroller': {
          fontFamily: 'inherit',
          lineHeight: 'inherit',
          overflow: 'auto',
          paddingBottom: '40vh',
        },
        '.cm-content': {
          caretColor: 'var(--color-accent)',
          padding: '12px 0',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: 'var(--color-accent)',
          borderLeftWidth: '2px',
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--color-selection) !important',
        },
        '.cm-line': {
          padding: '1px 0',
        },
        '.cm-heading-1': {
          fontSize: '1.45rem',
          fontWeight: '700',
          lineHeight: '1.4',
          color: 'var(--color-text-primary)',
          marginTop: '1.2rem',
          marginBottom: '0.4rem',
        },
        '.cm-heading-2': {
          fontSize: '1.25rem',
          fontWeight: '700',
          lineHeight: '1.45',
          color: 'var(--color-text-primary)',
          marginTop: '1.0rem',
          marginBottom: '0.35rem',
        },
        '.cm-heading-3': {
          fontSize: '1.12rem',
          fontWeight: '600',
          lineHeight: '1.5',
          color: 'var(--color-text-primary)',
          marginTop: '0.8rem',
        },
        '.cm-heading-4, .cm-heading-5, .cm-heading-6': {
          fontSize: '1.02rem',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
        },
        '.cm-quote': {
          borderLeft: '2.5px solid var(--color-border)',
          paddingLeft: '12px',
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
        },
        '.cm-verse': {
          borderLeft: '2.5px solid rgba(168, 85, 247, 0.6)',
          paddingLeft: '12px',
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
        },
        '.cm-comment': {
          fontStyle: 'italic',
          opacity: '0.55',
          color: 'var(--color-text-muted)',
        },
        '.cm-divider': {
          borderBottom: '1px solid var(--color-border)',
          margin: '12px 0',
        },
      },
      { dark: document.documentElement.classList.contains('dark') }
    );

    // Ctrl+9 keymap inside CodeMirror
    const cmd9Keymap: Extension = Prec.highest(
      keymap.of([
        {
          key: 'Mod-9',
          run: () => {
            openQuickMarkupAtCursor();
            return true;
          },
        },
      ])
    );

    // Ctrl+Enter (Mod-Enter): Drill-up from Editor to Sheet List
    const drillUpKeymap: Extension = Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: (view) => {
            view.contentDOM.blur();
            drillUp();
            return true;
          },
        },
      ])
    );

    const domHandlers = EditorView.domEventHandlers({
      focus: () => {
        setFocusedPanel('editor');
      },
    });

    // Update listener: detects changes, selections, and cursor context
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newText = update.state.doc.toString();
        setEditorContent(newText);
        if (activeSheet) {
          updateSheetContent(activeSheet.id, activeSheet.title, newText);
        }
      }

      if (update.selectionSet || update.docChanged) {
        const sel = update.state.selection.main;
        if (!sel.empty) {
          const coords = update.view.coordsAtPos(sel.from);
          if (coords) {
            setContextBarPos({
              x: coords.left + 30,
              y: coords.top,
            });
          }
          setCursorContext('has-selection');
        } else {
          setContextBarPos(null);

          const line = update.state.doc.lineAt(sel.head);
          const lineText = line.text;

          if (lineText.trim() === '') {
            setCursorContext('empty-line');
          } else if (/^\s*([-*+]|\d+\.)\s+/.test(lineText)) {
            setCursorContext('inside-list');
          } else if (/^\s*>+/.test(lineText)) {
            setCursorContext('inside-quote');
          } else {
            setCursorContext('inside-text');
          }
        }

        // Typewriter Scrolling: Keep current line aligned to target position
        alignTypewriter(update.view, false);
      }
    });

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        ulyssesTheme,
        focusCompartmentRef.current.of(focusModeFacet.of(focusMode)),
        markdownXlPlugin,
        smartListsKeymap,
        smartPairsExtension,
        odiseaShortcutsKeymap,
        cmd9Keymap,
        drillUpKeymap,
        domHandlers,
        updateListener,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, [activeSheet?.id, drillUp, setFocusedPanel, alignTypewriter]);

  // Listen for panel focus event to focus CodeMirror
  useEffect(() => {
    const handleFocusPanel = (e: any) => {
      if (e.detail?.panel === 'editor') {
        editorViewRef.current?.focus();
      }
    };
    window.addEventListener('odisea-focus-panel', handleFocusPanel);
    return () => window.removeEventListener('odisea-focus-panel', handleFocusPanel);
  }, []);

  // Sync title & doc when activeSheet changes externally
  useEffect(() => {
    if (activeSheet) {
      setTitle(activeSheet.title);
      const view = editorViewRef.current;
      if (view && view.state.doc.toString() !== activeSheet.content_mdxl) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: activeSheet.content_mdxl },
        });
      }
    } else {
      setTitle('');
    }
  }, [activeSheet?.title, activeSheet?.content_mdxl]);

  // Handle jump-to-line events dispatched by Outline, Overview or Backlinks panes
  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent<{ line: number; sheetId?: string }>;
      const lineNum = customEvent.detail?.line;
      const view = editorViewRef.current;
      if (!view || !lineNum) return;

      const doc = view.state.doc;
      if (lineNum > doc.lines) return;
      const lineInfo = doc.line(lineNum);
      view.dispatch({
        selection: { anchor: lineInfo.from },
        scrollIntoView: true,
      });
      view.focus();
    };

    window.addEventListener('odisea-jump-to-line', handleJump);
    return () => {
      window.removeEventListener('odisea-jump-to-line', handleJump);
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newTitle = e.target.value;
    setTitle(newTitle);
    if (activeSheet) {
      updateSheetContent(activeSheet.id, newTitle, editorContent);
    }
  };

  if (!activeSheet) {
    return (
      <main className="flex-1 h-full flex flex-col items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] select-none">
        <Edit3 size={36} className="stroke-[1.5] opacity-30 mb-3" />
        <h3 className="text-sm font-medium">Ninguna hoja seleccionada</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Selecciona una hoja de la biblioteca o crea una nueva para comenzar a escribir.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full flex flex-col bg-[var(--color-bg-primary)] relative overflow-hidden select-none">
      {/* 1. Top Customizable Toolbar (with drag & drop and Convert Markup) */}
      <CustomizableToolbar
        onInsertMarkup={insertMarkup}
        onOpenQuickMarkup={openQuickMarkupAtCursor}
        onOpenTableModal={() => setIsTableOpen(true)}
        onOpenImageModal={() => setIsImageOpen(true)}
        onOpenFootnoteModal={() => {
          setFootnoteText('');
          setFootnotePos(null);
          setIsFootnoteOpen(true);
        }}
        onOpenAnnotationModal={() => {
          setAnnotationAnchor('');
          setAnnotationNote('');
          setAnnotationPos(null);
          setIsAnnotationOpen(true);
        }}
        editorContent={editorContent}
        onUpdateContent={(converted) => {
          setEditorContent(converted);
          const view = editorViewRef.current;
          if (view) {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: converted },
            });
          }
        }}
      />

      {/* 2. Editor Core Container */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-12 md:px-24 lg:px-40 flex flex-col ${isRevisionMode ? 'revision-mode-active' : ''}`}
      >
        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col pt-8 pb-[60vh]">
          {/* Sheet Title */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Título de la hoja..."
            className="w-full text-2xl font-bold tracking-tight bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border-none focus:outline-hidden mb-4 shrink-0"
          />

          {/* CodeMirror 6 Mount Point */}
          <div
            ref={containerRef}
            className="flex-1 w-full min-h-[300px] cursor-text select-text"
          />
        </div>
      </div>

      {/* 3. Bottom Contextual Markup Bar */}
      <MarkupBarBottom
        contextType={cursorContext}
        onApplyTag={(prefix, suffix) => {
          if (prefix.startsWith('|')) {
            setIsTableOpen(true);
          } else if (prefix === '$' && suffix === '$') {
            setEquationDefaultBlock(false);
            setIsEquationOpen(true);
          } else if (prefix.startsWith('(fn')) {
            setFootnoteText('');
            setIsFootnoteOpen(true);
          } else if (prefix === '{' && suffix === '}') {
            setAnnotationAnchor('');
            setIsAnnotationOpen(true);
          } else if (prefix === '[' && suffix?.includes('http')) {
            setLinkInitialText('');
            setLinkInitialUrl('');
            setIsLinkOpen(true);
          } else {
            insertMarkup(prefix, suffix);
          }
        }}
        onOpenQuickMarkup={openQuickMarkupAtCursor}
      />

      {/* 4. Live Counter Badge */}
      <LiveCounterBadge />

      {/* 5. Floating Context Markup Bar (on selection) */}
      <ContextMarkupBar
        position={contextBarPos}
        onApplyFormat={(format) => {
          const view = editorViewRef.current;
          const sel = view ? view.state.selection.main : null;
          const selectedText = view && sel ? view.state.sliceDoc(sel.from, sel.to) : '';

          switch (format) {
            case 'bold':
              insertMarkup('**', '**');
              break;
            case 'italic':
              insertMarkup('_', '_');
              break;
            case 'highlight':
              insertMarkup('::', '::');
              break;
            case 'delete':
              insertMarkup('||', '||');
              break;
            case 'code':
              insertMarkup('`', '`');
              break;
            case 'link':
              setLinkInitialText(selectedText);
              setLinkPos(contextBarPos);
              setIsLinkOpen(true);
              break;
            case 'annotation':
              setAnnotationAnchor(selectedText);
              setAnnotationPos(contextBarPos);
              setIsAnnotationOpen(true);
              break;
          }
          setContextBarPos(null);
        }}
      />

      {/* 6. Quick Markup Popover (Ctrl+9) */}
      <QuickMarkupPopoverCmd9
        isOpen={isQuickMarkupOpen}
        onClose={() => setIsQuickMarkupOpen(false)}
        onSelectTag={(prefix, suffix) => {
          if (prefix.startsWith('|')) {
            setIsTableOpen(true);
          } else if (prefix.startsWith('$$') || prefix === '$') {
            setEquationDefaultBlock(prefix.startsWith('$$'));
            setIsEquationOpen(true);
          } else if (prefix.startsWith('(fn')) {
            setFootnoteText('');
            setIsFootnoteOpen(true);
          } else if (prefix.startsWith('{')) {
            setAnnotationAnchor('');
            setIsAnnotationOpen(true);
          } else if (prefix.startsWith('(img')) {
            setIsImageOpen(true);
          } else if (prefix.startsWith('[')) {
            setIsLinkOpen(true);
          } else {
            insertMarkup(prefix, suffix);
          }
        }}
        position={quickMarkupPos}
      />

      {/* 7. Advanced Interactive Widgets & Non-Intrusive Popovers */}
      <TableWidget
        isOpen={isTableOpen}
        onClose={() => setIsTableOpen(false)}
        onInsertTable={(md) => insertMarkup(md)}
        initialMarkdown={tableInitialMd}
      />

      <EquationWidget
        isOpen={isEquationOpen}
        onClose={() => setIsEquationOpen(false)}
        onInsertEquation={(eq) => insertMarkup(eq)}
        initialLatex={equationInitialLatex}
        defaultBlock={equationDefaultBlock}
      />

      <FootnotePopover
        isOpen={isFootnoteOpen}
        onClose={() => setIsFootnoteOpen(false)}
        onInsertFootnote={(fn) => insertMarkup(fn)}
        initialText={footnoteText}
        position={footnotePos}
      />

      <AnnotationPopover
        isOpen={isAnnotationOpen}
        onClose={() => setIsAnnotationOpen(false)}
        onInsertAnnotation={(ann) => insertMarkup(ann)}
        initialAnchorText={annotationAnchor}
        initialNote={annotationNote}
        position={annotationPos}
      />

      <LinkPopover
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        onInsertLink={(lnk) => insertMarkup(lnk)}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
        position={linkPos}
      />

      <ImageSketchModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        onInsertImage={(img) => insertMarkup(img)}
        initialImagePath={imageInitialPath}
      />
    </main>
  );
};
