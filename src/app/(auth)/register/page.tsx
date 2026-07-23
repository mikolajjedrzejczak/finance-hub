'use client';

import { registerUserAction } from '@/app/actions/auth.actions';
import Input from '@/components/ui/Input';
import { RegisterInput, registerSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import AuthLayout from '../AuthLayout';
import AuthForm from '../AuthForm';


export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', name: '' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const result = await registerUserAction(formData);

    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      router.push('/login?registered=true');
    }
  };

  return (
    <AuthLayout
      heroTitle="Twój nowy panel finansowy"
      heroSubtitle="Finance Hub"
      heroDescription="Jedno konto. Wiele firm. Pełna kontrola."
    >
      <AuthForm
        title="Załóż konto"
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        serverError={serverError}
        submitLabel="Zarejestruj się"
        submitLoadingLabel="Rejestrowanie..."
        footerText="Masz konto?"
        footerLinkText="Zaloguj się"
        footerLinkHref="/login"
      >
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
      </AuthForm>
    </AuthLayout>
  );
}