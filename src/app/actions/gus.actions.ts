'use server';

import { gusService } from '@/services/gus.service';

export async function fetchCompanyFromGusAction(nip: string) {
  try {
    const data = await gusService.fetchCompanyByNip(nip);
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Wystąpił nieoczekiwany błąd pobierania danych' };
  }
}
