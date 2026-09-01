import { ClientInput, clientSchema } from '@/schemas/client.schema';
import { Client } from '@prisma/client';
import { Modal } from '../ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import Input from '../ui/Input';

interface ClientEditModalProps {
  client: Client | null;
  onClose: () => void;
  onSubmit: (id: string, data: ClientInput) => Promise<void>;
  isPending: boolean;
}

export function ClientEditModal({
  client,
  onClose,
  onSubmit,
  isPending,
}: ClientEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (client) {
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
    }
  }, [client, reset]);

  if (!client) return null;

  return (
    <Modal
      isOpen={!!client}
      onClose={onClose}
      title="Edytuj klienta"
      maxWidth="max-w-lg"
    >
      <form
        onSubmit={handleSubmit((data) => onSubmit(client.id, data))}
        className="space-y-4"
      >
        <Input
          id="name"
          label="Nazwa firmy"
          register={register}
          error={errors.name}
        />

        <Input id="nip" label="NIP" register={register} error={errors.nip} />

        <Input
          id="address"
          label="Adres"
          register={register}
          error={errors.address}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="postal"
            label="Kod pocztowy"
            register={register}
            error={errors.postal}
          />
          <Input
            id="city"
            label="Miejscowość"
            register={register}
            error={errors.city}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm border hover:bg-gray-100 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
