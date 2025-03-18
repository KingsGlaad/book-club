import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default function middleware(req: Request) {
  const url = new URL(req.url);
  const token =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  if (!token) {
    // 🔹 Redireciona para a página de login, mantendo o redirect de onde veio
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname); // Mantém a URL original

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/posts/:path*", "/discussions/:path*", "/chat/:path*"], // 🔹 Aplica o middleware nessas rotas
};
