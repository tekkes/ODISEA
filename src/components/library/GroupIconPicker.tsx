import React from 'react';
import {
  Folder, Book, Bookmark, FileText, Star, Tag, Archive, Compass, Feather,
  PenTool, Shield, Sparkles, Coffee, Globe, Heart, Check
} from 'lucide-react';

interface GroupIconPickerProps {
  currentIcon: string;
  currentColor: string;
  onSelect: (icon: string, color: string) => void;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'folder', Icon: Folder },
  { name: 'book', Icon: Book },
  { name: 'bookmark', Icon: Bookmark },
  { name: 'file-text', Icon: FileText },
  { name: 'star', Icon: Star },
  { name: 'tag', Icon: Tag },
  { name: 'archive', Icon: Archive },
  { name: 'compass', Icon: Compass },
  { name: 'feather', Icon: Feather },
  { name: 'pen-tool', Icon: PenTool },
  { name: 'shield', Icon: Shield },
  { name: 'sparkles', Icon: Sparkles },
  { name: 'coffee', Icon: Coffee },
  { name: 'globe', Icon: Globe },
  { name: 'heart', Icon: Heart },
];

const AVAILABLE_COLORS = [
  '#0a84ff', '#30d158', '#ffd60a', '#ff9f0a', '#ff453a',
  '#bf5af2', '#5e5ce6', '#64d2ff', '#a2845e', '#8e8e93',
];

export const GroupIconPicker: React.FC<GroupIconPickerProps> = ({
  currentIcon,
  currentColor,
  onSelect,
  onClose,
}) => {
  const [selectedIcon, setSelectedIcon] = React.useState(currentIcon);
  const [selectedColor, setSelectedColor] = React.useState(currentColor);

  const handleApply = () => {
    onSelect(selectedIcon, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-80 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <h3 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
            Icono y Color de Grupo
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>

        {/* Color Palette */}
        <div className="mt-3">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Color de distintivo</span>
          <div className="grid grid-cols-5 gap-2 mt-1.5">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className="h-6 w-6 rounded-full flex items-center justify-center border transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: selectedColor === color ? '#ffffff' : 'transparent',
                }}
              >
                {selectedColor === color && <Check size={12} className="text-white micro-icon" />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="mt-4">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Icono</span>
          <div className="grid grid-cols-5 gap-2 mt-1.5">
            {AVAILABLE_ICONS.map(({ name, Icon }) => {
              const isSelected = selectedIcon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`h-8 w-8 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-selection-bg)] border-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <Icon size={14} className="micro-icon" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 text-xs font-semibold rounded bg-[var(--color-accent)] text-white hover:brightness-110"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
