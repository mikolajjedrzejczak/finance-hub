import { companyRepository } from '@/repositories/company.repository';

export const dashboardService = {
  async getDashboardData(userId: string) {
    return companyRepository.getCompaniesWithInvoices(userId);
  },
};
