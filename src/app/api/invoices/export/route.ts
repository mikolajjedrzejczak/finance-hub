import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { generateInvoicesCSV } from '@/utils/csv.utils';
import prisma from '@/lib/prisma';
import { InvoiceStatus, Prisma } from '@prisma/client';

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

  const whereClause: Prisma.InvoiceWhereInput = {
    companyId,
    company: { userId: session.user.id },
  };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    whereClause.issueDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (status && status !== 'ALL') {
    whereClause.status = status as InvoiceStatus;
  }

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
