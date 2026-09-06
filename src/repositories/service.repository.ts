import prisma from '@/lib/prisma';
import { NotFoundError } from '@/errors/domain.errors';
import { Prisma } from '@prisma/client';

export const serviceRepository = {
  async create(data: Prisma.ServiceUncheckedCreateInput) {
    return prisma.service.create({ data });
  },

  async update(
    id: string,
    companyId: string,
    data: Prisma.ServiceUncheckedUpdateInput,
  ) {
    const existing = await prisma.service.findFirst({
      where: { id, companyId },
    });

    if (!existing) throw new NotFoundError('Nie znaleziono usługi');

    return prisma.service.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, companyId: string) {
    const existing = await prisma.service.findFirst({ where: { id, companyId}});

    if (!existing) throw new NotFoundError('Nie znaleziono usługi');

    return prisma.service.update({
      where: { id },
      data: { isActive: false }
    })
  },

  async findByNameAndCompanyId(name: string, companyId: string) {
    return prisma.service.findFirst({
      where: { name, companyId },
    });
  },

  async findAllByCompanyId(companyId: string) {
    return prisma.service.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};
