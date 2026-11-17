// src/components/DailyWordComponents/AllDailyWordsComponents.tsx
"use client";

import { useMemo } from "react";
import { Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import PostsTable from "@/components/content/PostsTable";
import { PostStats, usePostsList } from "@/components/content/PostsList";
import { useDefinitionDocs } from "@/lib/content-utils";
import type { Post } from "@/types/post";
import { DAILY_WORD_ROUTES } from "./useDailyWordForm";

const formatDay = (d?: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "";

const renderQuote = (p: Post) => (
  <Text size="sm" fs="italic" lineClamp={2}>“{p.content}”</Text>
);

export default function AllDailyWordsComponents() {
  const { posts, loading, error } = usePostsList("dailyword");
  const authors = useDefinitionDocs("authors");
  const authorNames = useMemo(() => new Map(authors.map((a) => [a.id, String(a.fullName ?? "")])), [authors]);

  const extraColumns = useMemo<MRT_ColumnDef<Post>[]>(
    () => [
      {
        id: "author",
        header: "Söz Sahibi",
        size: 160,
        accessorFn: (row) => (row.authorId ? authorNames.get(row.authorId) ?? "" : "Anonim"),
        Cell: ({ cell }) => <Text size="sm" lineClamp={1}>{cell.getValue<string>() || "—"}</Text>,
      },
      {
        id: "displayDate",
        header: "Yayın Günü",
        size: 110,
        accessorFn: (row) => formatDay(row.displayDate),
        Cell: ({ cell }) => <Text size="xs" c="dimmed">{cell.getValue<string>() || "—"}</Text>,
      },
    ],
    [authorNames],
  );

  return (
    <div className="flex flex-col gap-5">
      <PostStats posts={posts} loading={loading} totalLabel="Toplam Söz" />
      <PostsTable
        posts={posts}
        loading={loading}
        error={error}
        routes={DAILY_WORD_ROUTES}
        singular="Söz"
        searchPlaceholder="Söz veya yazar ara..."
        renderTitle={renderQuote}
        extraColumns={extraColumns}
      />
    </div>
  );
}