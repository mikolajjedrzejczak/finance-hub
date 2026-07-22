'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { loginUserAction } from '@/app/actions/auth.actions';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Image from 'next/image';

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex items-center justify-center w-full rounded-xl ">
        <div className="relative hidden lg:block flex-1 h-screen w-[sc] bg-linear-to-br from-blue-600 to-blue-900 overflow-hidden">
          <div className="flex items-center p-12 pb-36">
            <h1 className="flex items-center gap-2 text-6xl font-bold text-white">
              Finance Hub
            </h1>
          </div>
          <div className="flex flex-col gap-10 w-130 ml-12 xl:ml-36">
            <h2 className="text-4xl  text-white text-start">
              Zarządzaj finansami
            </h2>
            <p className="text-white/70">
              Kontroluj przychody, faktury i wyniki swoich firm — z dowolnego
              miejsca.
            </p>
          </div>
          <Image
            src="/hero.png"
            width={700}
            height={400}
            preload
            alt="hero"
            className="absolute bottom-0 -right-20 rounded-tl-xl"
          />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-8 bg-white px-8 md:px-0 ">
          <div className="text-start w-full sm:w-130">
            <h2 className="text-2xl md:text-3xl  tracking-tight text-gray-900">
              Zaloguj się
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-12  w-full sm:w-130"
          >
            {serverError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div className="space-y-6">
              <Input
                id="email"
                title="Adres e-mail"
                register={register}
                type="email"
                errors={errors.email}
                required
              />
              <Input
                id="password"
                title="Hasło"
                register={register}
                type="password"
                errors={errors.password}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
            </button>
            <p className="text-black/50">
              Nie masz jeszcze konta?{' '}
              <Link className="text-blue-800" href="/register">
                &nbsp;Zarejestruj się
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
