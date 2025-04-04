"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePosts, Post } from "@/hooks/usePosts";
import PostCard from "@/components/post/PostCard";
import PostSkeleton from "@/components/post/PostSkeleton";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function PostsComponent({
  id,
  initialPosts,
}: {
  id: string;
  initialPosts?: Post[];
}) {
  const {
    posts,
    loading,
    error,
    hasMore,
    newComments,
    handleLike,
    handleBookmark,
    handleComment,
    setNewComments,
    loadMorePosts,
  } = usePosts(id, initialPosts);

  const lastPostRef = useInfiniteScroll(
    loading,
    hasMore && !loading, // Garantindo que o loading seja falso antes de disparar a próxima requisição
    loadMorePosts
  );

  // Erro de carregamento
  if (error) {
    return (
      <ErrorMessage message="Não foi possível carregar os posts. Por favor, tente novamente mais tarde." />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        {/* Mapeando os posts */}
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              ref={index === posts.length - 1 ? lastPostRef : null}
              onComment={handleComment}
              onLike={handleLike}
              onBookmark={handleBookmark}
              newComment={newComments[post.id] || ""}
              onCommentChange={(value) =>
                setNewComments({
                  ...newComments,
                  [post.id]: value,
                })
              }
              sessionUserId={id}
              userRole="USER"
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            Nenhum post encontrado
          </p>
        )}

        {/* Carregamento de mais posts */}
        {loading && hasMore && (
          <div className="space-y-4" aria-label="Carregando mais posts">
            <PostSkeleton />
          </div>
        )}

        {/* Mensagem caso não haja mais posts */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 py-4">
            Não há mais posts para carregar
          </p>
        )}
      </div>
    </div>
  );
}
