"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment } from "@/@types/post";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

const commentSchema = z.object({
  comment: z.string().min(1, "Comentário é obrigatório"),
});

type CommentSchema = z.infer<typeof commentSchema>;

export default function CommentSection({
  comments,
  postId,
}: CommentSectionProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [visibleCount, setVisibleCount] = useState(5); // Exibir 5 comentários inicialmente
  const { register, handleSubmit, reset, watch } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  });

  const commentValue = watch("comment") ?? ""; // Verifica o valor do input para habilitar o botão

  const handleSubmitComment = async (data: CommentSchema) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar comentário");
      }

      const newComment = await response.json();
      setLocalComments([newComment, ...localComments]); // Adiciona novo comentário no topo
      reset(); // Limpa o input
      toast.success("Comentário enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast.error("Erro ao enviar comentário.");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">
        Comentários ({localComments.length})
      </h3>

      <div className="space-y-3 mt-2">
        {localComments.length > 0 ? (
          localComments
            .slice(0, visibleCount)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
        ) : (
          <p className="text-sm text-gray-500">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}

        {visibleCount < localComments.length && (
          <div className="flex justify-center mt-2">
            <Button
              variant="outline"
              onClick={() => setVisibleCount(visibleCount + 5)}
            >
              Carregar mais
            </Button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleSubmitComment)}
          className="mt-3 space-y-2"
        >
          <Input placeholder="Adicionar comentário" {...register("comment")} />
          <div className="flex justify-end">
            <Button type="submit" disabled={!commentValue.trim()}>
              Comentar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-100 hover:text-black transition-colors duration-200">
      <Avatar>
        <AvatarImage
          src={comment.author.image}
          alt={`Foto de ${comment.author.name}`}
        />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{comment.author.name}</p>
        <p className="text-xs text-gray-500">
          {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-gray-500 text-sm mt-1">{comment.content}</p>
      </div>
    </div>
  );
}
