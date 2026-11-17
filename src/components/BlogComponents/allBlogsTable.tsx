"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { Group, Avatar, Text, Badge, ActionIcon, Tooltip } from "@mantine/core";
import { Loader2 } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/services/post.service";
import { subscribeCategories } from "@/services/category.service";
import { postStatusConfig, type Post, type PostStatus } from "@/types/post";

const BASE_URL = "/icerik-yonetimi/edebiyat-yazilari";
const AVATAR_COLORS = ["blue", "violet", "teal", "orange", "pink", "cyan", "grape", "indigo"];

// ——— Yardımcılar ———

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toLocaleUpperCase("tr"))
      .join("") || "?"
  );
}

// Aynı isim her zaman aynı rengi alsın
function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(t?: Timestamp | null) {
  if (!t?.toDate) return "—";
  return t.toDate().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

// ——— Tablo ———

type Props = {
  posts: Post[];
  loading: boolean;
  error: string;
};

const AllBlogsTable = ({ posts, loading, error }: Props) => {
  const [categoryNames, setCategoryNames] = useState<Map<string, string>>(new Map());
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Kategori ID'lerini isimlere çevirmek için
  useEffect(() => {
    return subscribeCategories(
      (cats) => setCategoryNames(new Map(cats.map((c) => [c.id, c.title]))),
      () => {},
    );
  }, []);

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`"${post.title}" silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) return;
    try {
      setDeletingId(post.id);
      setActionError("");
      await deletePost(post);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Silme işlemi başarısız");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Başlık",
        size: 300,
        Cell: ({ row }) => (
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} lineClamp={1}>
              {row.original.title}
            </Text>
            {row.original.excerpt && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {row.original.excerpt}
              </Text>
            )}
          </div>
        ),
      },
      {
        accessorKey: "authorName",
        header: "Yazar",
        size: 160,
        Cell: ({ row }) => {
          const name = row.original.authorName || "Bilinmiyor";
          return (
            <Group spacing={8} noWrap>
              <Avatar size={24} radius="xl" color={colorFor(name)}>
                {getInitials(name)}
              </Avatar>
              <Text size="sm" lineClamp={1}>{name}</Text>
            </Group>
          );
        },
      },
      {
        id: "category",
        header: "Kategori",
        size: 130,
        // Arama kutusu kategori adıyla da çalışsın
        accessorFn: (row) => (row.categoryId ? categoryNames.get(row.categoryId) ?? "" : ""),
        Cell: ({ cell }) => (
          <Text size="xs" c="dimmed">
            {cell.getValue<string>() || "—"}
          </Text>
        ),
      },
      {
        id: "date",
        header: "Tarih",
        size: 120,
        // Yayındaysa yayın tarihi, değilse oluşturulma tarihi
        accessorFn: (row) => formatDate(row.publishedAt ?? row.createdAt),
        Cell: ({ cell }) => (
          <Text size="xs" c="dimmed">
            {cell.getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Durum",
        size: 120,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: Object.entries(postStatusConfig).map(([value, c]) => ({ value, label: c.label })),
        },
        Cell: ({ cell }) => {
          const cfg = postStatusConfig[cell.getValue<PostStatus>()];
          return (
            <Badge color={cfg?.mantineColor ?? "gray"} variant="light" size="sm" radius="xl">
              {cfg?.label ?? cell.getValue<string>()}
            </Badge>
          );
        },
      },
    ],
    [categoryNames],
  );

  const shownError = error || actionError;

  const table = useMantineReactTable({
    columns,
    data: posts,
    getRowId: (row) => row.id,
    state: {
      showAlertBanner: !!shownError,
    },
    mantineToolbarAlertBannerProps: shownError ? { color: "red", children: shownError } : undefined,
    enableRowSelection: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    initialState: {
      density: "xs",
      pagination: { pageSize: 8, pageIndex: 0 },
      showGlobalFilter: true,
    },
    paginationDisplayMode: "pages",
    positionGlobalFilter: "left",
    mantineSearchTextInputProps: {
      placeholder: "Yazı ara...",
      style: { width: "260px" },
    },
    mantinePaginationProps: {
      radius: "md",
      size: "sm",
    },
    renderTopToolbarCustomActions: () => (
      <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
        <Link href={`${BASE_URL}/yazi-ekle`}>
          <IconPlus size={14} />
          Blog Ekle
        </Link>
      </Button>
    ),
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <Group spacing={4} noWrap>
        <Tooltip label="Düzenle">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            component={Link}
            href={`${BASE_URL}/${row.original.id}/duzenle`}
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Sil">
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            loading={deletingId === row.original.id}
            onClick={() => handleDelete(row.original)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
    mantineTableProps: {
      striped: false,
      highlightOnHover: true,
      withColumnBorders: false,
      withBorder: false,
    },
    localization: {
      search: "Ara",
      rowsPerPage: "Sayfa başına satır",
      of: "/",
      noRecordsToDisplay: "Henüz blog yazısı yok",
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <MantineReactTable table={table} />;
};

export default AllBlogsTable;