import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Importação correta para acessar os cookies

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const cookieStore = cookies(); // Acessa os cookies usando next/headers
  const token =
    (await cookieStore).get("next-auth.session-token") ||
    (await cookieStore).get("__Secure-next-auth.session-token");

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
