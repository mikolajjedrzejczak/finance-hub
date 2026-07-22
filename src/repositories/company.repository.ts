import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const companyRepository = {
  async findDefaultForUser(userId: string) {
    const defaultCompany = await prisma.company.findFirst({
      where: { userId, isDefault: true },
    });

    if (defaultCompany) return defaultCompany;

    return prisma.company.findFirst({
      where: { userId },
    });
  },

  async findCompanyByIdAndUserId(id: string, userId: string) {
    return prisma.company.findFirst({ where: { id, userId } });
  },

  async countUserCompanies(userId: string) {
    return prisma.company.count({ where: { userId } });
  },

  async countCompanyInvoices(companyId: string) {
    return prisma.invoice.count({ where: { companyId } });
  },

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    return prisma.company.create({ data });
  },

  async update(
    id: string,
    userId: string,
    data: Prisma.CompanyUncheckedUpdateInput,
  ) {
    const existing = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!existing) throw new Error('Nie znalezionu firmy');

    return prisma.company.updateMany({
      where: { id, userId },
      data,
    });
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!existing) throw new Error('Nie znalezionu firmy');

    const invoicesCount = await prisma.invoice.count({
      where: { companyId: id },
    });

    if (invoicesCount > 0) {
      throw new Error('HAS_INVOICES');
    }

    return prisma.company.delete({
      where: { id },
    });
  },

  async findAllByUserId(userId: string) {
    return prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async setAsDefault(companyId: string, userId: string) {
    return prisma.$transaction([
      prisma.company.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),

      prisma.company.update({
        where: { id: companyId, userId },
        data: { isDefault: true },
      }),
    ]);
  },

  async getCompaniesWithInvoicesForDashboard(userId: string) {
    return prisma.company.findMany({
      where: { userId },
      include: {
        invoices: {
          select: {
            totalGross: true,
            status: true,
            issueDate: true,
            client: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getGlobalRecentInvoices(userId: string) {
  return await prisma.invoice.findMany({
    where: {
      company: {
        userId: userId
      }
    },
    orderBy: {
      issueDate: 'desc'
    },
    take: 10,
    include: {
      client: true,
      company: true,
    }
  });
},

  async getCompanyWithInvoices(companyId: string, userId: string) {
    return prisma.company.findFirst({
      where: {
        id: companyId,
        userId: userId,
      },
      include: {
        invoices: {
          include: { client: true },
          orderBy: { issueDate: 'desc' },
        },
      },
    });
  },
};
