/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Minus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";

// Configure o cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const postSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z
    .string()
    .min(10, "O conteúdo deve ter pelo menos 10 caracteres")
    .refine((content) => {
      if (typeof window === "undefined") return true;
      const div = document.createElement("div");
      div.innerHTML = content;
      const text = div.textContent || "";
      return text.trim().length >= 10;
    }, "O conteúdo deve ter pelo menos 10 caracteres"),
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
  onPostCreated?: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl === null) {
      return;
    }

    // Se não houver texto selecionado, não faz nada
    if (editor.state.selection.empty) {
      return;
    }

    // Se já for um link, remove o link
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Adiciona o link
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setShowLinkDialog(false);
    setLinkUrl("");
  };

  return (
    <>
      <div className="border-b p-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("bold") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("italic") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("bulletList") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("orderedList") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("blockquote") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setShowLinkDialog(true);
          }}
          className={`hover:bg-gray-100 transition-colors ${
            editor.isActive("link") ? "bg-gray-100 text-blue-600" : ""
          }`}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setHorizontalRule().run();
          }}
          className="hover:bg-gray-100 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().undo()}
          className="hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().redo()}
          className="hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Cole a URL do link"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setLink();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={setLink}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function AddPostDialog({
  open,
  setOpen,
  onPostCreated,
}: AddPostDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-2",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "my-2",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic bg-gray-50 dark:bg-gray-800/50 py-2 rounded-r",
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-bold text-gray-900 dark:text-white",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-4 border-t border-gray-300 dark:border-gray-600",
          },
        },
      }),
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-500 hover:underline",
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      },
    },
    immediatelyRender: false,
  });

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
      content: "",
    },
  });

  // Atualiza o valor do campo content quando o editor muda
  useEffect(() => {
    if (editor) {
      const updateContent = () => {
        setValue("content", editor.getHTML());
      };

      editor.on("update", updateContent);
      return () => {
        editor.off("update", updateContent);
      };
    }
  }, [editor, setValue]);

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

      // Verifica se o conteúdo do editor está vazio
      const editorContent = editor?.getHTML() || "";
      if (!editorContent.trim()) {
        toast.error("O conteúdo não pode estar vazio");
        return;
      }

      // Upload da imagem para o Supabase Storage se existir
      if (data.image) {
        const timestamp = new Date().getTime();
        const fileName = `${timestamp}-${data.image.name.replace(/\s+/g, "-")}`;

        const { data: uploadData, error } = await supabase.storage
          .from("book-pics/posts-pics")
          .upload(fileName, data.image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw new Error(`Erro no upload da imagem: ${error.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("book-pics/posts-pics")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Crie o objeto de post para enviar à API
      const postData = {
        title: data.title,
        content: editorContent,
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
      editor?.commands.setContent("");

      // Chama o callback se existir
      if (onPostCreated) {
        onPostCreated();
      }
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

          {/* Editor TipTap */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Conteúdo</label>
            <div className="border rounded-md">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
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
