import z, { literal } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Nazwa firmy/klienta musi mieć conajmniej 2 znaki'),
  nip: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      'NIP musi składać się z 10 cyfr oraz bez spacji i myślników',
    ),
  city: z.string().min(2, 'Miasto jest wymagane'),
  postal: z
    .string()
    .regex(/^[0-9]{2}-[0-9]{3}$/, 'Kod pocztowy musi być w formacie XX-XXX'),
  address: z.string().min(2, 'Ulica i numer są wymagane'),

  email: z.string().email('Niepoprawny e-mail').optional().or(z.literal('')),
  phone: z.string().optional().or(literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
});

export type ClientInput = z.infer<typeof clientSchema>;
