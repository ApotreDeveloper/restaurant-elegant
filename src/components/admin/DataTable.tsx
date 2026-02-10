
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import { Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actions?: (item: T) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyState,
  onRowClick,
  selectable,
  selectedIds = [],
  onSelectionChange,
  actions,
  pagination,
  sort
}: DataTableProps<T>) {
  
  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(data.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    // Stop propagation to prevent row click
    e.stopPropagation();
    
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  // Render
  if (loading) return <LoadingSkeleton variant="table" count={5} />;
  
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  } else if (data.length === 0) {
    return <EmptyState icon={Search} title="Aucune donnée" message="Il n'y a rien à afficher ici pour le moment." />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={input => { if(input) input.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key}
                  className={cn(
                    "px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider select-none",
                    col.sortable && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors",
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && sort?.onSort(col.key)}
                >
                  <div className={cn("flex items-center gap-1", col.align === 'right' && "justify-end", col.align === 'center' && "justify-center")}>
                    {col.label}
                    {sort?.key === col.key && (
                      <span className="text-primary">
                        {sort.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "group transition-colors hover:bg-slate-50",
                  onRowClick && "cursor-pointer",
                  selectedIds.includes(item.id) && "bg-primary/5"
                )}
              >
                {selectable && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelectRow(item.id, e)}
                      className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={cn(
                      "px-6 py-4 text-sm text-slate-700",
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <span>
            Affichage {(pagination.page - 1) * pagination.pageSize + 1} à {Math.min(pagination.page * pagination.pageSize, pagination.total)} sur {pagination.total} résultats
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            {/* Simple Page Numbers (Current, Total) */}
            <div className="px-2 py-1.5 font-medium">
               Page {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
            </div>
            <button 
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
