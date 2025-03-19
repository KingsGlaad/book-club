import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// For Next.js App Router - use this pattern exactly as shown
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = (await params).postId;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verifica se o post existe
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o usuário já salvou o post
    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    if (existingBookmark) {
      // Se o bookmark existir, remova-o
      await db.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Caso contrário, crie o bookmark
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error("Erro ao processar o bookmark:", error);
    return NextResponse.json(
      { error: "Erro ao processar o bookmark" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getServerSession(authOptions);
  const postId = (await params).postId;

  try {
    // Verifica se o post existe
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o usuário já salvou o post
    const existingBookmark = session?.user?.id
      ? await db.bookmark.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: postId,
            },
          },
        })
      : null;

    return NextResponse.json({
      bookmarked: Boolean(existingBookmark),
    });
  } catch (error) {
    console.error("Erro ao verificar status do bookmark:", error);
    return NextResponse.json(
      { error: "Falha ao verificar status do bookmark" },
      { status: 500 }
    );
  }
}
