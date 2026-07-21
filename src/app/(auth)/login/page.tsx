'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { loginUserAction } from '@/app/actions/auth.actions';
import Link from 'next/link';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await loginUserAction(formData);

    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Zaloguj się
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {serverError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <Input
              title="Adres e-mail"
              config={{ ...register('email') }}
              type="email"
            />
            <Input
              title="Hasło"
              config={{ ...register('password') }}
              type="password"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </button>
          <p className="text-black/50 text-end">
            Nie masz jeszcze konta?{' '}
            <Link className="text-blue-800" href="/register">
              Zarejestruj się
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
