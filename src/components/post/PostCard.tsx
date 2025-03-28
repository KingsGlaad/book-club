"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Post } from "@/hooks/usePosts";
import { PostHeader } from "@/components/posts/PostHeader";
import { PostActions } from "@/components/posts/PostActions";
import { CommentList } from "@/components/posts/CommentList";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onBookmark: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onCommentLike: (commentId: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentEdit: (commentId: string, content: string) => Promise<void>;
  newComment: string;
  onCommentChange: (value: string) => void;
  sessionUserId: string;
  userRole?: "ADMIN" | "MODERATOR" | "USER";
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(
  (
    {
      post,
      onLike,
      onBookmark,
      onComment,
      onCommentLike,
      onCommentDelete,
      onCommentEdit,
      newComment,
      onCommentChange,
      sessionUserId,
      userRole = "USER",
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Função para truncar HTML mantendo as tags
    const truncateHTML = (html: string, maxLength: number) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      let textContent = "";
      let truncated = "";
      let isTruncated = false;

      // Função recursiva para processar os nós
      function processNode(node: Node) {
        if (textContent.length >= maxLength) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const remainingLength = maxLength - textContent.length;
          const text = node.textContent || "";

          if (textContent.length + text.length > maxLength) {
            const truncatedText = text.slice(0, remainingLength) + "...";
            textContent += truncatedText;
            truncated += truncatedText;
            isTruncated = true;
          } else {
            textContent += text;
            truncated += text;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          truncated += `<${element.tagName.toLowerCase()}`;

          // Adiciona os atributos
          Array.from(element.attributes).forEach((attr) => {
            truncated += ` ${attr.name}="${attr.value}"`;
          });

          truncated += ">";

          // Processa os filhos
          Array.from(node.childNodes).forEach((child) => {
            processNode(child);
          });

          truncated += `</${element.tagName.toLowerCase()}>`;
        }
      }

      Array.from(div.childNodes).forEach((node) => {
        processNode(node);
      });

      return {
        truncatedHTML: truncated,
        isTruncated,
      };
    };

    const { truncatedHTML, isTruncated } = truncateHTML(post.content, 250);

    return (
      <div
        ref={ref}
        className="rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-zinc-800 mx-auto mb-6 max-w-xl w-full"
      >
        {/* Post header */}
        <PostHeader author={post.author} createdAt={post.createdAt} />

        {/* Post content */}
        <div className="px-4 pb-4">
          <Link href={`/posts/${post.id}`}>
            <h2 className="text-xl font-semibold mb-4 hover:text-gray-600 dark:hover:text-gray-400">
              {post.title}
            </h2>
          </Link>

          {/* Post image */}
          {post.imageUrl && (
            <div className="mb-6">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={500}
                height={300}
                className="w-full h-auto rounded-lg object-cover max-h-[300px]"
              />
            </div>
          )}

          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none dark:prose-invert mb-4
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-em:text-gray-700 dark:prose-em:text-gray-300
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600
              prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50
              prose-blockquote:py-2 prose-blockquote:rounded-r
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
              prose-li:my-2
              prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
              dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300
              prose-quoteless:text-gray-700 dark:prose-quoteless:text-gray-300
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{
              __html: isExpanded ? post.content : truncatedHTML,
            }}
          />
          {isTruncated && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
            >
              {isExpanded ? (
                <>
                  Mostrar menos <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Ler mais <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
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

        {/* Post actions */}
        <PostActions
          likes={post.likes}
          commentsCount={post.comments?.length || 0}
          hasLiked={post.hasLiked}
          hasBookMarked={post.hasBookMarked}
          onToggleComments={() => setShowComments(!showComments)}
          onLike={() => onLike(post.id)}
          onBookmark={() => onBookmark(post.id)}
        />

        {/* Comments section */}
        {showComments && (
          <CommentList
            comments={post.comments}
            newComment={newComment}
            onCommentChange={onCommentChange}
            onComment={onComment}
            onCommentLike={onCommentLike}
            onCommentDelete={onCommentDelete}
            onCommentEdit={onCommentEdit}
            postId={post.id}
            sessionUserId={sessionUserId}
            userRole={userRole}
          />
        )}
      </div>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
