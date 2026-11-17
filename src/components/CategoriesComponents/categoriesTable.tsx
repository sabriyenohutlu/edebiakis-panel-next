"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { ActionIcon, Badge, Text, Group, Tooltip, Code } from "@mantine/core";
import { IconPencil, IconTrash, IconPlus, IconDatabaseImport } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Category, PostType, postTypeConfig } from "@/types/category";
import { deleteCategory, seedCategories, subscribeCategories } from "@/services/category.service";

const CategoriesTable = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCategories(
      (categories) => {
        setData(categories);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  // Ana kategorileri üste, alt kategorileri hemen altına sırala
  const sortedData = useMemo(() => {
    const parents = data.filter((c) => !c.parent_id);
    const result: Category[] = [];
    for (const parent of parents) {
      result.push(parent);
      result.push(...data.filter((c) => c.parent_id === parent.id));
    }
    return result;
  }, [data]);

  const handleDelete = async (category: Category) => {
    const hasChildren = data.some((c) => c.parent_id === category.id);
    const msg = hasChildren
      ? `"${category.title}" ve tüm alt kategorileri silinecek. Emin misiniz?`
      : `"${category.title}" silinecek. Emin misiniz?`;
    if (!window.confirm(msg)) return;

    try {
      await deleteCategory(category.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme işlemi başarısız");
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veriler yüklenemedi");
    } finally {
      setSeeding(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Başlık / İsim",
        size: 220,
        Cell: ({ row }) => {
          const isChild = !!row.original.parent_id;
          return (
            <div style={{ paddingLeft: isChild ? 20 : 0, display: "flex", alignItems: "center", gap: 8 }}>
              {isChild && (
                <div style={{ width: 16, height: 1, background: "var(--mantine-color-gray-4)", flexShrink: 0 }} />
              )}
              <div>
                <Text size="sm" fw={500}>{row.original.title}</Text>
                <Text size="xs" c="dimmed">{row.original.name}</Text>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "slug",
        header: "Slug",
        size: 160,
        Cell: ({ cell }) => <Code style={{ fontSize: 11 }}>{cell.getValue<string>()}</Code>,
      },
      {
        accessorKey: "post_type",
        header: "Post Type",
        size: 130,
        Cell: ({ cell }) => {
          const cfg = postTypeConfig[cell.getValue<PostType>()];
          return (
            <Badge variant="light" size="sm" radius="xl" color={cfg?.mantineColor ?? "gray"}>
              {cfg?.label ?? cell.getValue<string>()}
            </Badge>
          );
        },
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: Object.keys(postTypeConfig),
        },
      },
      {
        accessorKey: "description",
        header: "Açıklama",
        size: 220,
        Cell: ({ cell }) => (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {cell.getValue<string | null>() ?? "—"}
          </Text>
        ),
      },
      {
        accessorKey: "contentCount",
        header: "İçerik",
        size: 80,
        Cell: ({ cell }) => (
          <Text size="sm" fw={500} ta="center">{cell.getValue<number>() ?? 0}</Text>
        ),
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: sortedData,
    getRowId: (row) => row.id,
    state: {
      isLoading: loading,
      showAlertBanner: !!error,
    },
    mantineToolbarAlertBannerProps: error
      ? { color: "red", children: error }
      : undefined,
    enableRowSelection: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableSorting: false,
    initialState: {
      density: "xs",
      showGlobalFilter: true,
    },
    positionGlobalFilter: "left",
    mantineSearchTextInputProps: {
      placeholder: "Kategori ara...",
      style: { width: "240px" },
    },
    renderTopToolbarCustomActions: () => (
      <Group spacing={8} noWrap>
        <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
          <Link href="/icerik-yonetimi/kategoriler/kategori-ekle">
            <IconPlus size={14} />
            Kategori Ekle
          </Link>
        </Button>
      </Group>
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
            href={`/icerik-yonetimi/kategoriler/${row.original.id}/duzenle`}
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Sil">
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(row.original)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
    mantineTableProps: {
      highlightOnHover: true,
      withColumnBorders: false,
      withBorder: false,
    },
    localization: {
      search: "Ara",
      rowsPerPage: "Sayfa başına",
      of: "/",
      noRecordsToDisplay: "Kategori bulunamadı",
    },
  });

  return <MantineReactTable table={table} />;
};

export default CategoriesTable;