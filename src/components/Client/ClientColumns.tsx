import { Client } from '@prisma/client';
import { ColumnDef } from '../DataTable';
import { Edit2, Trash2 } from 'lucide-react';

interface ClientColumnsActions {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const getClientColumns = ({
  onEdit,
  onDelete,
}: ClientColumnsActions): ColumnDef<Client>[] => [
  {
    header: 'Nazwa / NIP',
    accessorKey: 'name',
    sortable: true,
    cell: (client) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{client.name}</div>
        <div className="text-xs text-gray-500">NIP: {client.nip}</div>
      </div>
    ),
  },
  {
    header: 'Adres',
    accessorKey: 'address',
    sortable: false,
    cell: (client) => (
      <span className="text-sm text-gray-500">{client.address}</span>
    ),
  },
  {
    header: 'Akcje',
    sortable: false,
    cell: (client) => (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(client)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edytuj"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(client)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Usuń"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
