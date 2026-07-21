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
    const existing = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!existing) throw new Error('Nie znaleziono klienta');

    return prisma.client.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, companyId: string) {
    const result = await prisma.client.deleteMany({
      where: { id, companyId },
    });

    if (result.count === 0) throw new Error('Nie znaleziono klineta');

    return true;
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
