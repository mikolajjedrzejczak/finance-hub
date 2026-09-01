import { auth } from '@/auth';
import { ServiceForm } from '@/components/Service/ServiceForm';
import { ServicesTable } from '@/components/Service/ServiceTable';
import { catalogService } from '@/services/service.service';
import { redirect } from 'next/navigation';

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const rawServices = await catalogService.getServices(session.user.id);
  const serializedServices = rawServices.map((service) => ({
    ...service,
    priceNet: service.priceNet.toNumber(),
    vatRate: service.vatRate.toNumber(),
  }));
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Katalog Usług i Produktów
        </h1>
        <p className="text-sm text-gray-600">
          Zarządzaj cennikiem. Te usługi będziesz mógł szybko dodawać na
          faktury.
        </p>
      </div>

      <ServiceForm />
      <ServicesTable services={serializedServices} />
    </div>
  );
}
