import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2, 'Nazwa firmy musi mieć co najmniej 2 znaki'),
  nip: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      'NIP musi składać się z 10 cyfr bez spacji i myślników',
    ),
  city: z.string().min(2, 'Miasto jest wymagane'),
  postal: z
    .string()
    .regex(/^[0-9]{2}-[0-9]{3}$/, 'Kod pocztowy musi być w formacie XX-XXX'),
  address: z.string().min(2, 'Ulica i numer są wymagane'),

  email: z.string().email('Niepoprawny e-mail').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  bankAccount: z
    .string()
    .regex(/^[0-9]{9,18}$/, 'przykład: 635802010014976')
    .optional()
    .or(z.literal('')),
});

export type CompanyInput = z.infer<typeof companySchema>;
