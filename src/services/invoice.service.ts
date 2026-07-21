import { invoiceRepository } from '@/repositories/invoice.repository';
import { companyRepository } from '@/repositories/company.repository';
import { InvoiceInput } from '@/schemas/invoice.schema';

export const invoiceService = {
  async createInvoice(data: InvoiceInput, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) {
      throw new Error('Musisz najpierw uzupełnić profil swojej firmy.');
    }

    const existing = await invoiceRepository.findByNumberAndCompanyId(
      data.number,
      userCompany.id,
    );
    if (existing) {
      throw new Error(`Faktura o numerze ${data.number} już istnieje.`);
    }

    let totalNet = 0;
    let totalGross = 0;

    const itemsToCreate = data.items.map((item) => {
      const itemNet = item.quantity * item.priceNet;
      const itemGross = itemNet * (1 + item.vatRate / 100);

      totalNet += itemNet;
      totalGross += itemGross;

      return {
        description: item.description,
        quantity: item.quantity,
        priceNet: item.priceNet,
        vatRate: item.vatRate,
        serviceId: item.serviceId || undefined,
      };
    });

    return invoiceRepository.create({
      number: data.number,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      totalNet,
      totalGross,
      userId,
      companyId: userCompany.id,
      clientId: data.clientId,
      items: {
        create: itemsToCreate,
      },
    });
  },

  async getInvoices(userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    if (!userCompany) return [];

    return invoiceRepository.findAllByCompanyId(userCompany.id);
  },
  async getInvoiceById(id: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) return null;
    return invoiceRepository.findByIdAndCompanyId(id, userCompany.id);
  },

  async updateInvoiceStatus(id: string, status: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) throw new Error('Brak profilu firmy');
    return invoiceRepository.updateStatus(id, userCompany.id, status);
  },

  async getNextInvoiceNumber(userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // np. 7

    const fallbackNumber = `FV/${year}/${month}/01`;

    if (!userCompany) return fallbackNumber;

    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastInvoice = await invoiceRepository.findLatestInDateRange(
      userCompany.id,
      startOfMonth,
      endOfMonth,
    );

    if (!lastInvoice) return fallbackNumber;

    const parts = lastInvoice.number.split('/');
    const lastSequenceStr = parts[parts.length - 1];
    const lastSequenceNumber = parseInt(lastSequenceStr, 10);

    if (isNaN(lastSequenceNumber)) return fallbackNumber;

    const nextSequence = (lastSequenceNumber + 1).toString().padStart(2, '0');

    console.log(lastInvoice)

    return `FV/${year}/${month}/${nextSequence}`;
  },
};
