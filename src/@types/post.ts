// types/post.ts
import { z } from "zod";

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image: string;
    slug?: string; // Tornando opcional
  };
  createdAt: string;
  comments: Comment[];
  likes: number;
  hasLiked: boolean;
  bookmarked: boolean;
}

// Schema para validação do formulário (client-side)
export const postFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  type: z.enum(["regular", "study"], {
    required_error: "Selecione o tipo do post",
  }),
  image: z.instanceof(File).optional(),
  published: z.boolean().default(true),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

// Schema para validação da API (server-side)
export const postApiSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  type: z.enum(["regular", "study"]),
  imageUrl: z.string().url().optional().nullable(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

export type CreatePostPayload = z.infer<typeof postApiSchema>;
