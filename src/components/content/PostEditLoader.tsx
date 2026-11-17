// src/components/content/PostEditLoader.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPost } from "@/services/post.service";
import type { Post } from "@/types/post";
import type { PostType } from "@/types/category";

type Props = {
  postType: PostType;
  listUrl: string;
  notFoundText: string;
  children: (post: Post) => ReactNode;
};

// Düzenleme sayfası: yazıyı yükler, sonra formu kurar
export default function PostEditLoader({ postType, listUrl, notFoundText, children }: Props) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then((p) => (p && p.post_type === postType ? setPost(p) : setError(notFoundText)))
      .catch((err) => setError(err instanceof Error ? err.message : "Kayıt yüklenemedi"))
      .finally(() => setLoading(false));
  }, [id, postType, notFoundText]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-muted-foreground">{error || notFoundText}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(listUrl)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  return <>{children(post)}</>;
}