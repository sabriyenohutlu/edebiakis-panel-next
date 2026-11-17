// src/components/ReviewComponents/ReviewsTable.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import {
  IconCircleCheck, IconArrowBackUp, IconPencil, IconPin, IconPinFilled, IconPlus, IconStarFilled, IconTrash,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { deletePost, setPostFeatured, setPostStatus } from "@/services/post.service";
import { useDefinitionDocs } from "@/lib/content-utils";
import { postStatusConfig, type Post, type PostStatus } from "@/types/post";
import type { BookPostConfig } from "./bookPostConfig";

const formatDate = (t?: Timestamp | null) =>
  t?.toDate ? t.toDate().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";

type Props = { posts: Post[]; loading: boolean; error: string; config: BookPostConfig };

export default function ReviewsTable({ posts, loading, error, config }: Props) {
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // ID → isim eşlemeleri
  const works = useDefinitionDocs("works");
  const authors = useDefinitionDocs("authors");
  const workNames = useMemo(() => new Map(works.map((w) => [w.id, String(w.title ?? "")])), [works]);
  const authorNames = useMemo(() => new Map(authors.map((a) => [a.id, String(a.fullName ?? "")])), [authors]);

  const run = async (id: string, action: () => Promise<void>) => {
    try {
      setBusyId(id);
      setActionError("");
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (post: Post) => {
    if (!window.confirm(`"${post.title}" silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) return;
    run(post.id, () => deletePost(post));
  };

  const columns = useMemo<MRT_ColumnDef<Post>[]>(
    () => [
      {
        id: "title",
       header: config.singular,
        size: 280,
        accessorFn: (row) => `${row.title} ${row.workId ? workNames.get(row.workId) ?? "" : ""}`,
        Cell: ({ row }) => (
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} lineClamp={1}>{row.original.title}</Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {row.original.workId ? workNames.get(row.original.workId) ?? "—" : "Kitap seçilmedi"}
            </Text>
          </div>
        ),
      },
      {
        id: "author",
        header: "Kitabın Yazarı",
        size: 160,
        accessorFn: (row) => (row.authorId ? authorNames.get(row.authorId) ?? "" : ""),
        Cell: ({ cell }) => <Text size="sm" lineClamp={1}>{cell.getValue<string>() || "—"}</Text>,
      },
      {
        id: "rating",
        header: "Puan",
        size: 80,
        accessorFn: (row) => row.rating ?? 0,
        Cell: ({ row }) =>
          row.original.rating ? (
            <Group spacing={4} noWrap>
              <IconStarFilled size={13} style={{ color: "#f59e0b" }} />
              <Text size="sm">{row.original.rating}</Text>
            </Group>
          ) : (
            <Text size="xs" c="dimmed">—</Text>
          ),
      },
      {
        id: "date",
        header: "Tarih",
        size: 110,
        accessorFn: (row) => formatDate(row.publishedAt ?? row.createdAt),
        Cell: ({ cell }) => <Text size="xs" c="dimmed">{cell.getValue<string>()}</Text>,
      },
      {
        accessorKey: "status",
        header: "Durum",
        size: 110,
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
    [workNames, authorNames,config],
  );

  const shownError = error || actionError;

  const table = useMantineReactTable({
    columns,
    data: posts,
    getRowId: (row) => row.id,
    state: { showAlertBanner: !!shownError },
    mantineToolbarAlertBannerProps: shownError ? { color: "red", children: shownError } : undefined,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    initialState: {
      density: "xs",
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    paginationDisplayMode: "pages",
    positionGlobalFilter: "left",
    mantineSearchTextInputProps: { placeholder: `${config.singular} veya kitap ara...`, style: { width: "260px" } },
    mantinePaginationProps: { radius: "md", size: "sm" },
    renderTopToolbarCustomActions: () => (
      <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
        <Link href={config.routes.create}>
          <IconPlus size={14} />
          {config.singular} Ekle
        </Link>
      </Button>
    ),
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: { "mrt-row-actions": { header: "İşlemler", size: 150 } },
    renderRowActions: ({ row }) => {
      const p = row.original;
      const isBusy = busyId === p.id;
      return (
        <Group spacing={2} noWrap>
          {p.status === "pending" && (
            <Tooltip label="Onayla ve yayınla">
              <ActionIcon variant="subtle" color="green" size="sm" loading={isBusy} onClick={() => run(p.id, () => setPostStatus(p, "published"))}>
                <IconCircleCheck size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          {p.status === "published" && (
            <Tooltip label="Yayından kaldır">
              <ActionIcon variant="subtle" color="orange" size="sm" loading={isBusy} onClick={() => run(p.id, () => setPostStatus(p, "draft"))}>
                <IconArrowBackUp size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={p.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}>
            <ActionIcon
              variant="subtle"
              color={p.isFeatured ? "yellow" : "gray"}
              size="sm"
              disabled={isBusy}
              onClick={() => run(p.id, () => setPostFeatured(p.id, !p.isFeatured))}
            >
              {p.isFeatured ? <IconPinFilled size={15} /> : <IconPin size={15} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Düzenle">
            <ActionIcon variant="subtle" color="gray" size="sm" component={Link}  href={config.routes.edit(p.id)}>
              <IconPencil size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Sil">
            <ActionIcon variant="subtle" color="red" size="sm" disabled={isBusy} onClick={() => handleDelete(p)}>
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    },
    mantineTableProps: { highlightOnHover: true, withColumnBorders: false, withBorder: false },
    localization: {
      search: "Ara",
      rowsPerPage: "Sayfa başına satır",
      of: "/",
      noRecordsToDisplay: "Henüz kitap incelemesi yok",
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
}