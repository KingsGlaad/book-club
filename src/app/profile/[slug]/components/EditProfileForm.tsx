import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/app/actions/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  bio: z.string().optional(),
  image: z
    .string()
    .url({ message: "URL inválida" })
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .url({ message: "URL inválida" })
    .optional()
    .or(z.literal("")),
  birthDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    image: string | null;
    coverImage: string | null;
    birthDate: Date | null;
  };
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      image: user.image || "",
      coverImage: user.coverImage || "",
      birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
    },
  });

  async function onSubmit(values: FormData) {
    try {
      const promise = updateProfile({
        userId: user.id,
        name: values.name,
        bio: values.bio || null,
        image: values.image || null,
        coverImage: values.coverImage || null,
        birthDate: values.birthDate || null,
      });

      toast.promise(promise, {
        loading: "Atualizando perfil...",
        success: "Perfil atualizado com sucesso!",
        error: "Erro ao atualizar perfil",
      });

      await promise;
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative w-full h-48 rounded-lg bg-gray-100 mb-6">
          {form.watch("coverImage") ? (
            <Image
              src={form.watch("coverImage") || "/cover-image.jpg"}
              alt="Capa do perfil"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/capa.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Nascimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte um pouco sobre você"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem de Perfil</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </Form>
  );
}
