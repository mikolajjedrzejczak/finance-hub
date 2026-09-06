import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Company } from '@prisma/client';
import { CompanyInput } from '@/schemas/company.schema';
import { updateCompanyAction, deleteCompanyAction } from '@/app/actions/company.actions';
import { useAction } from './useAction';

export function useCompanyTable(companies: Company[]) {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

   const { isPending, executionAction } = useAction();

  const onUpdate = useCallback((id: string, data: CompanyInput) =>
    executionAction(updateCompanyAction(id, data), () => setEditingCompany(null)), [executionAction]);

  const onDelete = useCallback(() => {
    if (deletingCompany) {
      executionAction(deleteCompanyAction(deletingCompany.id), () =>
        setDeletingCompany(null),
      );
    }
  }, [deletingCompany, executionAction]);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;

    const lowercasedTerm = searchTerm.toLowerCase();

    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(lowercasedTerm) ||
        company.nip.includes(lowercasedTerm),
    );
  }, [companies, searchTerm]);

  return {
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
  };
}