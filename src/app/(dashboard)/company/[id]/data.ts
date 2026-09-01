import { companyService } from '@/services/company.service';
import { InvoiceDisplay } from '@/types/invoice.type';
import {
  calculateSingleCompanyKPIs,
  serializeInvoices,
} from '@/utils/company.utils';
import 'server-only';

export async function getSingleCompanyData(companyId: string, userId: string) {
  const companyData = await companyService.getCompanyDashboardData(
    companyId,
    userId,
  );

  if (!companyData) return null;

  const serializedInvoices: InvoiceDisplay[] = serializeInvoices(
    companyData.invoices,
  );
  const kpi = calculateSingleCompanyKPIs(serializedInvoices);

  return {
    company: {
      id: companyData.id,
      name: companyData.name,
      nip: companyData.nip,
    },
    invoices: serializedInvoices,
    kpi,
  };
}
