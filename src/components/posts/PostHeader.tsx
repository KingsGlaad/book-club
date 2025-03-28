"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostHeaderProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string;
  };
  createdAt: Date;
}

export function PostHeader({ author, createdAt }: PostHeaderProps) {
  return (
    <div className="p-4 flex items-center space-x-3">
      <Link href={`/profile/${author.slug}`}>
        <Avatar>
          <AvatarImage src={author.image || ""} alt={author.name || ""} />
          <AvatarFallback>
            {author.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${author.slug}`} className="hover:underline">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {author.name}
          </p>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(createdAt), {
            locale: ptBR,
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}
