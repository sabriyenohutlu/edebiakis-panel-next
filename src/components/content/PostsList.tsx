// src/components/content/PostsList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribePosts } from "@/services/post.service";
import type { Post } from "@/types/post";
import type { PostType } from "@/types/category";

// Bir içerik türünün yazılarını canlı dinler
export function usePostsList(postType: PostType) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => subscribePosts(postType, setPosts, (e) => setError(e.message)), [postType]);
  return { posts: posts ?? [], loading: posts === null && !error, error };
}

export function PostStats({ posts, loading, totalLabel }: { posts: Post[]; loading: boolean; totalLabel: string }) {
  const stats = useMemo(() => {
    const count = (s: Post["status"]) => posts.filter((p) => p.status === s).length;
    const published = count("published");
    return [
      { label: totalLabel, value: posts.length, sub: `${posts.filter((p) => p.isFeatured).length} öne çıkan` },
      { label: "Yayında", value: published, sub: posts.length ? `%${Math.round((published / posts.length) * 100)} yayın oranı` : "—" },
      { label: "Onay Bekleyen", value: count("pending"), sub: "Yayınlanmayı bekliyor" },
      { label: "Taslak", value: count("draft"), sub: "Henüz tamamlanmadı" },
    ];
  }, [posts, totalLabel]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-muted/50 rounded-lg p-3.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">{s.label}</p>
          <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{loading ? "Yükleniyor..." : s.sub}</p>
        </div>
      ))}
    </div>
  );
}