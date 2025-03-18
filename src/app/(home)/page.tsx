import PostsComponent from "./components/Posts";
import AddPostButton from "./components/AddPostButton"; // Botão separado
import { db } from "@/lib/prisma";

export default async function Home() {
  try {
    // Buscar posts do banco de dados
    const allPosts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true, // Adicionando id do autor
            name: true,
            image: true,
            slug: true,
          },
        },
        _count: {
          // Adicionando contagem de curtidas
          select: {
            likes: true,
            comments: true,
          },
        },
        comments: true, // Incluindo comentários
      },
    });

    // Processar os posts para incluir as propriedades necessárias
    const processedPosts = allPosts.map((post) => ({
      ...post,
      likes: post._count?.likes || 0, // Definindo o número de curtidas
      hasLiked: false, // Isso será atualizado no cliente
      bookmarked: false, // Isso será atualizado no cliente
      comments: post.comments || [], // Garantindo que comments existe
    }));

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Últimos Posts</h1>
        {/* @ts-expect-error Server Component */}
        <PostsComponent posts={processedPosts} />
        <AddPostButton />
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return <div>Erro ao buscar posts.</div>;
  }
}
