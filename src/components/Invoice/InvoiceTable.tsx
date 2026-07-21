'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { CopyLinkButton } from '../ui/CopyLinkButton';
import { ExportButton } from '../ui/ExportButton';
import { DataTable, ColumnDef } from '../DataTable';
import { INVOICE_STATUSES, InvoiceStatus } from '@/lib/contstants';
import { StatusSwitcher } from '@/app/(dashboard)/invoices/[id]/StatusSwitcher';
import { StatusSelect } from '../ui/StatusSelect';

export type InvoiceDisplay = {
  id: string;
  number: string;
  issueDate: string;
  totalGross: number;
  status: 'PAID' | 'OVERDUE' | 'PENDING' | 'PARTIALLY_PAID';
  client: { name: string; nip: string };
};

const invoiceColumns: ColumnDef<InvoiceDisplay>[] = [
  {
    header: 'Numer',
    accessorKey: 'number',
    sortable: true,
    cell: (inv) => (
      <Link
        href={`/invoices/${inv.id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm"
      >
        {inv.number}
      </Link>
    ),
  },
  {
    header: 'Nabywca',
    sortable: true,
    getSortValue: (inv) => inv.client.name,
    cell: (inv) => (
      <div>
        <div className="text-sm max-w-[200px] lg:max-w-xs truncate font-medium text-gray-900">
          {inv.client.name}
        </div>
        <div className="text-xs text-gray-500">NIP: {inv.client.nip}</div>
      </div>
    ),
  },
  {
    header: 'Data wystawienia',
    accessorKey: 'issueDate',
    sortable: true,
    cell: (inv) => (
      <span className="text-sm text-gray-500">{inv.issueDate}</span>
    ),
  },
  {
    header: 'Kwota Brutto',
    accessorKey: 'totalGross',
    sortable: true,
    cell: (inv) => (
      <span className="text-sm font-bold text-gray-900">
        {inv.totalGross.toFixed(2)} PLN
      </span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: false,
    cell: (inv) => (
      <StatusSwitcher
        invoiceId={inv.id}
        currentStatus={inv.status}
        showLabel={false}
      />
    ),
  },
  {
    header: 'Akcje',
    sortable: false,
    cell: (inv) => <CopyLinkButton invoiceId={inv.id} />,
  },
];

function useInvoiceFilters(invoices: InvoiceDisplay[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredData = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        inv.number.toLowerCase().includes(term) ||
        inv.client.name.toLowerCase().includes(term) ||
        inv.client.nip.includes(term);
      const matchesStatus =
        statusFilter === 'ALL' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredData,
  };
}

export function InvoicesTable({
  invoices,
  companyId,
}: {
  invoices: InvoiceDisplay[];
  companyId: string;
}) {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredData,
  } = useInvoiceFilters(invoices);

  const ToolbarLeft = (
    <>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Szukaj po numerze lub kliencie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        <StatusSelect
          value={statusFilter}
          onChange={setStatusFilter}
          includeAllOption={true}
        />
      </div>
    </>
  );

  return (
    <DataTable
      data={filteredData}
      columns={invoiceColumns}
      toolbarLeft={ToolbarLeft}
      toolbarRight={<ExportButton companyId={companyId} />}
      emptyMessage="Brak faktur spełniających kryteria wyszukiwania."
    />
  );
}
