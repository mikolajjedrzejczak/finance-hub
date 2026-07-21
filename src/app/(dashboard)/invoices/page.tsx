import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { clientService } from '@/services/client.service';
import { catalogService } from '@/services/service.service';
import { invoiceService } from '@/services/invoice.service';
import { companyRepository } from '@/repositories/company.repository';
import { InvoiceForm } from '@/components/Invoice/InvoiceForm';
import { InvoicesTable } from '@/components/Invoice/InvoiceTable';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userCompany = await companyRepository.findDefaultForUser(
    session.user.id,
  );

  if (!userCompany) {
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

  const rawClients = await clientService.getClients(session.user.id);
  const rawServices = await catalogService.getServices(session.user.id);
  const rawInvoices = await invoiceService.getInvoices(session.user.id);
  const nextInvoiceNumber = await invoiceService.getNextInvoiceNumber(
    session.user.id,
  );

  const services = rawServices.map((s) => ({
    ...s,
    priceNet: Number(s.priceNet),
    vatRate: Number(s.vatRate),
  }));

  const serializedInvoices = rawInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    issueDate: inv.issueDate.toISOString().split('T')[0],
    totalGross: Number(inv.totalGross),
    status: inv.status,
    client: {
      name: inv.client.name,
      nip: inv.client.nip,
    },
  }));

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faktury</h1>
        <p className="text-sm text-gray-600">
          Zarządzaj swoimi dokumentami sprzedaży i wystawiaj nowe.
        </p>
      </div>

      {rawClients.length === 0 ? (
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
            clients={rawClients}
            services={services}
            nextInvoiceNumber={nextInvoiceNumber}
          />

          <InvoicesTable
            invoices={serializedInvoices}
            companyId={userCompany.id}
          />
        </>
      )}
    </div>
  );
}
