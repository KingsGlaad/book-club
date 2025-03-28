"use server";

import { prisma } from "@/lib/prisma";

export async function createComment(
  content: string,
  authorId: string,
  postId: string
) {
  return await prisma.comment.create({
    data: {
      content,
      userId: authorId,
      postId,
    },
  });
}

export async function likeComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      likes: {
        where: {
          userId,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!comment) return;

  if (comment.likes.length > 0) {
    // Se o usuário já curtiu, removemos o like
    await prisma.like.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  } else {
    // Se o usuário não curtiu, adicionamos o like
    await prisma.like.create({
      data: {
        userId,
        commentId,
      },
    });
  }

  // Buscar o estado atualizado
  const updatedComment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      likes: {
        where: {
          userId,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!updatedComment) return;

  return {
    likesCount: updatedComment._count.likes,
    hasLiked: updatedComment.likes.length > 0,
  };
}
export async function deleteComment(commentId: string) {
  return await prisma.comment.delete({
    where: { id: commentId },
  });
}

export async function editComment(commentId: string, content: string) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });
}
