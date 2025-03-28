"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MoreVertical, Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  onCommentLike: (commentId: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentEdit: (commentId: string, content: string) => Promise<void>;
  postId: string;
  sessionUserId: string;
  userRole?: "ADMIN" | "MODERATOR" | "USER";
}

export function CommentList({
  comments = [],
  newComment = "",
  onCommentChange,
  onComment,
  onCommentLike,
  onCommentDelete,
  onCommentEdit,
  postId,
  sessionUserId,
  userRole = "USER",
}: CommentListProps) {
  const { data: session } = useSession();
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isEditingComment, setIsEditingComment] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCommentDelete = async () => {
    if (!commentToDelete) return;

    try {
      const loadingToast = toast.loading("Excluindo comentário...");
      await onCommentDelete(commentToDelete);
      toast.dismiss(loadingToast);
      toast.success("Comentário excluído com sucesso!");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      toast.error("Erro ao excluir o comentário", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleCommentEdit = async (commentId: string) => {
    if (!editedCommentContent.trim()) {
      toast.error("O comentário não pode estar vazio");
      return;
    }

    try {
      const loadingToast = toast.loading("Editando comentário...");
      await onCommentEdit(commentId, editedCommentContent);
      toast.dismiss(loadingToast);
      toast.success("Comentário editado com sucesso!");
      setIsEditingComment(null);
      setEditedCommentContent("");
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      toast.error("Erro ao editar o comentário", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      await onCommentLike(commentId);
    } catch (error) {
      console.error("Erro ao curtir comentário:", error);
      toast.error("Erro ao curtir o comentário");
    }
  };

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
          comments.map((comment) => {
            if (!comment.user) return null;
            const canModerate =
              comment.user?.id === sessionUserId ||
              userRole === "ADMIN" ||
              userRole === "MODERATOR";

            return (
              <div
                key={comment.id}
                className="flex items-start space-x-2 group"
              >
                <Link href={`/profile/${comment.user?.slug || "#"}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user?.image || undefined} />
                    <AvatarFallback>
                      {(comment.user?.name?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-zinc-800/60 rounded-2xl px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.user?.slug || "#"}`}
                          className="font-semibold text-sm text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.user?.name || "Usuário"}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {canModerate && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={() => {
                                setIsEditingComment(comment.id);
                                setEditedCommentContent(comment.content);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCommentToDelete(comment.id);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                              {userRole !== "USER" &&
                                sessionUserId !== comment.user.id && (
                                  <span className="ml-1 text-xs opacity-75">
                                    ({userRole === "ADMIN" ? "Admin" : "Mod"})
                                  </span>
                                )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {isEditingComment === comment.id ? (
                      <div className="mt-2">
                        <Textarea
                          value={editedCommentContent}
                          onChange={(e) =>
                            setEditedCommentContent(e.target.value)
                          }
                          className="resize-none mb-2 border-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCommentEdit(comment.id)}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingComment(null);
                              setEditedCommentContent("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-4">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Heart
                        size={14}
                        className={cn(
                          "transition-colors",
                          comment.hasLiked ? "fill-red-500 text-red-500" : ""
                        )}
                      />
                      {comment.likesCount > 0 && (
                        <span>{comment.likesCount}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-2">
            Sem comentários ainda
          </p>
        )}
      </div>

      {/* Delete Comment Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir comentário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setCommentToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCommentDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
