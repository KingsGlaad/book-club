"use client";
// ProfilePage.tsx
import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileForm } from "./EditProfileForm";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  coverImage: string | null;
  birthDate: Date | null;
  _count: {
    followers: number;
    following: number;
  };
}

interface Post {
  id: string;
  title: string;
  createdAt: Date;
  author: {
    name: string | null;
    image: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  post: {
    id: string;
    title: string;
  };
}

interface ProfilePageProps {
  user: User;
  isOwner: boolean;
  savedPosts: Post[];
  recentComments: Comment[];
}

export function ProfilePage({
  user,
  isOwner,
  savedPosts,
  recentComments,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna da esquerda - Informações do usuário */}
        <div className="md:col-span-1 h-screen overflow-y-auto sticky top-20">
          <Card className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={user.coverImage || "/cover-image.jpg"}
                alt="Capa do perfil"
                className="w-full h-full object-cover"
                fill
              />
            </div>
            <div className="p-6 -mt-16 relative">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                  {user.birthDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Nascimento:{" "}
                      {format(new Date(user.birthDate), "dd/MM/yyyy")}
                    </p>
                  )}
                </div>

                <div className="flex gap-8 text-center">
                  <div>
                    <p className="font-semibold">{user._count.followers}</p>
                    <p className="text-gray-600">Seguidores</p>
                  </div>
                  <div>
                    <p className="font-semibold">{user._count.following}</p>
                    <p className="text-gray-600">Seguindo</p>
                  </div>
                </div>

                {isOwner && (
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Editar perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full h-screen overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar perfil</DialogTitle>
                      </DialogHeader>
                      <EditProfileForm
                        user={user}
                        onSuccess={() => setIsEditing(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna da direita - Posts salvos e comentários recentes */}
        <div className="md:col-span-2 space-y-8">
          {/* Posts salvos */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Posts salvos</h2>
            {savedPosts.length > 0 ? (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={post.author.image || undefined} />
                        <AvatarFallback>
                          {post.author.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-semibold hover:underline"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                          por {post.author.name} •{" "}
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhum post salvo ainda.</p>
            )}
          </section>

          {/* Comentários recentes */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Comentários recentes</h2>
            {recentComments.length > 0 ? (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <Link
                      href={`/posts/${comment.post.id}`}
                      className="font-semibold hover:underline block mb-2"
                    >
                      Re: {comment.post.title}
                    </Link>
                    <p className="text-gray-800">{comment.content}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Nenhum comentário ainda.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
