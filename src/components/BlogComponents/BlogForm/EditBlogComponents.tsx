// src/components/BlogComponents/BlogForm/EditBlogComponents.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPost } from "@/services/post.service";
import type { Post } from "@/types/post";
import { BlogFormLayout } from "./index";
import { LIST_URL, useBlogForm } from "./useBlogForm";

// Yazı yüklendikten sonra kurulur; hook başlangıç değerlerini yazıdan alır
function EditBlogForm({ post }: { post: Post }) {
  const form = useBlogForm({ post });
  return <BlogFormLayout form={form} />;
}

export default function EditBlogComponents() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then((p) => {
        if (!p) setError("Yazı bulunamadı.");
        setPost(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Yazı yüklenemedi"))
      .finally(() => setLoading(false));
  }, [id]);

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
        <p className="text-sm text-muted-foreground">{error || "Yazı bulunamadı."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(LIST_URL)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  // key: başka bir yazıya geçilince form sıfırdan kurulsun
  return <EditBlogForm key={post.id} post={post} />;
}