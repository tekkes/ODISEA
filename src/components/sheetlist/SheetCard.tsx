import React from 'react';
import { Sheet } from '../../store/useOdiseaStore';
import { GlueIndicator } from './GlueIndicator';
import { GoalRingSVG } from './GoalRingSVG';
import { Star, Send } from 'lucide-react';

interface SheetCardProps {
  sheet: Sheet;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleGlue: () => void;
}

export const SheetCard: React.FC<SheetCardProps> = ({
  sheet,
  isSelected,
  onSelect,
  onToggleFavorite,
  onToggleGlue,
}) => {
  // Extract excerpt: strip markdown symbols and take first 2 lines
  const cleanExcerpt = React.useMemo(() => {
    if (!sheet.content_mdxl) return 'Sin contenido adicional...';
    const lines = sheet.content_mdxl
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));
    return lines.slice(0, 2).join(' ').replace(/[#*`_~|]/g, '') || 'Hoja vacía';
  }, [sheet.content_mdxl]);

  // Parse writing goal if any
  const goal = React.useMemo(() => {
    if (!sheet.writing_goal_json) return null;
    try {
      return JSON.parse(sheet.writing_goal_json);
    } catch {
      return null;
    }
  }, [sheet.writing_goal_json]);

  // Parse publication status
  const publishStatus = React.useMemo(() => {
    if (!sheet.publish_status_json) return null;
    try {
      return JSON.parse(sheet.publish_status_json);
    } catch {
      return null;
    }
  }, [sheet.publish_status_json]);

  // Extract inline keywords/tags if present in content
  const keywords = React.useMemo(() => {
    if (!sheet.content_mdxl) return [];
    const matches = sheet.content_mdxl.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g);
    if (!matches) return [];
    // Filter out standard Markdown headings (e.g. # Heading)
    const validTags = matches
      .filter((t) => !sheet.content_mdxl.includes(`${t} `))
      .map((t) => t.replace('#', ''));
    return Array.from(new Set(validTags)).slice(0, 3);
  }, [sheet.content_mdxl]);

  // Format date nicely
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(sheet.updated_at);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  }, [sheet.updated_at]);

  // Approximate word count for goal ring
  const wordCount = React.useMemo(() => {
    if (!sheet.content_mdxl) return 0;
    return sheet.content_mdxl.trim().split(/\s+/).filter(Boolean).length;
  }, [sheet.content_mdxl]);

  return (
    <div
      onClick={onSelect}
      data-sheet-id={sheet.id}
      className={`relative p-3 border-b border-[var(--color-border)] cursor-pointer transition-colors group ${
        isSelected
          ? 'bg-[var(--color-bg-hover)] border-l-2 border-l-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
          : 'hover:bg-[var(--color-bg-secondary)]'
      }`}
    >
      {/* Title & Metadata Top Row */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] truncate flex-1">
          {sheet.title || 'Hoja sin título'}
        </h4>

        <div className="flex items-center gap-1.5 shrink-0">
          {goal && (
            <GoalRingSVG current={wordCount} target={goal.target_words || 500} size={14} />
          )}

          {publishStatus && (
            <span
              title={publishStatus.platform ? `Publicado en ${publishStatus.platform}` : 'Publicado'}
              className="micro-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5"
            >
              <Send size={10} strokeWidth={1.5} className="micro-icon !w-2.5 !h-2.5 rotate-45" />
              <span>{publishStatus.platform ? publishStatus.platform.slice(0, 4) : 'Pub'}</span>
            </span>
          )}

          {sheet.is_material && (
            <span
              title="Hoja de material / investigación"
              className="micro-badge bg-amber-500/20 text-amber-500 font-medium"
            >
              Mat
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-0.5 rounded transition-colors ${
              sheet.is_favorite
                ? 'text-amber-400'
                : 'text-transparent group-hover:text-[var(--color-text-muted)] hover:text-amber-400'
            }`}
            title="Marcar como favorita"
          >
            <Star
              size={12}
              strokeWidth={1.5}
              className="micro-icon"
              fill={sheet.is_favorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Snippet Excerpt */}
      <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-2 mb-2">
        {cleanExcerpt}
      </p>

      {/* Keywords / Tags Row (Micro-Pills) */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="micro-keyword bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info Row */}
      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
        <span>{formattedDate}</span>
        <div className="flex items-center gap-2">
          <span>{wordCount} palabras</span>
          <GlueIndicator
            isGlued={sheet.glued_with_next}
            onClick={onToggleGlue}
          />
        </div>
      </div>
    </div>
  );
};
