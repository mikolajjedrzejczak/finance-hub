import prisma from '@/lib/prisma';
import {
  InvoiceDisplayDTO,
  invoiceDisplayDTOSchema,
} from '@/schemas/invoice.schema';
import { Prisma } from '@prisma/client';

export const invoiceRepository = {
  async create(data: Prisma.InvoiceUncheckedCreateInput) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) throw new Error('Nie znaleziono danych sprzedawcy.');

    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) throw new Error('Nie znaleziono danych nabywcy.');

    return prisma.invoice.create({
      data: {
        ...data,

        sellerName: company.name,
        sellerNip: company.nip,
        sellerAddress: company.address,
        sellerPostal: company.postal,
        sellerCity: company.city,
        sellerBankAccount: company.bankAccount,

        buyerName: client.name,
        buyerNip: client.nip,
        buyerAddress: client.address,
        buyerPostal: client.postal,
        buyerCity: client.city,
      },
      include: {
        items: true,
      },
    });
  },

  async findByNumberAndCompanyId(number: string, companyId: string) {
    return prisma.invoice.findFirst({
      where: { number, companyId },
    });
  },

  async findAllByCompanyId(companyId: string) {
    return prisma.invoice.findMany({
      where: { companyId },
      include: {
        client: {
          select: { name: true, nip: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    });
  },

  async findByIdAndCompanyId(id: string, companyId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!invoice) return null;

    const rawData = {
      ...invoice,
      totalNet: invoice.totalNet.toNumber(),
      totalGross: invoice.totalGross.toNumber(),
      paidAmount: invoice.paidAmount.toNumber(),
      items: invoice.items.map((item) => ({
        ...item,
        quantity: item.quantity.toNumber(),
        priceNet: item.priceNet.toNumber(),
        vatRate: item.vatRate.toNumber(),
      })),
    };

    return invoiceDisplayDTOSchema.parse(rawData);
  },

  async updateStatus(id: string, companyId: string, status: any) {
    return prisma.invoice.update({
      where: { id, companyId },
      data: { status },
    });
  },

  async findLatestInDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return prisma.invoice.findFirst({
      where: {
        companyId,
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { issueDate: 'desc' },
    });
  },

  async getDashboardStats(companyId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      select: { totalGross: true, status: true, issueDate: true },
    });

    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.totalGross), 0);

    const pendingAmount = invoices
      .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + Number(i.totalGross), 0);

    const recentInvoices = await prisma.invoice.findMany({
      where: { companyId },
      orderBy: { issueDate: 'desc' },
      take: 10,
      include: {
        client: true,
      },
    });

    return { totalRevenue, pendingAmount, count: invoices.length, recentInvoices };
  },

  async getPublicById(id: string): Promise<InvoiceDisplayDTO | null> {
    if (!id) return null;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) return null;

    const rawData = {
      ...invoice,
      totalNet: invoice.totalNet.toNumber(),
      totalGross: invoice.totalGross.toNumber(),
      paidAmount: invoice.paidAmount.toNumber(),
      items: invoice.items.map((item) => ({
        ...item,
        quantity: item.quantity.toNumber(),
        priceNet: item.priceNet.toNumber(),
        vatRate: item.vatRate.toNumber(),
      })),
    };

    return invoiceDisplayDTOSchema.parse(rawData);
  },
};
