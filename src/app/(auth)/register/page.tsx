'use client';

import { registerUserAction } from '@/app/actions/auth.actions';
import Input from '@/components/ui/Input';
import { RegisterInput, registerSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    if (data.name) formData.append('name', data.name);

    const result = await registerUserAction(formData);

    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      router.push('/login?registered=true');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Załóż konto
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rozpocznij wystawianie faktur w kilka sekund.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {serverError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <Input
              title="Imię i nazwisko / Firma"
              config={{ ...register('name') }}
              errors={errors.name}
              placeholder="Jan Nowak"
            />
            <Input
              title="Adres e-mail"
              type="email"
              config={{ ...register('email') }}
              errors={errors.email}
              placeholder="jan@example.com"
              important
            />
            <Input
              title="Hasło"
              type="password"
              config={{ ...register('password') }}
              errors={errors.password}
              placeholder="*******"
              important
            />
            <Input
              title="Powtórz hasło"
              type="password"
              config={{ ...register('confirmPassword') }}
              errors={errors.confirmPassword}
              placeholder="*******"
              important
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </button>
          <p className="text-black/50 text-end">
            Masz konto?{' '}
            <Link className="text-blue-800" href="/login">
              Zaloguj się
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
