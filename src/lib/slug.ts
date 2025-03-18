/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/utils/slug.ts
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function generateUniqueSlug(
  prisma: any,
  name: string,
  userId?: string
): Promise<string> {
  const slug = generateSlug(name);
  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    // Verifica se o slug existe, excluindo o usuário atual (em caso de atualização)
    const existingUser = await prisma.user.findFirst({
      where: {
        slug: uniqueSlug,
        NOT: userId ? { id: userId } : undefined,
      },
    });

    if (!existingUser) break;

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}
