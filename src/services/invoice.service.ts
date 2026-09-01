import { invoiceRepository } from '@/repositories/invoice.repository';
import { companyRepository } from '@/repositories/company.repository';
import { InvoiceInput } from '@/schemas/invoice.schema';
import { clientRepository } from '@/repositories/client.repository';
import { InvoiceStatus } from '@prisma/client';
import { roundMoney } from '@/utils/money.utils';
import { GetPaginatedInvoiceInput } from '@/types/invoice.type';

export const invoiceService = {
  async createInvoice(data: InvoiceInput, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) {
      throw new Error('Musisz najpierw uzupełnić profil swojej firmy.');
    }

    const client = await clientRepository.findByIdAndCompanyId(
      data.clientId,
      userCompany.id,
    );

    if (!client) {
      throw new Error('Wybrany klient nie istnieje.');
    }

    const existing = await invoiceRepository.findByNumberAndCompanyId(
      data.number,
      userCompany.id,
    );

    if (existing) {
      throw new Error(`Faktura o numerze ${data.number} już istnieje.`);
    }

    let calculatedTotalNet = 0;
    let calculatedTotalGross = 0;

    const itemsToCreate = data.items.map((item) => {
      const quantity = Number(item.quantity);
      const priceNet = Number(item.priceNet);
      const vatRate = Number(item.vatRate);

      const itemNet = roundMoney(quantity * priceNet);
      const itemVat = roundMoney(itemNet * (vatRate / 100));
      const itemGross = roundMoney(itemNet + itemVat);

      calculatedTotalNet = roundMoney(calculatedTotalNet + itemNet);
      calculatedTotalGross = roundMoney(calculatedTotalGross + itemGross);

      return {
        description: item.description,
        quantity: Number(item.quantity),
        priceNet: Number(item.priceNet),
        vatRate: Number(item.vatRate),
        serviceId: item.serviceId || undefined,
      };
    });

    return invoiceRepository.create({
      number: data.number,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      totalNet: calculatedTotalNet,
      totalGross: calculatedTotalGross,
      userId,
      companyId: userCompany.id,
      clientId: data.clientId,

      sellerName: userCompany.name,
      sellerNip: userCompany.nip,
      sellerAddress: userCompany.address,
      sellerPostal: userCompany.postal,
      sellerCity: userCompany.city,
      sellerBankAccount: userCompany.bankAccount ?? null,

      buyerName: client.name,
      buyerNip: client.nip,
      buyerAddress: client.address,
      buyerPostal: client.postal,
      buyerCity: client.city,

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

  async getPaginatedInvoices({
    userId,
    companyId: explicitCompanyId,
    query = '',
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  }: GetPaginatedInvoiceInput) {
    let targetCompanyId = explicitCompanyId;

    if (!targetCompanyId) {
      const userCompany = await companyRepository.findDefaultForUser(userId);
      targetCompanyId = userCompany?.id;
    }

    if (!targetCompanyId) {
      return {
        invoices: [],
        totalPages: 0,
        currentPage: page,
        totalCount: 0,
        companyId: '',
      };
    }

    const safeStatus =
      status && status !== 'ALL' ? (status as InvoiceStatus) : undefined;
    const skip = (page - 1) * pageSize;

    let parsedStartDate: Date | undefined;
    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) parsedStartDate = date;
    }

    let parsedEndDate: Date | undefined;
    if (endDate) {
      const date = new Date(endDate);
      if (!isNaN(date.getTime())) {
        date.setHours(23, 59, 59, 999);
        parsedEndDate = date;
      }
    }

    const filterParams = {
      companyId: targetCompanyId,
      query: query.trim(),
      status: safeStatus,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      skip,
      take: pageSize,
    };

    const [rawInvoices, totalCount] = await Promise.all([
      invoiceRepository.findPaginatedByCompanyId(filterParams),
      invoiceRepository.countFilteredByCompanyId(filterParams),
    ]);

    const formattedInvoices = rawInvoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      issueDate: inv.issueDate.toISOString().split('T')[0],
      totalGross: inv.totalGross.toNumber(),
      status: inv.status,
      client: {
        name: inv.client.name,
        nip: inv.client.nip,
      },
    }));

    return {
      invoices: formattedInvoices,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
      companyId: targetCompanyId,
    };
  },

  async getInvoiceById(id: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) return null;
    return invoiceRepository.findByIdAndCompanyId(id, userCompany.id);
  },

  async updateInvoiceStatus(id: string, status: string, userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);
    if (!userCompany) throw new Error('Brak profilu firmy');
    return invoiceRepository.updateStatus(
      id,
      userCompany.id,
      status as InvoiceStatus,
    );
  },

  async getNextInvoiceNumber(userId: string) {
    const userCompany = await companyRepository.findDefaultForUser(userId);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

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

    console.log(lastInvoice);

    return `FV/${year}/${month}/${nextSequence}`;
  },
};
