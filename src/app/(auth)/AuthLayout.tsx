'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
}

export default function AuthLayout({
  children,
  heroTitle,
  heroSubtitle,
  heroDescription,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex items-center justify-center w-full rounded-xl">
        <div className="relative hidden lg:block flex-1 h-screen bg-linear-to-br from-blue-600 to-blue-900 overflow-hidden">
          <div className="flex items-center p-12 pb-36">
            <span className="text-6xl font-bold text-white">Finance Hub</span>
          </div>
          <div className="flex flex-col gap-10 w-130 ml-12 xl:ml-36">
            <h2 className="text-4xl text-white">{heroTitle}</h2>
            <p className="text-white/70">{heroDescription}</p>
          </div>
          <Image
            src="/hero.png"
            width={700}
            height={400}
            alt="hero"
            preload
            className="absolute bottom-0 -right-20 rounded-tl-xl"
          />
        </div>

        <div className="flex-1 flex flex-col items-center space-y-8 bg-white px-8 md:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}