import prisma from '@/lib/prisma';
import {
  InvoiceDisplayDTO,
  invoiceDisplayDTOSchema,
} from '@/schemas/invoice.schema';
import { InvoiceStatus, Prisma } from '@prisma/client';

const invoiceWithItemsInclude = {
  items: true,
} satisfies Prisma.InvoiceInclude;

type InvoiceWithItems = Prisma.InvoiceGetPayload<{
  include: { items: true };
}>;

export interface FindInvoiceParams {
  companyId: string;
  query?: string;
  status?: InvoiceStatus;
  skip?: number;
  take?: number;
  startDate?: Date;
  endDate?: Date;
}

function mapToInvoiceDisplayDTO(invoice: InvoiceWithItems): InvoiceDisplayDTO {
  const rawData = {
    ...invoice,
    totalNet: invoice.totalNet.toNumber(),
    totalGross: invoice.totalGross.toNumber(),
    paidAmount: invoice.paidAmount ? invoice.paidAmount.toNumber() : 0,
    items: invoice.items.map((item) => ({
      ...item,
      quantity: item.quantity.toNumber(),
      priceNet: item.priceNet.toNumber(),
      vatRate: item.vatRate.toNumber(),
    })),
  };

  return invoiceDisplayDTOSchema.parse(rawData);
}

export const invoiceRepository = {
  async create(data: Prisma.InvoiceUncheckedCreateInput) {
    return prisma.invoice.create({
      data,
      include: invoiceWithItemsInclude,
    });
  },

  async updateStatus(id: string, companyId: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id, companyId },
      data: { status },
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

    return invoice ? mapToInvoiceDisplayDTO(invoice) : null;
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

  async getPublicById(id: string): Promise<InvoiceDisplayDTO | null> {
    if (!id) return null;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    return invoice ? mapToInvoiceDisplayDTO(invoice) : null;
  },

  async countByCompanyId(companyId: string) {
    return prisma.invoice.count({
      where: { companyId },
    });
  },

  async countByClientId(clientId: string, companyId: string) {
    return prisma.invoice.count({
      where: { clientId, companyId },
    });
  },

  buildInvoiceFilter(params: FindInvoiceParams): Prisma.InvoiceWhereInput {
    const { companyId, query, status, startDate, endDate } = params;

    return {
      companyId,
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            issueDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { number: { contains: query, mode: 'insensitive' } },
              { client: { name: { contains: query, mode: 'insensitive' } } },
              { client: { nip: { contains: query } } },
            ],
          }
        : {}),
    };
  },

  async findPaginatedByCompanyId(params: FindInvoiceParams) {
    const where = this.buildInvoiceFilter(params);

    return prisma.invoice.findMany({
      where,
      skip: params.skip,
      take: params.take,
      include: {
        client: {
          select: {
            name: true,
            nip: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });
  },

  async countFilteredByCompanyId(params: FindInvoiceParams) {
    const where = this.buildInvoiceFilter(params);

    return prisma.invoice.count({ where });
  },
};
