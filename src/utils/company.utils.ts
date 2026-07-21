import { Prisma } from '@prisma/client';

type RawInvoiceWithClient = {
  id: string;
  number: string;
  issueDate: Date;
  totalGross: Prisma.Decimal | number | string;
  status: string;
  client: { name: string; nip: string };
};

export function serializeInvoices(invoices: RawInvoiceWithClient[]) {
  return invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    issueDate: inv.issueDate.toISOString().split('T')[0],
    totalGross: Number(inv.totalGross),
    status: inv.status,
    client: {
      name: inv.client.name,
      nip: inv.client.nip,
    },
  }));
}

export function calculateSingleCompanyKPIs(serializedInvoices: ReturnType<typeof serializeInvoices>) {
  return serializedInvoices.reduce(
    (acc, inv) => {
      acc.total += inv.totalGross;
      if (inv.status === 'PAID') {
        acc.paid += inv.totalGross;
      } else {
        acc.pending += inv.totalGross;
      }
      return acc;
    },
    { total: 0, paid: 0, pending: 0 },
  );
}