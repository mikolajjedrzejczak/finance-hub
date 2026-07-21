'use client';

import { setActiveCompanyAction } from '@/app/actions/company.actions';
import {
  Briefcase,
  FileText,
  Building2,
  LayoutDashboard,
  Menu,
  Users,
  Wallet,
  X,
  Building,
  LineChart,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Company {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function Sidebar({ companies = [] }: { companies?: Company[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenMenu = () => {
    setIsOpen((prevState) => !prevState);
  };

  const isActive = (href: string) => pathname === href;

  const activeCompany = companies.find((c) => c.isDefault) || companies[0];

  const navigation = [
    { name: 'Panel Główny', href: '/dashboard', icon: LayoutDashboard },
    ...(activeCompany
      ? [
          {
            name: 'Panel Aktywnej Firmy',
            href: `/company/${activeCompany.id}`,
            icon: LineChart,
          },
        ]
      : []),
    { name: 'Moje Firmy', href: '/company', icon: Building },
    { name: 'Faktury', href: '/invoices', icon: FileText },
    { name: 'Klienci', href: '/clients', icon: Users },
    { name: 'Katalog Usług', href: '/services', icon: Briefcase },
  ];

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    startTransition(async () => {
      const result = await setActiveCompanyAction(newCompanyId);

      if (result?.success) {
        if (pathname.startsWith('/company/') && pathname !== '/company') {
          router.push(`/company/${newCompanyId}`);
        } else {
          router.refresh();
        }
      }
    });
  };

  const CompanySwitcher = () => {
    if (companies.length === 0) return null;
    return (
      <div className="px-4 py-4 border-b border-sidebar-border">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Aktywna firma
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            disabled={isPending}
            value={activeCompany?.id || ''}
            onChange={handleCompanyChange}
            className={`w-full appearance-none text-ellipsis rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
              isPending ? 'opacity-50' : ''
            }`}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-sidebar-border bg-background md:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-2xl font-bold text-blue-600"
          >
            Finance Hub
          </Link>
        </div>

        <CompanySwitcher />

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm gap-1 font-medium lg:px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${isActive(item.href) ? 'text-primary bg-muted' : 'text-muted-foreground'} flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-muted`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="w-full py-4 px-5">
          <form
            action={async () => {
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              className="w-full py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            >
              Wyloguj się
            </button>
          </form>
        </div>
      </aside>

      <div className="fixed top-0 left-0 flex items-center justify-between md:hidden w-full p-4 bg-background z-100">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-2xl font-bold text-blue-600"
          >
            Finance Hub
          </Link>
        </div>
        <div className="cursor-pointer" onClick={handleOpenMenu}>
          {isOpen ? <X /> : <Menu />}
        </div>
      </div>

      <div
        className={`md:hidden fixed left-0 w-full h-fit bg-background transition-all duration-100 ${isOpen ? 'top-14' : '-top-100'} flex flex-col justify-between z-30`}
      >
        <CompanySwitcher />
        <div className="py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${isActive(item.href) ? 'text-primary bg-muted' : 'text-muted-foreground'} flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-muted`}
                onClick={handleOpenMenu}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="w-full py-4 px-5">
          <form
            action={async () => {
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              className="py-1 px-3 text-sm rounded-md hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            >
              Wyloguj się
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
