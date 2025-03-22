"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { ROLE_TYPE_OPTIONS } from "@/app/_constants/profile";

interface EditFormProps {
  user: {
    id: string;
    name: string;
    role: string;
    slug: string;
    bio: string;
    image: string;
  };
}
const profileSchema = z.object({
  name: z.string().min(3, "Mínimo de 3 caracteres"),
  slug: z.string().min(3, "Mínimo de 3 caracteres"),
  bio: z.string().max(160, "Máximo de 160 caracteres").optional(),
  role: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export default function EditProfile({ user }: EditFormProps) {
  const [preview, setPreview] = useState<string | null>(user.image || null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      slug: user.slug,
      bio: user.bio,
      role: user.role,
    },
  });

  // Atualizar preview da imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl); // Atualiza a pré-visualização
      setValue("image", file); // Atualiza o estado do formulário
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("book-pics/avatars")
      .upload(fileName, file);
    if (error) {
      toast.error("Erro ao enviar imagem");
      return;
    }
    return data.path;
  };

  const onSubmit = async (data: ProfileSchema) => {
    try {
      let imageUrl = null;

      // Upload da imagem para o Supabase Storage se existir
      if (data.image) {
        // Gere um nome de arquivo único baseado no timestamp e nome original
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}-${data.image.name.replace(/\s+/g, "-")}`;

        const { data: uploadData, error } = await supabase.storage
          .from("book-pics/avatars") // Nome do seu bucket
          .upload(fileName, data.image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw new Error(`Erro no upload da imagem: ${error.message}`);
        }

        // Obtenha a URL pública da imagem
        const { data: urlData } = supabase.storage
          .from("book-pics/avatars")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Crie o objeto de post para enviar à API
      const postData = {
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        role: data.role,
        updatedAt: new Date().toISOString(),
        ...(imageUrl && { imageUrl }),
      };

      // Faça a requisição para sua API
      const response = await fetch("/api/users/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao editar perfil.");
      }

      toast.success("Usuário atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao editar perfil.");
      console.error(error);
    }
  };

  console.log(user.role);

  // Função para obter a label formatada
  const getRoleLabel = (role: string): string => {
    const foundRole = ROLE_TYPE_OPTIONS.find((option) => option.value === role);
    return foundRole ? foundRole.label : "Desconhecido"; // Retorna "Desconhecido" caso o papel não seja encontrado
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4 group w-fit">
          <Avatar className="w-24 h-24">
            <AvatarImage src={preview || user.image} alt="Avatar" />
            <AvatarFallback>{user.name.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image"
            {...register("image")}
            onChange={handleImageChange}
          />
          <label
            htmlFor="image"
            className="cursor-pointer bg-white rounded-full p-2 absolute ml-6 mt-1  invisible group-hover:visible"
          >
            <PenLine size={30} fill="black" className="text-black" />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Nome */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium">Nome:</label>
            <Input
              placeholder="Nome de usuário"
              {...register("name")}
              defaultValue={user.name}
              aria-label="Nome de usuário"
              onChange={(e) => setValue("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          {/* Slug */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium">Usuário:</label>
            <Input
              placeholder="Usuário"
              {...register("slug")}
              defaultValue={user.slug}
              aria-label="Usuário"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm">{errors.slug.message}</p>
            )}
          </div>
          {/* Role */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium">Função:</label>
            <Select disabled={user.role != "ADMIN"}>
              <SelectTrigger>
                <SelectValue placeholder={getRoleLabel(user.role)} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROLE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.slug && (
              <p className="text-red-500 text-sm">{errors.slug.message}</p>
            )}
          </div>
          {/* Biografia */}
          <div className="flex flex-col gap-2 col-span-3">
            <label className="text-sm font-medium">Biografia:</label>
            <Textarea
              placeholder="Biografia"
              {...register("bio")}
              defaultValue={user.bio}
              aria-label="Biografia"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full">
          Salvar alterações
        </Button>
      </form>
    </>
  );
}
