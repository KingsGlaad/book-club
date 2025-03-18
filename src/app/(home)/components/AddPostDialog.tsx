"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Configure o cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const postSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  type: z.enum(["regular", "study"], {
    required_error: "Selecione o tipo do post",
  }),
  image: z.instanceof(File).optional(),
  published: z.boolean().default(true),
});

type PostSchema = z.infer<typeof postSchema>;

interface AddPostDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddPostDialog({ open, setOpen }: AddPostDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: "regular",
      published: true,
    },
  });

  const imageFile = watch("image");

  // Atualizar preview da imagem
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Lidar com a alteração do tipo de post
  const handleTypeChange = (value: "regular" | "study") => {
    setValue("type", value);
  };

  const onSubmit = async (data: PostSchema) => {
    try {
      setIsSubmitting(true);
      let imageUrl = null;

      // Upload da imagem para o Supabase Storage se existir
      if (data.image) {
        // Gere um nome de arquivo único baseado no timestamp e nome original
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}-${data.image.name.replace(/\s+/g, "-")}`;

        const { data: uploadData, error } = await supabase.storage
          .from("book-pics/posts-pics") // Nome do seu bucket
          .upload(fileName, data.image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw new Error(`Erro no upload da imagem: ${error.message}`);
        }

        // Obtenha a URL pública da imagem
        const { data: urlData } = supabase.storage
          .from("book-pics/posts-pics")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Crie o objeto de post para enviar à API
      const postData = {
        title: data.title,
        content: data.content,
        type: data.type,
        published: data.published,
        ...(imageUrl && { imageUrl }),
      };

      // Faça a requisição para sua API
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar post");
      }

      toast.success("Post criado com sucesso!");
      setOpen(false);
      reset();
      setPreview(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar post.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isSubmitting) setOpen(isOpen);
      }}
    >
      {/* Adicionando classes para tornar o diálogo scrollable */}
      <DialogContent className="p-6 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-xl font-bold pt-2 pb-4 z-10">
          Criar Novo Post
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <Input
            placeholder="Título"
            {...register("title")}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}

          {/* Tipo de Post */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Post</label>
            <Select
              onValueChange={handleTypeChange}
              defaultValue="regular"
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="study">Estudo</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Conteúdo</label>
            <Textarea
              placeholder="Escreva algo..."
              {...register("content")}
              className="min-h-[150px]"
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Imagem de capa (opcional)</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
            {preview && (
              <div className="relative w-full h-40 mt-2">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Botão fixo na parte inferior */}
          <Button
            type="submit"
            className="w-full rounded-full hover:bg-gray-500 text-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
