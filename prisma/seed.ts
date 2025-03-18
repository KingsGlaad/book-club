import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando Seed...");

  // Criando usuários
  const user1 = await prisma.user.upsert({
    where: { email: "usuario1@email.com" },
    update: {},
    create: {
      name: "João Silva",
      email: "usuario1@email.com",
      image: "https://i.pravatar.cc/150?img=1",
      slug: "joao-silva",
      bio: "Amante de livros e discussões filosóficas.",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "usuario2@email.com" },
    update: {},
    create: {
      name: "Maria Oliveira",
      email: "usuario2@email.com",
      image: "https://i.pravatar.cc/150?img=2",
      slug: "maria-oliveira",
      bio: "Apaixonada por literatura clássica e teologia.",
    },
  });

  console.log("✅ Usuários criados!");

  // Criando postagens
  await prisma.post.createMany({
    data: [
      {
        title: "A importância da leitura diária",
        content:
          "Ler todos os dias pode transformar nossa maneira de pensar...",
        type: "study",
        published: true,
        authorId: user1.id,
      },
      {
        title: "Os melhores livros de 2024",
        content:
          "Confira a lista de livros que mais impactaram leitores este ano...",
        type: "regular",
        published: true,
        authorId: user2.id,
      },
      {
        title: "Estudo sobre 'O Pequeno Príncipe'",
        content:
          "Vamos analisar os simbolismos e mensagens por trás deste clássico...",
        type: "study",
        published: true,
        authorId: user1.id,
      },
    ],
  });

  console.log("✅ Posts criados!");

  console.log("🌱 Seed concluída!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
