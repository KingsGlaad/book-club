import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import EditForm from "./components/EditForm";
interface EditProfileProps {
  id: string;
  name: string;
  role: string;
  slug: string;
  bio: string;
  image: string;
}

export default async function EditProfile() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Usuário não autenticado" },
      { status: 401 }
    );
  }

  const id = session.user.id;
  const user = await db.user.findUnique({
    where: { id },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const sanitizedUser: EditProfileProps = {
    id: user.id,
    name: user.name || "",
    role: user.role,
    slug: user.slug,
    bio: user.bio || "",
    image: user.image || "",
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>
      <EditForm user={sanitizedUser} />
    </div>
  );
}
