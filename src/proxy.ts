import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthRoute =
    nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isRootRoute = nextUrl.pathname === '/';
  const isPublicRoute = nextUrl.pathname.startsWith('/public');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (isLoggedIn && (isAuthRoute || isRootRoute)) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};