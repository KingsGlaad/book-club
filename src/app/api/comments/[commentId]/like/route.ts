import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { commentId } = context.params;
  const userId = session.user.id;

  try {
    // Verifica se o usuário já curtiu o comentário
    const existingLike = await db.like.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingLike) {
      // Se já curtiu, remover like (toggle)
      await db.like.delete({
        where: { userId_commentId: { userId, commentId } },
      });

      return NextResponse.json({ message: "Like removido" });
    }

    // Se não curtiu, adicionar like
    await db.like.create({
      data: { userId, commentId },
    });

    return NextResponse.json({ message: "Like adicionado" }, { status: 201 });
  } catch (error) {
    console.error("Erro ao curtir comentário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
