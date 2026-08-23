import prisma from '@/lib/prisma';
import { InvoiceStatus, Currency, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function money(n: number): string {
  return n.toFixed(2);
}

function exchangeRateFor(currency: Currency): string {
  switch (currency) {
    case Currency.EUR:
      return (4.2 + Math.random() * 0.3).toFixed(4);
    case Currency.USD:
      return (3.85 + Math.random() * 0.3).toFixed(4);
    case Currency.GBP:
      return (4.9 + Math.random() * 0.3).toFixed(4);
    default:
      return '1.0000';
  }
}

// Statusy ważone wg "wieku" faktury - starsze częściej opłacone
function randomStatus(monthsAgo: number): InvoiceStatus {
  if (monthsAgo >= 3) {
    const roll = Math.random();
    if (roll < 0.8) return InvoiceStatus.PAID;
    if (roll < 0.92) return InvoiceStatus.PARTIALLY_PAID;
    return InvoiceStatus.OVERDUE;
  }
  const roll = Math.random();
  if (roll < 0.35) return InvoiceStatus.PAID;
  if (roll < 0.55) return InvoiceStatus.PARTIALLY_PAID;
  if (roll < 0.85) return InvoiceStatus.PENDING;
  return InvoiceStatus.OVERDUE;
}

const CURRENCIES: Currency[] = [
  Currency.PLN,
  Currency.PLN,
  Currency.PLN,
  Currency.PLN,
  Currency.EUR,
  Currency.USD,
  Currency.GBP,
];

const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.TRANSFER,
  PaymentMethod.TRANSFER,
  PaymentMethod.TRANSFER,
  PaymentMethod.CARD,
  PaymentMethod.CASH,
  PaymentMethod.OTHER,
];

// ---------------------------------------------------------------------------
// Dane bazowe
// ---------------------------------------------------------------------------

interface ServiceTemplate {
  name: string;
  description: string;
  priceNet: number;
  vatRate: number;
  category: string;
}

const SERVICE_CATALOG_IT: ServiceTemplate[] = [
  {
    name: 'Wdrożenie aplikacji webowej',
    description: 'Prace programistyczne end-to-end',
    priceNet: 180,
    vatRate: 23,
    category: 'Development',
  },
  {
    name: 'Konsultacje techniczne',
    description: 'Doradztwo architektoniczne',
    priceNet: 220,
    vatRate: 23,
    category: 'Consulting',
  },
  {
    name: 'Utrzymanie serwera',
    description: 'Abonament miesięczny hostingu i monitoringu',
    priceNet: 450,
    vatRate: 23,
    category: 'Maintenance',
  },
  {
    name: 'Integracja API płatności',
    description: 'Wdrożenie bramki płatniczej',
    priceNet: 3200,
    vatRate: 23,
    category: 'Development',
  },
  {
    name: 'Testy automatyczne',
    description: 'Przygotowanie i utrzymanie testów E2E',
    priceNet: 160,
    vatRate: 23,
    category: 'QA',
  },
  {
    name: 'Licencja oprogramowania',
    description: 'Licencja roczna na system',
    priceNet: 1200,
    vatRate: 23,
    category: 'Licensing',
  },
];

const SERVICE_CATALOG_CREATIVE: ServiceTemplate[] = [
  {
    name: 'Projekt logo',
    description: 'Kompletna identyfikacja wizualna',
    priceNet: 1500,
    vatRate: 23,
    category: 'Branding',
  },
  {
    name: 'Sesja fotograficzna produktowa',
    description: 'Zdjęcia produktowe do e-commerce',
    priceNet: 350,
    vatRate: 23,
    category: 'Photography',
  },
  {
    name: 'Projekt graficzny social media',
    description: 'Pakiet grafik na miesiąc',
    priceNet: 900,
    vatRate: 23,
    category: 'Design',
  },
  {
    name: 'Montaż wideo reklamowego',
    description: 'Materiał reklamowy do 60 sekund',
    priceNet: 2200,
    vatRate: 23,
    category: 'Video',
  },
  {
    name: 'Konsultacja brandingowa',
    description: 'Warsztat strategii marki',
    priceNet: 300,
    vatRate: 23,
    category: 'Consulting',
  },
];

