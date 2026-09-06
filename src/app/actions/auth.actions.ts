'use server';

import { signIn } from '@/auth';
import { DomainError } from '@/errors/domain.errors';
import { registerSchema } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { AuthError } from 'next-auth';

export async function registerUserAction(formData: FormData) {
  try {
    const validatedData = registerSchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!validatedData.success) {
      return {
        error: 'Nieprawidłowe dane',
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    await authService.registerUser(validatedData.data);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      return { error: error.message, statusCode: error.statusCode };
    }
    console.error('Nieoczekiwany błąd rejestracji: ', error);
    return { error: 'Wystąpił nieoczekiwany błąd serwera.' };
  }
}

export async function loginUserAction(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      if (
        error.type === 'CredentialsSignin' ||
        error.cause?.err?.message?.includes('Nieprawidłowy e-mail lub hasło')
      ) {
        return { error: 'Nieprawidłowy e-mail lub hasło.' };
      }
      return { error: 'Wystąpił błąd podczas logowania.' };
    }

    if (error instanceof DomainError) {
      return { error: error.message, statusCode: error.statusCode };
    }

    console.error('Błąd logowania: ', error);
    return { error: 'Wystąpił nieoczekiwany błąd.' };
  }
}
