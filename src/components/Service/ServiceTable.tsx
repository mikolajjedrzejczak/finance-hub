'use client';

import { ConfirmModal } from '../ui/ConfirmModal';
import { DataTable } from '../DataTable';
import { useServiceTable } from '@/hooks/useServiceTable';
import { ServiceColumns } from './ServiceColumns';
import { SearchInput } from '../ui/SearchInput';
import { ServiceEditModal } from './ServiceEditModal';
import { SerializedService } from '@/types/service.type';



export interface ServicesTableProps {
  services: SerializedService[];
}

export function ServicesTable({ services }: ServicesTableProps ) {
  const {
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
  } = useServiceTable(services);

  return (
    <>
      <DataTable
        data={filteredServices}
        columns={ServiceColumns({
          onEdit: setEditingService,
          onDelete: setDeletingService,
        })}
        getRowId={(row) => row.id}
        toolbarLeft={
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Szukaj po nazwie lub NIP..."
            className="mb-4 sm:mb-0"
          />
        }
        emptyMessage="Brak usług w katalogu."
      />

      <ServiceEditModal
        service={editingService}
        onClose={() => setEditingService(null)}
        onSubmit={onUpdate}
        isPending={isPending}
      />

      <ConfirmModal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń usługę"
        description={
          <>
            Czy na pewno chcesz usunąć usługę{' '}
            <strong>{deletingService?.name}</strong> z katalogu? Zniknie ona z
            listy podpowiedzi, ale pozostanie na już wystawionych fakturach.
          </>
        }
      />
    </>
  );
}
