'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InvoicesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Invoices page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-xl bg-red-50 p-8 text-center border border-red-100">
        <h2 className="text-lg font-bold text-red-800">Wystąpił błąd</h2>
        <p className="text-sm text-red-600 mt-2">
          Nie udało się załadować danych faktur. Spróbuj odświeżyć stronę.
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}