import { auth } from '@/auth';
import { ClientForm } from '@/components/Client/ClientForm';
import { ClientsTable } from '@/components/Client/ClientsTable';
import { clientService } from '@/services/client.service';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const clients = await clientService.getClients(session.user.id);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Klienci</h1>
        <p className="text-sm text-gray-600">
          Zarządzaj bazą kontrahentów i dodawaj nowych.
        </p>
      </div>

      <ClientForm />
      <ClientsTable clients={clients} />
    </div>
  );
}
