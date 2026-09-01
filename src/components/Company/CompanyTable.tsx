'use client';

import { Company } from '@prisma/client';
import { ConfirmModal } from '../ui/ConfirmModal';
import { DataTable } from '../DataTable';
import { getCompanyColumns } from './CompanyColumns';
import { CompanyEditModal } from './CompanyEditModal';
import { useCompanyTable } from '@/hooks/useCompanyTable';
import { SearchInput } from '../ui/SearchInput';

export default function CompanyTable({ companies }: { companies: Company[] }) {
  const {
    searchTerm,
    setSearchTerm,
    filteredCompanies,
    editingCompany,
    setEditingCompany,
    deletingCompany,
    setDeletingCompany,
    isPending,
    onUpdate,
    onDelete,
  } = useCompanyTable(companies);

  return (
    <>
      <DataTable
        data={filteredCompanies}
        columns={getCompanyColumns({
          onEdit: setEditingCompany,
          onDelete: setDeletingCompany,
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
        emptyMessage="Nie masz jeszcze żadnej firmy. Dodaj ją powyżej."
      />

      <CompanyEditModal
        company={editingCompany}
        onClose={() => setEditingCompany(null)}
        onSubmit={onUpdate}
        isPending={isPending}
      />

      <ConfirmModal
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        onConfirm={onDelete}
        isPending={isPending}
        title="Usuń firme"
        description={
          <>
            Czy na pewno chcesz usunąć firme{' '}
            <strong>{deletingCompany?.name}</strong> z bazy? Zniknie on z listy
            podpowiedzi. Jeśli ma przypisane faktury, system zablokuje tę
            operację.
          </>
        }
      />
    </>
  );
}
