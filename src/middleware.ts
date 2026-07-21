import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthRoute =
    nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isRootRoute = nextUrl.pathname === '/';

  const isPublicRoute = nextUrl.pathname.startsWith('/public');

  if (isPublicRoute) return null;

  if (isRootRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    } else {
      return Response.redirect(new URL('/login', nextUrl));
    }
  }

  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return null;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
