import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { name, slug, bio, role, updatedAt, imageUrl } = await req.json();
    const id = session.user.id;
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        slug,
        bio,
        role,
        updatedAt,
        image: imageUrl || null,
      },
    });

    return NextResponse.json(
      { message: "Perfil atualizado", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
