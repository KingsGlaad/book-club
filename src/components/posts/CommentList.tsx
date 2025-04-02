"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CommentItem } from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string;
  };
  likesCount: number;
  hasLiked: boolean;
}

interface CommentListProps {
  comments: Comment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onComment: (postId: string, content: string) => Promise<void>;
  postId: string;
  sessionUserId: string;
  userRole?: "ADMIN" | "MODERATOR" | "USER";
}

export function CommentList({
  comments = [],
  newComment = "",
  onCommentChange,
  onComment,
  postId,
  sessionUserId,
  userRole = "USER",
}: CommentListProps) {
  const { data: session } = useSession();

  const handleComment = async (postId: string, content: string) => {
    try {
      await onComment(postId, content);
      toast.success("Comentário adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error("Erro ao adicionar comentário");
    }
  };

  return (
    <div className="px-4 pt-2 pb-4 border-t border-gray-100 dark:border-gray-800">
      {/* Comment form */}
      {session?.user && (
        <div className="mb-4 flex items-start space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback>
              {(session.user.name?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-2xl p-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => onCommentChange(e.target.value)}
                className="resize-none mb-2 border-none text-sm rounded-xl"
                rows={2}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!newComment.trim()) {
                      toast.error("O comentário não pode estar vazio");
                      return;
                    }
                    await handleComment(postId, newComment);
                    onCommentChange("");
                  }}
                  disabled={!newComment.trim()}
                >
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={{
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                likesCount: comment.likesCount,
                hasLiked: comment.hasLiked,
                author: {
                  id: comment.user.id,
                  name: comment.user.name,
                  image: comment.user.image,
                  slug: comment.user.slug,
                },
              }}
              sessionUserId={sessionUserId}
              userRole={userRole}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-2">
            Sem comentários ainda
          </p>
        )}
      </div>
    </div>
  );
}
