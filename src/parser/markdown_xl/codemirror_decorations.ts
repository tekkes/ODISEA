/**
 * Odisea WYSIWYM CodeMirror 6 Decoration & Interaction Engine
 * Implements real-time syntax separation for all 28 Markdown XL tags:
 * Delimiter tokens ('ulysses-tag') are separated from semantic content.
 * Includes interactive checklist toggles, margin badges, smart lists, smart pairs,
 * focus mode highlight (line, sentence, paragraph with 30% dimming), and interactive popover triggers.
 */

import { Extension, Prec, Range, Facet } from '@codemirror/state';
import {
  ViewPlugin,
  Decoration,
  DecorationSet,
  ViewUpdate,
  EditorView,
  WidgetType,
  keymap,
} from '@codemirror/view';
import { MarkdownXlScanner, MarkdownXlToken } from './markdown_xl_lezer';

export type FocusMode = 'none' | 'line' | 'sentence' | 'paragraph';

// Facet to pass the current focus mode to CodeMirror plugins
export const focusModeFacet = Facet.define<FocusMode, FocusMode>({
  combine: (values) => values[values.length - 1] || 'none',
});

// ============================================================================
// 1. Interactive Widgets (Micro-UI compliant)
// ============================================================================

/**
 * Interactive checklist checkbox widget for - [ ] and - [x]
 */
class ChecklistWidget extends WidgetType {
  constructor(readonly checked: boolean, readonly pos: number) {
    super();
  }

  eq(other: ChecklistWidget): boolean {
    return this.checked === other.checked && this.pos === other.pos;
  }

  toDOM(view: EditorView): HTMLElement {
    const wrap = document.createElement('span');
    wrap.className = 'cm-checklist-widget inline-flex items-center align-middle mr-1.5 cursor-pointer select-none';

    const box = document.createElement('span');
    box.className = `w-3.5 h-3.5 rounded flex items-center justify-center transition-colors border ${
      this.checked
        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
        : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
    }`;

    if (this.checked) {
      box.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }

    wrap.appendChild(box);

    wrap.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the [ ] or [x] around this.pos in doc
      const textAround = view.state.doc.sliceString(this.pos, Math.min(this.pos + 12, view.state.doc.length));
      const match = textAround.match(/\[([ xX])\]/);
      if (match && match.index !== undefined) {
        const replaceFrom = this.pos + match.index;
        const replaceTo = replaceFrom + 3;
        const newTag = this.checked ? '[ ]' : '[x]';
        view.dispatch({
          changes: { from: replaceFrom, to: replaceTo, insert: newTag },
        });
      }
    });

    return wrap;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * Heading margin indicator widget (H1..H6)
 */
class HeadingBadgeWidget extends WidgetType {
  constructor(readonly level: number) {
    super();
  }

  eq(other: HeadingBadgeWidget): boolean {
    return this.level === other.level;
  }

  toDOM(): HTMLElement {
    const badge = document.createElement('span');
    badge.className = `cm-heading-badge micro-pill inline-flex items-center justify-center text-[10px] font-mono font-bold leading-none h-[16px] max-h-[18px] px-[5px] rounded-[4px] mr-2 select-none pointer-events-none text-[var(--color-accent)] bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/20`;
    badge.textContent = `H${this.level}`;
    return badge;
  }
}

/**
 * Inline footnote pill widget (clicking opens FootnotePopover)
 */
class FootnoteBadgeWidget extends WidgetType {
  constructor(readonly payload: string, readonly pos: number) {
    super();
  }

  eq(other: FootnoteBadgeWidget): boolean {
    return this.payload === other.payload && this.pos === other.pos;
  }

  toDOM(view: EditorView): HTMLElement {
    const badge = document.createElement('span');
    badge.className =
      'cm-footnote-pill micro-pill inline-flex items-center justify-center text-[10px] font-mono font-bold leading-none h-[16px] max-h-[18px] px-[5px] rounded-[4px] text-[var(--color-accent)] bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 cursor-pointer select-none mx-0.5 hover:bg-[var(--color-accent)]/25 transition-colors';
    badge.title = this.payload || 'Nota al pie (FN)';
    badge.textContent = 'FN';

    badge.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const coords = view.coordsAtPos(this.pos);
      window.dispatchEvent(
        new CustomEvent('odisea:open-footnote', {
          detail: { payload: this.payload, pos: this.pos, coords },
        })
      );
    });

    return badge;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * Inline media/object badge widget (clicking opens corresponding editor modal)
 */
