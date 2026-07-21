import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { generateInvoicesCSV } from '@/utils/csv.util';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Brak autoryzacji', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const status = searchParams.get('status');

  if (!companyId) {
    return new NextResponse('Brak ID firmy', { status: 400 });
  }

  // 1. Budujemy dynamiczny obiekt filtrowania
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    companyId,
    company: { userId: session.user.id },
  };

  // 2. Jeśli podano miesiąc i rok, ograniczamy daty
  if (month && year) {
    // Uwaga: w JS miesiące są indeksowane od 0 (styczeń to 0)
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    whereClause.issueDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  // 3. Jeśli wybrano konkretny status (inny niż ALL)
  if (status && status !== 'ALL') {
    whereClause.status = status;
  }

  // 4. Pobieramy przefiltrowane dane
  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    orderBy: { issueDate: 'desc' },
  });

  if (invoices.length === 0) {
    return new NextResponse('Brak faktur dla podanych kryteriów', {
      status: 404,
    });
  }

  const fileContent = generateInvoicesCSV(invoices);

  // Sprytne nazewnictwo pliku (np. eksport_2026_7.csv)
  const filename =
    month && year ? `eksport_${year}_${month}.csv` : `eksport_pelny.csv`;

  return new NextResponse(fileContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
