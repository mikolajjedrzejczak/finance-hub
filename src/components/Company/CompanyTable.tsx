'use client';

import {
  deleteCompanyAction,
  updateCompanyAction,
} from '@/app/actions/company.actions';
import { CompanyInput, companySchema } from '@/schemas/company.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@prisma/client';
import { Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Modal } from '../ui/Modal';

export default function CompanyTable({ companies }: { companies: Company[] }) {
  const router = useRouter();

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
  });

  const openEditModal = (company: Company) => {
    reset({
      name: company.name,
      nip: company.nip,
      city: company.city,
      postal: company.postal,
      address: company.address,
      email: company.email || undefined,
      phone: company.phone || undefined,
      bankAccount: company.bankAccount || undefined,
    });

    setEditingCompany(company);
  };

  const onUpdate = async (data: CompanyInput) => {
    if (!editingCompany) return;
    setIsPending(true);
    const result = await updateCompanyAction(editingCompany.id, data);
    setIsPending(false);

    if (result.success) {
      setEditingCompany(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const onDelete = async () => {
    if (!deletingCompany) return;
    setIsPending(true);
    const result = await deleteCompanyAction(deletingCompany.id);
    setIsPending(false);

    if (result.success) {
      setDeletingCompany(null);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nazwa / NIP
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Konto bankowe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {company.name}
                </div>
                <div className="text-sm text-gray-500">NIP: {company.nip}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {company.bankAccount || 'Brak konta'}
              </td>
              <td className="px-6 py-4">
                {company.isDefault ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Aktywna
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Nieaktywna</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edytuj"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCompany(company)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                Nie masz jeszcze żadnej firmy. Dodaj ją powyżej.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
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
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Konto Bankowe
            </label>
            <input
              {...register('bankAccount')}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.bankAccount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.bankAccount.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingCompany(null)}
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
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń firme"
        description={
          <>
            Czy na pewno chcesz usunąć firme{' '}
            <strong>{deletingCompany?.name}</strong> z bazy? Zniknie on z listy
            podpowiedzi. Jeśli ma przypisane faktury, system zablokuje tę
            operację.
          </>
        }
      />
    </>
  );
}
