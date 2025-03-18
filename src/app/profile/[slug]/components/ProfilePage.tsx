"use client";

import React from "react";
import { User, Post, Discussion } from "@prisma/client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/post/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ErrorMessage from "@/components/ui/ErrorMessage";
// Tipagem para as props recebidas
type ProfilePageProps = {
  userData: User;
  userPosts: Post[];
  userDiscussions: Discussion[];
};

const ProfilePage: React.FC<ProfilePageProps> = ({
  userData,
  userPosts,
  userDiscussions,
}) => {
  const {
    loading,
    error,
    hasMore,
    newComments,
    handleLike,
    handleBookmark,
    handleComment,
    setNewComments,
    loadMorePosts,
  } = usePosts(userData.id);

  const enrichedUserPosts = userPosts.map((post) => ({
    ...post,
    author: {
      name: userData.name,
      slug: userData.slug,
      image: userData.image || "/placeholder-avatar.png",
    },
  }));

  const lastPostRef = useInfiniteScroll(loading, hasMore, loadMorePosts);
  if (error) {
    return (
      <ErrorMessage message="Não foi possível carregar os posts. Por favor, tente novamente mais tarde." />
    );
  }
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Cabeçalho do perfil */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userData.image || "/default-avatar.png"} />
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{userData.name}</h1>
          <p className="text-gray-500">@{userData.slug}</p>
          <p className="text-gray-700 mt-2">{userData.bio || "Sem bio."}</p>
        </div>
      </div>

      {/* Seções de Postagens e Discussões */}
      <div className="space-y-8">
        {/* Postagens do usuário */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Postagens</h2>
          <div className="space-y-4">
            {enrichedUserPosts.length > 0 ? (
              enrichedUserPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  ref={index === userPosts.length - 1 ? lastPostRef : null}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onComment={handleComment}
                  newComment={newComments[post.id] || ""}
                  onCommentChange={(value) =>
                    setNewComments({
                      ...newComments,
                      [post.id]: value,
                    })
                  }
                />
              ))
            ) : (
              <p>Sem postagens ainda.</p>
            )}
          </div>
        </section>

        {/* Discussões do usuário */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Discussões</h2>
          <div className="space-y-4">
            {userDiscussions.length > 0 ? (
              userDiscussions.map((discussion) => (
                <Card
                  key={discussion.id}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <CardHeader>
                    <CardTitle>{discussion.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{discussion.content}</p>
                    <Button variant="ghost" className="hover:bg-none">
                      Participar
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Sem discussões ainda.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
