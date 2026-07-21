import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { InvoicesTable } from '@/components/Invoice/InvoiceTable';
import { formatCurrency } from '@/utils/dashboard.utils';
import { getSingleCompanyData } from './data';

export default async function SingleCompanyDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const resolvedParams = await params;
  const companyId = resolvedParams.id;

  const data = await getSingleCompanyData(companyId, session.user.id);

  if (!data) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Firma nie znaleziona
        </h2>
        <p className="text-gray-500 mb-6">
          Ta firma nie istnieje lub nie masz do niej dostępu.
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Wróć do panelu głównego
        </Link>
      </div>
    );
  }

  const company = data.company;
  const invoices = data.invoices;
  const kpi = data.kpi;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-500">
            NIP: {company.nip} • Panel analityczny
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-white bg-linear-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm  font-medium mb-1">
              Całkowita sprzedaż (Brutto)
            </p>
            <p className="text-3xl font-bold">{formatCurrency(kpi.total)}</p>
          </div>
          <div className="p-2">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">
              Faktycznie opłacone
            </p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(kpi.paid)}
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">
              Oczekujące wpłaty
            </p>
            <p className="text-3xl font-bold text-orange-500">
              {formatCurrency(kpi.pending)}
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Wszystkie faktury firmy
        </h2>
        <InvoicesTable invoices={invoices} companyId={company.id} />
      </div>
    </div>
  );
}
