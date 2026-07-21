'use client';

import { registerUserAction } from '@/app/actions/auth.actions';
import Input from '@/components/ui/Input';
import { RegisterInput, registerSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex items-center justify-center w-full rounded-xl ">
        <div className="relative hidden lg:block flex-1 h-screen w-[sc] bg-linear-to-br from-blue-600 to-blue-900 overflow-hidden">
          <div className="flex items-center p-12 pb-36">
            <span className="flex items-center text-5xl font-bold text-white">
              Finance Hub
            </span>
          </div>
          <div className="flex flex-col gap-10 w-130 ml-12 xl:ml-36">
            <h2 className="text-4xl  text-white text-start">
              Twój nowy panel finansowy
            </h2>
            <p className="text-white/70">
              Jedno konto. Wiele firm. Pełna kontrola.
            </p>
          </div>
          <Image
            src="/hero.png"
            width={700}
            height={400}
            alt="hero"
            className="absolute bottom-0 -right-20 rounded-tl-xl"
          />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-8 bg-white px-8 md:px-0 ">
          <div className="text-start w-full sm:w-130">
            <h2 className="text-2xl md:text-3xl  tracking-tight text-gray-900">
              Załóż konto
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
                id="name"
                title="Imię i nazwisko / Firma"
                register={register}
                errors={errors.name}
                placeholder="Jan Nowak"
              />
              <Input
                id="email"
                title="Adres e-mail"
                type="email"
                register={register}
                errors={errors.email}
                placeholder="jan@example.com"
                required
              />
              <Input
                id="password"
                title="Hasło"
                type="password"
                register={register}
                errors={errors.password}
                placeholder="*******"
                required
              />
              <Input
                id="confirmPassword"
                title="Powtórz hasło"
                type="password"
                register={register}
                errors={errors.confirmPassword}
                placeholder="*******"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Logowanie...' : 'Zarejestruj się'}
            </button>
            <p className="text-black/50">
              Masz konto?{' '}
              <Link className="text-blue-800" href="/login">
                &nbsp;Zaloguj się
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
