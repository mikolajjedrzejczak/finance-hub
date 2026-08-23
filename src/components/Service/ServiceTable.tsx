'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceInput } from '@/schemas/service.schema';
import {
  updateServiceAction,
  deleteServiceAction,
} from '@/app/actions/service.action';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ColumnDef, DataTable } from '../DataTable';

type Service = {
  id: string;
  name: string;
  priceNet: number;
  vatRate: number;
};

export function ServicesTable({ services }: { services: Service[] }) {
  const router = useRouter();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
  });

  const openEditModal = (service: Service) => {
    reset({
      name: service.name,
      priceNet: service.priceNet,
      vatRate: service.vatRate,
    });
    setEditingService(service);
  };

  const onUpdate = async (data: ServiceInput) => {
    if (!editingService) return;
    setIsPending(true);
    const result = await updateServiceAction(editingService.id, data);
    setIsPending(false);
    if (result.success) {
      setEditingService(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const onDelete = async () => {
    if (!deletingService) return;
    setIsPending(true);
    const result = await deleteServiceAction(deletingService.id);
    setIsPending(false);
    if (result.success) {
      setDeletingService(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const columns: ColumnDef<Service>[] = [
    {
      header: 'Nazwa usługi',
      accessorKey: 'name',
      sortable: true,
    },
    {
      header: 'Cena Netto',
      accessorKey: 'priceNet',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {row.priceNet.toFixed(2)} PLN
        </span>
      ),
    },
    {
      header: 'VAT',
      accessorKey: 'vatRate',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.vatRate}%</span>
      ),
    },
    {
      header: 'Akcje',
      cell: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edytuj"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingService(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Usuń"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={services}
        columns={columns}
        getRowId={(row) => row.id}
        emptyMessage="Brak usług w katalogu."
      />

      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Edytuj usługę"
      >
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Nazwa usługi
            </label>
            <input
              {...register('name')}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Cena Netto
              </label>
              <input
                {...register('priceNet', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                VAT (%)
              </label>
              <input
                {...register('vatRate', { valueAsNumber: true })}
                type="number"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń usługę"
        description={
          <>
            Czy na pewno chcesz usunąć usługę{' '}
            <strong>{deletingService?.name}</strong> z katalogu? Zniknie ona z
            listy podpowiedzi, ale pozostanie na już wystawionych fakturach.
          </>
        }
      />
    </>
  );
}
