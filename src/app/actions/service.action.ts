'use server';

import { auth } from '@/auth';
import { ServiceInput, serviceSchema } from '@/schemas/service.schema';
import { catalogService } from '@/services/service.service';
import { revalidatePath } from 'next/cache';
import { DomainError, UnauthorizedError } from '@/errors/domain.errors';

export async function createServiceAction(data: ServiceInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) throw new UnauthorizedError();

    const validatedData = serviceSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    await catalogService.createService(validatedData.data, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczikowany błąd serwera' };
  }
}

export async function updateServiceAction(id: string, data: ServiceInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) throw new UnauthorizedError();

    const validatedData = await serviceSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    await catalogService.updateService(id, validatedData.data, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) throw new UnauthorizedError();

    await catalogService.deleteService(id, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}
