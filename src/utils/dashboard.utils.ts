import { Prisma } from '@prisma/client';

type InvoiceData = {
  totalGross: Prisma.Decimal | number | string;
  status: string;
  issueDate: Date;
};

type CompanyData = {
  id: string;
  name: string;
  invoices: InvoiceData[];
};

export function processChartData(companies: CompanyData[]) {
  const companyNames = companies.map((c) => c.name);

  const allMonths = Array.from(
    new Set(
      companies.flatMap((c) =>
        c.invoices.map((i) =>
          i.issueDate.toLocaleString('pl-PL', { month: 'short' }),
        ),
      ),
    ),
  );

  const chartData = allMonths.map((month) => {
    const row: Record<string, any> = { name: month };

    companyNames.forEach((name) => {
      row[name] = 0;
    });

    companies.forEach((company) => {
      const sumForCompanyAndMonth = company.invoices
        .filter(
          (i) =>
            i.issueDate.toLocaleString('pl-PL', { month: 'short' }) === month,
        )
        .reduce((sum, i) => sum + Number(i.totalGross), 0);

      row[company.name] = sumForCompanyAndMonth.toFixed(2);
    });

    return row;
  });

  return { chartData, companyNames };
}

export function calculateKPIs(companies: CompanyData[]) {
  let globalTotal = 0;
  let globalPaid = 0;
  let globalPending = 0;

  const companyStats = companies.map((company) => {
    const stats = company.invoices.reduce(
      (acc, inv) => {
        const gross = Number(inv.totalGross);
        acc.total += gross;
        if (inv.status === 'PAID') acc.paid += gross;
        else acc.pending += gross;
        return acc;
      },
      { total: 0, paid: 0, pending: 0 },
    );

    globalTotal += stats.total;
    globalPaid += stats.paid;
    globalPending += stats.pending;

    return { ...company, stats };
  });

  return { globalTotal, globalPaid, globalPending, companyStats };
}

export function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' PLN'
  );
}
