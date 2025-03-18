import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { db } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
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
        session.user.role = token.role;
        session.user.slug = token.slug;
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
          where: { id: token.id },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.slug = dbUser.slug;
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies:
    process.env.NODE_ENV === "production"
      ? {
          sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
            },
          },
        }
      : undefined,
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
