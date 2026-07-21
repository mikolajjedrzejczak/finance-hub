'use client';

import { useState } from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { serviceSchema, type ServiceInput } from '@/schemas/service.schema';
import { createServiceAction } from '@/app/actions/service.action';

type FormInputProps = {
  label: string;
  id: keyof ServiceInput;
  register: UseFormRegister<ServiceInput>;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
};
const FormInput = ({
  label,
  id,
  register,
  error,
  type = 'text',
  placeholder,
  required,
  step,
}: FormInputProps) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      step={step}
      placeholder={placeholder}
      {...register(id)}
      className={`mt-1 block w-full text-black px-3 py-2 text-sm rounded-md shadow-sm border focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

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
            <FormInput
              id="name"
              label="Nazwa usługi / produktu"
              register={register}
              error={errors.name?.message}
              required
            />
          </div>
          <FormInput
            id="priceNet"
            type="number"
            step="0.01"
            label="Cena Netto (PLN)"
            register={register}
            error={errors.priceNet?.message}
            required
          />
          <FormInput
            id="vatRate"
            type="number"
            step="1"
            label="Stawka VAT (%)"
            register={register}
            error={errors.vatRate?.message}
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Dodawanie...' : 'Dodaj do katalogu'}
          </button>
        </div>
      </form>
    </div>
  );
}
