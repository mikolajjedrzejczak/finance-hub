import prisma from '@/lib/prisma';
import { RegisterInput } from '@/schemas/auth.schema';

export const authRepository = {
  async findUser(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data: Pick<RegisterInput, 'email' | 'password' | 'name'>) {
    return await prisma.user.create({
      data,
    });
  },
};
