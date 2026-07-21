'use server';

import { auth } from '@/auth';
import { CompanyInput, companySchema } from '@/schemas/company.schema';
import { companyService } from '@/services/company.service';
import { revalidatePath } from 'next/cache';

export async function createCompanyAction(data: CompanyInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Musisz być zalogowany, aby dodać firmę.' };
    }

    const validatedData = companySchema.safeParse(data);
    if (!validatedData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const newCompany = await companyService.createCompany(
      validatedData.data,
      session.user.id,
    );

    revalidatePath('/', 'layout');

    return { success: true, company: newCompany };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' };
  }
}

export async function updateCompanyAction(
  companyId: string,
  data: CompanyInput,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Brak autoryzacji');

    const validateData = await companySchema.safeParse(data);
    if (!validateData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validateData.error.flatten().fieldErrors,
      };
    }

    const result = await companyService.updateCompany(
      validateData.data,
      companyId,
      session.user.id,
    );

    revalidatePath('/', 'layout');

    return { success: true, updatedComapany: result };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function deleteCompanyAction(companyId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    await companyService.deleteCompany(companyId, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function setActiveCompanyAction(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Brak autoryzacji' };

    await companyService.setActiveCompany(companyId, session.user.id);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    return { error: 'Nie udało się zmienić aktywnej firmy' };
  }
}
