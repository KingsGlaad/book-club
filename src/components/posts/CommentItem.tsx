"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useState } from "react";
import { likeComment, deleteComment, editComment } from "@/app/actions/comment";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  hasLiked: boolean;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  sessionUserId: string;
  userRole?: "ADMIN" | "MODERATOR" | "USER";
}

export function CommentItem({
  comment,
  sessionUserId,
  userRole = "USER",
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(
    comment.likesCount
  );
  const [hasLiked, setHasLiked] = useState(comment.hasLiked);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Atualização otimista
    setHasLiked(!hasLiked);
    setCurrentLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      await likeComment(comment.id, sessionUserId);
      toast.success(hasLiked ? "Comentário descurtido" : "Comentário curtido");
    } catch (error) {
      // Reverter em caso de erro
      setHasLiked(!hasLiked);
      setCurrentLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
      console.error("Erro ao curtir comentário:", error);
      toast.error("Erro ao curtir o comentário");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Excluindo comentário...");
      await deleteComment(comment.id);
      setShowDeleteDialog(false);
      toast.dismiss();

      // Mensagem personalizada baseada no papel do usuário
      const actionDescription =
        sessionUserId === comment.author.id
          ? "Seu comentário foi removido permanentemente."
          : "O comentário foi removido permanentemente.";

      toast.success("Comentário excluído com sucesso!", {
        description: actionDescription,
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      toast.dismiss();
      toast.error("Erro ao excluir o comentário", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) {
      toast.error("O comentário não pode estar vazio");
      return;
    }

    try {
      await editComment(comment.id, editedContent);
      setIsEditing(false);

      // Mensagem personalizada baseada no papel do usuário
      const actionDescription =
        sessionUserId === comment.author.id
          ? "Seu comentário foi atualizado."
          : "O comentário foi atualizado.";

      toast.success("Comentário editado com sucesso", {
        description: actionDescription,
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      toast.error("Erro ao editar o comentário", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const canModerate =
    sessionUserId === comment.author.id || // Autor do comentário
    userRole === "ADMIN" || // Admin
    userRole === "MODERATOR"; // Moderador

  return (
    <>
      <div className="flex items-start space-x-2 group">
        <Link href={`/profile/${comment.author.slug}`}>
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.image || undefined} />
            <AvatarFallback>{comment.author.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-zinc-800/60 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${comment.author.slug}`}
                className="font-semibold text-sm text-gray-900 dark:text-white hover:underline"
              >
                {comment.author.name}
              </Link>
            </div>

            {isEditing ? (
              <div className="mt-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="resize-none mb-2 bg-white dark:bg-gray-800 text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(comment.content);
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

          <div className="flex items-center gap-4 mt-1 px-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                isLiking && "opacity-50 cursor-not-allowed"
              )}
            >
              {hasLiked ? "Descurtir" : "Curtir"}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            {currentLikesCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Heart size={12} className={cn("fill-red-500 text-red-500")} />
                <span>{currentLikesCount}</span>
              </div>
            )}
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
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                    {userRole !== "USER" &&
                      sessionUserId !== comment.author.id && (
                        <span className="ml-1 text-xs opacity-75">
                          ({userRole === "ADMIN" ? "Admin" : "Mod"})
                        </span>
                      )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir comentário</DialogTitle>
            <DialogDescription>
              {sessionUserId === comment.author.id
                ? "Tem certeza que deseja excluir seu comentário? Esta ação não pode ser desfeita."
                : `Tem certeza que deseja excluir este comentário como ${
                    userRole === "ADMIN" ? "administrador" : "moderador"
                  }? Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
