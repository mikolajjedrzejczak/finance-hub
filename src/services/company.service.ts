import { companyRepository } from '@/repositories/company.repository';
import { CompanyInput } from '@/schemas/company.schema';

export const companyService = {
  async createCompany(data: CompanyInput, userId: string) {
    const count = await companyRepository.countUserCompanies(userId);
    const isDefault = count === 0;

    return companyRepository.create({
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      bankAccount: data.bankAccount || undefined,
      userId,
      isDefault,
    });
  },

  async updateCompany(data: CompanyInput, companyId: string, userId: string) {
    const existig = await companyRepository.findCompanyByIdAndUserId(
      companyId,
      userId,
    );

    if (!existig) throw new Error('Nie znaleziono firmy');

    return companyRepository.update(companyId, userId, data);
  },

  async deleteCompany(companyId: string, userId: string) {
    const existig = await companyRepository.findCompanyByIdAndUserId(
      companyId,
      userId,
    );

    if (!existig) throw new Error('Nie znaleziono firmy');

    return companyRepository.delete(companyId, userId);
  },

  async getUserCompanies(userId: string) {
    return companyRepository.findAllByUserId(userId);
  },

  async setActiveCompany(companyId: string, userId: string) {
    return companyRepository.setAsDefault(companyId, userId);
  },

  async getCompanyDashboardData(companyId: string, userId: string) {
    return companyRepository.getCompanyWithInvoices(companyId, userId);
  },
};
