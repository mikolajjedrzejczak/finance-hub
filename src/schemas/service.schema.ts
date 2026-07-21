import z from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nazwa usługi/produktu musi mieć min. 2 znaki'),
  description: z.string().optional(),
  priceNet: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    },
    z.number().min(0, 'Cena netto nie może być ujemna'),
  ),
  vatRate: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    },
    z
      .number()
      .min(0, 'Stawka VAT nie może być ujemna')
      .max(100, 'Stawka VAT nie może przekraczać 100%'),
  ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
