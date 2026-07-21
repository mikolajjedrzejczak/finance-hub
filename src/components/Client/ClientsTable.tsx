'use client';

import {
  deleteClientAction,
  updateClientAction,
} from '@/app/actions/client.actions';
import { ClientInput, clientSchema } from '@/schemas/client.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Edit2, Trash2 } from 'lucide-react';

type ClientProps = {
  name: string;
  id: string;
  nip: string;
  city: string;
  postal: string;
  address: string;
  email: string | null;
  phone: string | null;
  bankAccount: string | null;
};

type ClientsTableProps = {
  clients: Client[];
};

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();

  const [editingClient, setEditingClient] = useState<ClientProps | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientProps | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  });

  const openEditModal = (client: ClientProps) => {
    reset({
      name: client.name,
      nip: client.nip,
      city: client.city,
      postal: client.postal,
      address: client.address,
      email: client.email || undefined,
      phone: client.phone || undefined,
      bankAccount: client.bankAccount || undefined,
    });

    setEditingClient(client);
  };

  const onUpdate = async (data: ClientInput) => {
    if (!editingClient) return;
    setIsPending(true);
    const result = await updateClientAction(editingClient.id, data);
    setIsPending(false);

    if (result.success) {
      setEditingClient(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const onDelete = async () => {
    if (!deletingClient) return;
    setIsPending(true);
    const result = await deleteClientAction(deletingClient.id);
    setIsPending(false);

    if (result.success) {
      setDeletingClient(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-500">
          Brak klientów w bazie. Dodaj pierwszego klienta za pomocą formularza
          powyżej.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nazwa firmy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                NIP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Adres
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {client.nip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {client.address}, {client.postal} {client.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edytuj"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingClient(client)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Brak klientów w bazie. Dodaj pierwszego klienta za pomocą
                  formularza powyżej.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Edytuj klienta"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Nazwa firmy
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

          <div>
            <label className="block text-xs font-medium text-gray-700">
              NIP
            </label>
            <input
              {...register('nip')}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.nip && (
              <p className="mt-1 text-xs text-red-600">{errors.nip.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Adres (Ulica i numer)
            </label>
            <input
              {...register('address')}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Kod pocztowy
              </label>
              <input
                {...register('postal')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Miejscowość
              </label>
              <input
                {...register('city')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingClient(null)}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń klienta"
        description={
          <>
            Czy na pewno chcesz usunąć klienta{' '}
            <strong>{deletingClient?.name}</strong> z bazy? Zniknie on z listy
            podpowiedzi. Jeśli ma przypisane faktury, system zablokuje tę
            operację.
          </>
        }
      />
    </>
  );
}
