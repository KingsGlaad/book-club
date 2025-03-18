//api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Verifica a sessão do usuário logado
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    // Busca os posts do banco de dados
    const posts = await db.post.findMany({
      take: limit + 1, // Retorna um a mais para verificar se há mais posts
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId } } : undefined, // Verifica se o usuário deu like no post
        bookmarks: userId ? { where: { userId } } : undefined, // Verifica se o usuário salvou o post
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { name: true, image: true } }, // Inclui os autores dos comentários
            _count: { select: { likes: true } }, // Conta os likes dos comentários
            likes: userId ? { where: { userId } } : undefined, // Verifica se o usuário deu like no comentário
          },
        },
      },
    });

    // Verifica se há mais posts a carregar
    const hasMore = posts.length > limit;

    // Atualiza cada post com a informação de "hasLiked" para o usuário logado
    const updatedPosts = posts.slice(0, limit).map((post) => {
      const hasLiked = post.likes?.length > 0; // Verifica se o array de likes existe e tem elementos
      const hasLikedComment = post.comments.likes.length > 0; // Verifica se o array de likes dos comentários existe e tem elementos
      const hasBookMarked = post.bookmarks?.length > 0; // Verifica se o array de mark existe e tem elementos
      return {
        ...post,
        hasLiked, // Define "hasLiked" com base na existência de likes
        hasBookMarked, // Define "hasBookMarked" com base na existência de bookmarks
        likes: post._count.likes, // Inclui o total de likes
      };
    });

    return NextResponse.json({
      posts: updatedPosts,
      hasMore,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro ao carregar posts: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { title, content, type, published, imageUrl } = await request.json();

    if (!title || !content || !type) {
      return NextResponse.json(
        { message: "Título, conteúdo e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    const post = await db.post.create({
      data: {
        title,
        content,
        type,
        imageUrl: imageUrl || null,
        published: published ?? true,
        authorId: userId,
      },
      include: {
        author: { select: { name: true, image: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(
      { message: "Post criado com sucesso", post },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}
