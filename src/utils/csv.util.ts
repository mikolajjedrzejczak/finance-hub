import { Invoice } from '@prisma/client'; 

export function generateInvoicesCSV(invoices: Invoice[]) {
  const csvHeaders = [
    'Numer Faktury', 'Data Wystawienia', 'Nabywca', 'NIP Nabywcy',
    'Wartość Netto', 'Kwota VAT', 'Wartość Brutto', 'Waluta', 'Status',
  ].join(';');

  const csvRows = invoices.map((inv) => {
    const net = Number(inv.totalNet);
    const gross = Number(inv.totalGross);
    const vatAmount = gross - net;
    
    return [
      inv.number,
      inv.issueDate.toISOString().split('T')[0],
      `"${inv.buyerName.replace(/"/g, '""')}"`,
      inv.buyerNip || 'Brak',
      net.toFixed(2).replace('.', ','),
      vatAmount.toFixed(2).replace('.', ','),
      gross.toFixed(2).replace('.', ','),
      inv.currency,
      inv.status,
    ].join(';');
  });

  const bom = '\uFEFF';
  return bom + [csvHeaders, ...csvRows].join('\n');
}