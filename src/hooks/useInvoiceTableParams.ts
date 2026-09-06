'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateParam('query', value);
      }, 400);
    },
    [updateParam],
  );

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('query');
    params.delete('status');
    params.delete('startDate');
    params.delete('endDate');
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    query,
    status,
    startDate,
    endDate,
    hasActiveFilters,
    updateParam,
    setPage,
    handleSearchChange,
    resetFilters,
  };
}
