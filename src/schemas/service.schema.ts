// import z from 'zod';

// export const serviceSchema = z.object({
//   name: z.string().min(2, 'Nazwa usługi/produktu musi mieć min. 2 znaki'),
//   description: z.string().optional(),
//   priceNet: z.coerce.number().min(0, 'Cena netto nie może być ujemna'),
//   vatRate: z.coerce
//     .number()
//     .min(0, 'Stawka VAT nie może być ujemna')
//     .max(100, 'Stawka VAT nie może przekraczać 100%'),
// });

// export type ServiceInput = z.infer<typeof serviceSchema>;

// schemas/service.schema.ts
import z from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nazwa usługi/produktu musi mieć min. 2 znaki'),
  description: z.string().optional(),
  priceNet: z.number().min(0, 'Cena netto nie może być ujemna'),
  vatRate: z.number().min(0, 'Stawka VAT nie może być ujemna').max(100, 'Stawka VAT nie może przekraczać 100%'),
});

export type ServiceInput = z.infer<typeof serviceSchema>;