class ObjectPillWidget extends WidgetType {
  constructor(readonly label: string, readonly pos: number, readonly tooltip?: string, readonly data?: string) {
    super();
  }

  eq(other: ObjectPillWidget): boolean {
    return this.label === other.label && this.pos === other.pos && this.data === other.data;
  }

  toDOM(view: EditorView): HTMLElement {
    const pill = document.createElement('span');
    const displayLabel = this.label.toUpperCase();
    pill.className =
      'cm-object-pill micro-pill inline-flex items-center justify-center text-[10px] font-mono font-bold leading-none h-[16px] max-h-[18px] px-[5px] rounded-[4px] text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] cursor-pointer select-none mx-0.5 hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/40 transition-colors';
    if (this.tooltip) {
      pill.title = this.tooltip;
    }
    pill.textContent = displayLabel;

    pill.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const coords = view.coordsAtPos(this.pos);
      if (this.label === 'img' || this.tooltip?.includes('Imagen')) {
        window.dispatchEvent(
          new CustomEvent('odisea:open-image', { detail: { path: this.data, coords } })
        );
      } else if (this.label === 'tbl' || this.label === 'Tabla') {
        window.dispatchEvent(
          new CustomEvent('odisea:open-table', { detail: { coords } })
        );
      }
    });

    return pill;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * Non-breaking space micro-dot widget (Alt+Space)
 */
class NbspDotWidget extends WidgetType {
  eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const dot = document.createElement('span');
    dot.className = 'cm-nbsp-dot text-[var(--color-accent)] opacity-40 select-none font-bold text-[11px] px-0.5 pointer-events-none';
    dot.textContent = '·';
    return dot;
  }
}

// ============================================================================
// 2. Decoration Builder (StateField / ViewPlugin)
// ============================================================================

const tagMark = Decoration.mark({
  class: 'cm-ulysses-tag opacity-40 font-normal select-none transition-opacity hover:opacity-90',
});

const strongMark = Decoration.mark({
  class: 'cm-ulysses-strong font-bold text-[var(--color-text-primary)]',
});

const emphMark = Decoration.mark({
  class: 'cm-ulysses-emph italic text-[var(--color-text-primary)]',
});

const markMark = Decoration.mark({
  class: 'cm-ulysses-mark bg-yellow-200/40 dark:bg-yellow-500/25 text-yellow-900 dark:text-yellow-100 rounded px-0.5',
});

const deleteMark = Decoration.mark({
  class: 'cm-ulysses-delete line-through opacity-60 text-red-600 dark:text-red-400',
});

const commentMark = Decoration.mark({
  class: 'cm-ulysses-comment italic text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-1',
});

const annotationMark = Decoration.mark({
  class: 'cm-ulysses-annotation text-indigo-600 dark:text-indigo-400 underline decoration-dotted decoration-indigo-400/80 cursor-pointer',
});

const codeMark = Decoration.mark({
  class: 'cm-ulysses-code font-mono text-[13px] bg-zinc-200/50 dark:bg-zinc-800/60 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded',
});

const rawMark = Decoration.mark({
  class: 'cm-ulysses-raw font-mono text-[13px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1 rounded',
});

const linkMark = Decoration.mark({
  class: 'cm-ulysses-link text-[var(--color-accent)] underline decoration-1 cursor-pointer',
});

const wikiMark = Decoration.mark({
  class: 'cm-ulysses-wiki text-sky-600 dark:text-sky-400 font-medium underline decoration-dashed cursor-pointer',
});

const mathMark = Decoration.mark({
  class: 'cm-ulysses-math font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 rounded cursor-pointer',
});

