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
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();

        // Check if user already exists
        let existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          // Auto-create user from Google profile
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
          // Update avatar if user exists but has no avatar
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { avatarUrl: user.image },
          });
        }

        // Attach the database user ID to the user object
        user.id = existingUser.id;
        (user as { username?: string }).username = existingUser.username;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { username?: string }).username = token.username as string;
      }
      return session;
    },
  },
});
