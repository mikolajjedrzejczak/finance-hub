import { auth } from '@/auth';
import { ServiceForm } from '@/components/Service/ServiceForm';
import { ServicesTable } from '@/components/Service/ServiceTable';
import { catalogService } from '@/services/service.service';
import { redirect } from 'next/navigation';

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const rawServices = await catalogService.getServices(session.user.id);
  console.log(rawServices, "sdad");
  const serializedServices = rawServices.map((service) => ({
    ...service,
    priceNet: Number(service.priceNet),
    vatRate: Number(service.vatRate),
  }));
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
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
