import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostHeader } from "@/components/posts/PostHeader";
import { PostActions } from "@/components/posts/PostActions";
import { CommentForm } from "@/components/posts/CommentForm";
import { CommentItem } from "@/components/posts/CommentItem";
import Image from "next/image";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id },
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
            },
          },
          likes: {
            where: {
              userId: session.user.id,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      likes: {
        where: {
          userId: session.user.id,
        },
      },
      Bookmark: {
        where: {
          userId: session.user.id,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const comments = post.comments.map((comment) => ({
    ...comment,
    hasLiked: comment.likes.length > 0,
  }));

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-card rounded-lg shadow-sm p-6">
        <PostHeader
          author={{
            id: post.author.id,
            name: post.author.name || "Usuário",
            image: post.author.image || null,
            slug: post.author.slug,
          }}
          createdAt={post.createdAt}
        />

        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {post.imageUrl && (
            <div className="mb-6">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-auto rounded-lg object-cover max-h-[400px]"
              />
            </div>
          )}

          <div
            className="mt-6 prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-em:text-gray-700 dark:prose-em:text-gray-300
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600
              prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50
              prose-blockquote:py-2 prose-blockquote:rounded-r
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
              prose-li:my-2
              prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
              dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <PostActions
          likes={post._count.likes}
          hasLiked={post.likes.length > 0}
          commentsCount={comments.length}
          hasBookMarked={post.Bookmark.length > 0}
          postId={post.id}
          userId={session.user.id}
        />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Comentários</h2>
          <CommentForm
            author={{
              name: session.user.name || "Usuário",
              image: session.user.image || null,
            }}
            postId={post.id}
            authorId={session.user.id}
          />

          <div className="mt-8 space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={{
                  ...comment,
                  author: {
                    id: comment.user.id,
                    name: comment.user.name,
                    image: comment.user.image,
                    slug: comment.user.id, // Usando o ID como slug temporário
                  },
                  likesCount: comment.likes.length, // Adicionando a contagem de likes
                }}
                sessionUserId={session.user.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
