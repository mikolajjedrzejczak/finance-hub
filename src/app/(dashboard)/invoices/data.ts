import 'server-only';
import { cache } from 'react';
import { clientService } from '@/services/client.service';
import { catalogService } from '@/services/service.service';
import { invoiceService } from '@/services/invoice.service';
import { companyRepository } from '@/repositories/company.repository';
import { InvoiceStatus } from '@prisma/client';

export interface InvoicePageData {
  companyId: string;
  clients: Awaited<ReturnType<typeof clientService.getClients>>;
  services: Array<{
    id: string;
    name: string;
    priceNet: number;
    vatRate: number;
    description?: string | null;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    issueDate: string;
    totalGross: number;
    status: InvoiceStatus;
    client: { name: string; nip: string };
  }>;
  nextInvoiceNumber: string;
}

export const getInvoicePageData = cache(
  async (userId: string): Promise<InvoicePageData | null> => {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) return null;

    const [rawClients, rawServices, rawInvoices, nextInvoiceNumber] =
      await Promise.all([
        clientService.getClients(userId),
        catalogService.getServices(userId),
        invoiceService.getInvoices(userId),
        invoiceService.getNextInvoiceNumber(userId),
      ]);

    const services = rawServices.map((s) => ({
      id: s.id,
      name: s.name,
      priceNet: Number(s.priceNet),
      vatRate: Number(s.vatRate),
      description: s.description,
    }));

    const invoices = rawInvoices.map((inv) => ({
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

    return {
      companyId: userCompany.id,
      clients: rawClients,
      services,
      invoices,
      nextInvoiceNumber,
    };
  },
);
