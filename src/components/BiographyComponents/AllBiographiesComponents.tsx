// src/components/BiographyComponents/AllBiographiesComponents.tsx
"use client";

import { useMemo } from "react";
import { Avatar, Group, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import PostsTable from "@/components/content/PostsTable";
import { PostStats, usePostsList } from "@/components/content/PostsList";
import { useDefinitionDocs } from "@/lib/content-utils";
import type { Post } from "@/types/post";
import { BIOGRAPHY_ROUTES } from "./useBiographyForm";

export default function AllBiographiesComponents() {
  const { posts, loading, error } = usePostsList("biography");
  const authors = useDefinitionDocs("authors");
  const authorMap = useMemo(() => new Map(authors.map((a) => [a.id, a])), [authors]);

  const extraColumns = useMemo<MRT_ColumnDef<Post>[]>(
    () => [
      {
        id: "subject",
        header: "Kişi",
        size: 180,
        accessorFn: (row) => (row.authorId ? String(authorMap.get(row.authorId)?.fullName ?? "") : ""),
        Cell: ({ row, cell }) => {
          const author = row.original.authorId ? authorMap.get(row.original.authorId) : undefined;
          return (
            <Group spacing={8} noWrap>
              <Avatar size={24} radius="xl" src={author?.photoURL ?? null} />
              <Text size="sm" lineClamp={1}>{cell.getValue<string>() || "—"}</Text>
            </Group>
          );
        },
      },
    ],
    [authorMap],
  );

  return (
    <div className="flex flex-col gap-5">
      <PostStats posts={posts} loading={loading} totalLabel="Toplam Biyografi" />
      <PostsTable
        posts={posts}
        loading={loading}
        error={error}
        routes={BIOGRAPHY_ROUTES}
        singular="Biyografi"
        searchPlaceholder="Biyografi veya kişi ara..."
        extraColumns={extraColumns}
      />
    </div>
  );
}