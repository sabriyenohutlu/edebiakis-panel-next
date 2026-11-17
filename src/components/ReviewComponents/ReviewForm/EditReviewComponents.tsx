// src/components/ReviewComponents/ReviewForm/EditReviewComponents.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPost } from "@/services/post.service";
import type { Post } from "@/types/post";
import { ReviewFormLayout } from "./index";
import { useReviewForm } from "./useReviewForm";
import { BOOK_CONFIGS, type BookKind, type BookPostConfig } from "../bookPostConfig";

function EditForm({ post, config }: { post: Post; config: BookPostConfig }) {
  const form = useReviewForm({ post, config });
  return <ReviewFormLayout form={form} />;
}

export default function EditReviewComponents({ kind }: { kind: BookKind }) {
  const config = BOOK_CONFIGS[kind];
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPost(id)
      .then((p) => {
        // Kayıt bu türe ait değilse (ör. öneri sayfasında bir inceleme ID'si) gösterme
        if (!p || p.post_type !== "book" || (p.book_kind ?? "review") !== kind) {
          setError(`${config.singular} bulunamadı.`);
        } else {
          setPost(p);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Kayıt yüklenemedi"))
      .finally(() => setLoading(false));
  }, [id, kind, config.singular]);

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
        <p className="text-sm text-muted-foreground">{error || `${config.singular} bulunamadı.`}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(config.routes.list)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  return <EditForm key={post.id} post={post} config={config} />;
}