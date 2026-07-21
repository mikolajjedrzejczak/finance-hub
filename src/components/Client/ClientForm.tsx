'use client';

import { createClientAction } from '@/app/actions/client.actions';
import { ClientInput, clientSchema } from '@/schemas/client.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import { fetchCompanyFromGusAction } from '@/app/actions/gus.actions';

export function ClientForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFetchingGus, setIsFetchingGus] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      nip: '',
      city: '',
      postal: '',
      address: '',
      email: '',
      phone: '',
      bankAccount: '',
    },
  });

  const handleFetchGus = async () => {
    const nip = getValues('nip');
    if (!nip || nip.length < 10) {
      setServerError('Wpisz poprawny (10-cyfrowy) NIP.');
      return;
    }

    setServerError(null);
    setIsFetchingGus(true);
    const result = await fetchCompanyFromGusAction(nip);

    if (result.error) {
      setServerError(result.error);
    } else if (result.data) {
      setValue('name', result.data.name, { shouldValidate: true });
      setValue('address', result.data.address, { shouldValidate: true });
      setValue('postal', result.data.postal, { shouldValidate: true });
      setValue('city', result.data.city, { shouldValidate: true });
    }

    setIsFetchingGus(false);
  };

  const onSubmit = async (data: ClientInput) => {
    setServerError(null);
    const result = await createClientAction(data);

    if (result.error) {
      setServerError(result.error);
    } else if (result.success) {
      reset();
      router.refresh();
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Szybkie dodawanie klienta
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              title="Nazwa firmy / Imię i nazwisko"
              config={register("name")}
              errors={errors.name}
              important
            />
          </div>
          <Input
            title="NIP"
            config={register("nip")}
            errors={errors.nip}
            important
            actionButton={
              <button
                type="button"
                onClick={handleFetchGus}
                disabled={isFetchingGus}
                className="inline-flex py-2 items-center justify-center rounded-md border  border-gray-300 bg-gray-50 px-3 text-sm font-medium text-blue-600 hover:bg-gray-100 disabled:text-gray-400"
              >
                {isFetchingGus ? 'Szukam...' : 'Pobierz'}
              </button>
            }
          />
          <Input
            type="email"
            title="Adres e-mail"
            config={register("email")}
            errors={errors.email}
          />

          <div className="md:col-span-2">
            <Input
              title="Ulica i numer"
              config={register("address")}
              errors={errors.address}
              important
            />
          </div>
          <Input
            title="Kod pocztowy"
            placeholder="00-000"
            config={register("postal")}
            errors={errors.postal}
            important
          />
          <Input
            title="Miasto"
            config={register("city")}
            errors={errors.city}
            important
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Zapisywanie...' : 'Dodaj klienta'}
          </button>
        </div>
      </form>
    </div>
  );
}
