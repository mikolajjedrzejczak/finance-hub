import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import bcrypt from 'bcryptjs';

import { authConfig } from '@/auth.config';
import prisma from './lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Brakujące dane logowania');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error('Nieprawidłowy e-mail lub hasło');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('Nieprawidłowy e-mail lub hasło');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === 'microsoft-entra-id') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        if (existingUser) {
          const hasMicrosoftAccount = existingUser.accounts.some(
            (acc) => acc.provider === 'microsoft-entra-id',
          );

          if (!hasMicrosoftAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
        } else {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || (profile as any)?.name,
            },
          });
        }
      }
      return true;
    },
  },
});
