import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 🔹 Certifique-se de importar as configurações do NextAuth

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions); // 🔹 Passando as opções de autenticação

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 }
    );
  }

  const postId = (await params).postId;
  const { content } = await req.json();
  const userId = session.user.id; // 🔹 Agora o ID do usuário está garantido

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });
  }

  try {
    const comment = await db.comment.create({
      data: { content, userId: userId, postId },
      include: { user: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return NextResponse.json({ error: "Erro ao comentar" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const postId = (await context.params).postId;

  try {
    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    );
  }
}
