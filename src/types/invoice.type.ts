import { InvoiceStatus } from "@prisma/client";

export interface InvoiceDisplay  {
  id: string;
  number: string;
  issueDate: string;
  totalGross: number;
  status: InvoiceStatus;
  client: { name: string; nip: string };
};

export interface GetPaginatedInvoiceInput {
  userId: string;
  companyId?: string;
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

