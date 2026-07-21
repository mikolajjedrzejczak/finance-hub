import NextAuth from "next-auth";
import { authConfig } from "./auth.config";


// Inicjalizujemy tylko lekką wersję NextAuth dla Edge
export const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Jeśli użytkownik jest niezalogowany i próbuje wejść na chronioną trasę
  if (!isLoggedIn && nextUrl.pathname !== "/login" && nextUrl.pathname !== "/register") {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register|public).*)"],
};