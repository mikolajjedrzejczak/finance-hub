'use client';
import { Client } from '@prisma/client';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Search } from 'lucide-react';
import { useClientTable } from '@/hooks/useClientTable';
import { ClientEditModal } from './ClientEditModal';
import { DataTable } from '../DataTable';
import { getClientColumns } from './ClientColumns';
import { SearchInput } from '../ui/SearchInput';

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const {
    searchTerm,
    setSearchTerm,
    filteredClients,
    editingClient,
    setEditingClient,
    deletingClient,
    setDeletingClient,
    isPending,
    onUpdate,
    onDelete,
  } = useClientTable(clients);

  return (
    <>
      <DataTable
        data={filteredClients}
        columns={getClientColumns({
          onEdit: setEditingClient,
          onDelete: setDeletingClient,
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
        emptyMessage="Brak klientów w bazie. Dodaj pierwszego klienta za pomocą formularza powyżej."
      />

      <ClientEditModal
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={onUpdate}
        isPending={isPending}
      />

      <ConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń klienta"
        description={
          <>
            Czy na pewno chcesz usunąć klienta{' '}
            <strong>{deletingClient?.name}</strong> z bazy? Zniknie on z listy
            podpowiedzi. Jeśli ma przypisane faktury, system zablokuje tę
            operację.
          </>
        }
      />
    </>
  );
}
