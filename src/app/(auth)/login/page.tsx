'use client';

import { loginUserAction } from '@/app/actions/auth.actions';
import Input from '@/components/ui/Input';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import AuthLayout from '../AuthLayout';
import AuthForm from '../AuthForm';
import { signIn } from 'next-auth/react';

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
    <AuthLayout
      heroTitle="Zarządzaj finansami"
      heroSubtitle="Finance Hub"
      heroDescription="Kontroluj przychody, faktury i wyniki swoich firm — z dowolnego miejsca."
    >
      <AuthForm
        title="Zaloguj się"
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel="Zaloguj się"
        submitLoadingLabel="Logowanie..."
        footerText="Nie masz jeszcze konta?"
        footerLinkText="Zarejestruj się"
        footerLinkHref="/register"
      >
        <Input
          id="email"
          title="Adres e-mail"
          type="email"
          register={register}
          errors={errors.email}
          required
        />
        <Input
          id="password"
          title="Hasło"
          type="password"
          register={register}
          errors={errors.password}
          required
        />
      </AuthForm>
    </AuthLayout>
  );
}
