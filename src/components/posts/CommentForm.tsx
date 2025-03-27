"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CommentFormProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  newComment: string;
  setNewComment: (value: string) => void;
  onSubmit: (content: string) => Promise<void>;
}

export function CommentForm({
  author,
  newComment,
  setNewComment,
  onSubmit,
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={author.image || undefined} />
        <AvatarFallback>
          {author.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <Textarea
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
