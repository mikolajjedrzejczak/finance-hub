import { CompanyInput, companySchema } from '@/schemas/company.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import Input from '../ui/Input';

interface CompanyEditModalProps {
  company: Company | null;
  onClose: () => void;
  onSubmit: (id: string, data: CompanyInput) => Promise<void>;
  isPending: boolean;
}

export function CompanyEditModal({ company, onClose, onSubmit, isPending }: CompanyEditModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (company) {
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
    }
  }, [company, reset]);

  if (!company) return null;

  return (
    <Modal isOpen={!!company} onClose={onClose} title="Edytuj firmę" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit((data) => onSubmit(company.id, data))} className="space-y-4">
        <Input id="name" label="Nazwa firmy" register={register} error={errors.name} />
        <Input id="nip" label="NIP" register={register} error={errors.nip} />
        <Input id="address" label="Adres" register={register} error={errors.address} />
        <div className="grid grid-cols-2 gap-4">
          <Input id="postal" label="Kod pocztowy" register={register} error={errors.postal} />
          <Input id="city" label="Miejscowość" register={register} error={errors.city} />
        </div>
        <Input id="bankAccount" label="Konto Bankowe" register={register} error={errors.bankAccount} />

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm border hover:bg-gray-100 transition-colors">
            Anuluj
          </button>
          <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </Modal>
  );
}