// app/profile/[slug]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProfilePage from "./components/ProfilePage";

export default async function Profile({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const user = await db.user.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      discussions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <ProfilePage
      userData={user}
      userPosts={user.posts}
      userDiscussions={user.discussions}
    />
  );
}
