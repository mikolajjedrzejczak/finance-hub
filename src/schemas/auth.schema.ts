import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Niepoprawny format adresu e-mail'),
    password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
    confirmPassword: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
    name: z.string().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Hasła nie są takie same!',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Niepopawny format adresu e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export type LoginInput = z.infer<typeof loginSchema>;
