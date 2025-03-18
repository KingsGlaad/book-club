// hooks/useDataValidation.ts
import { useEffect } from "react";
import { Post } from "@/@types/post";

export function usePostDataValidation(posts: Post[]) {
  useEffect(() => {
    // Validação de dados
    const invalidPosts = posts.filter((post) => {
      const hasBasicFields = post.id && post.title && post.content;
      const hasAuthor = post.author && post.author.name && post.author.image;

      return !hasBasicFields || !hasAuthor;
    });

    if (invalidPosts.length > 0) {
      console.warn("Dados de posts inválidos detectados:", invalidPosts);
    }

    // Validação de slug
    const missingSlug = posts.filter((post) => !post.author?.slug);
    if (missingSlug.length > 0) {
      console.warn(
        "Posts sem slug de autor detectados:",
        missingSlug.map((p) => ({ id: p.id, author: p.author?.name }))
      );
    }
  }, [posts]);
}
