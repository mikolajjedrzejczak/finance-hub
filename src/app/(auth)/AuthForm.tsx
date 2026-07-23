'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  serverError: string | null;
  submitLabel: string;
  submitLoadingLabel: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: ReactNode;
}

export default function AuthForm({
  title,
  onSubmit,
  isSubmitting,
  serverError,
  submitLabel,
  submitLoadingLabel,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthFormProps) {
  return (
    <div className="w-full md:max-w-130 flex flex-col items-center space-y-8 md:px-0 ">
      <div className="text-start w-full sm:w-130">
        <h2 className="text-2xl md:text-3xl tracking-tight text-gray-900">
          {title}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-12 w-full :w-130">
        {serverError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="space-y-6">{children}</div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? submitLoadingLabel : submitLabel}
        </button>

        <p className="text-black/50">
          {footerText}{' '}
          <Link className="text-blue-800" href={footerLinkHref}>
            &nbsp;{footerLinkText}
          </Link>
        </p>
      </form>
      <div className="w-full">
        <div className="w-full flex items-center pb-10">
          <span
            className="relative w-full text-center  before:content-[''] before:absolute before:block before:top-[50%]
            before:w-[45%] before:h-px before:bg-black/30 before:z-100
            after:absolute after:block after:top-[50%] after:right-0
            after:w-[45%] after:h-px after:bg-black/30 after:z-100
            text-black/50 text-sm
            "
          >
            lub
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })
          }
          className="flex items-center w-full md:w-130 justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 21 21" fill="currentColor">
            <path d="M1 1h9v9H1z" fill="#f25022" />
            <path d="M1 11h9v9H1z" fill="#00a4ef" />
            <path d="M11 1h9v9h-9z" fill="#7fba00" />
            <path d="M11 11h9v9h-9z" fill="#ffb900" />
          </svg>
          Zaloguj się przez Microsoft
        </button>
      </div>
    </div>
  );
}
