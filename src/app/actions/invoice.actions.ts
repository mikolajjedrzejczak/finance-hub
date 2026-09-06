'use server';

import { invoiceSchema, type InvoiceInput } from '@/schemas/invoice.schema';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { invoiceService } from '@/services/invoice.service';
import { DomainError, UnauthorizedError } from '@/errors/domain.errors';

export async function createInvoiceAction(data: InvoiceInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const validatedData = invoiceSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const newInvoice = await invoiceService.createInvoice(
      validatedData.data,
      session.user.id,
    );

    revalidatePath('/', 'layout');

    return { success: true, invoiceId: newInvoice.id };
  } catch (error: unknown) {
    if (error instanceof DomainError) return { error: error.message };
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' };
  }
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError('Brak autoryzacji');

    await invoiceService.updateInvoiceStatus(id, status, session.user.id);
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' };
  }
}
