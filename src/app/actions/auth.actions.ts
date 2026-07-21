'use server';

import { signIn } from '@/auth';
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
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
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
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Nieprawidłowy e-mail lub hasło.' };
        default:
          return { error: 'Wystąpił błąd podczas logowania.' };
      }
    }

    throw Error;
  }
}
