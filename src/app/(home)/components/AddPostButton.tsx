"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import AddPostDialog from "./AddPostDialog"; // Modal separado
import { useRouter } from "next/navigation";

export default function AddPostButton() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handlePostCreated = () => {
    // Atualiza a página sem dar refresh
    router.refresh();
  };

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-md"
              onClick={() => setOpenDialog(!openDialog)}
            >
              <FileText size={18} /> Criar Postagem
            </Button>
            {/* <Button
              variant="outline"
              className="flex items-center gap-2  shadow-md"
              onClick={() => alert("Iniciar Discussão")}
            >
              <MessageCircle size={18} /> Iniciar Discussão
            </Button>*/}
          </div>
        )}
        <Button
          className="rounded-full p-4 shadow-lg hover:bg-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Modal de criação de post */}
      <AddPostDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
