'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export type ColumnDef<T> = {
  header: string;
  accessorKey?: keyof T;
  sortable?: boolean;
  getSortValue?: (row: T) => string | number | Date;
  cell?: (row: T) => React.ReactNode;
  className?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string; 
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  emptyMessage?: string;
  defaultSortField?: keyof T | string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  toolbarLeft,
  toolbarRight,
  emptyMessage = 'Brak danych do wyświetlenia.',
  defaultSortField,
  defaultSortDirection = 'desc',
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(
    defaultSortField ? String(defaultSortField) : null
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;
    
    const key = column.accessorKey ? String(column.accessorKey) : column.header;
    if (key === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const getValue = (row: T, column: ColumnDef<T>): unknown => {
    if (column.getSortValue) return column.getSortValue(row);
    if (column.accessorKey) return row[column.accessorKey];
    return null;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    const column = columns.find(
      (col) => (col.accessorKey && String(col.accessorKey) === sortField) || col.header === sortField
    );
    if (!column) return 0;

    const aValue = getValue(a, column);
    const bValue = getValue(b, column);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const isSorted = (column: ColumnDef<T>) => {
    const key = column.accessorKey ? String(column.accessorKey) : column.header;
    return sortField === key;
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {(toolbarLeft || toolbarRight) && (
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
            {toolbarLeft}
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-200">
            {toolbarRight}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown 
                        className={`h-3 w-3 transition-colors ${
                          isSorted(col) ? 'text-blue-500' : 'text-gray-400'
                        }`} 
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr key={getRowId(row)} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}
                    >
                      {col.cell ? (
                        col.cell(row)
                      ) : col.accessorKey ? (
                        <span className="text-sm text-gray-900">
                          {String(row[col.accessorKey] ?? '-')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}