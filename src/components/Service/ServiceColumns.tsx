import { ColumnDef } from '../DataTable';
import { Edit2, Trash2 } from 'lucide-react';
import { SerializedService } from '@/types/service.type';

export interface ServiceColumnsProps {
  onEdit: (service: SerializedService) => void;
  onDelete: (service: SerializedService) => void;
}

export const ServiceColumns = ({
  onEdit,
  onDelete,
}: ServiceColumnsProps): ColumnDef<SerializedService>[] => [
  {
    header: 'Nazwa usługi',
    accessorKey: 'name',
    sortable: true,
  },
  {
    header: 'Cena Netto',
    accessorKey: 'priceNet',
    sortable: true,
    cell: (service) => (
      <span className="text-sm text-gray-600">
        {service.priceNet.toFixed(2)} PLN
      </span>
    ),
  },
  {
    header: 'VAT',
    accessorKey: 'vatRate',
    sortable: true,
    cell: (service) => (
      <span className="text-sm text-gray-600">
        {service.vatRate.toFixed(2)}%
      </span>
    ),
  },
  {
    header: 'Akcje',
    cell: (service) => (
      <div className="flex justify-center gap-2">
        <button
          onClick={() => onEdit(service)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edytuj"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(service)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Usuń"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
