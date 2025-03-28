import { prisma } from "@/lib/prisma";

interface UpdateProfileParams {
  userId: string;
  name: string;
  bio: string | null;
  image: string | null;
  coverImage?: string | null;
  birthDate?: Date | null;
}

export async function updateProfile({
  userId,
  name,
  bio,
  image,
  coverImage,
  birthDate,
}: UpdateProfileParams) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      bio,
      image,
      coverImage,
      birthDate,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  return updatedUser;
}