const SERVICE_CATALOG_CONSULTING: ServiceTemplate[] = [
  {
    name: 'Audyt finansowy',
    description: 'Przegląd procesów finansowych firmy',
    priceNet: 400,
    vatRate: 23,
    category: 'Finance',
  },
  {
    name: 'Doradztwo podatkowe',
    description: 'Konsultacja optymalizacji podatkowej',
    priceNet: 350,
    vatRate: 23,
    category: 'Tax',
  },
  {
    name: 'Szkolenie zespołu',
    description: 'Warsztat stacjonarny dla pracowników',
    priceNet: 2800,
    vatRate: 8,
    category: 'Training',
  },
  {
    name: 'Raport rynkowy',
    description: 'Analiza konkurencji i rynku',
    priceNet: 1800,
    vatRate: 23,
    category: 'Research',
  },
];

interface ClientTemplate {
  name: string;
  nip: string;
  address: string;
  city: string;
  postal: string;
  email: string;
  phone: string;
  bankAccount?: string;
}

const CLIENTS_POOL: ClientTemplate[] = [
  {
    name: 'Klient Korporacyjny S.A.',
    nip: '5556667788',
    address: 'Rynek Główny 10',
    city: 'Kraków',
    postal: '30-001',
    email: 'biuro@korporacyjny.pl',
    phone: '+48 12 345 67 89',
    bankAccount: 'PL61109010140000071219812874',
  },
  {
    name: 'Nowak i Wspólnicy Sp. j.',
    nip: '6667778899',
    address: 'ul. Długa 22',
    city: 'Wrocław',
    postal: '50-243',
    email: 'kontakt@nowakwspolnicy.pl',
    phone: '+48 71 234 56 78',
  },
  {
    name: 'Zielona Energia Sp. z o.o.',
    nip: '7778889900',
    address: 'ul. Ekologiczna 3',
    city: 'Gdańsk',
    postal: '80-244',
    email: 'biuro@zielonaenergia.pl',
    phone: '+48 58 111 22 33',
    bankAccount: 'PL27114020040000300201355387',
  },
  {
    name: 'Marketing Pro s.c.',
    nip: '8889990011',
    address: 'ul. Reklamowa 8',
    city: 'Łódź',
    postal: '90-001',
    email: 'hello@marketingpro.pl',
    phone: '+48 42 456 78 90',
  },
  {
    name: 'BudExpert Sp. z o.o.',
    nip: '9990001122',
    address: 'ul. Budowlana 14',
    city: 'Katowice',
    postal: '40-001',
    email: 'biuro@budexpert.pl',
    phone: '+48 32 678 90 12',
  },
  {
    name: 'FoodTrade Distribution',
    nip: '1112223344',
    address: 'ul. Handlowa 6',
    city: 'Szczecin',
    postal: '70-001',
    email: 'zamowienia@foodtrade.pl',
    phone: '+48 91 234 56 78',
    bankAccount: 'PL10105000997603123456789123',
  },
  {
    name: 'MedCare Klinika',
    nip: '2223334455',
    address: 'ul. Zdrowotna 2',
    city: 'Poznań',
    postal: '61-001',
    email: 'recepcja@medcare.pl',
    phone: '+48 61 987 65 43',
  },
  {
    name: 'EduSystem Fundacja',
    nip: '3334445566',
    address: 'ul. Szkolna 11',
    city: 'Lublin',
    postal: '20-001',
    email: 'kontakt@edusystem.org',
    phone: '+48 81 345 67 89',
  },
  {
    name: 'LogTrans Sp. z o.o.',
    nip: '4445556677',
    address: 'ul. Transportowa 19',
    city: 'Bydgoszcz',
    postal: '85-001',
    email: 'biuro@logtrans.pl',
    phone: '+48 52 456 78 90',
  },
  {
    name: 'ArtDesign Studio',
    nip: '5556667700',
    address: 'ul. Artystyczna 4',
    city: 'Warszawa',
    postal: '00-002',
    email: 'studio@artdesign.pl',
    phone: '+48 22 111 22 33',
  },
];

