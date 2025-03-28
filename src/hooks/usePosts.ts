/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { likeComment } from "@/app/actions/comment";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  slug: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: Author;
  likesCount: number;
  hasLiked: boolean;
}

interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: Author;
  comments: Comment[];
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  hasBookMarked: boolean;
  tags: Tag[];
}

export function usePosts(id: string, initialPosts?: Post[]) {
  const { data: session } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  // Fetch posts
  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (initialPosts && pageNum === 1) {
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await res.json();

        // Verificar o estado de "curtido" para cada post
        const updatedPosts = await Promise.all(
          data.posts.map(async (post: Post) => {
            const likeRes = await fetch(`/api/posts/${post.id}/like`);
            const likeData = await likeRes.json();

            return {
              ...post,
              hasLiked: likeData.liked, // Atualizar o estado do like
            };
          })
        );

        if (pageNum === 1) {
          setPosts(updatedPosts);
        } else {
          setPosts((prev) => [...prev, ...updatedPosts]);
        }

        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        toast.error("Erro ao carregar posts");
      } finally {
        setLoading(false);
      }
    },
    [initialPosts]
  );

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [fetchPosts, loading, hasMore, page]);

  const requireAuth = useCallback(() => {
    if (!session) {
      router.push("/signin");
      return false;
    }
    return true;
  }, [session, router]);

  // Handle like
  const handleLike = async (postId: string) => {
    if (!requireAuth()) return;

    try {
      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return;

      // Atualização otimista
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
                hasLiked: !post.hasLiked,
              }
            : post
        )
      );

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Reverter em caso de erro
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
                  hasLiked: !post.hasLiked,
                }
              : post
          )
        );
        throw new Error("Falha ao curtir post");
      }

      const data = await response.json();

      // Atualizar com dados do servidor
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: data.likes, hasLiked: data.liked }
            : post
        )
      );
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      throw error;
    }
  };
  // Handle bookmark
  const handleBookmark = useCallback(
    async (postId: string) => {
      if (!session?.user) {
        toast.error("Você precisa estar logado para salvar um post");
        return;
      }

      try {
        // Atualização otimista do estado
        const currentPost = posts.find((post) => post.id === postId);
        if (!currentPost) return;

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, hasBookMarked: !post.hasBookMarked }
              : post
          )
        );

        const res = await fetch(`/api/posts/${postId}/bookmark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          // Reverter a mudança em caso de erro
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? { ...post, hasBookMarked: !post.hasBookMarked }
                : post
            )
          );
          throw new Error("Failed to bookmark post");
        }

        const data = await res.json();

        // Atualizar o estado com a resposta do servidor
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, hasBookMarked: data.bookmarked }
              : post
          )
        );
      } catch (err) {
        toast.error("Erro ao salvar o post");
      }
    },
    [session?.user, posts]
  );

  // Handle comment
  const handleComment = useCallback(
    async (postId: string, content: string) => {
      if (!session?.user) {
        toast.error("Você precisa estar logado para comentar");
        return;
      }

      if (!content.trim()) {
        toast.error("O comentário não pode estar vazio");
        return;
      }

      try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) throw new Error("Failed to add comment");

        const newComment = await res.json();

        setPosts((prev) => {
          const updatedPosts = prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [newComment, ...(post.comments || [])],
                  commentsCount: (post.commentsCount || 0) + 1,
                }
              : post
          );

          return [...updatedPosts]; // Força um re-render
        });

        // Clear comment input
        setNewComments((prev) => ({ ...prev, [postId]: "" }));
      } catch (err) {
        toast.error("Erro ao adicionar comentário");
      }
    },
    [session?.user]
  );

  // Handle comment like
  const handleCommentLike = useCallback(
    async (commentId: string) => {
      if (!requireAuth()) return;

      try {
        // Atualização otimista
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likesCount: comment.hasLiked
                      ? comment.likesCount - 1
                      : comment.likesCount + 1,
                    hasLiked: !comment.hasLiked,
                  }
                : comment
            ),
          }))
        );

        const result = await likeComment(commentId, session?.user?.id || "");

        if (!result) return;

        // Atualizar com dados do servidor
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likesCount: result.likesCount,
                    hasLiked: result.hasLiked,
                  }
                : comment
            ),
          }))
        );
      } catch (error) {
        console.error("Erro ao curtir comentário:", error);
        throw error;
      }
    },
    [session?.user?.id, requireAuth]
  );

  // Handle comment delete
  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      if (!session?.user) {
        toast.error("Você precisa estar logado para excluir um comentário");
        return;
      }

      try {
        // Atualização otimista
        const originalPosts = [...posts];
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            comments: post.comments.filter(
              (comment) => comment.id !== commentId
            ),
            commentsCount: post.commentsCount - 1,
          }))
        );

        const res = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          // Reverter em caso de erro
          setPosts(originalPosts);
          throw new Error("Failed to delete comment");
        }
      } catch (err) {
        toast.error("Erro ao excluir o comentário");
      }
    },
    [session?.user, posts]
  );

  // Handle comment edit
  const handleCommentEdit = useCallback(
    async (commentId: string, content: string) => {
      if (!session?.user) {
        toast.error("Você precisa estar logado para editar um comentário");
        return;
      }

      if (!content.trim()) {
        toast.error("O comentário não pode estar vazio");
        return;
      }

      try {
        // Atualização otimista
        const originalPosts = [...posts];
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId ? { ...comment, content } : comment
            ),
          }))
        );

        const res = await fetch(`/api/comments/${commentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          // Reverter em caso de erro
          setPosts(originalPosts);
          throw new Error("Failed to edit comment");
        }

        const updatedComment = await res.json();

        // Atualizar com dados do servidor
        setPosts((prev) =>
          prev.map((post) => ({
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, ...updatedComment }
                : comment
            ),
          }))
        );
      } catch (err) {
        toast.error("Erro ao editar o comentário");
      }
    },
    [session?.user, posts]
  );

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    newComments,
    handleLike,
    handleBookmark,
    handleComment,
    handleCommentLike,
    handleCommentDelete,
    handleCommentEdit,
    setNewComments,
    loadMorePosts,
  };
}
