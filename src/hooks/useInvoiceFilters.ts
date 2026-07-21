import { InvoiceDisplayDTO } from '@/schemas/invoice.schema';
import { useMemo, useState } from 'react';

function useInvoiceFilters(invoices: InvoiceDisplayDTO[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredData = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        inv.number.toLowerCase().includes(term) ||
        inv.buyerName.toLowerCase().includes(term) ||
        inv.buyerNip.includes(term);
      const matchesStatus =
        statusFilter === 'ALL' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredData,
  };
}
