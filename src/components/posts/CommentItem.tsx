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
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Session } from "next-auth";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  hasLiked: boolean;
  author: {
    id: string;
    name: string;
    image: string | null;
    slug: string;
    role: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  session: Session | null;
  onCommentLike: (commentId: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentEdit: (commentId: string, content: string) => Promise<void>;
}

export function CommentItem({
  comment,
  session,
  onCommentLike,
  onCommentDelete,
  onCommentEdit,
}: CommentItemProps) {
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onCommentEdit(comment.id, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const canModerate =
    session?.user?.id === comment.author.id ||
    session?.user?.role === "MODERATOR" ||
    session?.user?.role === "ADMIN";

  return (
    <div className="flex gap-4 p-4 border-b">
      <Avatar>
        <AvatarImage src={comment.author.image || undefined} />
        <AvatarFallback>
          {comment.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{comment.author.name}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>

          {canModerate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCommentDelete(comment.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Salvar</Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm">{comment.content}</p>
        )}

        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 text-muted-foreground hover:text-red-500",
              comment.hasLiked && "text-red-500"
            )}
            onClick={() => onCommentLike(comment.id)}
          >
            <Heart className="h-4 w-4" />
            <span>{comment.likesCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
