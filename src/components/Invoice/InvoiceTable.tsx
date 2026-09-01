'use client';

import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { ExportButton } from '../ui/ExportButton';
import { DataTable } from '../DataTable';
import { StatusSelect } from '../ui/StatusSelect';
import { useInvoiceTableParams } from '@/hooks/useInvoiceTableParams';
import { invoiceColumns } from './InvoiceColumns';
import React, { useEffect, useState } from 'react';
import { SearchInput } from '../ui/SearchInput';
import { InvoiceDisplay } from '@/types/invoice.type';

export interface InvoiceTableProps {
  invoices: InvoiceDisplay[];
  companyId: string;
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export function InvoicesTable({
  invoices,
  companyId,
  totalPages,
  currentPage,
  totalCount,
}: InvoiceTableProps) {
  const {
    query,
    status,
    startDate,
    endDate,
    hasActiveFilters,
    updateParam,
    setPage,
    handleSearchChange,
    resetFilters,
  } = useInvoiceTableParams();
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const applyPageChange = () => {
    if (pageInput.trim() === '') {
      setPageInput(String(currentPage));
      return;
    }

    let val = Number(pageInput);

    if (isNaN(val) || val <= 0) val = 1;
    if (val > totalPages) val = totalPages;

    setPageInput(String(val));

    if (val !== currentPage) {
      setPage(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyPageChange();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setPageInput(onlyNumbers);
  };

  const ToolbarLeft = (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <SearchInput
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value);
          handleSearchChange(value);
        }}
        placeholder="Szukaj po numerze lub kliencie..."
      />

      <div className="relative min-w-[170px]">
        <StatusSelect
          value={status}
          onChange={(val) => updateParam('status', val)}
          includeAllOption={true}
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
        <Calendar className="h-4 w-4 text-gray-400 ml-1" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => updateParam('startDate', e.target.value)}
          className="py-1 text-sm text-gray-600 focus:outline-none bg-transparent cursor-pointer"
          title="Data początkowa"
        />
        <span className="text-gray-300">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => updateParam('endDate', e.target.value)}
          className="py-1 text-sm text-gray-600 focus:outline-none bg-transparent cursor-pointer"
          title="Data końcowa"
        />
      </div>
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 rounded-md transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          Wyczyść
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <DataTable
        data={invoices}
        columns={invoiceColumns}
        getRowId={(row) => row.id}
        toolbarLeft={ToolbarLeft}
        toolbarRight={<ExportButton companyId={companyId} />}
        emptyMessage="Brak faktur spełniających kryteria wyszukiwania."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          <span className="text-sm text-gray-500">
            Wyniki:{' '}
            <span className="font-semibold text-gray-900">{totalCount}</span> |
            Strona{' '}
            <span className="font-semibold text-gray-900">{currentPage}</span> z{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Poprzednia
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={handleInputChange}
              onBlur={applyPageChange}
              onKeyDown={handleKeyDown}
              className="appearance-none px-3 py-1 border border-gray-200 rounded-lg w-10 text-center"
            />
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Następna
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
