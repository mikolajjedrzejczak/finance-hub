'use server';

import { auth } from '@/auth';
import { DomainError, UnauthorizedError } from '@/errors/domain.errors';
import { CompanyInput, companySchema } from '@/schemas/company.schema';
import { companyService } from '@/services/company.service';
import { revalidatePath } from 'next/cache';

export async function createCompanyAction(data: CompanyInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError('Musisz być zalogowany, aby dodać firmę.');
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
    if (error instanceof DomainError) {
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
    if (!session?.user?.id) throw new UnauthorizedError();

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
    if (error instanceof DomainError) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function deleteCompanyAction(companyId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) throw new UnauthorizedError();

    await companyService.deleteCompany(companyId, session.user.id);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }

    return { error: 'Wystąpił nieoczekiwany błąd serwera' };
  }
}

export async function setActiveCompanyAction(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    await companyService.setActiveCompany(companyId, session.user.id);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    return { error: 'Nie udało się zmienić aktywnej firmy' };
  }
}
