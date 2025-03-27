import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    image: string | null;
    slug: string;
  };
  createdAt: string;
}

export function PostHeader({ author, createdAt }: PostHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href={`/profile/${author.slug}`}>
        <Avatar>
          <AvatarImage src={author.image || undefined} />
          <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>

      <div>
        <Link
          href={`/profile/${author.slug}`}
          className="font-semibold hover:underline"
        >
          {author.name}
        </Link>
        <span className="text-sm text-muted-foreground ml-2">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      </div>
    </div>
  );
}
