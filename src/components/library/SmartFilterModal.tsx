import React, { useState } from 'react';
import { Filter, Plus, Trash2, Check } from 'lucide-react';
import { invokeCommand } from '../../store/tauri_ipc';

interface FilterRule {
  field: 'text' | 'keyword' | 'status' | 'date_modified';
  operator: 'contains' | 'equals' | 'is_before' | 'is_after';
  value: string;
}

interface SmartFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (filterData: { name: string; rules: FilterRule[]; matchAll: boolean }) => void;
}

export const SmartFilterModal: React.FC<SmartFilterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [filterName, setFilterName] = useState('Nuevo Filtro Inteligente');
  const [matchAll, setMatchAll] = useState(true);
  const [rules, setRules] = useState<FilterRule[]>([
    { field: 'keyword', operator: 'contains', value: '' },
  ]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules([...rules, { field: 'text', operator: 'contains', value: '' }]);
  };

  const handleRemoveRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const handleRuleChange = (index: number, updated: Partial<FilterRule>) => {
    const next = [...rules];
    next[index] = { ...next[index], ...updated };
    setRules(next);
  };

  const handleSave = async () => {
    const filterDefinition = {
      name: filterName,
      rules,
      matchAll,
    };

    try {
      await invokeCommand('create_filter', {
        name: filterName,
        icon: 'filter',
        color: '#0a84ff',
        rulesJson: JSON.stringify(filterDefinition),
      });
    } catch {
      // Handled gracefully in offline/mock mode
    }

    if (onSave) {
      onSave(filterDefinition);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-[460px] rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-5 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
          <Filter size={15} className="text-[var(--color-accent)] micro-icon" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Configurar Filtro Inteligente
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">
              Nombre del Filtro
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span>Coincidir con</span>
            <select
              value={matchAll ? 'all' : 'any'}
              onChange={(e) => setMatchAll(e.target.value === 'all')}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
            >
              <option value="all">todas las condiciones (AND)</option>
              <option value="any">cualquiera de las condiciones (OR)</option>
            </select>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={rule.field}
                  onChange={(e) =>
                    handleRuleChange(idx, { field: e.target.value as FilterRule['field'] })
                  }
                  className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
                >
                  <option value="keyword">Palabra clave</option>
                  <option value="text">Texto completo</option>
                  <option value="status">Estado</option>
                  <option value="date_modified">Fecha de modificación</option>
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) =>
                    handleRuleChange(idx, { operator: e.target.value as FilterRule['operator'] })
                  }
                  className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
                >
                  <option value="contains">contiene</option>
                  <option value="equals">es exactamente</option>
                  <option value="is_before">antes de</option>
                  <option value="is_after">después de</option>
                </select>

                <input
                  type="text"
                  placeholder="Valor..."
                  value={rule.value}
                  onChange={(e) => handleRuleChange(idx, { value: e.target.value })}
                  className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-hidden"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  disabled={rules.length <= 1}
                  className="text-[var(--color-text-muted)] hover:text-red-400 disabled:opacity-30 p-1"
                >
                  <Trash2 size={13} className="micro-icon" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline"
          >
            <Plus size={13} className="micro-icon" />
            <span>Añadir condición</span>
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[var(--color-accent)] text-white hover:brightness-110"
          >
            <Check size={13} className="micro-icon" />
            <span>Guardar Filtro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
