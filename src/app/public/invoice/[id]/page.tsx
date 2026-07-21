import { invoiceRepository } from '@/repositories/invoice.repository';
import { notFound } from 'next/navigation';
import { Download, CreditCard, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { PdfButton } from '@/components/ui/PdfButtonts';

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const invoice = await invoiceRepository.getPublicById(resolvedParams.id);

  // Jeśli ktoś wpisał zły ID - zwracamy stronę 404
  if (!invoice) {
    notFound();
  }

  // Pomocnicze zmienne do wyliczania kwot
  const amountDue = invoice.totalGross - invoice.paidAmount;
  const isPaid = invoice.status === 'PAID' || amountDue <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* PASEK Z AKCJAMI DLA KLIENTA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Faktura {invoice.number}
            </h1>
            <p className="text-sm text-gray-500">Od: {invoice.sellerName}</p>
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <PdfButton
              filename={`Faktura_${invoice.number.replace(/\//g, '_')}`}
            />

            {/* Przycisk płatności zmienia się w zależności od statusu */}
            {isPaid ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                Opłacona
              </div>
            ) : (
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-sm">
                <CreditCard className="w-4 h-4" />
                Opłać {amountDue.toFixed(2)} {invoice.currency}
              </button>
            )}
          </div>
        </div>

        {/* WIDOK DOKUMENTU FAKTURY */}
        <div
          id="invoice-print-area"
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12"
        >
          {/* Nagłówek dokumentu */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                Faktura
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {invoice.number}
              </p>
            </div>
            <div className="text-right space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Data wystawienia:</span>{' '}
                {format(new Date(invoice.issueDate), 'dd.MM.yyyy')}
              </p>
              <p>
                <span className="text-gray-500">Termin płatności:</span>{' '}
                {format(new Date(invoice.dueDate), 'dd.MM.yyyy')}
              </p>
            </div>
          </div>

          {/* Dane Sprzedawcy i Nabywcy ze Snapshota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">
                Sprzedawca
              </p>
              <div className="text-sm text-gray-900 space-y-1">
                <p className="font-bold">{invoice.sellerName}</p>
                <p>NIP: {invoice.sellerNip}</p>
                <p>{invoice.sellerAddress}</p>
                <p>
                  {invoice.sellerPostal} {invoice.sellerCity}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">
                Nabywca
              </p>
              <div className="text-sm text-gray-900 space-y-1">
                <p className="font-bold">{invoice.buyerName}</p>
                <p>NIP: {invoice.buyerNip}</p>
                <p>{invoice.buyerAddress}</p>
                <p>
                  {invoice.buyerPostal} {invoice.buyerCity}
                </p>
              </div>
            </div>
          </div>

          {/* Tabela Pozycji */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-700">
                    Usługa / Towar
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">
                    Ilość
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">
                    Cena Netto
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">
                    VAT
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">
                    Wartość Netto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 px-4 text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-right">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-right">
                      {item.priceNet.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-right">
                      {item.vatRate}%
                    </td>
                    <td className="py-4 px-4 text-gray-900 text-right font-medium">
                      {(item.quantity * item.priceNet).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Podsumowanie kwot */}
          <div className="flex justify-end border-t border-gray-200 pt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Suma Netto:</span>
                <span>
                  {invoice.totalNet.toFixed(2)} {invoice.currency}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kwota VAT:</span>
                <span>
                  {(invoice.totalGross - invoice.totalNet).toFixed(2)}{' '}
                  {invoice.currency}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Do zapłaty:</span>
                <span>
                  {invoice.totalGross.toFixed(2)} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Dane do przelewu */}
          {!isPaid && invoice.sellerBankAccount && (
            <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-100 text-sm">
              <p className="font-semibold text-gray-900 mb-2">
                Dane do przelewu tradycyjnego:
              </p>
              <p className="text-gray-600">
                Bank:{' '}
                <span className="font-mono font-medium text-gray-900">
                  {invoice.sellerBankAccount}
                </span>
              </p>
              <p className="text-gray-600">
                Tytuł przelewu:{' '}
                <span className="font-medium text-gray-900">
                  {invoice.number}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
