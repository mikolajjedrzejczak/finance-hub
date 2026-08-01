'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { serviceSchema, type ServiceInput } from '@/schemas/service.schema';
import { createServiceAction } from '@/app/actions/service.action';
import Input from '../ui/Input';

export function ServiceForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', description: '', priceNet: 0, vatRate: 23 },
  });

  const onSubmit = async (data: ServiceInput) => {
    setServerError(null);
    const result = await createServiceAction(data);
    if (result.error) setServerError(result.error);
    else if (result.success) {
      reset();
      router.refresh();
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Szybkie dodawanie do katalogu
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <Input
              id="name"
              title="Nazwa usługi"
              register={register}
              errors={errors}
              required
            />
          </div>
          <Input
            id="description"
            title="Opis usługi"
            register={register}
            errors={errors}
          />
          <Input
            id="priceNet"
            title="Cena Netto (PLN)"
            register={register}
            type="number"
            errors={errors}
            required
          />
          <Input
            id="vatRate"
            title="Stawka VAT (%)"
            register={register}
            type="number"
            step="1"
            errors={errors}
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-300 cursor-pointer"
          >
            {isSubmitting ? 'Dodawanie...' : 'Dodaj do katalogu'}
          </button>
        </div>
      </form>
    </div>
  );
}
