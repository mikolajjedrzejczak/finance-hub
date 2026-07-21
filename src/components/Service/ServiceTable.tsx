'use client';

import { useState } from 'react';
import { Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
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

  // Formularz do edycji
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
  });

  // Funkcja odpalana po kliknięciu "Edytuj" - ładuje dane do formularza
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

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nazwa usługi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Cena Netto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                VAT
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr
                key={service.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  {service.priceNet.toFixed(2)} PLN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  {service.vatRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edytuj"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingService(service)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Brak usług w katalogu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                {...register('priceNet')}
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
                {...register('vatRate')}
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