async function main() {
  console.log('Czyszczenie bazy danych...');
  await prisma.payment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('haslo123', 10);

  async function logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details?: Record<string, unknown>,
  ) {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId },
    });
  }

  console.log('Tworzenie użytkowników...');

  const mainUser = await prisma.user.create({
    data: {
      email: 'mds@mds.com',
      password: hashedPassword,
      name: 'Mikołaj Jędrzejczak',
      emailVerified: new Date(),
    },
  });
  const secondUser = await prisma.user.create({
    data: {
      email: 'anna.nowak@financehub.pl',
      password: hashedPassword,
      name: 'Anna Nowak',
      emailVerified: new Date(),
    },
  });
  const thirdUser = await prisma.user.create({
    data: {
      email: 'piotr.wisniewski@financehub.pl',
      password: hashedPassword,
      name: 'Piotr Wiśniewski',
    },
  });

  for (const u of [mainUser, secondUser, thirdUser]) {
    await logAction(u.id, 'USER_LOGIN', 'User', u.id, { ip: '127.0.0.1' });
  }

  // -------------------------------------------------------------------------
  // Firmy
  // -------------------------------------------------------------------------
  console.log('Tworzenie firm...');

  const companyIT = await prisma.company.create({
    data: {
      name: 'Mikołaj Jędrzejczak Miko Dev Studio',
      nip: '7812104816',
      address: 'Augustyna Szamarzewskiego 21/2',
      city: 'Poznań',
      postal: '60-514',
      email: 'contact@mds.com',
      phone: '+48 61 000 11 22',
      bankAccount: 'PL66102010260000000123456789',
      userId: mainUser.id,
      isDefault: true,
    },
  });
  const companyCreative = await prisma.company.create({
    data: {
      name: 'Creative Studio',
      nip: '9876543210',
      address: 'ul. Kreatywna 5',
      city: 'Warszawa',
      postal: '00-001',
      email: 'biuro@creativestudio.pl',
      phone: '+48 22 111 33 44',
      userId: mainUser.id,
    },
  });
  const companyConsulting = await prisma.company.create({
    data: {
      name: 'Consulting Partners',
      nip: '1122334455',
      address: 'ul. Doradcza 7',
      city: 'Wrocław',
      postal: '50-100',
      email: 'kontakt@consultingpartners.pl',
      phone: '+48 71 555 66 77',
      userId: mainUser.id,
    },
  });
  const companySecondUser = await prisma.company.create({
    data: {
      name: 'Nowak Marketing',
      nip: '6655443322',
      address: 'ul. Marketingowa 9',
      city: 'Gdynia',
      postal: '81-001',
      email: 'kontakt@nowakmarketing.pl',
      phone: '+48 58 222 33 44',
      userId: secondUser.id,
      isDefault: true,
    },
  });
  const companyThirdUser = await prisma.company.create({
    data: {
      name: 'Wiśniewski Consulting',
      nip: '7788990011',
      address: 'ul. Biznesowa 3',
      city: 'Katowice',
      postal: '40-002',
      email: 'kontakt@wisniewskiconsulting.pl',
      phone: '+48 32 444 55 66',
      userId: thirdUser.id,
      isDefault: true,
    },
  });

  for (const c of [
    companyIT,
    companyCreative,
    companyConsulting,
    companySecondUser,
    companyThirdUser,
  ]) {
    await logAction(c.userId, 'COMPANY_CREATED', 'Company', c.id, {
      name: c.name,
    });
  }

  // -------------------------------------------------------------------------
  // Usługi
  // -------------------------------------------------------------------------
  console.log('Tworzenie katalogu usług...');

  async function createServices(
    companyId: string,
    userId: string,
    templates: ServiceTemplate[],
  ) {
    const created = [];
    for (const tpl of templates) {
      const service = await prisma.service.create({
        data: {
          name: tpl.name,
          description: tpl.description,
          priceNet: money(tpl.priceNet),
          vatRate: tpl.vatRate.toFixed(2),
          category: tpl.category,
          isActive: true,
          userId,
          companyId,
        },
      });
      created.push(service);
    }
    return created;
  }

  const servicesIT = await createServices(
    companyIT.id,
    mainUser.id,
    SERVICE_CATALOG_IT,
  );
  const servicesCreative = await createServices(
    companyCreative.id,
    mainUser.id,
    SERVICE_CATALOG_CREATIVE,
  );
  const servicesConsulting = await createServices(
    companyConsulting.id,
    mainUser.id,
    SERVICE_CATALOG_CONSULTING,
  );
  const servicesSecondUser = await createServices(
    companySecondUser.id,
    secondUser.id,
    SERVICE_CATALOG_CREATIVE,
  );
  const servicesThirdUser = await createServices(
    companyThirdUser.id,
    thirdUser.id,
    SERVICE_CATALOG_CONSULTING,
  );

  // Jedna nieaktywna usługa (wycofana z oferty) - przydatna do testów UI
  await prisma.service.create({
    data: {
      name: 'Stara usługa hostingowa (wycofana)',
      description:
        'Usługa wycofana z oferty, zachowana ze względu na historyczne faktury',
      priceNet: money(99),
      vatRate: '23.00',
      category: 'Maintenance',
      isActive: false,
      userId: mainUser.id,
      companyId: companyIT.id,
    },
  });

  // -------------------------------------------------------------------------
  // Klienci
  // -------------------------------------------------------------------------
  console.log('Tworzenie klientów...');

  async function createClientsForCompany(
    companyId: string,
    userId: string,
    count: number,
  ) {
    const pool = shuffle(CLIENTS_POOL).slice(0, count);
    const created = [];
    for (const tpl of pool) {
      const client = await prisma.client.create({
        data: {
          name: tpl.name,
          nip: tpl.nip,
          address: tpl.address,
          city: tpl.city,
          postal: tpl.postal,
          email: tpl.email,
          phone: tpl.phone,
          bankAccount: tpl.bankAccount,
          userId,
          companyId,
        },
      });
      created.push(client);
      await logAction(userId, 'CLIENT_CREATED', 'Client', client.id, {
        name: client.name,
      });
    }
    return created;
  }

  const clientsIT = await createClientsForCompany(companyIT.id, mainUser.id, 6);
  const clientsCreative = await createClientsForCompany(
    companyCreative.id,
    mainUser.id,
    4,
  );
  const clientsConsulting = await createClientsForCompany(
    companyConsulting.id,
    mainUser.id,
    3,
  );
  const clientsSecondUser = await createClientsForCompany(
    companySecondUser.id,
    secondUser.id,
    4,
  );
  const clientsThirdUser = await createClientsForCompany(
    companyThirdUser.id,
    thirdUser.id,
    3,
  );

  // -------------------------------------------------------------------------
  // Faktury + pozycje + płatności
  // -------------------------------------------------------------------------
  console.log('Generowanie faktur, pozycji i płatności...');

  type ServiceRow = Awaited<ReturnType<typeof createServices>>[number];
  type ClientRow = Awaited<ReturnType<typeof createClientsForCompany>>[number];

  interface CompanyContext {
    company: typeof companyIT;
    userId: string;
    clients: ClientRow[];
    services: ServiceRow[];
    prefix: string;
  }

  const contexts: CompanyContext[] = [
    {
      company: companyIT,
      userId: mainUser.id,
      clients: clientsIT,
      services: servicesIT,
      prefix: 'TS',
    },
    {
      company: companyCreative,
      userId: mainUser.id,
      clients: clientsCreative,
      services: servicesCreative,
      prefix: 'CS',
    },
    {
      company: companyConsulting,
      userId: mainUser.id,
      clients: clientsConsulting,
      services: servicesConsulting,
      prefix: 'CP',
    },
    {
      company: companySecondUser,
      userId: secondUser.id,
      clients: clientsSecondUser,
      services: servicesSecondUser,
      prefix: 'NM',
    },
    {
      company: companyThirdUser,
      userId: thirdUser.id,
      clients: clientsThirdUser,
      services: servicesThirdUser,
      prefix: 'WC',
    },
  ];

  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
  let totalInvoicesCreated = 0;

  for (const ctx of contexts) {
    let invoiceCounter = 1;

    for (const month of MONTHS) {
      const invoicesThisMonth = randomInt(1, 4);

      for (let i = 0; i < invoicesThisMonth; i++) {
        const client = randomChoice(ctx.clients);
        const currency = randomChoice(CURRENCIES);
        const paymentMethod = randomChoice(PAYMENT_METHODS);
        const monthsAgo = 12 - month;
        const status = randomStatus(monthsAgo);

        const issueDay = randomInt(1, 25);
        const issueDate = new Date(2026, month - 1, issueDay);
        const dueDate = new Date(2026, month - 1, issueDay + randomInt(7, 21));

        const number = `FV/${String(invoiceCounter).padStart(3, '0')}/${String(month).padStart(2, '0')}/2026/${ctx.prefix}`;
        invoiceCounter++;

        // 1-5 pozycji faktury z katalogu usług tej firmy
        const itemCount = randomInt(1, 5);
        const chosenServices = shuffle(ctx.services).slice(0, itemCount);

        let totalNet = 0;
        let totalGross = 0;

        const itemsToCreate = chosenServices.map((service) => {
          const quantity = randomInt(1, 6);
          const priceNet = Number(service.priceNet);
          const vatRate = Number(service.vatRate);
          const netAmount = quantity * priceNet;
          const grossAmount = netAmount * (1 + vatRate / 100);

          totalNet += netAmount;
          totalGross += grossAmount;

          return {
            description: service.name,
            quantity: quantity.toFixed(2),
            priceNet: money(priceNet),
            vatRate: vatRate.toFixed(2),
            serviceId: service.id,
          };
        });

        // paidAmount zależny od statusu faktury
        let paidAmount = 0;
        if (status === InvoiceStatus.PAID) {
          paidAmount = totalGross;
        } else if (status === InvoiceStatus.PARTIALLY_PAID) {
          paidAmount = totalGross * (0.3 + Math.random() * 0.4); // 30-70%
        }

        const invoice = await prisma.invoice.create({
          data: {
            number,
            issueDate,
            dueDate,
            status,
            currency,
            exchangeRate: exchangeRateFor(currency),
            paymentMethod,
            totalNet: money(totalNet),
            totalGross: money(totalGross),
            paidAmount: money(paidAmount),
            userId: ctx.userId,
            clientId: client.id,
            companyId: ctx.company.id,
            sellerName: ctx.company.name,
            sellerNip: ctx.company.nip,
            sellerAddress: ctx.company.address,
            sellerPostal: ctx.company.postal,
            sellerCity: ctx.company.city,
            sellerBankAccount: ctx.company.bankAccount,
            buyerName: client.name,
            buyerNip: client.nip,
            buyerAddress: client.address,
            buyerPostal: client.postal,
            buyerCity: client.city,
          },
        });

        await prisma.invoiceItem.createMany({
          data: itemsToCreate.map((item) => ({
            ...item,
            invoiceId: invoice.id,
          })),
        });

        // Płatności odzwierciedlające paidAmount
        if (status === InvoiceStatus.PAID) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: money(paidAmount),
              method: paymentMethod,
              date: new Date(
                issueDate.getFullYear(),
                issueDate.getMonth(),
                issueDay + randomInt(1, 6),
              ),
              reference: `PRZ/${number.replace(/\//g, '-')}`,
            },
          });
          await logAction(ctx.userId, 'INVOICE_PAID', 'Invoice', invoice.id, {
            number,
            amount: money(paidAmount),
          });
        } else if (status === InvoiceStatus.PARTIALLY_PAID) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: money(paidAmount),
              method: paymentMethod,
              date: new Date(
                issueDate.getFullYear(),
                issueDate.getMonth(),
                issueDay + randomInt(1, 10),
              ),
              reference: `ZAL/${number.replace(/\//g, '-')}`,
            },
          });
        }

        if (i === 0) {
          await logAction(
            ctx.userId,
            'INVOICE_CREATED',
            'Invoice',
            invoice.id,
            { number, status },
          );
        }

        totalInvoicesCreated++;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Przypadki brzegowe, przydatne do testów UI
  // -------------------------------------------------------------------------
  console.log('Tworzenie przypadków brzegowych...');

  // Mocno zaległa faktura (overdue)
  const overdueClient = randomChoice(clientsIT);
  const overdueNet = 15000;
  const overdueGross = overdueNet * 1.23;
  const overdueInvoice = await prisma.invoice.create({
    data: {
      number: 'FV/999/03/2026/TS',
      issueDate: new Date(2026, 2, 1),
      dueDate: new Date(2026, 2, 15),
      status: InvoiceStatus.OVERDUE,
      currency: Currency.PLN,
      paymentMethod: PaymentMethod.TRANSFER,
      totalNet: money(overdueNet),
      totalGross: money(overdueGross),
      paidAmount: money(0),
      userId: mainUser.id,
      clientId: overdueClient.id,
      companyId: companyIT.id,
      sellerName: companyIT.name,
      sellerNip: companyIT.nip,
      sellerAddress: companyIT.address,
      sellerPostal: companyIT.postal,
      sellerCity: companyIT.city,
      sellerBankAccount: companyIT.bankAccount,
      buyerName: overdueClient.name,
      buyerNip: overdueClient.nip,
      buyerAddress: overdueClient.address,
      buyerPostal: overdueClient.postal,
      buyerCity: overdueClient.city,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: overdueInvoice.id,
      serviceId: servicesIT[0].id,
      description: servicesIT[0].name,
      quantity: '60.00',
      priceNet: '250.00',
      vatRate: '23.00',
    },
  });

  // Faktura w walucie obcej (EUR), w pełni opłacona
  const eurClient = randomChoice(clientsConsulting);
  const eurNet = 5000;
  const eurGross = eurNet * 1.23;
  const eurInvoice = await prisma.invoice.create({
    data: {
      number: 'FV/998/06/2026/CP',
      issueDate: new Date(2026, 5, 10),
      dueDate: new Date(2026, 5, 24),
      status: InvoiceStatus.PAID,
      currency: Currency.EUR,
      exchangeRate: '4.2500',
      paymentMethod: PaymentMethod.CARD,
      totalNet: money(eurNet),
      totalGross: money(eurGross),
      paidAmount: money(eurGross),
      userId: mainUser.id,
      clientId: eurClient.id,
      companyId: companyConsulting.id,
      sellerName: companyConsulting.name,
      sellerNip: companyConsulting.nip,
      sellerAddress: companyConsulting.address,
      sellerPostal: companyConsulting.postal,
      sellerCity: companyConsulting.city,
      buyerName: eurClient.name,
      buyerNip: eurClient.nip,
      buyerAddress: eurClient.address,
      buyerPostal: eurClient.postal,
      buyerCity: eurClient.city,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: eurInvoice.id,
      serviceId: servicesConsulting[0].id,
      description: servicesConsulting[0].name,
      quantity: '12.00',
      priceNet: '416.67',
      vatRate: '23.00',
    },
  });
  await prisma.payment.create({
    data: {
      invoiceId: eurInvoice.id,
      amount: money(eurGross),
      method: PaymentMethod.CARD,
      date: new Date(2026, 5, 12),
      reference: 'PRZ/EUR-998',
    },
  });

  // Faktura częściowo opłacona z dwiema wpłatami ratalnymi
  const partialClient = randomChoice(clientsCreative);
  const partialNet = 4500;
  const partialGross = partialNet * 1.23;
  const partialInvoice = await prisma.invoice.create({
    data: {
      number: 'FV/996/08/2026/CS',
      issueDate: new Date(2026, 7, 3),
      dueDate: new Date(2026, 7, 17),
      status: InvoiceStatus.PARTIALLY_PAID,
      currency: Currency.PLN,
      paymentMethod: PaymentMethod.TRANSFER,
      totalNet: money(partialNet),
      totalGross: money(partialGross),
      paidAmount: money(partialGross * 0.5),
      userId: mainUser.id,
      clientId: partialClient.id,
      companyId: companyCreative.id,
      sellerName: companyCreative.name,
      sellerNip: companyCreative.nip,
      sellerAddress: companyCreative.address,
      sellerPostal: companyCreative.postal,
      sellerCity: companyCreative.city,
      buyerName: partialClient.name,
      buyerNip: partialClient.nip,
      buyerAddress: partialClient.address,
      buyerPostal: partialClient.postal,
      buyerCity: partialClient.city,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: partialInvoice.id,
      serviceId: servicesCreative[0].id,
      description: servicesCreative[0].name,
      quantity: '3.00',
      priceNet: '1500.00',
      vatRate: '23.00',
    },
  });
  await prisma.payment.createMany({
    data: [
      {
        invoiceId: partialInvoice.id,
        amount: money(partialGross * 0.25),
        method: PaymentMethod.TRANSFER,
        date: new Date(2026, 7, 5),
        reference: 'RATA-1/996',
      },
      {
        invoiceId: partialInvoice.id,
        amount: money(partialGross * 0.25),
        method: PaymentMethod.TRANSFER,
        date: new Date(2026, 7, 12),
        reference: 'RATA-2/996',
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Podsumowanie
  // -------------------------------------------------------------------------
  const [
    invoiceCount,
    itemCount,
    clientCount,
    serviceCount,
    paymentCount,
    auditLogCount,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoiceItem.count(),
    prisma.client.count(),
    prisma.service.count(),
    prisma.payment.count(),
    prisma.auditLog.count(),
  ]);

  console.log('Seedowanie zakończone sukcesem!');
  console.log(`  Użytkownicy: 3`);
  console.log(`  Firmy: 5`);
  console.log(`  Klienci: ${clientCount}`);
  console.log(`  Usługi: ${serviceCount}`);
  console.log(
    `  Faktury: ${invoiceCount} (w tym ${totalInvoicesCreated} wygenerowanych w pętli miesięcy)`,
  );
  console.log(`  Pozycje faktur: ${itemCount}`);
  console.log(`  Płatności: ${paymentCount}`);
  console.log(`  Logi audytowe: ${auditLogCount}`);
  console.log('');
  console.log('Dane logowania (wszyscy użytkownicy, hasło: haslo123):');
  console.log('  demo@financehub.pl');
  console.log('  anna.nowak@financehub.pl');
  console.log('  piotr.wisniewski@financehub.pl');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
