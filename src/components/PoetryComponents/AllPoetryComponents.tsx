// src/components/PoetryComponents/AllPoetryComponents.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PoetryTable from "./PoetryTable";
import { subscribePosts } from "@/services/post.service";
import type { Post } from "@/types/post";

const AllPoetryComponents = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const loading = posts === null && !error;

  useEffect(() => subscribePosts("poetry", setPosts, (err) => setError(err.message)), []);

  const stats = useMemo(() => {
    const list = posts ?? [];
    const count = (s: Post["status"]) => list.filter((p) => p.status === s).length;
    const published = count("published");
    return [
      { label: "Toplam Şiir", value: list.length, sub: `${list.filter((p) => p.isFeatured).length} öne çıkan` },
      { label: "Yayında", value: published, sub: list.length ? `%${Math.round((published / list.length) * 100)} yayın oranı` : "—" },
      { label: "Onay Bekleyen", value: count("pending"), sub: "Yayınlanmayı bekliyor" },
      { label: "Taslak", value: count("draft"), sub: "Henüz tamamlanmadı" },
    ];
  }, [posts]);

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

      <PoetryTable posts={posts ?? []} loading={loading} error={error} />
    </div>
  );
};

export default AllPoetryComponents;