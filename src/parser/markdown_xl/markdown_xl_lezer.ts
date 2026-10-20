/**
 * Odisea WYSIWYM Markdown XL Lexer & Tokenizer
 * Conforms to .rea_evidence/markdown_xl_grammar.ebnf
 * Recognizes all 28 canonical tags and separates 'ulysses-tag' syntax delimiters from semantic content.
 */

export type MarkdownXlTokenType =
  | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6'
  | 'block-quote' | 'block-verse' | 'block-comment' | 'block-code' | 'block-raw'
  | 'block-table' | 'block-divider' | 'block-toc' | 'block-math'
  | 'list-unordered' | 'list-ordered' | 'list-task'
  | 'inline-strong' | 'inline-emphasis' | 'inline-mark' | 'inline-delete'
  | 'inline-comment' | 'inline-annotation' | 'inline-code' | 'inline-raw'
  | 'inline-link' | 'inline-wiki' | 'inline-footnote' | 'inline-image' | 'inline-video' | 'inline-math'
  | 'ulysses-tag' | 'checklist-box' | 'nbsp-microdot' | 'line-break';

export interface MarkdownXlToken {
  type: MarkdownXlTokenType;
  from: number;
  to: number;
  text?: string;
  level?: number;
  checked?: boolean;
  data?: string;
}

export interface ScanResult {
  tokens: MarkdownXlToken[];
  lineStyles: {
    lineIndex: number;
    from: number;
    to: number;
    className: string;
    headingLevel?: number;
    quoteLevel?: number;
    isCode?: boolean;
    isRaw?: boolean;
    isComment?: boolean;
    isVerse?: boolean;
    isDivider?: boolean;
  }[];
}

