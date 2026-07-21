'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors print:hidden"
    >
      <Printer className="h-4 w-4" /> Drukuj / Zapisz jako PDF
    </button>
  );
}
