'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export function useInvoiceTableParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') || 'ALL';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const hasActiveFilters = Boolean(
    query || (status && status !== 'ALL') || startDate || endDate,
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateParam('query', value);
    }, 400);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('query');
    params.delete('status');
    params.delete('startDate');
    params.delete('endDate');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    query: searchParams.get('query') || '',
    status: searchParams.get('status') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    hasActiveFilters,
    updateParam,
    setPage,
    handleSearchChange,
    resetFilters,
  };
}
