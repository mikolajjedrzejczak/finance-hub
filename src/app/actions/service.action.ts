'use server';

import { auth } from '@/auth';
import { ServiceInput, serviceSchema } from '@/schemas/service.schema';
import { catalogService } from '@/services/service.service';
import { revalidatePath } from 'next/cache';

export async function createServiceAction(data: ServiceInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

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
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczikowany błąd serwera' };
  }
}

export async function updateServiceAction(id: string, data: ServiceInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    const validatedData = await serviceSchema.safeParse(data);

    if (!validatedData.success) return { error: 'Nieprawidłowe dane' };

    await catalogService.updateService(id, data, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    await catalogService.deleteService(id, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}
