"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/app/actions/comment";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  author: {
    name: string;
    image: string | null;
  };
  postId: string;
  authorId: string;
}

export function CommentForm({ author, postId, authorId }: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(newComment, authorId, postId);
      setNewComment("");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={author.image || undefined} />
        <AvatarFallback>{author.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none mb-2"
          rows={2}
        />
        <Button
          size="sm"
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </form>
  );
}