export function buildMarkdownXlDecorations(view: EditorView): DecorationSet {
  const content = view.state.doc.toString();
  const scanResult = MarkdownXlScanner.scan(content);
  const widgets: Range<Decoration>[] = [];

  // Focus Highlight mode detection
  const focusMode = view.state.facet(focusModeFacet);
  const cursorHead = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorHead);

  // Determine active boundaries for Focus Mode (dimming other text to 30%)
  let activeFrom = currentLine.from;
  let activeTo = currentLine.to;

  if (focusMode === 'paragraph') {
    // Expand to contiguous non-empty lines
    let pStart = currentLine.number;
    while (pStart > 1 && view.state.doc.line(pStart - 1).text.trim() !== '') {
      pStart--;
    }
    let pEnd = currentLine.number;
    while (pEnd < view.state.doc.lines && view.state.doc.line(pEnd + 1).text.trim() !== '') {
      pEnd++;
    }
    activeFrom = view.state.doc.line(pStart).from;
    activeTo = view.state.doc.line(pEnd).to;
  }

  // 1. Line Decorations (Heading margins, block styles, Focus Mode dimming)
  for (const ls of scanResult.lineStyles) {
    if (ls.from <= view.state.doc.length) {
      const isLineDimmed =
        focusMode !== 'none' && (ls.to < activeFrom || ls.from > activeTo);
      const combinedLineClass = `${ls.className} ${isLineDimmed ? 'cm-focus-dimmed' : ''}`.trim();

      widgets.push(
        Decoration.line({
          class: combinedLineClass,
        }).range(ls.from)
      );

      // Left margin indicator for headings H1..H6
      if (ls.headingLevel) {
        widgets.push(
          Decoration.widget({
            widget: new HeadingBadgeWidget(ls.headingLevel),
            side: -1,
          }).range(ls.from)
        );
      }
    }
  }

  // If focusMode is active and some lines don't have explicit lineStyles, apply dimming to remaining lines
  if (focusMode !== 'none') {
    const styledLineStarts = new Set(scanResult.lineStyles.map((ls) => ls.from));
    for (let i = 1; i <= view.state.doc.lines; i++) {
      const l = view.state.doc.line(i);
      if (!styledLineStarts.has(l.from)) {
        const isDimmed = l.to < activeFrom || l.from > activeTo;
        if (isDimmed) {
          widgets.push(
            Decoration.line({
              class: 'cm-focus-dimmed',
            }).range(l.from)
          );
        }
      }
    }
  }

  // 2. Token Marks and Interactive Widgets
  for (const token of scanResult.tokens) {
    if (token.from > view.state.doc.length || token.to > view.state.doc.length) continue;

    switch (token.type) {
      case 'ulysses-tag':
        if (token.from < token.to) {
          widgets.push(tagMark.range(token.from, token.to));
        }
        break;

      case 'checklist-box':
        widgets.push(
          Decoration.widget({
            widget: new ChecklistWidget(Boolean(token.checked), token.from),
            side: 1,
          }).range(token.from)
        );
        break;

      case 'inline-strong':
        if (token.from < token.to) widgets.push(strongMark.range(token.from, token.to));
        break;

      case 'inline-emphasis':
        if (token.from < token.to) widgets.push(emphMark.range(token.from, token.to));
        break;

      case 'inline-mark':
        if (token.from < token.to) widgets.push(markMark.range(token.from, token.to));
        break;

      case 'inline-delete':
        if (token.from < token.to) widgets.push(deleteMark.range(token.from, token.to));
        break;

      case 'inline-comment':
        if (token.from < token.to) widgets.push(commentMark.range(token.from, token.to));
        break;

      case 'inline-annotation':
        if (token.from < token.to) widgets.push(annotationMark.range(token.from, token.to));
        break;

      case 'inline-code':
        if (token.from < token.to) widgets.push(codeMark.range(token.from, token.to));
        break;

      case 'inline-raw':
        if (token.from < token.to) widgets.push(rawMark.range(token.from, token.to));
        break;

      case 'inline-link':
        if (token.from < token.to) widgets.push(linkMark.range(token.from, token.to));
        break;

      case 'inline-wiki':
        if (token.from < token.to) widgets.push(wikiMark.range(token.from, token.to));
        break;

      case 'inline-math':
        if (token.from < token.to) widgets.push(mathMark.range(token.from, token.to));
        break;

      case 'inline-footnote':
        widgets.push(
          Decoration.widget({
            widget: new FootnoteBadgeWidget(token.data || '', token.from),
            side: 1,
          }).range(token.to)
        );
        break;

      case 'inline-image':
        widgets.push(
          Decoration.widget({
            widget: new ObjectPillWidget('img', token.from, 'Imagen (clic para editar)', token.data),
            side: 1,
          }).range(token.to)
        );
        break;

      case 'inline-video':
        widgets.push(
          Decoration.widget({
            widget: new ObjectPillWidget('vid', token.from, 'Video', token.data),
            side: 1,
          }).range(token.to)
        );
        break;

      case 'block-toc':
        widgets.push(
          Decoration.widget({
            widget: new ObjectPillWidget('TOC', token.from, 'Tabla de Contenidos'),
            side: 1,
          }).range(token.from)
        );
        break;

      case 'nbsp-microdot':
        widgets.push(
          Decoration.widget({
            widget: new NbspDotWidget(),
            side: 1,
          }).range(token.from)
        );
        break;

      default:
        break;
    }
  }

  // Sort ranges properly for CodeMirror DecorationSet
  return Decoration.set(widgets, true);
}

