import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Post } from "@/hooks/usePosts";
import PostsComponent from "../../components/Posts";

// Componente do servidor que busca os dados
export default async function SavedPosts() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  const savedPosts = await prisma.post.findMany({
    where: {
      Bookmark: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          slug: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          Bookmark: true,
        },
      },
      likes: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
      Bookmark: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const postsWithLikeAndBookmarkStatus = savedPosts.map((post) => ({
    ...post,
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.type,
    imageUrl: post.imageUrl,
    published: post.published,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.user,
      likesCount: 0,
      hasLiked: false,
    })),
    likes: post._count.likes,
    commentsCount: post._count.comments,
    hasLiked: post.likes.length > 0,
    hasBookMarked: post.Bookmark.length > 0,
    tags: [],
  })) as unknown as Post[];

  console.log(postsWithLikeAndBookmarkStatus);

  return (
    <PostsComponent
      id="saved-posts"
      initialPosts={postsWithLikeAndBookmarkStatus}
    />
  );
}
