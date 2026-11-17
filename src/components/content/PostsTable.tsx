// src/components/content/PostsTable.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import {
  IconArrowBackUp, IconCircleCheck, IconEye, IconPencil, IconPin, IconPinFilled, IconPlus, IconTrash,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { deletePost, setPostFeatured, setPostStatus } from "@/services/post.service";
import { postStatusConfig, type Post, type PostStatus } from "@/types/post";

export type PostRoutes = {
  list: string;
  create: string;
  detail: (id: string) => string;
  edit: (id: string) => string;
};

export const formatShortDate = (t?: Timestamp | null) =>
  t?.toDate ? t.toDate().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";

type Props = {
  posts: Post[];
  loading: boolean;
  error: string;
  routes: PostRoutes;
  singular: string;                         // "Söz", "Biyografi"
  searchPlaceholder?: string;
  renderTitle?: (post: Post) => ReactNode;  // Başlık hücresi özelleştirme
  extraColumns?: MRT_ColumnDef<Post>[];     // Modüle özel kolonlar (useMemo ile verilmeli)
};

export default function PostsTable({
  posts, loading, error, routes, singular, searchPlaceholder, renderTitle, extraColumns,
}: Props) {
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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
        accessorKey: "title",
        header: singular,
        size: 280,
        Cell: ({ row }) => (
          <Link href={routes.detail(row.original.id)} style={{ display: "block", minWidth: 0 }}>
            {renderTitle ? (
              renderTitle(row.original)
            ) : (
              <>
                <Text size="sm" fw={500} lineClamp={1}>{row.original.title}</Text>
                {row.original.excerpt && <Text size="xs" c="dimmed" lineClamp={1}>{row.original.excerpt}</Text>}
              </>
            )}
          </Link>
        ),
      },
      ...(extraColumns ?? []),
      {
        id: "date",
        header: "Tarih",
        size: 110,
        accessorFn: (row) => formatShortDate(row.publishedAt ?? row.createdAt),
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
    [extraColumns, renderTitle, routes, singular],
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
    initialState: { density: "xs", pagination: { pageSize: 10, pageIndex: 0 }, showGlobalFilter: true },
    paginationDisplayMode: "pages",
    positionGlobalFilter: "left",
    mantineSearchTextInputProps: { placeholder: searchPlaceholder ?? `${singular} ara...`, style: { width: "260px" } },
    mantinePaginationProps: { radius: "md", size: "sm" },
    renderTopToolbarCustomActions: () => (
      <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
        <Link href={routes.create}>
          <IconPlus size={14} />
          {singular} Ekle
        </Link>
      </Button>
    ),
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: { "mrt-row-actions": { header: "İşlemler", size: 170 } },
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
          <Tooltip label="Detay">
            <ActionIcon variant="subtle" color="gray" size="sm" component={Link} href={routes.detail(p.id)}>
              <IconEye size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Düzenle">
            <ActionIcon variant="subtle" color="gray" size="sm" component={Link} href={routes.edit(p.id)}>
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
    localization: { search: "Ara", rowsPerPage: "Sayfa başına satır", of: "/", noRecordsToDisplay: "Henüz kayıt yok" },
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