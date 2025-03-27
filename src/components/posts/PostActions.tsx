import { Heart, Bookmark, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  likes: number;
  hasLiked: boolean;
  hasBookMarked: boolean;
  commentsCount: number;
}

export function PostActions({
  postId,
  likes,
  hasLiked,
  hasBookMarked,
  commentsCount,
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={async () => {
          "use server";
          const response = await fetch(`/api/posts/${postId}/like`, {
            method: "POST",
          });
          if (!response.ok) throw new Error("Erro ao curtir");
        }}
        className={cn(
          "flex items-center gap-1 text-muted-foreground hover:text-red-500",
          hasLiked && "text-red-500"
        )}
      >
        <Heart className="h-4 w-4" />
        <span>{likes}</span>
      </button>

      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount}</span>
      </div>

      <button
        onClick={async () => {
          "use server";
          const response = await fetch(`/api/posts/${postId}/bookmark`, {
            method: "POST",
          });
          if (!response.ok) throw new Error("Erro ao salvar");
        }}
        className={cn(
          "flex items-center gap-1 text-muted-foreground hover:text-yellow-500",
          hasBookMarked && "text-yellow-500"
        )}
      >
        <Bookmark className="h-4 w-4" />
      </button>
    </div>
  );
}
