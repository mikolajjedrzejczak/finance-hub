'use server';

import { auth } from '@/auth';
import { ClientInput, clientSchema } from '@/schemas/client.schema';
import { clientService } from '@/services/client.service';
import { revalidatePath } from 'next/cache';

export async function createClientAction(data: ClientInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Musisz być zalogowany, aby dodać klienta.' };
    }

    const validateData = clientSchema.safeParse(data);

    if (validateData?.error) {
      return {
        error: 'Nieprawidłowe dane',
        details: validateData.error.flatten().fieldErrors,
      };
    }

    const newClient = await clientService.createClient(
      validateData.data,
      session.user.id,
    );

    revalidatePath('/clients');
    return { success: true, client: newClient };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' };
  }
}

export async function updateClientAction(id: string, data: ClientInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    const validateData = await clientSchema.safeParse(data);

    if (!validateData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validateData.error.flatten().fieldErrors,
      };
    }

    await clientService.updateClient(id, data, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function deleteClientAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    await clientService.deleteClient(id, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}