// ============================================================================
// 3. ViewPlugin Instance
// ============================================================================

export const markdownXlPlugin: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildMarkdownXlDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildMarkdownXlDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// ============================================================================
// 4. Ulysses Smart Lists Auto-Numbering & Auto-Continuation
// ============================================================================

export const smartListsKeymap = Prec.highest(
  keymap.of([
    {
      key: 'Enter',
      run: (view: EditorView): boolean => {
        const state = view.state;
        const sel = state.selection.main;
        if (!sel.empty) return false;

        const line = state.doc.lineAt(sel.head);
        const lineText = line.text;

        // 1. Task List: ^(\s*)(-|\*|\+)\s+\[([ xX])\]\s*(.*)$
        const taskMatch = lineText.match(/^(\s*)([-*+])\s+\[([ xX])\]\s*(.*)$/);
        if (taskMatch) {
          const indent = taskMatch[1];
          const bullet = taskMatch[2];
          const content = taskMatch[4];

          if (content.trim() === '') {
            view.dispatch({
              changes: { from: line.from, to: line.to, insert: '' },
            });
            return true;
          }

          view.dispatch({
            changes: { from: sel.head, insert: `\n${indent}${bullet} [ ] ` },
            selection: { anchor: sel.head + indent.length + 7 },
          });
          return true;
        }

        // 2. Ordered List: ^(\s*)(\d+)\.\s*(.*)$
        const orderedMatch = lineText.match(/^(\s*)(\d+)\.\s*(.*)$/);
        if (orderedMatch) {
          const indent = orderedMatch[1];
          const num = parseInt(orderedMatch[2], 10);
          const content = orderedMatch[3];

          if (content.trim() === '') {
            view.dispatch({
              changes: { from: line.from, to: line.to, insert: '' },
            });
            return true;
          }

          const nextNum = num + 1;
          const insertStr = `\n${indent}${nextNum}. `;
          view.dispatch({
            changes: { from: sel.head, insert: insertStr },
            selection: { anchor: sel.head + insertStr.length },
          });
          return true;
        }

        // 3. Unordered List: ^(\s*)([-*+])\s*(.*)$
        const unorderedMatch = lineText.match(/^(\s*)([-*+])\s*(.*)$/);
        if (unorderedMatch) {
          const indent = unorderedMatch[1];
          const bullet = unorderedMatch[2];
          const content = unorderedMatch[3];

          if (content.trim() === '') {
            view.dispatch({
              changes: { from: line.from, to: line.to, insert: '' },
            });
            return true;
          }

          const insertStr = `\n${indent}${bullet} `;
          view.dispatch({
            changes: { from: sel.head, insert: insertStr },
            selection: { anchor: sel.head + insertStr.length },
          });
          return true;
        }

        // 4. Blockquote: ^(\s*>+)\s*(.*)$
        const quoteMatch = lineText.match(/^(\s*>+)\s*(.*)$/);
        if (quoteMatch) {
          const arrows = quoteMatch[1];
          const content = quoteMatch[2];

          if (content.trim() === '') {
            view.dispatch({
              changes: { from: line.from, to: line.to, insert: '' },
            });
            return true;
          }

          const insertStr = `\n${arrows} `;
          view.dispatch({
            changes: { from: sel.head, insert: insertStr },
            selection: { anchor: sel.head + insertStr.length },
          });
          return true;
        }

        return false;
      },
    },
  ])
);

// ============================================================================
// 5. Ulysses Smart Pairs Auto-Closing & Selection Wrapping Extension
// ============================================================================

const PAIR_MAP: Record<string, string> = {
  '{': '}',
  '[': ']',
  '(': ')',
  '`': '`',
  '~': '~',
  $: '$',
};

export const smartPairsExtension = EditorView.domEventHandlers({
  beforeinput(event: InputEvent, view: EditorView): boolean {
    const data = event.data;
    if (!data) return false;

    const sel = view.state.selection.main;

    // Selection wrapping
    if (!sel.empty) {
      const selected = view.state.sliceDoc(sel.from, sel.to);
      if (PAIR_MAP[data]) {
        event.preventDefault();
        const close = PAIR_MAP[data];
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: `${data}${selected}${close}` },
          selection: { anchor: sel.from + 1, head: sel.to + 1 },
        });
        return true;
      }
      if (data === '*' || data === '_' || data === ':') {
        event.preventDefault();
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: `${data}${selected}${data}` },
          selection: { anchor: sel.from + 1, head: sel.to + 1 },
        });
        return true;
      }
      return false;
    }

    // Auto-close pairs on empty selection
    if (PAIR_MAP[data]) {
      event.preventDefault();
      const close = PAIR_MAP[data];
      view.dispatch({
        changes: { from: sel.head, insert: `${data}${close}` },
        selection: { anchor: sel.head + 1 },
      });
      return true;
    }

    // Double-character Ulysses tags (::, ||, ++, **)
    const prevChar = view.state.sliceDoc(Math.max(0, sel.head - 1), sel.head);
    if (
      (data === ':' && prevChar === ':') ||
      (data === '|' && prevChar === '|') ||
      (data === '+' && prevChar === '+') ||
      (data === '*' && prevChar === '*')
    ) {
      event.preventDefault();
      view.dispatch({
        changes: { from: sel.head, insert: `${data}${data}${data}` },
        selection: { anchor: sel.head + 1 },
      });
      return true;
    }

    return false;
  },
});

