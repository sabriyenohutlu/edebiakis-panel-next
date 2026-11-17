// src/components/PoetryComponents/PoetryForm/EditPoetryComponents.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPost } from "@/services/post.service";
import type { Post } from "@/types/post";
import { PoetryFormLayout } from "./index";
import { POETRY_ROUTES, usePoetryForm } from "./usePoetryForm";

function EditForm({ post }: { post: Post }) {
  const form = usePoetryForm({ post });
  return <PoetryFormLayout form={form} />;
}

export default function EditPoetryComponents() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then((p) => (p && p.post_type === "poetry" ? setPost(p) : setError("Şiir bulunamadı.")))
      .catch((err) => setError(err instanceof Error ? err.message : "Şiir yüklenemedi"))
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
        <p className="text-sm text-muted-foreground">{error || "Şiir bulunamadı."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(POETRY_ROUTES.list)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  return <EditForm key={post.id} post={post} />;
}