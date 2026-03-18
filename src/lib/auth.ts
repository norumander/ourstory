import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { deriveUsername } from "./utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            username: user.username,
          };
        } catch (error) {
          console.error("[Auth] Credentials authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const email = user.email.toLowerCase();

          let existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            let username = deriveUsername(email);
            let suffix = 2;
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${deriveUsername(email)}${suffix}`;
              suffix++;
            }

            existingUser = await prisma.user.create({
              data: {
                email,
                passwordHash: null,
                displayName: user.name || email.split("@")[0],
                username,
                avatarUrl: user.image || null,
              },
            });
          } else if (!existingUser.avatarUrl && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { avatarUrl: user.image },
            });
          }

          user.id = existingUser.id;
          (user as { username?: string }).username = existingUser.username;
        } catch (error) {
          console.error("[Auth] Google signIn callback error:", error);
          // Allow sign-in even if DB fails — JWT callback will retry
          return true;
        }
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account && token.email) {
        // First sign-in — look up database user
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, username: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
          }
        } catch (error) {
          console.error("[Auth] JWT callback DB lookup error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { username?: string }).username =
          token.username as string;
      }
      return session;
    },
  },
});
