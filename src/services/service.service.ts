import { companyRepository } from '@/repositories/company.repository';
import { serviceRepository } from '@/repositories/service.repository';
import { ServiceInput } from '@/schemas/service.schema';

export const catalogService = {
  async createService(data: ServiceInput, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) {
      throw new Error('Musisz najpierw uzupełnić profil swojej firmy.');
    }

    const existing = await serviceRepository.findByNameAndUserId(
      data.name,
      userCompany.id,
    );

    if (existing) {
      throw new Error('Usługa o tej nazwie już istnieje');
    }

    return serviceRepository.create({
      name: data.name,
      priceNet: data.priceNet,
      vatRate: data.vatRate,
      description: data.description || undefined,
      userId,
      companyId: userCompany.id,
    });
  },

  async updateService(id: string, data: any, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) throw new Error('Brak profilu firmy');

    return serviceRepository.update(id, userCompany.id, data);
  },

  async deleteService(id: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) throw new Error('Brak profilu firmy');

    return serviceRepository.delete(id, userCompany.id);
  },

  async getServices(userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) {
      return [];
    }

    return serviceRepository.findAllByCompanyId(userCompany.id);
  },
};
