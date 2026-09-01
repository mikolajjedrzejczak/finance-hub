import {
  deleteServiceAction,
  updateServiceAction,
} from '@/app/actions/service.action';
import { ServiceInput } from '@/schemas/service.schema';
import { SerializedService } from '@/types/service.type';
import { useMemo, useState } from 'react';
import { useAction } from './useAction';

export function useServiceTable(services: SerializedService[]) {
  const [editingService, setEditingService] =
    useState<SerializedService | null>(null);
  const [deletingService, setDeletingService] =
    useState<SerializedService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { isPending, executionAction } = useAction();

  const onUpdate = (id: string, data: ServiceInput) =>
    executionAction(updateServiceAction(id, data), () =>
      setEditingService(null),
    );

  const onDelete = () => {
    if (deletingService) {
      executionAction(deleteServiceAction(deletingService.id), () =>
        setDeletingService(null),
      );
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;

    const lowercaseTerm = searchTerm.toLowerCase();

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(lowercaseTerm) ||
        String(service.priceNet).toLowerCase().includes(lowercaseTerm) ||
        String(service.vatRate).toLowerCase().includes(lowercaseTerm),
    );
  }, [services, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredServices,
    editingService,
    setEditingService,
    deletingService,
    setDeletingService,
    isPending,
    onUpdate,
    onDelete,
  };
}
