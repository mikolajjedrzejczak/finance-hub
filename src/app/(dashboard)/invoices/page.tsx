import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { InvoiceForm } from '@/components/Invoice/InvoiceForm';
import { InvoicesTable } from '@/components/Invoice/InvoiceTable';
import { getInvoicePageData } from './data';
import { invoiceService } from '@/services/invoice.service';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const data = await getInvoicePageData(session.user.id);

  if (!data) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center ">
        <h2 className="text-xl font-bold">Brak skonfigurowanej firmy</h2>
        <p className="text-gray-500 mt-2">
          Zanim wystawisz fakturę, przejdź do ustawień i dodaj dane swojej
          firmy.
        </p>
      </div>
    );
  }

  const tableResult = await invoiceService.getPaginatedInvoices({
    userId: session.user.id,
    companyId: data.companyId,
    query: resolvedSearchParams.query,
    page: Number(resolvedSearchParams.page) || 1,
    status: resolvedSearchParams.status,
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
    pageSize: 10,
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faktury</h1>
        <p className="text-sm text-gray-600">
          Zarządzaj swoimi dokumentami sprzedaży i wystawiaj nowe.
        </p>
      </div>

      {data.clients.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold">Brak klientów</h2>
          <p className="text-sm text-gray-500 mt-1">
            Zanim wystawisz fakturę, dodaj przynajmniej jednego klienta w
            zakładce Klienci.
          </p>
        </div>
      ) : (
        <>
          <InvoiceForm
            clients={data.clients}
            services={data.services}
            nextInvoiceNumber={data.nextInvoiceNumber}
          />

          <InvoicesTable
            invoices={tableResult.invoices}
            companyId={data.companyId}
            totalPages={tableResult.totalPages}
            totalCount={tableResult.totalCount}
            currentPage={tableResult.currentPage}
          />
        </>
      )}
    </div>
  );
}
