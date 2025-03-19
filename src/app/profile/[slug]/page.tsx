// app/profile/[slug]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProfilePage from "./components/ProfilePage";

export interface PostWithExtras {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  imageUrl?: string;
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    likes: number;
    author: {
      id: string;
      name: string;
      image: string;
      slug: string;
    };
  }[];
  author: {
    id: string;
    name: string;
    slug: string;
  };
  commentsCount: number;
  hasLiked: boolean;
  hasBookMarked: boolean;
  type: string;
  published: boolean;
  updatedAt: Date;
  likes: number;
  tags?: [];
}

// Page components in Next.js App Router receive props directly, not request/context
export default async function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  const user = await db.user.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          likes: true,
          bookmarks: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      discussions: true,
    },
  });

  if (!user) {
    notFound();
  }

  const enrichedPosts: PostWithExtras[] = user.posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl ?? "",
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name ?? "",
      slug: post.author.slug ?? "",
    },
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: 0,
      author: {
        id: comment.author.id,
        name: comment.author.name ?? "",
        image: comment.author.image ?? "",
        slug: comment.author.name ?? "",
      },
    })),
    commentsCount: post.comments.length ?? 0,
    likes: post.likes.length ?? 0,
    hasLiked: post.likes.length > 0,
    hasBookMarked: post.bookmarks.length > 0,
    type: post.type,
    published: post.published,
    updatedAt: post.updatedAt,
    tags: [],
  }));

  console.log("Enriched Posts page:", enrichedPosts);

  return (
    <ProfilePage
      userData={user}
      userPosts={enrichedPosts}
      userDiscussions={user.discussions}
    />
  );
}
