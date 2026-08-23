import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoiceService } from '../invoice.service';
import { invoiceRepository } from '@/repositories/invoice.repository';
import { companyRepository } from '@/repositories/company.repository';
import { clientRepository } from '@/repositories/client.repository';
import { InvoiceInput } from '@/schemas/invoice.schema';

vi.mock('@/repositories/invoice.repository', () => ({
  invoiceRepository: {
    create: vi.fn(),
    findByNumberAndCompanyId: vi.fn(),
    findAllByCompanyId: vi.fn(),
    findByIdAndCompanyId: vi.fn(),
    updateStatus: vi.fn(),
    findLatestInDateRange: vi.fn(),
  },
}));

vi.mock('@/repositories/company.repository', () => ({
  companyRepository: {
    findDefaultForUser: vi.fn(),
  },
}));

vi.mock('@/repositories/client.repository', () => ({
  clientRepository: {
    findByIdAndCompanyId: vi.fn(),
  },
}));

describe('invoiceService', () => {
  const mockUserId = 'user-123';

  const mockCompany = {
    id: 'company-123',
    name: 'Moja Firma Sp. z o.o.',
    nip: '1234567890',
    address: 'ul. Główna 1',
    postal: '60-001',
    city: 'Poznań',
  };

  const mockClient = {
    id: 'client-123',
    name: 'Klient Testowy S.A.',
    nip: '9876543210',
    address: 'ul. Boczna 5',
    postal: '00-001',
    city: 'Warszawa',
  };

  const sampleInvoiceInput: InvoiceInput = {
    number: 'FV/2026/08/01',
    clientId: 'client-123',
    issueDate: '2026-08-20',
    dueDate: '2026-09-03',
    currency: 'PLN',
    paymentMethod: 'TRANSFER',
    items: [
      {
        description: 'Usługa programistyczna',
        quantity: 2,
        priceNet: 100, // 2 * 100 = 200 netto
        vatRate: 23, // 200 * 0.23 = 46 VAT -> 246 brutto
      },
      {
        description: 'Konsultacje Cloud',
        quantity: 1,
        priceNet: 50, // 1 * 50 = 50 netto
        vatRate: 23, // 50 * 0.23 = 11.50 VAT -> 61.50 brutto
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('Rzuca błąd, gdy użytkwonik nie ma profilu firmy', async () => {
      vi.mocked(companyRepository.findDefaultForUser).mockResolvedValue(null);

      await expect(
        invoiceService.createInvoice(sampleInvoiceInput, mockUserId),
      ).rejects.toThrow('Musisz najpierw uzupełnić profil swojej firmy.');
    });

    it('Rzuca błąd, gdy wskazany klient nie istnieje', async () => {
      vi.mocked(companyRepository.findDefaultForUser).mockResolvedValue(
        mockCompany as any,
      );
      vi.mocked(clientRepository.findByIdAndCompanyId).mockResolvedValue(null)
      
      await expect(
        invoiceService.createInvoice(sampleInvoiceInput, mockUserId)
      ).rejects.toThrow("Wybrany klient nie istnieje.")
    });
  });
});
