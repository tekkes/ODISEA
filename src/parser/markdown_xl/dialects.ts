/**
 * Odisea Markup Dialect System & Bidirectional Converter
 * Supports: Markdown XL, CommonMark/GFM Markdown, Minimark, and Textil'd
 * Operates on "Edit > Convert Markup" and Sheet Settings
 */

export type MarkupDialect = 'markdown_xl' | 'markdown' | 'minimark' | 'textild';

export interface DialectDefinition {
  id: MarkupDialect;
  name: string;
  description: string;
  supportsComments: boolean;
  supportsAnnotations: boolean;
  supportsRedact: boolean;
  supportsFootnotes: boolean;
  supportsMath: boolean;
}

export const DIALECTS: Record<MarkupDialect, DialectDefinition> = {
  markdown_xl: {
    id: 'markdown_xl',
    name: 'Markdown XL',
    description: 'Dialecto canónico de Ulysses y Odisea con las 28 etiquetas semánticas completas.',
    supportsComments: true,
    supportsAnnotations: true,
    supportsRedact: true,
    supportsFootnotes: true,
    supportsMath: true,
  },
  markdown: {
    id: 'markdown',
    name: 'Markdown Estándar (CommonMark / GFM)',
    description: 'Compatibilidad estándar con CommonMark y GitHub Flavored Markdown.',
    supportsComments: false,
    supportsAnnotations: false,
    supportsRedact: false,
    supportsFootnotes: true,
    supportsMath: true,
  },
  minimark: {
    id: 'minimark',
    name: 'Minimark',
    description: 'Conjunto minimalista simplificado sin anotaciones ni comentarios.',
    supportsComments: false,
    supportsAnnotations: false,
    supportsRedact: false,
    supportsFootnotes: false,
    supportsMath: false,
  },
  textild: {
    id: 'textild',
    name: "Textil'd",
    description: 'Dialecto clásico con delimitadores tipo Textile (*bold*, _italic_, -delete-).',
    supportsComments: false,
    supportsAnnotations: false,
    supportsRedact: false,
    supportsFootnotes: false,
    supportsMath: false,
  },
};

/**
 * Bidirectional conversion between Markdown dialects (Edit > Convert Markup)
 */
export function convertMarkup(
  content: string,
  fromDialect: MarkupDialect,
  toDialect: MarkupDialect
): string {
  if (fromDialect === toDialect) {
    return content;
  }

  let result = content;

  // ---------------------------------------------------------------------------
  // Step 1: Normalize source dialect into canonical Markdown XL tokens
  // ---------------------------------------------------------------------------
  if (fromDialect === 'markdown') {
    // Strikethrough: ~~text~~ -> ||text||
    result = result.replace(/~~(.*?)~~/g, '||$1||');
    // Highlight: ==text== or <mark>text</mark> -> ::text::
    result = result.replace(/<mark>(.*?)<\/mark>/gi, '::$1::');
    result = result.replace(/==(.*?)==/g, '::$1::');
    // HTML Comments: <!-- comment --> -> %% comment
    result = result.replace(/<!--\s*([\s\S]*?)\s*-->/g, (_, c) => {
      if (c.includes('\n')) {
        return c
          .split('\n')
          .map((line: string) => `%% ${line.trim()}`)
          .join('\n');
      }
      return `%% ${c.trim()}`;
    });
    // GFM Footnotes: [^1]: text and [^1] -> (fn: text)
    result = result.replace(/\[\^([^\]]+)\]/g, '(fn: $1)');
  } else if (fromDialect === 'textild') {
    // Textile Delete: -text- -> ||text||
    result = result.replace(/(^|[\s(])-(.*?)-(?=[)\s.,;!?]|$)/g, '$1||$2||');
    // Textile Strong: *text* -> **text**
    result = result.replace(/(^|[\s(])\*(.*?)\*(?=[)\s.,;!?]|$)/g, '$1**$2**');
    // Textile Code: @code@ -> `code`
    result = result.replace(/(^|[\s(])@(.*?)@(?=[)\s.,;!?]|$)/g, '$1`$2`');
  } else if (fromDialect === 'minimark') {
    // Footnote reference normalization
    result = result.replace(/\[\^(.*?)\]/g, '(fn: $1)');
  }

  // ---------------------------------------------------------------------------
  // Step 2: Convert from canonical Markdown XL tokens into target dialect
  // ---------------------------------------------------------------------------
  if (toDialect === 'markdown') {
    // Delete/Redact: ||text|| -> ~~text~~
    result = result.replace(/\|\|(.*?)\|\|/g, '~~$1~~');
    // Highlight: ::text:: -> <mark>text</mark>
    result = result.replace(/::(.*?)::/g, '<mark>$1</mark>');
    // Private Comments: ++text++ -> <!-- comment: text -->
    result = result.replace(/\+\+(.*?)\+\+/g, '<!-- $1 -->');
    // Block Comments: %% text -> <!-- text -->
    result = result.replace(/^%%\s*(.*)$/gm, '<!-- $1 -->');
    // Annotations: {text|note} -> text ([^note])
    result = result.replace(/\{(.*?)\|(.*?)\}/g, '$1 [^$2]');
    result = result.replace(/\{(.*?)\}/g, '$1');
    // Verse: |" text -> > text
    result = result.replace(/^\|\s*\"\s*(.*)$/gm, '> $1');
    // Ulysses code block '' -> ```
    result = result.replace(/^''([a-zA-Z0-9_\-\+]*)$/gm, '```$1');
  } else if (toDialect === 'textild') {
    // Strong: **text** -> *text*
    result = result.replace(/\*\*(.*?)\*\*/g, '*$1*');
    // Delete: ||text|| -> -text-
    result = result.replace(/\|\|(.*?)\|\|/g, '-$1-');
    // Inline Code: `text` -> @text@
    result = result.replace(/`([^`]+)`/g, '@$1@');
    // Annotations: strip markers
    result = result.replace(/\{(.*?)(?:\|.*?)?\}/g, '$1');
    // Comments: strip
    result = result.replace(/\+\+(.*?)\+\+/g, '');
    result = result.replace(/^%%\s*.*$/gm, '');
    // Verse: |" -> "
    result = result.replace(/^\|\s*\"\s*(.*)$/gm, '" $1');
  } else if (toDialect === 'minimark') {
    // Strip annotations, private comments and internal links
    result = result.replace(/\|\|(.*?)\|\|/g, '$1');
    result = result.replace(/::(.*?)::/g, '$1');
    result = result.replace(/\+\+(.*?)\+\+/g, '');
    result = result.replace(/^%%\s*.*$/gm, '');
    result = result.replace(/\{(.*?)(?:\|.*?)?\}/g, '$1');
    result = result.replace(/\(fn:?\s*(.*?)\)/g, '($1)');
    result = result.replace(/\(vid:?\s*(.*?)\)/g, '[$1]($1)');
    result = result.replace(/\(toc\)/g, '');
  }

  return result;
}
