import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/posts/PostHeader";
import { PostActions } from "@/components/posts/PostActions";
import { CommentForm } from "@/components/posts/CommentForm";
import { CommentItem } from "@/components/posts/CommentItem";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    notFound();
  }
  console.log(params);
  const id = (await params).id;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
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
      bookmarks: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const hasLiked = post.likes.length > 0;
  const hasBookMarked = post.bookmarks.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <PostHeader
            author={{
              id: post.author.id,
              name: post.author.name || "",
              image: post.author.image,
              slug: post.author.slug || "",
            }}
            createdAt={post.createdAt.toISOString()}
          />

          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
          </div>

          <PostActions
            postId={post.id}
            likes={post.likesCount}
            hasLiked={hasLiked}
            hasBookMarked={hasBookMarked}
            commentsCount={post.comments.length}
          />
        </div>

        <div className="border-t">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Comentários ({post.comments.length})
            </h3>

            <CommentForm
              author={{
                id: session.user.id,
                name: session.user.name || "",
                image: session.user.image || null,
              }}
              newComment=""
              setNewComment={() => {}}
              onSubmit={async (content) => {
                "use server";
                await prisma.comment.create({
                  data: {
                    content,
                    authorId: session.user.id,
                    postId: post.id,
                  },
                });
              }}
            />

            <div className="mt-6 space-y-4">
              {post.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={{
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt.toISOString(),
                    likesCount: comment.likesCount,
                    hasLiked: comment.likes.length > 0,
                    author: {
                      id: comment.author.id,
                      name: comment.author.name || "",
                      image: comment.author.image,
                      slug: comment.author.slug || "",
                      role: comment.author.role || "USER",
                    },
                  }}
                  session={session}
                  onCommentLike={async (commentId) => {
                    "use server";
                    const comment = await prisma.comment.findUnique({
                      where: { id: commentId },
                      include: {
                        likes: {
                          where: {
                            userId: session.user.id,
                          },
                        },
                      },
                    });

                    if (!comment) return;

                    if (comment.likes.length > 0) {
                      await prisma.commentLike.delete({
                        where: {
                          userId_commentId: {
                            userId: session.user.id,
                            commentId: commentId,
                          },
                        },
                      });

                      await prisma.comment.update({
                        where: { id: commentId },
                        data: {
                          likesCount: {
                            decrement: 1,
                          },
                        },
                      });
                    } else {
                      await prisma.commentLike.create({
                        data: {
                          userId: session.user.id,
                          commentId: commentId,
                        },
                      });

                      await prisma.comment.update({
                        where: { id: commentId },
                        data: {
                          likesCount: {
                            increment: 1,
                          },
                        },
                      });
                    }
                  }}
                  onCommentDelete={async (commentId) => {
                    "use server";
                    await prisma.comment.delete({
                      where: { id: commentId },
                    });
                  }}
                  onCommentEdit={async (commentId, content) => {
                    "use server";
                    await prisma.comment.update({
                      where: { id: commentId },
                      data: { content },
                    });
                  }}
                />
              ))}

              {post.comments.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Seja o primeiro a comentar!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
