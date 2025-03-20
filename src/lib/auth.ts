/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { db } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { generateUniqueSlug } from "./slug";

export const authOptions: AuthOptions = {
  adapter: {
    ...PrismaAdapter(db),
    async createUser(data = {} as any) {
      if (!data.name) {
        console.error("Erro: nome não fornecido pelo provedor.");
        throw new Error("Nome é obrigatório.");
      }

      const slug = await generateUniqueSlug(db, data.name);
      console.log("Slug gerado:", slug);
      console.log("Tentando criar usuário:", JSON.stringify(data, null, 2));

      return db.user.create({
        data: {
          ...data,
          slug,
        },
      });
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.slug = token.slug as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.slug = (user as any).slug;
      } else if (!token.slug) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { slug: true, role: true },
        });

        if (dbUser) {
          token.slug = dbUser.slug;
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
