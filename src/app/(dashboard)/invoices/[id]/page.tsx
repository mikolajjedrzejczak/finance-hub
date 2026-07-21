import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { invoiceService } from '@/services/invoice.service';
import { StatusSwitcher } from './StatusSwitcher';
import { PdfButton } from '@/components/ui/PdfButtonts';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const invoice = await invoiceService.getInvoiceById(
    resolvedParams.id,
    session.user.id,
  );
  
  if (!invoice) return <div className="p-10">Nie znaleziono faktury.</div>;

  const formatDate = (date: Date) => date.toLocaleDateString('pl-PL');

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć
        </Link>
        <div className="flex items-center gap-3">
          <StatusSwitcher
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <CopyLinkButton invoiceId={invoice.id} />
          <PdfButton
            filename={`Faktura_${invoice.number.replace(/\//g, '_')}`}
          />
        </div>
      </div>

      <div
        id="invoice-print-area"
        className="bg-white p-16 w-[794px] mx-auto border border-gray-300 shadow-md text-black"
      >
        <div className="flex justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">FAKTURA</h1>
            <p className="text-sm">Nr {invoice.number}</p>
          </div>
          <div className="text-right text-sm">
            <p>
              Data wystawienia: <b>{formatDate(invoice.issueDate)}</b>
            </p>
            <p>
              Termin płatności: <b>{formatDate(invoice.dueDate)}</b>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-20 mb-12 text-sm">
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-2">
              Sprzedawca
            </p>
            <p className="font-bold">{invoice.sellerName}</p>
            <p>NIP: {invoice.sellerNip}</p>
            <p>{invoice.sellerAddress}</p>
            <p>
              {invoice.sellerPostal} {invoice.sellerCity}
            </p>
            {invoice.sellerBankAccount && (
              <p className="mt-2">
                <span className="font-semibold">Konto:</span>{' '}
                {invoice.sellerBankAccount}
              </p>
            )}
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-2">
              Nabywca
            </p>
            <p className="font-bold">{invoice.buyerName}</p>
            <p>NIP: {invoice.buyerNip}</p>
            <p>{invoice.buyerAddress}</p>
            <p>
              {invoice.buyerPostal} {invoice.buyerCity}
            </p>
          </div>
        </div>

        <table className="w-full text-sm mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-2">Opis usługi/towaru</th>
              <th className="py-2 text-center">Ilość</th>
              <th className="py-2 text-right">Cena Netto</th>
              <th className="py-2 text-center">VAT</th>
              <th className="py-2 text-right">Kwota Brutto</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-center">{Number(item.quantity)}</td>
                <td className="py-4 text-right">
                  {Number(item.priceNet).toFixed(2)}
                </td>
                <td className="py-4 text-center">{Number(item.vatRate)}%</td>
                <td className="py-4 text-right">
                  {(
                    Number(item.quantity) *
                    Number(item.priceNet) *
                    (1 + Number(item.vatRate) / 100)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 border-t border-black pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Do zapłaty:</span>
              <span>
                {Number(invoice.totalGross).toFixed(2)} {invoice.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
