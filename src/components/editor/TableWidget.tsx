import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Clipboard,
  Bold,
  Italic,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';

interface TableWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (tableMarkdown: string) => void;
  initialMarkdown?: string;
}

export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableColumn {
  id: string;
  name: string;
  align: ColumnAlign;
  widthPercent?: number;
}

export interface TableRow {
  id: string;
  cells: string[];
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  isOpen,
  onClose,
  onInsertTable,
  initialMarkdown = '',
}) => {
  const [columns, setColumns] = useState<TableColumn[]>([
    { id: 'col-1', name: 'Columna 1', align: 'left' },
    { id: 'col-2', name: 'Columna 2', align: 'left' },
    { id: 'col-3', name: 'Columna 3', align: 'right' },
  ]);

  const [rows, setRows] = useState<TableRow[]>([
    { id: 'row-1', cells: ['Dato 1', 'Descripción A', '100'] },
    { id: 'row-2', cells: ['Dato 2', 'Descripción B', '250'] },
    { id: 'row-3', cells: ['Dato 3', 'Descripción C', '85'] },
  ]);

  const [draggedColIdx, setDraggedColIdx] = useState<number | null>(null);
  const [draggedRowIdx, setDraggedRowIdx] = useState<number | null>(null);
  const [sortColIdx, setSortColIdx] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Parse initial markdown table if provided
  useEffect(() => {
    if (initialMarkdown && initialMarkdown.trim()) {
      parseMarkdownTable(initialMarkdown);
    }
  }, [initialMarkdown, isOpen]);

  const parseMarkdownTable = (md: string) => {
    const lines = md
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('|') && l.endsWith('|'));
    if (lines.length < 2) return;

    // Header row
    const headerParts = lines[0]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    // Alignment row
    const alignParts = lines[1]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

    const parsedCols: TableColumn[] = headerParts.map((name, i) => {
      const a = alignParts[i] || '---';
      let align: ColumnAlign = 'left';
      if (a.startsWith(':') && a.endsWith(':')) align = 'center';
      else if (a.endsWith(':')) align = 'right';
      return { id: `col-${i}-${Date.now()}`, name, align };
    });

    // Data rows
    const parsedRows: TableRow[] = lines.slice(2).map((line, rIdx) => {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      // Ensure row has cell for each column
      while (cells.length < parsedCols.length) cells.push('');
      return { id: `row-${rIdx}-${Date.now()}`, cells };
    });

    setColumns(parsedCols);
    setRows(parsedRows);
  };

  if (!isOpen) return null;

  // Add Column
  const handleAddColumn = () => {
    const newId = `col-${Date.now()}`;
    const newName = `Columna ${columns.length + 1}`;
    setColumns([...columns, { id: newId, name: newName, align: 'left' }]);
    setRows(rows.map((r) => ({ ...r, cells: [...r.cells, ''] })));
  };

  // Delete Column
  const handleDeleteColumn = (idx: number) => {
    if (columns.length <= 1) return;
    const newCols = columns.filter((_, i) => i !== idx);
    const newRows = rows.map((r) => ({
      ...r,
      cells: r.cells.filter((_, i) => i !== idx),
    }));
    setColumns(newCols);
    setRows(newRows);
  };

  // Add Row
  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    const newCells = columns.map(() => '');
    setRows([...rows, { id: newId, cells: newCells }]);
  };

  // Delete Row
  const handleDeleteRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  // Cycle Column Alignment
  const handleToggleAlign = (idx: number) => {
    const newCols = [...columns];
    const current = newCols[idx].align;
    const next: ColumnAlign = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
    newCols[idx].align = next;
    setColumns(newCols);
  };

  // Sort rows by column
  const handleSortByColumn = (colIdx: number) => {
    const isSameCol = sortColIdx === colIdx;
    const nextAsc = isSameCol ? !sortAsc : true;
    setSortColIdx(colIdx);
    setSortAsc(nextAsc);

    const sorted = [...rows].sort((a, b) => {
      const valA = a.cells[colIdx] || '';
      const valB = b.cells[colIdx] || '';
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return nextAsc ? numA - numB : numB - numA;
      }
      return nextAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    setRows(sorted);
  };

  // Column Drag and Drop
  const handleColDragStart = (idx: number) => setDraggedColIdx(idx);
  const handleColDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedColIdx === null || draggedColIdx === targetIdx) return;
    const newCols = [...columns];
    const col = newCols.splice(draggedColIdx, 1)[0];
    newCols.splice(targetIdx, 0, col);

    const newRows = rows.map((r) => {
      const c = [...r.cells];
      const cell = c.splice(draggedColIdx, 1)[0];
      c.splice(targetIdx, 0, cell);
      return { ...r, cells: c };
    });

    setDraggedColIdx(targetIdx);
    setColumns(newCols);
    setRows(newRows);
  };

  // Row Drag and Drop
  const handleRowDragStart = (idx: number) => setDraggedRowIdx(idx);
  const handleRowDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedRowIdx === null || draggedRowIdx === targetIdx) return;
    const newRows = [...rows];
    const r = newRows.splice(draggedRowIdx, 1)[0];
    newRows.splice(targetIdx, 0, r);
    setDraggedRowIdx(targetIdx);
    setRows(newRows);
  };

  // Handle Cell Value Change
  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIdx].cells[colIdx] = value;
    setRows(newRows);
  };

  // Handle Column Header Change
  const handleHeaderChange = (colIdx: number, value: string) => {
    const newCols = [...columns];
    newCols[colIdx].name = value;
    setColumns(newCols);
  };

  // Paste handler: Supports Excel, Google Sheets (TSV) or CSV
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (!text || (!text.includes('\t') && !text.includes(','))) return;

    // Check if table delimiter is tab (Excel/Google Sheets) or comma
    const isTsv = text.includes('\t');
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;

    e.preventDefault();

    const matrix: string[][] = lines.map((l) =>
      isTsv ? l.split('\t').map((c) => c.trim()) : l.split(',').map((c) => c.trim())
    );

    const header = matrix[0];
    const dataLines = matrix.slice(1);

    const newCols: TableColumn[] = header.map((name, i) => ({
      id: `pcol-${i}-${Date.now()}`,
      name: name || `Columna ${i + 1}`,
      align: 'left',
    }));

    const newRows: TableRow[] = dataLines.map((line, rIdx) => {
      const cells = [...line];
      while (cells.length < newCols.length) cells.push('');
      return { id: `prow-${rIdx}-${Date.now()}`, cells: cells.slice(0, newCols.length) };
    });

    setColumns(newCols);
    setRows(newRows.length > 0 ? newRows : [{ id: 'prow-0', cells: newCols.map(() => '') }]);
    setPasteNotice(`Importadas ${newRows.length} filas y ${newCols.length} columnas de la hoja de cálculo.`);
    setTimeout(() => setPasteNotice(null), 3500);
  };

  // Generate Odisea Markdown XL pipe table
  const handleGenerateMarkdown = () => {
    let md = '\n';

    // Header row
    const headers = columns.map((c) => c.name || ' ');
    md += `| ${headers.join(' | ')} |\n`;

    // Alignment row
    const separators = columns.map((c) => {
      if (c.align === 'center') return ':---:';
      if (c.align === 'right') return '---:';
      return ':---';
    });
    md += `| ${separators.join(' | ')} |\n`;

    // Data rows
    for (const r of rows) {
      const safeCells = columns.map((_, i) => (r.cells[i] ? r.cells[i].replace(/\|/g, '\\|') : ' '));
      md += `| ${safeCells.join(' | ')} |\n`;
    }
    md += '\n';

    onInsertTable(md);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onPaste={handlePaste}
    >
      <div className="w-[820px] max-w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] select-none">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[var(--color-accent)] micro-icon" />
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
              Editor Visual de Tablas Markdown XL
            </h3>
            <span className="micro-badge bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-mono text-[10px]">
              {columns.length} × {rows.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 bg-[var(--color-bg-primary)] px-2 py-0.5 rounded border border-[var(--color-border)]">
              <Clipboard size={11} className="micro-icon" />
              <span>Pega desde Excel / Sheets con Ctrl+V</span>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-0.5 cursor-pointer"
            >
              <X size={14} className="micro-icon" />
            </button>
          </div>
        </div>

        {/* Paste notification banner */}
        {pasteNotice && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <Sparkles size={12} className="micro-icon" />
            <span>{pasteNotice}</span>
          </div>
        )}

        {/* Visual Table Editor Workspace */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="inline-block min-w-full align-middle border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-primary)] shadow-xs">
            <table className="min-w-full divide-y divide-[var(--color-border)] border-collapse text-xs">
              {/* Header row */}
              <thead className="bg-[var(--color-bg-tertiary)]">
                <tr>
                  <th className="w-8 px-2 py-2 text-center text-[var(--color-text-muted)] border-r border-[var(--color-border)]">
                    #
                  </th>
                  {columns.map((col, cIdx) => (
                    <th
                      key={col.id}
                      draggable
                      onDragStart={() => handleColDragStart(cIdx)}
                      onDragOver={(e) => handleColDragOver(e, cIdx)}
                      onDragEnd={() => setDraggedColIdx(null)}
                      className={`px-3 py-2 text-left font-medium border-r border-[var(--color-border)] group relative ${
                        draggedColIdx === cIdx ? 'opacity-40 bg-[var(--color-bg-hover)]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 flex-1">
                          <GripVertical
                            size={12}
                            className="micro-icon text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 cursor-grab"
                          />
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                            className="bg-transparent font-semibold text-xs text-[var(--color-text-primary)] focus:outline-hidden border-b border-transparent focus:border-[var(--color-accent)] w-full"
                          />
                        </div>

                        {/* Column actions */}
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Alignment Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleAlign(cIdx)}
                            title={`Alineación: ${col.align}. Clic para alternar`}
                            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
                          >
                            {col.align === 'left' ? (
                              <AlignLeft size={11} className="micro-icon" />
                            ) : col.align === 'center' ? (
                              <AlignCenter size={11} className="micro-icon" />
                            ) : (
                              <AlignRight size={11} className="micro-icon" />
                            )}
                          </button>

                          {/* Sort Column */}
                          <button
                            type="button"
                            onClick={() => handleSortByColumn(cIdx)}
                            title="Ordenar filas por esta columna"
                            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
                          >
                            {sortColIdx === cIdx ? (
                              sortAsc ? (
                                <ArrowUp size={11} className="micro-icon text-[var(--color-accent)]" />
                              ) : (
                                <ArrowDown size={11} className="micro-icon text-[var(--color-accent)]" />
                              )
                            ) : (
                              <ArrowUpDown size={11} className="micro-icon" />
                            )}
                          </button>

                          {/* Delete Column */}
                          {columns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(cIdx)}
                              title="Eliminar columna"
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 size={11} className="micro-icon" />
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="w-10 px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      title="Añadir columna a la derecha"
                      className="p-1 rounded text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15 transition-colors cursor-pointer"
                    >
                      <Plus size={13} className="micro-icon" />
                    </button>
                  </th>
                </tr>
              </thead>

              {/* Data rows */}
              <tbody className="divide-y divide-[var(--color-border)]">
                {rows.map((row, rIdx) => (
                  <tr
                    key={row.id}
                    draggable
                    onDragStart={() => handleRowDragStart(rIdx)}
                    onDragOver={(e) => handleRowDragOver(e, rIdx)}
                    onDragEnd={() => setDraggedRowIdx(null)}
                    className={`hover:bg-[var(--color-bg-hover)] group ${
                      draggedRowIdx === rIdx ? 'opacity-40 bg-[var(--color-bg-hover)]' : ''
                    }`}
                  >
                    {/* Row drag handle & index */}
                    <td className="px-2 py-1.5 text-center text-[var(--color-text-muted)] border-r border-[var(--color-border)] font-mono text-[10px] select-none">
                      <div className="flex items-center justify-center gap-0.5">
                        <GripVertical
                          size={11}
                          className="micro-icon opacity-0 group-hover:opacity-100 cursor-grab"
                        />
                        <span>{rIdx + 1}</span>
                      </div>
                    </td>

                    {/* Cells */}
                    {columns.map((col, cIdx) => (
                      <td
                        key={`${row.id}-${col.id}`}
                        className={`px-2.5 py-1.5 border-r border-[var(--color-border)] ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <input
                          type="text"
                          value={row.cells[cIdx] || ''}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          spellCheck
                          className={`w-full bg-transparent text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:bg-[var(--color-accent)]/5 rounded px-1 py-0.5 ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        />
                      </td>
                    ))}

                    {/* Row delete button */}
                    <td className="px-2 py-1.5 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rIdx)}
                          title="Eliminar fila"
                          className="p-1 rounded text-red-500/60 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={11} className="micro-icon" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors border border-dashed border-[var(--color-accent)]/40 cursor-pointer"
            >
              <Plus size={13} className="micro-icon" />
              <span>Añadir fila al final</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] select-none">
          <div className="text-[11px] text-[var(--color-text-muted)]">
            Alineación por columna y ordenación automática incluidas en la tabla.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerateMarkdown}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-accent)] text-white hover:brightness-110 shadow-xs cursor-pointer"
            >
              <Check size={13} className="micro-icon" />
              <span>Insertar Tabla en Odisea</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
