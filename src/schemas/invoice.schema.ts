import { z } from 'zod';
import { Currency, PaymentMethod } from '@prisma/client';

export const invoiceItemSchema = z.object({
  serviceId: z.string().optional(),
  description: z.string().min(1, 'Opis pozycji jest wymagany'),
  quantity: z.coerce.number().min(0.01, 'Ilość musi być większa od 0'),
  priceNet: z.coerce.number().min(0, 'Cena nie może być ujemna'),
  vatRate: z.coerce
    .number()
    .min(0, 'VAT nie może być ujemny')
    .max(100, 'Max 100%'),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Wybierz klienta'),
  number: z.string().min(1, 'Numer faktury jest wymagany'),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.nativeEnum(Currency),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Faktura musi mieć przynajmniej jedną pozycję'),
});

export const invoiceItemDTOSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  priceNet: z.number(),
  vatRate: z.number(),
});

export const invoiceDisplayDTOSchema = z.object({
  id: z.string(),
  number: z.string(),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.string(),
  totalNet: z.number(),
  totalGross: z.number(),
  paidAmount: z.number(),
  currency: z.string(),
  paymentMethod: z.string(),

  sellerName: z.string(),
  sellerNip: z.string(),
  sellerAddress: z.string(),
  sellerPostal: z.string(),
  sellerCity: z.string(),
  sellerBankAccount: z.string().nullable(),


  buyerName: z.string(),
  buyerNip: z.string(),
  buyerAddress: z.string(),
  buyerPostal: z.string(),
  buyerCity: z.string(),


  items: z.array(invoiceItemDTOSchema),
});


export type InvoiceDisplayDTO = z.infer<typeof invoiceDisplayDTOSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
