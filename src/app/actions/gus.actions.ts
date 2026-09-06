'use server';

import { auth } from '@/auth';
import { DomainError, UnauthorizedError } from '@/errors/domain.errors';
import { gusService } from '@/services/gus.service';

export async function fetchCompanyFromGusAction(nip: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError("Musisz być zalogowany, aby pobrać dane z rejestru.");
    }

    const data = await gusService.fetchCompanyByNip(nip);
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    return { error: 'Wystąpił nieoczekiwany błąd pobierania danych' };
  }
}
