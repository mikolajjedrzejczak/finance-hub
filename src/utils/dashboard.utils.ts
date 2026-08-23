import { InvoiceDisplay } from '@/components/Invoice/InvoiceTable';
import { InvoiceStatus, Prisma } from '@prisma/client';

export type InvoiceData = {
  id?: string;
  number?: string;
  totalGross: Prisma.Decimal | number | string;
  paidAmount: Prisma.Decimal | number | string;
  status: InvoiceStatus | string;
  issueDate: Date | string;
};

type CompanyData = {
  id: string;
  name: string;
  nip?: string;
  invoices: InvoiceData[];
};

export interface CompanyDashboardPayload {
  company: {
    id: string;
    name: string;
    nip?: string;
  };
  invoices: InvoiceDisplay[];
  kpi?: {
    total: number;
    paid: number;
    pending: number;
  };
}


export type KPIStats = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
};

const MONTH_NAMES = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
] as const;

export function processChartCompanyData(
  data: CompanyDashboardPayload,
  targetYear: number = new Date().getFullYear(),
) {
  const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
  const companyName = data?.company?.name || 'Firma';

  const monthlyTotals = new Array<number>(12).fill(0);

  invoices.forEach((inv) => {
    if (!inv?.issueDate) return;

    const date =
      typeof inv.issueDate === 'string'
        ? new Date(inv.issueDate)
        : inv.issueDate;

    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const amount = Number(inv.totalGross) || 0;

    if (isNaN(date.getTime()) || year !== targetYear) return;

    monthlyTotals[monthIndex] += amount;
  });

  const chartData = MONTH_NAMES.map((monthName, index) => ({
    name: monthName,
    [companyName]: Number(monthlyTotals[index].toFixed(2)),
  }));

  return { chartData, companyName };
}

export function processChartData(
  companies: CompanyData[],
  targetYear: number = new Date().getFullYear(),
) {
  const companyNames = companies.map((c) => c.name);

  const chartData = MONTH_NAMES.map((monthName, monthIndex) => {
    const row: Record<string, string | number> = { name: monthName };

    companies.forEach((company) => {
      const sum = (company.invoices || [])
        .filter((inv) => {
          if (!inv?.issueDate) return false;
          const date =
            typeof inv.issueDate === 'string'
              ? new Date(inv.issueDate)
              : inv.issueDate;

          return (
            !isNaN(date.getTime()) &&
            date.getUTCFullYear() === targetYear &&
            date.getUTCMonth() === monthIndex
          );
        })
        .reduce((acc, inv) => acc + (Number(inv.totalGross) || 0), 0);

      row[company.name] = Number(sum.toFixed(2));
    });

    return row;
  });

  return { chartData, companyNames };
}

export function calculateKPIs(companies: CompanyData[]) {
  let globalTotal = 0;
  let globalPaid = 0;
  let globalPending = 0;
  let globalOverdue = 0;

  const companyStats = (companies || []).map((company) => {
    const stats = (company.invoices || []).reduce<KPIStats>(
      (acc, inv) => {
        const gross = Number(inv.totalGross) || 0;
        let paid = 0;
        let pending = 0;

        if (inv.status === InvoiceStatus.PAID) {
          paid = gross;
        } else if (inv.status === InvoiceStatus.PARTIALLY_PAID) {
          paid = Number(inv.paidAmount) || 0;
          pending = Math.max(0, gross - paid);
        } else {
          paid = Number(inv.paidAmount) || 0;
          pending = Math.max(0, gross - paid);
        }

        if (inv.status === InvoiceStatus.OVERDUE) {
          acc.overdue += pending;
        }

        acc.total += gross;
        acc.paid += paid;
        acc.pending += pending;

        return acc;
      },
      { total: 0, paid: 0, pending: 0, overdue: 0 },
    );

    globalTotal += stats.total;
    globalPaid += stats.paid;
    globalPending += stats.pending;
    globalOverdue += stats.overdue;

    return {
      ...company,
      stats: {
        total: Number(stats.total.toFixed(2)),
        paid: Number(stats.paid.toFixed(2)),
        pending: Number(stats.pending.toFixed(2)),
        overdue: Number(stats.overdue.toFixed(2)),
      },
    };
  });

  return {
    globalTotal: Number(globalTotal.toFixed(2)),
    globalPaid: Number(globalPaid.toFixed(2)),
    globalPending: Number(globalPending.toFixed(2)),
    globalOverdue: Number(globalOverdue.toFixed(2)),
    companyStats,
  };
}


