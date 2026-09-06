import { companyRepository } from '@/repositories/company.repository';
import { CompanyInput } from '@/schemas/company.schema';
import { invoiceRepository } from '@/repositories/invoice.repository';
import { ConflictError, NotFoundError } from '@/errors/domain.errors';

export const companyService = {
  async createCompany(data: CompanyInput, userId: string) {
    const count = await companyRepository.countUserCompanies(userId);
    const isDefault = count === 0;

    const existig = await companyRepository.findByNip(data.nip);
    if (existig)
      throw new ConflictError('Firma o podanym NIPie istnieje już w systemie.');

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

    if (!existig) throw new NotFoundError('Nie znaleziono firmy');

    return companyRepository.update(companyId, userId, data);
  },

  async deleteCompany(companyId: string, userId: string) {
    const existig = await companyRepository.findCompanyByIdAndUserId(
      companyId,
      userId,
    );

    if (!existig) throw new NotFoundError('Nie znaleziono firmy');

    const invoicesCount = await invoiceRepository.countByCompanyId(existig.id);

    if (invoicesCount > 0) {
      throw new ConflictError(
        'Nie można usunąć firmy, która posiada wystawione faktury. Usuń najpierw wystawione faktury.',
      );
    }

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
