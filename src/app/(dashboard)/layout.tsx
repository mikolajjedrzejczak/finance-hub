import { auth } from '@/auth';
import Sidebar from '@/components/Sidebar';
import { companyService } from '@/services/company.service';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const companies = await companyService.getUserCompanies(session.user.id);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar companies={companies} />
      <main className="mt-24 md:mt-0 md:ml-70">{children}</main>
    </div>
  );
}
