import { ColumnDef } from '../DataTable';
import { Company } from '@prisma/client';
import { Edit2, Trash2 } from 'lucide-react';

interface CompanyColumnActions {
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const getCompanyColumns = ({
  onEdit,
  onDelete,
}: CompanyColumnActions): ColumnDef<Company>[] => [
  {
    header: 'Nazwa / NIP',
    accessorKey: 'name',
    sortable: true, 
    cell: (company) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{company.name}</div>
        <div className="text-xs text-gray-500">NIP: {company.nip}</div>
      </div>
    ),
  },
  {
    header: 'Konto bankowe',
    accessorKey: 'bankAccount',
    sortable: false,
    cell: (company) => (
      <span className="text-sm text-gray-500">
        {company.bankAccount || 'Brak konta'}
      </span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'isDefault',
    sortable: true,
    cell: (company) =>
      company.isDefault ? (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Aktywna
        </span>
      ) : (
        <span className="text-xs text-gray-400">Nieaktywna</span>
      ),
  },
  {
    header: 'Akcje',
    sortable: false,
    cell: (company) => (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(company)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edytuj"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(company)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Usuń"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
