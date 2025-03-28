"use client";

import { Heart, Bookmark, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { likePost, bookmarkPost } from "@/app/actions/post";

interface PostActionsProps {
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
  hasBookMarked: boolean;
  postId?: string;
  userId?: string;
  onToggleComments?: () => void;
  onLike?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
}

export function PostActions({
  likes,
  commentsCount,
  hasLiked,
  hasBookMarked,
  postId,
  userId,
  onToggleComments,
  onLike,
  onBookmark,
}: PostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (onLike) {
        await onLike();
      } else if (postId && userId) {
        await likePost(postId, userId);
        router.refresh();
      }
      toast.success(hasLiked ? "Post descurtido" : "Post curtido");
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      toast.error("Erro ao processar sua ação");
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      if (onBookmark) {
        await onBookmark();
      } else if (postId && userId) {
        await bookmarkPost(postId, userId);
        router.refresh();
      }
      toast.success(hasBookMarked ? "Post removido dos salvos" : "Post salvo");
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast.error("Erro ao processar sua ação");
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="px-4 py-2 flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300",
            isLiking && "opacity-50 cursor-not-allowed"
          )}
        >
          <Heart
            size={18}
            className={cn(
              "transition-colors",
              hasLiked ? "fill-red-500 text-red-500" : ""
            )}
          />
          <span>{Number(likes) || 0}</span>
        </button>
        {onToggleComments && (
          <button
            onClick={onToggleComments}
            className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <MessageCircle size={18} />
            <span>{commentsCount || 0}</span>
          </button>
        )}
      </div>
      <button
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={cn(
          "hover:text-gray-700 dark:hover:text-gray-300",
          isBookmarking && "opacity-50 cursor-not-allowed"
        )}
      >
        <Bookmark
          size={18}
          className={cn(
            "transition-colors",
            hasBookMarked ? "fill-yellow-500 text-yellow-500" : ""
          )}
        />
      </button>
    </div>
  );
}
