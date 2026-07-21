'use client';

import { INVOICE_STATUSES, InvoiceStatus } from '@/lib/contstants';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  includeAllOption?: boolean;
  className?: string;
}

export function StatusSelect({
  value,
  onChange,
  disabled,
  includeAllOption = false,
  className = '',
}: StatusSelectProps) {
  const activeStyles =
    value === 'ALL'
      ? 'bg-white text-gray-700 border-gray-300 font-normal'
      : INVOICE_STATUSES[value as InvoiceStatus]?.selectStyles ||
        'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`relative rounded-md border py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors  cursor-pointer ${activeStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {includeAllOption && <option value="ALL">Wszystkie statusy</option>}

      {Object.entries(INVOICE_STATUSES).map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
}