export class MarkdownXlScanner {
  /**
   * Scans document content into semantic tokens and line styles
   */
  public static scan(content: string): ScanResult {
    const tokens: MarkdownXlToken[] = [];
    const lineStyles: ScanResult['lineStyles'] = [];
    const lines = content.split(/\r?\n/);
    let offset = 0;

    let inCodeBlock = false;
    let codeBlockDelim = '';
    let inRawBlock = false;
    let inMathBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLen = line.length;
      const lineFrom = offset;
      const lineTo = offset + lineLen;

      // Check multi-line block states
      if (inCodeBlock) {
        if (line.trim() === codeBlockDelim) {
          // Closing code fence
          tokens.push({
            type: 'ulysses-tag',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-code-fence opacity-50',
            isCode: true,
          });
          inCodeBlock = false;
          codeBlockDelim = '';
        } else {
          // Code line
          tokens.push({
            type: 'block-code',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-code-line font-mono bg-zinc-100/70 dark:bg-zinc-900/50 text-[13.5px] px-2 text-emerald-700 dark:text-emerald-400',
            isCode: true,
          });
        }
        offset += lineLen + 1;
        continue;
      }

      if (inRawBlock) {
        if (line.trim() === '~~') {
          // Closing raw fence
          tokens.push({
            type: 'ulysses-tag',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-raw-fence opacity-50',
            isRaw: true,
          });
          inRawBlock = false;
        } else {
          tokens.push({
            type: 'block-raw',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-raw-line font-mono bg-amber-50/50 dark:bg-amber-950/20 text-[13.5px] px-2 text-amber-700 dark:text-amber-400',
            isRaw: true,
          });
        }
        offset += lineLen + 1;
        continue;
      }

      if (inMathBlock) {
        if (line.trim() === '$$') {
          // Closing math fence
          tokens.push({
            type: 'ulysses-tag',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-math-fence opacity-50',
          });
          inMathBlock = false;
        } else {
          tokens.push({
            type: 'block-math',
            from: lineFrom,
            to: lineTo,
            text: line,
          });
          lineStyles.push({
            lineIndex: i,
            from: lineFrom,
            to: lineTo,
            className: 'cm-math-line font-mono bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 px-2',
          });
        }
        offset += lineLen + 1;
        continue;
      }

      // 1. Headings (H1 to H6)
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const hashes = headingMatch[1];
        const headingText = headingMatch[2];
        const level = hashes.length;
        const headingType = `heading-${level}` as MarkdownXlTokenType;

        // Syntax delimiter: '# '
        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom,
          to: lineFrom + hashes.length + 1,
          text: hashes + ' ',
        });

        // Content
        tokens.push({
          type: headingType,
          from: lineFrom + hashes.length + 1,
          to: lineTo,
          text: headingText,
          level,
        });

        // Scan inlines inside heading text
        this.scanInlines(headingText, lineFrom + hashes.length + 1, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: `cm-heading cm-heading-${level}`,
          headingLevel: level,
        });

        offset += lineLen + 1;
        continue;
      }

      // 2. Blockquote (single and multilevel: '>', '>>', '> >')
      const quoteMatch = line.match(/^(\s*)(>+)\s*(.*)$/);
      if (quoteMatch) {
        const indent = quoteMatch[1];
        const arrows = quoteMatch[2];
        const quoteText = quoteMatch[3];
        const quoteLevel = arrows.length;

        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom + indent.length,
          to: lineFrom + indent.length + arrows.length + 1,
          text: arrows + ' ',
        });

        tokens.push({
          type: 'block-quote',
          from: lineFrom + indent.length + arrows.length + 1,
          to: lineTo,
          text: quoteText,
          level: quoteLevel,
        });

        this.scanInlines(quoteText, lineFrom + indent.length + arrows.length + 1, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: `cm-quote cm-quote-level-${quoteLevel}`,
          quoteLevel,
        });

        offset += lineLen + 1;
        continue;
      }

      // 3. Verse block (Ulysses |" )
      const verseMatch = line.match(/^(\s*)\|\"\s*(.*)$/);
      if (verseMatch) {
        const indent = verseMatch[1];
        const verseText = verseMatch[2];

        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom + indent.length,
          to: lineFrom + indent.length + 3,
          text: '|" ',
        });

        tokens.push({
          type: 'block-verse',
          from: lineFrom + indent.length + 3,
          to: lineTo,
          text: verseText,
        });

        this.scanInlines(verseText, lineFrom + indent.length + 3, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-verse border-l-2 border-purple-400/80 pl-3 italic text-[var(--color-text-secondary)]',
          isVerse: true,
        });

        offset += lineLen + 1;
        continue;
      }

      // 4. Comment Block: '%%'
      const commentMatch = line.match(/^(\s*)%%(\s*)(.*)$/);
      if (commentMatch) {
        const indent = commentMatch[1];
        const commentContent = commentMatch[3];

        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom + indent.length,
          to: lineFrom + indent.length + 2 + commentMatch[2].length,
          text: '%%' + commentMatch[2],
        });

        tokens.push({
          type: 'block-comment',
          from: lineFrom + indent.length + 2 + commentMatch[2].length,
          to: lineTo,
          text: commentContent,
        });

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-comment opacity-60 italic text-zinc-500 dark:text-zinc-400 select-none',
          isComment: true,
        });

        offset += lineLen + 1;
        continue;
      }

      // 5. Code block start: ''lang or ```lang
      const codeStartMatch = line.match(/^(''|```)([a-zA-Z0-9_\-\+]*)$/);
      if (codeStartMatch) {
        inCodeBlock = true;
        codeBlockDelim = codeStartMatch[1];
        const lang = codeStartMatch[2];

        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom,
          to: lineTo,
          text: line,
          data: lang,
        });

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-code-fence opacity-50',
          isCode: true,
        });

        offset += lineLen + 1;
        continue;
      }

      // 6. Raw block start: ~~
      if (line.trim() === '~~') {
        inRawBlock = true;
        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom,
          to: lineTo,
          text: line,
        });
        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-raw-fence opacity-50',
          isRaw: true,
        });
        offset += lineLen + 1;
        continue;
      }

      // 7. Math block start: $$
      if (line.trim() === '$$') {
        inMathBlock = true;
        tokens.push({
          type: 'ulysses-tag',
          from: lineFrom,
          to: lineTo,
          text: line,
        });
        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-math-fence opacity-50',
        });
        offset += lineLen + 1;
        continue;
      }

      // 8. Divider: '----', '====', '****'
      if (/^(\-{4,}|\={4,}|\*{4,})$/.test(line.trim())) {
        tokens.push({
          type: 'block-divider',
          from: lineFrom,
          to: lineTo,
          text: line,
        });

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-divider my-2 border-b border-[var(--color-border)] select-none text-transparent',
          isDivider: true,
        });

        offset += lineLen + 1;
        continue;
      }

      // 9. Table of Contents: '(toc)'
      if (line.trim() === '(toc)') {
        tokens.push({
          type: 'block-toc',
          from: lineFrom,
          to: lineTo,
          text: line,
        });

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-toc-block py-1',
        });

        offset += lineLen + 1;
        continue;
      }

      // 10. Checklist / Task list: '- [ ] ' or '- [x] '
      const taskMatch = line.match(/^(\s*)(-|\*|\+)\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const indent = taskMatch[1];
        const isChecked = taskMatch[3].toLowerCase() === 'x';
        const taskText = taskMatch[4];
        const boxStart = lineFrom + indent.length;
        const boxEnd = boxStart + taskMatch[2].length + 4; // "- [ ] " is 6 chars

        tokens.push({
          type: 'checklist-box',
          from: boxStart,
          to: boxEnd,
          checked: isChecked,
          text: taskMatch[0].substring(indent.length, indent.length + taskMatch[2].length + 5),
        });

        tokens.push({
          type: 'list-task',
          from: boxEnd,
          to: lineTo,
          text: taskText,
          checked: isChecked,
        });

        this.scanInlines(taskText, boxEnd, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: `cm-task-item ${isChecked ? 'line-through opacity-60' : ''}`,
        });

        offset += lineLen + 1;
        continue;
      }

      // 11. Ordered list: '1. ' with smart numbering
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        const indent = orderedMatch[1];
        const numStr = orderedMatch[2];
        const itemText = orderedMatch[3];
        const numStart = lineFrom + indent.length;
        const numEnd = numStart + numStr.length + 2;

        tokens.push({
          type: 'ulysses-tag',
          from: numStart,
          to: numEnd,
          text: `${numStr}. `,
        });

        tokens.push({
          type: 'list-ordered',
          from: numEnd,
          to: lineTo,
          text: itemText,
          level: parseInt(numStr, 10),
        });

        this.scanInlines(itemText, numEnd, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-ordered-list-item pl-2',
        });

        offset += lineLen + 1;
        continue;
      }

      // 12. Unordered list: '- ', '* ', '+ '
      const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
      if (unorderedMatch) {
        const indent = unorderedMatch[1];
        const bullet = unorderedMatch[2];
        const itemText = unorderedMatch[3];
        const bulletStart = lineFrom + indent.length;
        const bulletEnd = bulletStart + 2;

        tokens.push({
          type: 'ulysses-tag',
          from: bulletStart,
          to: bulletEnd,
          text: `${bullet} `,
        });

        tokens.push({
          type: 'list-unordered',
          from: bulletEnd,
          to: lineTo,
          text: itemText,
        });

        this.scanInlines(itemText, bulletEnd, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-unordered-list-item pl-2',
        });

        offset += lineLen + 1;
        continue;
      }

      // 13. Table row: starts and ends with '|' or is '(tbl)'
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        tokens.push({
          type: 'block-table',
          from: lineFrom,
          to: lineTo,
          text: line,
        });

        // Scan inlines within table cells
        this.scanInlines(line, lineFrom, tokens);

        lineStyles.push({
          lineIndex: i,
          from: lineFrom,
          to: lineTo,
          className: 'cm-table-row font-mono text-[13.5px]',
        });

        offset += lineLen + 1;
        continue;
      }

      // 14. Regular paragraph with inlines
      this.scanInlines(line, lineFrom, tokens);

      offset += lineLen + 1;
    }

    return { tokens, lineStyles };
  }

  /**
   * Scans all inline elements and delimiters in a text segment:
   * Strong, Emphasis, Mark, Delete/Redact, Inline Comment, Annotation, Inline Code,
   * Inline Raw, Links, Wiki-links, Footnotes, Media, Math, Non-breaking space, Line breaks.
   */
  public static scanInlines(text: string, baseOffset: number, tokens: MarkdownXlToken[]): void {
    if (!text) return;

    // 1. Math formulas ($...$)
    this.matchDelimited(text, baseOffset, tokens, /\$([^\$\n]+)\$/g, 'inline-math', '$', '$');

    // 2. Strong & Emphasis
    // Bold: **text** or __text__
    this.matchDelimited(text, baseOffset, tokens, /\*\*([^\*\n]+)\*\*/g, 'inline-strong', '**', '**');
    this.matchDelimited(text, baseOffset, tokens, /__([^_\n]+)__/g, 'inline-strong', '__', '__');

    // Italic: _text_ or *text* (excluding already matched **)
    this.matchDelimited(text, baseOffset, tokens, /(?<!\*)\*([^\*\n]+)\*(?!\*)/g, 'inline-emphasis', '*', '*');
    this.matchDelimited(text, baseOffset, tokens, /(?<!_)_([^_\n]+)_(?!_)/g, 'inline-emphasis', '_', '_');

    // 3. Mark / Highlight: ::text:: or ==text==
    this.matchDelimited(text, baseOffset, tokens, /::([^:\n]+)::/g, 'inline-mark', '::', '::');
    this.matchDelimited(text, baseOffset, tokens, /==([^=\n]+)==/g, 'inline-mark', '==', '==');

    // 4. Delete / Redact: ||text||
    this.matchDelimited(text, baseOffset, tokens, /\|\|([^\|\n]+)\|\|/g, 'inline-delete', '||', '||');

    // 5. Inline Comment: ++text++
    this.matchDelimited(text, baseOffset, tokens, /\+\+([^\+\n]+)\+\+/g, 'inline-comment', '++', '++');

    // 6. Annotation: {text} or {text|note}
    const annotRegex = /\{([^{}\n]+)\}/g;
    let annotMatch;
    while ((annotMatch = annotRegex.exec(text)) !== null) {
      const fullFrom = baseOffset + annotMatch.index;
      const fullTo = fullFrom + annotMatch[0].length;
      const inner = annotMatch[1];

      // Delimiter '{'
      tokens.push({
        type: 'ulysses-tag',
        from: fullFrom,
        to: fullFrom + 1,
        text: '{',
      });

      tokens.push({
        type: 'inline-annotation',
        from: fullFrom + 1,
        to: fullTo - 1,
        text: inner,
      });

      // Delimiter '}'
      tokens.push({
        type: 'ulysses-tag',
        from: fullTo - 1,
        to: fullTo,
        text: '}',
      });
    }

    // 7. Inline Code: `code`
    this.matchDelimited(text, baseOffset, tokens, /`([^`\n]+)`/g, 'inline-code', '`', '`');

    // 8. Inline Raw: ~raw~
    this.matchDelimited(text, baseOffset, tokens, /(?<!~)~([^~\n]+)~(?!~)/g, 'inline-raw', '~', '~');

    // 9. Internal Wiki-Links: [[Sheet#Header]] or [[Sheet]]
    const wikiRegex = /\[\[([^\]\n]+)\]\]/g;
    let wikiMatch;
    while ((wikiMatch = wikiRegex.exec(text)) !== null) {
      const fullFrom = baseOffset + wikiMatch.index;
      const fullTo = fullFrom + wikiMatch[0].length;

      tokens.push({
        type: 'ulysses-tag',
        from: fullFrom,
        to: fullFrom + 2,
        text: '[[',
      });

      tokens.push({
        type: 'inline-wiki',
        from: fullFrom + 2,
        to: fullTo - 2,
        text: wikiMatch[1],
      });

      tokens.push({
        type: 'ulysses-tag',
        from: fullTo - 2,
        to: fullTo,
        text: ']]',
      });
    }

    // 10. Links: [text](url) or [text]
    const linkRegex = /\[([^\]\n]+)\](?:\(([^)\n]+)\))?/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      // Avoid colliding with internal wiki links
      if (text[linkMatch.index - 1] === '[' || text[linkMatch.index + linkMatch[0].length] === ']') {
        continue;
      }
      const fullFrom = baseOffset + linkMatch.index;
      const fullTo = fullFrom + linkMatch[0].length;
      const linkLabel = linkMatch[1];
      const linkUrl = linkMatch[2];

      tokens.push({
        type: 'ulysses-tag',
        from: fullFrom,
        to: fullFrom + 1,
        text: '[',
      });

      tokens.push({
        type: 'inline-link',
        from: fullFrom + 1,
        to: fullFrom + 1 + linkLabel.length,
        text: linkLabel,
        data: linkUrl,
      });

      tokens.push({
        type: 'ulysses-tag',
        from: fullFrom + 1 + linkLabel.length,
        to: fullTo,
        text: text.substring(linkMatch.index + 1 + linkLabel.length, linkMatch.index + linkMatch[0].length),
      });
    }

    // 11. Footnote: (fn) or (fn: payload)
    const fnRegex = /\(fn(?::\s*([^)\n]+))?\)/g;
    let fnMatch;
    while ((fnMatch = fnRegex.exec(text)) !== null) {
      const fullFrom = baseOffset + fnMatch.index;
      const fullTo = fullFrom + fnMatch[0].length;
      tokens.push({
        type: 'inline-footnote',
        from: fullFrom,
        to: fullTo,
        text: fnMatch[0],
        data: fnMatch[1] || '',
      });
    }

    // 12. Media: (img: path), (img), (vid: url), (vid), ![alt](url)
    const imgRegex = /(?:\(img(?::\s*([^)\n]+))?\)|!\[([^\]\n]*)\]\(([^)\n]+)\))/g;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(text)) !== null) {
      const fullFrom = baseOffset + imgMatch.index;
      const fullTo = fullFrom + imgMatch[0].length;
      tokens.push({
        type: 'inline-image',
        from: fullFrom,
        to: fullTo,
        text: imgMatch[0],
        data: imgMatch[1] || imgMatch[3] || '',
      });
    }

    const vidRegex = /\(vid(?::\s*([^)\n]+))?\)/g;
    let vidMatch;
    while ((vidMatch = vidRegex.exec(text)) !== null) {
      const fullFrom = baseOffset + vidMatch.index;
      const fullTo = fullFrom + vidMatch[0].length;
      tokens.push({
        type: 'inline-video',
        from: fullFrom,
        to: fullTo,
        text: vidMatch[0],
        data: vidMatch[1] || '',
      });
    }

    // 13. Non-breaking space (Alt+Space: \u00A0)
    const nbspRegex = /\u00A0/g;
    let nbspMatch;
    while ((nbspMatch = nbspRegex.exec(text)) !== null) {
      tokens.push({
        type: 'nbsp-microdot',
        from: baseOffset + nbspMatch.index,
        to: baseOffset + nbspMatch.index + 1,
        text: '\u00A0',
      });
    }

    // 14. Manual line break ('\' at end of line)
    const brRegex = /\\$/g;
    let brMatch;
    if ((brMatch = brRegex.exec(text)) !== null) {
      tokens.push({
        type: 'line-break',
        from: baseOffset + brMatch.index,
        to: baseOffset + brMatch.index + 1,
        text: '\\',
      });
    }
  }

  /**
   * Helper to scan a delimited pattern and produce:
   * 1. opening ulysses-tag
   * 2. semantic content token
   * 3. closing ulysses-tag
   */
  private static matchDelimited(
    text: string,
    baseOffset: number,
    tokens: MarkdownXlToken[],
    regex: RegExp,
    type: MarkdownXlTokenType,
    openDelim: string,
    closeDelim: string
  ): void {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const fullFrom = baseOffset + match.index;
      const fullTo = fullFrom + match[0].length;
      const content = match[1];

      // Opening tag delimiter
      tokens.push({
        type: 'ulysses-tag',
        from: fullFrom,
        to: fullFrom + openDelim.length,
        text: openDelim,
      });

      // Semantic content
      tokens.push({
        type,
        from: fullFrom + openDelim.length,
        to: fullTo - closeDelim.length,
        text: content,
      });

      // Closing tag delimiter
      tokens.push({
        type: 'ulysses-tag',
        from: fullTo - closeDelim.length,
        to: fullTo,
        text: closeDelim,
      });
    }
  }
}
