/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  author: Author;
  likes: number;
  hasLikedComment: boolean;
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

export function usePosts() {
  const { data: session } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum: number) => {
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
  }, []);

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

      // Alteração local do like
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
              hasLiked: !post.hasLiked,
            }
          : post
      );
      setPosts(updatedPosts);

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Falha ao curtir post");

      const data = await response.json();
      // Atualizando os dados do post após a resposta do backend
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: data.likes, hasLiked: data.liked }
            : post
        )
      );
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  // Handle Like comment
  const handleLikeComment = async (commentId: string, postId: string) => {
    if (!requireAuth()) return;

    try {
      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return;

      const currentComment = currentPost.comments.find(
        (comment) => comment.id === commentId
      );
      if (!currentComment) return;

      // Atualização otimista
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.hasLikedComment
                        ? comment.likes - 1
                        : comment.likes + 1,
                      hasLiked: !comment.hasLikedComment,
                    }
                  : comment
              ),
            }
          : post
      );
      setPosts(updatedPosts);

      // Chamada da API
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao curtir comentário");

      const data = await response.json();

      // Atualização com os dados reais da API
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        likes: data.likes,
                        hasLikedComment: data.liked,
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (err) {
      toast.error("Erro ao curtir comentário");
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
        const res = await fetch(`/api/posts/${postId}/bookmark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to bookmark post");

        const data = await res.json();

        // Atualizando o estado local após a mudança no banco de dados
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, bookmarked: data.bookmarked } : post
          )
        );

        toast.success(
          data.bookmarked ? "Post salvo" : "Post removido dos salvos"
        );
      } catch (err) {
        toast.error("Erro ao salvar o post");
      }
    },
    [session?.user]
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

          console.log("Posts atualizados:", updatedPosts);
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
    handleLikeComment,
    handleBookmark,
    handleComment,
    setNewComments,
    loadMorePosts,
  };
}
