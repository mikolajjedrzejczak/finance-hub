import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;


  if (
    !isLoggedIn &&
    nextUrl.pathname !== '/login' &&
    nextUrl.pathname !== '/register'
  ) {
    return Response.redirect(new URL('/login', nextUrl));
  }
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
