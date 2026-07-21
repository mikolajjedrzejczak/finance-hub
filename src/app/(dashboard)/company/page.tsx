import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { companyService } from '@/services/company.service';
import { CompanyForm } from '@/components/Company/CompanyForm';
import CompanyTable from '@/components/Company/CompanyTable';

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const companies = await companyService.getUserCompanies(session.user.id);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Moje Firmy</h1>
        <p className="text-sm text-gray-600">
          Zarządzaj profilami firm, z których wystawiasz faktury.
        </p>
      </div>

      <CompanyForm />

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <CompanyTable companies={companies} />
      </div>
    </div>
  );
}