// ============================================================================
// 6. Ulysses Standard & Custom Shortcuts Keymap
// ============================================================================

export const odiseaShortcutsKeymap = Prec.high(
  keymap.of([
    // Ctrl+B: Negrita
    {
      key: 'Mod-b',
      run: (view: EditorView): boolean => {
        return wrapOrInsert(view, '**', '**');
      },
    },
    // Ctrl+I: Cursiva
    {
      key: 'Mod-i',
      run: (view: EditorView): boolean => {
        return wrapOrInsert(view, '_', '_');
      },
    },
    // Ctrl+K: Enlace (dispatches link dialog event)
    {
      key: 'Mod-k',
      run: (view: EditorView): boolean => {
        const sel = view.state.selection.main;
        const selected = view.state.sliceDoc(sel.from, sel.to);
        const coords = view.coordsAtPos(sel.from);
        window.dispatchEvent(
          new CustomEvent('odisea:open-link', {
            detail: { text: selected, coords },
          })
        );
        return true;
      },
    },
    // Alt+Space: Espacio protegido con micropunto (\u00A0)
    {
      key: 'Alt-Space',
      run: (view: EditorView): boolean => {
        const sel = view.state.selection.main;
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: '\u00A0' },
          selection: { anchor: sel.from + 1 },
        });
        return true;
      },
    },
    // Shift-Enter: Salto de línea manual (\)
    {
      key: 'Shift-Enter',
      run: (view: EditorView): boolean => {
        const sel = view.state.selection.main;
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: '\\\n' },
          selection: { anchor: sel.from + 2 },
        });
        return true;
      },
    },
    // Mod-1 a Mod-6: Encabezados H1..H6
    {
      key: 'Mod-1',
      run: (view: EditorView): boolean => toggleHeading(view, 1),
    },
    {
      key: 'Mod-2',
      run: (view: EditorView): boolean => toggleHeading(view, 2),
    },
    {
      key: 'Mod-3',
      run: (view: EditorView): boolean => toggleHeading(view, 3),
    },
    {
      key: 'Mod-4',
      run: (view: EditorView): boolean => toggleHeading(view, 4),
    },
    {
      key: 'Mod-5',
      run: (view: EditorView): boolean => toggleHeading(view, 5),
    },
    {
      key: 'Mod-6',
      run: (view: EditorView): boolean => toggleHeading(view, 6),
    },
  ])
);

function wrapOrInsert(view: EditorView, prefix: string, suffix: string): boolean {
  const sel = view.state.selection.main;
  if (!sel.empty) {
    const text = view.state.sliceDoc(sel.from, sel.to);
    view.dispatch({
      changes: { from: sel.from, to: sel.to, insert: `${prefix}${text}${suffix}` },
      selection: { anchor: sel.from + prefix.length, head: sel.to + prefix.length },
    });
    return true;
  }
  view.dispatch({
    changes: { from: sel.head, insert: `${prefix}${suffix}` },
    selection: { anchor: sel.head + prefix.length },
  });
  return true;
}

function toggleHeading(view: EditorView, level: number): boolean {
  const sel = view.state.selection.main;
  const line = view.state.doc.lineAt(sel.head);
  const hashes = '#'.repeat(level) + ' ';

  const existingMatch = line.text.match(/^(#{1,6})\s+/);
  if (existingMatch) {
    if (existingMatch[1].length === level) {
      view.dispatch({
        changes: { from: line.from, to: line.from + existingMatch[0].length, insert: '' },
      });
      return true;
    }
    view.dispatch({
      changes: { from: line.from, to: line.from + existingMatch[0].length, insert: hashes },
    });
    return true;
  }

  view.dispatch({
    changes: { from: line.from, insert: hashes },
  });
  return true;
}
