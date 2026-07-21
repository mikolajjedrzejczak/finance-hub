export const INVOICE_STATUSES = {
  PAID: { 
    label: 'Opłacona', 
    badgeStyles: 'bg-green-50 text-green-700 ring-green-600/20',
    selectStyles: 'bg-green-50 text-green-700 border-green-200'
  },
  PARTIALLY_PAID: { 
    label: 'Częściowo opłacona', 
    badgeStyles: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    selectStyles: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  OVERDUE: { 
    label: 'Zaległa', 
    badgeStyles: 'bg-red-50 text-red-700 ring-red-600/20',
    selectStyles: 'bg-red-50 text-red-700 border-red-200'
  },
  PENDING: { 
    label: 'Oczekująca', 
    badgeStyles: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    selectStyles: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
} as const;

export type InvoiceStatus = keyof typeof INVOICE_STATUSES;