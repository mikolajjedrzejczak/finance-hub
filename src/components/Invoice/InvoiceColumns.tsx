import Link from 'next/link';
import { ColumnDef } from '../DataTable';
import { StatusSwitcher } from '@/app/(dashboard)/invoices/[id]/StatusSwitcher';
import { CopyLinkButton } from '../ui/CopyLinkButton';
import { InvoiceDisplay } from '@/types/invoice.type';

export const invoiceColumns: ColumnDef<InvoiceDisplay>[] = [
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
