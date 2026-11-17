"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import AllBlogsTable from "./allBlogsTable";
import { subscribePosts } from "@/services/post.service";
import type { Post } from "@/types/post";

const AllBlogsComponents = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const loading = posts === null && !error;

  useEffect(() => {
    return subscribePosts("blog", setPosts, (err) => setError(err.message));
  }, []);

  const stats = useMemo(() => {
    const list = posts ?? [];
    const total = list.length;
    const published = list.filter((p) => p.status === "published").length;
    const drafts = list.filter((p) => p.status === "draft").length;
    const pending = list.filter((p) => p.status === "pending").length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const addedThisMonth = list.filter(
      (p) => (p.createdAt?.toMillis() ?? 0) >= monthStart.getTime(),
    ).length;

    const rate = total > 0 ? Math.round((published / total) * 100) : 0;

    return [
      {
        label: "Toplam Blog",
        value: total,
        sub: `+${addedThisMonth} bu ay eklendi`,
      },
      { label: "Yayınlanan", value: published, sub: `%${rate} yayın oranı` },
      {
        label: "Taslak / Beklemede",
        value: drafts + pending,
        sub: `${drafts} taslak · ${pending} beklemede`,
      },
    ];
  }, [posts]);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-lg p-3.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
              {s.label}
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {loading ? "—" : s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {loading ? "Yükleniyor..." : s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <AllBlogsTable posts={posts ?? []} loading={loading} error={error} />
      {/* Tablo — Firestore'a bağlanınca props eklenecek */}
    </div>
  );
};

export default AllBlogsComponents;
