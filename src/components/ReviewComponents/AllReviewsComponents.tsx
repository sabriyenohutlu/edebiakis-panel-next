// src/components/ReviewComponents/AllReviewsComponents.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ReviewsTable from "./ReviewsTable";
import { subscribePosts } from "@/services/post.service";
import type { Post } from "@/types/post";
import { BOOK_CONFIGS, type BookKind } from "./bookPostConfig";

const AllReviewsComponents = ({ kind }: { kind: BookKind }) => {
  const config = BOOK_CONFIGS[kind];
  const [allBookPosts, setAllBookPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const loading = allBookPosts === null && !error;

  useEffect(() => subscribePosts("book", setAllBookPosts, (err) => setError(err.message)), []);

  // İncelemeler ve öneriler aynı koleksiyonda; türüne göre ayır
  const posts = useMemo(
    () => (allBookPosts ?? []).filter((p) => (p.book_kind ?? "review") === kind),
    [allBookPosts, kind],
  );

  const stats = useMemo(() => {
    const count = (s: Post["status"]) => posts.filter((p) => p.status === s).length;
    const published = count("published");
    return [
      { label: `Toplam ${config.singular}`, value: posts.length, sub: `${posts.filter((p) => p.isFeatured).length} öne çıkan` },
      { label: "Yayında", value: published, sub: posts.length ? `%${Math.round((published / posts.length) * 100)} yayın oranı` : "—" },
      { label: "Onay Bekleyen", value: count("pending"), sub: "Yayınlanmayı bekliyor" },
      { label: "Taslak", value: count("draft"), sub: "Henüz tamamlanmadı" },
    ];
  }, [posts, config.singular]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-lg p-3.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">{s.label}</p>
            <p className="text-2xl font-semibold tabular-nums">{loading ? "—" : s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{loading ? "Yükleniyor..." : s.sub}</p>
          </div>
        ))}
      </div>

      <ReviewsTable posts={posts} loading={loading} error={error} config={config} />
    </div>
  );
};

export default AllReviewsComponents;