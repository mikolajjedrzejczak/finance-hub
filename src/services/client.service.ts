import { clientRepository } from '@/repositories/client.repository';
import { companyRepository } from '@/repositories/company.repository';
import { ClientInput } from '@/schemas/client.schema';

export const clientService = {
  async createClient(data: ClientInput, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) {
      throw new Error(
        'Musisz najpierw uzupełnić profil swojej firmy, aby móc dodawać klientów.',
      );
    }


    if (userCompany.nip === data.nip) {
      throw new Error('Nie możesz dodać własnej firmy jako klienta');
    }

    const existingClient = await clientRepository.findByNipAndCompanyId(
      data.nip,
      userCompany.id,
    );

    if (existingClient) {
      throw new Error(
        'Klient o podanym numerze NIP już istnieje w Twojej bazie.',
      );
    }

    const newClient = await clientRepository.create({
      name: data.name,
      nip: data.nip,
      city: data.city,
      postal: data.postal,
      address: data.address,
      email: data.email || undefined,
      phone: data.phone || undefined,
      bankAccount: data.bankAccount || undefined,
      userId,
      companyId: userCompany.id,
    });

    return newClient;
  },

  async updateClient(id: string, data: ClientInput, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) throw new Error('Brak profilu firmy');

    return clientRepository.update(id, userCompany.id, data);
  },

  async deleteClient(id: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) throw new Error('Brak profilu firmy');

    return clientRepository.delete(id, userCompany.id);
  },

  async getClients(userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) {
      return [];
    }

    return clientRepository.findAllbyCompanyId(userCompany.id);
  },
};
