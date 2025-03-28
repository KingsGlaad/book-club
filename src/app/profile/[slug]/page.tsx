// app/profile/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfilePage } from "./components/ProfilePage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { slug: (await params).slug },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      coverImage: true,
      birthDate: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user || !user.name) {
    notFound();
  }

  const savedPosts = await prisma.post.findMany({
    where: {
      Bookmark: {
        some: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentComments = await prisma.comment.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <ProfilePage
      user={user}
      isOwner={session?.user.id === user.id}
      savedPosts={savedPosts}
      recentComments={recentComments}
    />
  );
}
