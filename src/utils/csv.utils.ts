import { Invoice } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { formatMoneyForCsv } from './money.utils';

export function generateInvoicesCSV(invoices: Invoice[]) {
  const csvHeaders = [
    'Numer Faktury',
    'Data Wystawienia',
    'Nabywca',
    'NIP Nabywcy',
    'Wartość Netto',
    'Kwota VAT',
    'Wartość Brutto',
    'Waluta',
    'Status',
  ].join(';');

  const csvRows = invoices.map((inv) => {
    const netDecimal = new Decimal(inv.totalNet.toString());
    const grossDecimal = new Decimal(inv.totalGross.toString());
    const vatDecimal = grossDecimal.minus(netDecimal);

    return [
      inv.number,
      inv.issueDate.toISOString().split('T')[0],
      `"${inv.buyerName.replace(/"/g, '""')}"`,
      inv.buyerNip || 'Brak',
      formatMoneyForCsv(netDecimal),
      formatMoneyForCsv(vatDecimal),
      formatMoneyForCsv(grossDecimal),
      inv.currency,
      inv.status,
    ].join(';');
  });

  const bom = '\uFEFF';
  return bom + [csvHeaders, ...csvRows].join('\n');
}
