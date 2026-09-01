import { ServiceInput, serviceSchema } from '@/schemas/service.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { useEffect } from 'react';
import Input from '../ui/Input';
import { SerializedService } from '@/types/service.type';

interface ServiceEditModalProps {
  service: SerializedService | null;
  onClose: () => void;
  onSubmit: (id: string, data: ServiceInput) => Promise<void>;
  isPending: boolean;
}

export function ServiceEditModal({
  service,
  onClose,
  onSubmit,
  isPending,
}: ServiceEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || undefined,
        priceNet: Number(service.priceNet),
        vatRate: Number(service.vatRate),
      });
    }
  }, [service, reset]);

  if (!service) return null;

  return (
    <Modal isOpen={!!service} onClose={onClose} title="Edytuj usługę">
      <form
        onSubmit={handleSubmit((data) => onSubmit(service.id, data))}
        className="space-y-4"
      >
        <Input
          id="name"
          label="Nazwa usługi"
          register={register}
          error={errors.name}
        />
        <Input
          id="priceNet"
          type="number"
          label="Cena Netto"
          register={register}
          error={errors.priceNet}
        />
        <Input
          id="vatRate"
          type="number"
          label="VAT (%)"
          register={register}
          error={errors.vatRate}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
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
  );
}
