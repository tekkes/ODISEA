import React from 'react';
import { Paperclip, Link2 } from 'lucide-react';

interface GlueIndicatorProps {
  isGlued: boolean;
  onClick?: () => void;
  className?: string;
}

export const GlueIndicator: React.FC<GlueIndicatorProps> = ({
  isGlued,
  onClick,
  className = '',
}) => {
  if (!isGlued) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      title="Hojas pegadas (se exportan y leen como una sola secuencia)"
      className={`flex items-center justify-center cursor-pointer text-[var(--color-accent)] opacity-80 hover:opacity-100 ${className}`}
    >
      <div className="h-3.5 w-0.5 bg-[var(--color-accent)] rounded-full mr-1" />
      <Link2 size={12} className="micro-icon" />
    </div>
  );
};
