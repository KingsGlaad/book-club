// app/api/users/slug/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateUniqueSlug } from "@/lib/slug";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { newSlug } = await req.json();

  try {
    const slug = await generateUniqueSlug(db, newSlug, session.user.id);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { slug },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar slug" },
      { status: 500 }
    );
  }
}
