import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';

import { dashboardService } from '@/services/dashboard.service';
import {
  processChartData,
  calculateKPIs,
  formatCurrency,
} from '@/utils/dashboard.utils';

export const dynamic = 'force-dynamic';

export default async function GlobalDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const companiesWithInvoices = await dashboardService.getDashboardData(
    session.user.id,
  );

  if (companiesWithInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-center px-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Witaj w Finance Hub
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Wygląda na to, że nie masz jeszcze dodanej żadnej firmy. Skonfiguruj
          swój pierwszy profil działalności, aby zacząć wystawiać faktury.
        </p>
        <Link
          href="/company"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Dodaj pierwszą firmę
        </Link>
      </div>
    );
  }

  const { chartData, companyNames } = processChartData(companiesWithInvoices);
  const { globalTotal, globalPaid, globalPending, companyStats } =
    calculateKPIs(companiesWithInvoices);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Cześć, {session.user.name || 'Przedsiębiorco'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Oto podsumowanie wszystkich Twoich biznesów.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-blue-100 font-medium mb-1">
            Portfel (Całkowita sprzedaż)
          </p>
          <p className="text-4xl font-bold">{formatCurrency(globalTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Globalnie opłacone
          </p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(globalPaid)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">
            Globalnie oczekujące
          </p>
          <p className="text-3xl font-bold text-orange-500">
            {formatCurrency(globalPending)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart data={chartData} companyNames={companyNames} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Twoje Firmy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyStats.map((company: any) => (
            <Link
              href={`/companies/${company.id}`}
              key={company.id}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all"
            >
              <h3 className="font-bold text-gray-900 mb-4">{company.name}</h3>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Przychód:</span>
                <span className="font-semibold">
                  {formatCurrency(company.stats.total)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-50 text-blue-600 text-sm font-medium flex items-center">
                Przejdź do panelu <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
