//actions/post.ts
"use server";

import { db } from "@/lib/prisma";
import { toast } from "sonner";

export async function likePost(postId: string, userId: string) {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      likes: {
        where: {
          userId,
        },
      },
    },
  });

  if (!post) {
    toast.error("Post não encontrado");
    return;
  }

  if (post.likes.length > 0) {
    await db.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // Remover a lógica de likesCount
  } else {
    await db.like.create({
      data: {
        userId,
        postId,
      },
    });

    // Remover a lógica de likesCount
  }

  // Buscar o estado atualizado
  const updatedPost = await db.post.findUnique({
    where: { id: postId },
    include: {
      likes: true, // Inclua os likes para contar
    },
  });

  if (!updatedPost) return;

  return {
    likesCount: updatedPost.likes.length, // Calcule a contagem de likes
    hasLiked: updatedPost.likes.some((like) => like.userId === userId), // Verifique se o usuário curtiu
  };
}

export async function bookmarkPost(postId: string, userId: string) {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      Bookmark: {
        where: {
          userId,
        },
      },
    },
  });

  if (!post) return;

  if (post.Bookmark.length > 0) {
    await db.bookmark.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  } else {
    await db.bookmark.create({
      data: {
        userId,
        postId,
      },
    });
  }
}
