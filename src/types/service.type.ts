import { Service } from "@prisma/client";

export type SerializedService = Omit<Service, 'priceNet' | 'vatRate'> & {
  priceNet: number;
  vatRate: number;
};
