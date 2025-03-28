"use client";

import { usePosts, Post } from "@/hooks/usePosts";
import PostCard from "@/components/post/PostCard";
import { Bookmark } from "lucide-react";

interface SavedPostsClientProps {
  initialPosts: Post[];
}

export function SavedPostsClient({ initialPosts }: SavedPostsClientProps) {
  const {
    posts,
    handleLike,
    handleBookmark,
    handleComment,
    newComments,
    setNewComments,
  } = usePosts("saved", initialPosts);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Posts Salvos</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">
            Nenhum post salvo ainda
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Os posts que você salvar aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onCommentLike={handleLike}
              onCommentDelete={async () => {}}
              onCommentEdit={async () => {}}
              sessionUserId={post.author.id}
              onComment={handleComment}
              newComment={newComments[post.id] || ""}
              onCommentChange={(value) =>
                setNewComments((prev) => ({ ...prev, [post.id]: value }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
