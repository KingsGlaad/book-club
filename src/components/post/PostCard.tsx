import { forwardRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onLikeComment?: (commentId: string) => void;
  onBookmark: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  newComment: string;
  onCommentChange: (value: string) => void;
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  (
    { post, onLike, onBookmark, onComment, newComment, onCommentChange },
    ref
  ) => {
    const [showComments, setShowComments] = useState(false);

    console.log("Like", post.comments);

    return (
      <div
        ref={ref}
        className="rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800 mx-auto mb-6 max-w-xl w-full"
      >
        {/* Post header */}
        <div className="p-4 flex items-center space-x-3">
          <Link href={`/profile/${post.author.slug}`}>
            <Avatar>
              <AvatarImage
                src={post.author.image || ""}
                alt={post.author.name || ""}
              />
              <AvatarFallback>
                {post.author.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${post.author.slug}`}
              className="hover:underline"
            >
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {post.author.name}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                locale: ptBR,
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Post content */}
        <div className="px-4 pb-2">
          <Link href={`/posts/${post.id}`}>
            <h2 className="text-xl font-semibold mb-2 hover:text-gray-600 dark:hover:text-gray-400">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {post.content}
          </p>

          {/* Post image */}
          {post.imageUrl && (
            <div className="mb-4">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={500} // Reduzido para um tamanho fixo
                height={300} // Ajuste proporcional
                className="w-full h-auto rounded-md"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Post stats */}
        <div className="px-4 py-2 flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Heart
                size={18}
                className={cn(
                  "transition-colors",
                  post.hasLiked ? "fill-red-500 text-red-500" : ""
                )}
              />
              <span>{Number(post.likes) || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MessageCircle size={18} />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
          <button
            onClick={() => onBookmark(post.id)}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Bookmark
              size={18}
              className={cn(
                "transition-colors",
                post.hasBookMarked ? "fill-yellow-500 text-yellow-500" : ""
              )}
            />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="px-4 pt-2 pb-4 border-t border-gray-100 dark:border-gray-800">
            {/* Comment form */}
            <div className="mb-4 flex items-start space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={post.author.image || ""}
                  alt={post.author.name || ""}
                />
                <AvatarFallback>
                  {post.author.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  className="resize-none mb-2"
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={() => onComment(post.id, newComment)}
                  disabled={!newComment.trim()}
                >
                  Comentar
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={comment.author.image || ""}
                        alt={comment.author.name || ""}
                      />
                      <AvatarFallback>
                        {comment.author.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          href={`/profile/${comment.author.slug}`}
                          className="font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between space-x-2 ">
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-2">
                  Sem comentários ainda
                </p>
              )}

              {post.comments && post.comments.length < post.commentsCount && (
                <Link
                  href={`/posts/${post.id}`}
                  className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todos os {post.commentsCount} comentários
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
