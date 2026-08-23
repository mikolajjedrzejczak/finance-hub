'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';
import { invoiceSchema, type InvoiceInput } from '@/schemas/invoice.schema';
import { createInvoiceAction } from '@/app/actions/invoice.actions';
import { Currency } from '@prisma/client';

type Client = { id: string; name: string; nip: string };
type Service = { id: string; name: string; priceNet: number; vatRate: number };

type InvoiceFormProps = {
  clients: Client[];
  services: Service[];
  nextInvoiceNumber: string;
};

export function InvoiceForm({
  clients,
  services,
  nextInvoiceNumber,
}: InvoiceFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number: nextInvoiceNumber,
      clientId: '',
      issueDate: today,
      dueDate: in14Days,
      currency: 'PLN',
      paymentMethod: 'TRANSFER',
      items: [
        {
          description: '',
          quantity: 1,
          priceNet: 0,
          vatRate: 23,
          serviceId: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const totals = watchedItems.reduce(
    (acc, item) => {
      const net = (Number(item.quantity) || 0) * (Number(item.priceNet) || 0);
      const gross = net * (1 + (Number(item.vatRate) || 0) / 100);
      return { net: acc.net + net, gross: acc.gross + gross };
    },
    { net: 0, gross: 0 },
  );

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`items.${index}.description`, service.name);
      setValue(`items.${index}.priceNet`, service.priceNet);
      setValue(`items.${index}.vatRate`, service.vatRate);
    }
  };

  const onSubmit = async (data: InvoiceInput) => {
    setServerError(null);
    const result = await createInvoiceAction(data);

    if (result.error) {
      setServerError(result.error);
    } else if (result.success && result.invoiceId) {
      router.push(`/invoices/${result.invoiceId}`);
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5" /> Wystaw nową fakturę
        </button>
      </div>
    );
  }

  const currencyKeys = Object.keys(Currency).filter((key) =>
    isNaN(Number(key)),
  );

  console.log(currencyKeys);

  return (
    <div className="mb-8 border-b border-gray-200 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Kreator faktury</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Zamknij"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {serverError && (
          <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">
            {serverError}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Dane ogólne
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Nabywca (Klient) *
              </label>
              <select
                {...register('clientId')}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.clientId
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              >
                <option value="">-- Wybierz klienta --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (NIP: {c.nip})
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Numer faktury *
              </label>
              <input
                {...register('number')}
                type="text"
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.number ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.number && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Data wystawienia *
              </label>
              <input
                {...register('issueDate')}
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.issueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Termin płatności *
              </label>
              <input
                {...register('dueDate')}
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Metoda płatności
              </label>
              <select
                {...register('paymentMethod')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="TRANSFER">Przelew bankowy</option>
                <option value="CASH">Gotówka</option>
                <option value="CARD">Karta płatnicza</option>
                <option value="OTHER">Inne</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Waluta
              </label>
              <select
                {...register('currency')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {currencyKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-base font-bold text-gray-900">
              Pozycje na fakturze
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  priceNet: 0,
                  vatRate: 23,
                  serviceId: '',
                })
              }
              className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4" /> Dodaj kolejną pozycję
            </button>
          </div>

          {errors.items?.root && (
            <p className="mb-4 text-sm font-medium text-red-600">
              {errors.items.root.message}
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative grid grid-cols-1 gap-4 sm:grid-cols-12 items-end border border-gray-200 bg-gray-50/50 p-4 rounded-lg"
              >
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700">
                    Katalog usług
                  </label>
                  <select
                    {...register(`items.${index}.serviceId`)}
                    onChange={(e) => {
                      register(`items.${index}.serviceId`).onChange(e);
                      handleServiceChange(index, e.target.value);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- Wpisz ręcznie --</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-gray-700">
                    Opis pozycji *
                  </label>
                  <input
                    {...register(`items.${index}.description`)}
                    type="text"
                    placeholder="np. Usługi IT"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm bg-white ${
                      errors.items?.[index]?.description
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Ilość *
                  </label>
                  <input
                    {...register(`items.${index}.quantity`)}
                    type="number"
                    step="1"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm bg-white ${
                      errors.items?.[index]?.quantity
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Cena Netto *
                  </label>
                  <input
                    {...register(`items.${index}.priceNet`)}
                    type="number"
                    step="0.01"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm bg-white ${
                      errors.items?.[index]?.priceNet
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700">
                    VAT (%)
                  </label>
                  <input
                    {...register(`items.${index}.vatRate`)}
                    type="number"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm bg-white ${
                      errors.items?.[index]?.vatRate
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mb-1 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-20 transition-colors"
                    title="Usuń pozycję"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end rounded-xl bg-gray-50 p-6 shadow-sm border border-gray-200">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Suma Netto:</span>
              <span>{totals.net.toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3">
              <span>Kwota VAT:</span>
              <span>{(totals.gross - totals.net).toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Suma Brutto:</span>
              <span>{totals.gross.toFixed(2)} PLN</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4 w-full justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Wystawianie...' : 'Wystaw fakturę'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
