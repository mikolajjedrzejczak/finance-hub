import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const clientRepository = {
  async create(data: Prisma.ClientUncheckedCreateInput) {
    return prisma.client.create({ data });
  },

  async update(
    id: string,
    companyId: string,
    data: Prisma.ClientUncheckedUpdateInput,
  ) {
    return await prisma.client.updateMany({
      where: { id, companyId },
      data,
    });
  },

  async delete(id: string, companyId: string) {
    return await prisma.client.deleteMany({
      where: { id, companyId },
    });
  },

  async findByIdAndCompanyId(id: string, companyId: string) {
    return prisma.client.findFirst({
      where: { id, companyId },
    });
  },

  async findByNipAndCompanyId(nip: string, companyId: string) {
    return prisma.client.findFirst({
      where: { nip, companyId },
    });
  },

  async findAllbyCompanyId(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
