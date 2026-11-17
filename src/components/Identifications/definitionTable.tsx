// src/components/Identifications/DefinitionTable.tsx
"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { ActionIcon, Badge, Code, Group, Text, Tooltip } from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  definitionMap,
  statusOptions,
  type DefinitionColumn,
  type DefinitionConfig,
  type DefinitionKey,
} from "@/config/definitions.config";
import {
  deleteDefinition,
  subscribeDefinitions,
  type DefinitionDoc,
} from "../../services/definitions.service";
import type { LiteraryDate } from "@/types/definitions";

const BASE_URL = "/icerik-yonetimi/tanimlamalar";
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

type Lookups = Partial<Record<DefinitionKey, Map<string, string>>>;

// ——— Biçimlendirme ———

function formatLiteraryDate(d?: LiteraryDate | null) {
  if (!d?.year) return "—";
  const parts = [
    d.day,
    d.month ? MONTHS[d.month - 1] : undefined,
    d.year,
  ].filter(Boolean);
  return `${d.approximate ? "~ " : ""}${parts.join(" ")}`;
}

function formatTimestamp(t?: Timestamp | null) {
  if (!t?.toDate) return "—";
  return t
    .toDate()
    .toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

function BadgeList({
  items,
  max = 2,
}: {
  items: { label: string; color: string }[];
  max?: number;
}) {
  if (items.length === 0)
    return (
      <Text size="xs" c="dimmed">
        —
      </Text>
    );
  return (
    <Group spacing={4} noWrap>
      {items.slice(0, max).map((item, i) => (
        <Badge key={i} variant="light" size="sm" radius="xl" color={item.color}>
          {item.label}
        </Badge>
      ))}
      {items.length > max && (
        <Text size="xs" c="dimmed">
          +{items.length - max}
        </Text>
      )}
    </Group>
  );
}

// Referans alanlarındaki ID'leri isimlere çevirmek için ilgili koleksiyonları dinler
function useLookups(refKeys: DefinitionKey[]) {
  const [lookups, setLookups] = useState<Lookups>({});
  const depKey = refKeys.join(",");

  useEffect(() => {
    const unsubscribes = refKeys.map((key) => {
      const cfg = definitionMap[key];
      return subscribeDefinitions(
        cfg.collection,
        (docs) =>
          setLookups((prev) => ({
            ...prev,
            [key]: new Map(
              docs.map((d) => [d.id, String(d[cfg.labelField] ?? "")]),
            ),
          })),
        () => {},
      );
    });
    return () => unsubscribes.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return lookups;
}

function refNames(
  col: DefinitionColumn,
  value: unknown,
  lookups: Lookups,
): string[] {
  const map = col.ref ? lookups[col.ref] : undefined;
  const ids = Array.isArray(value) ? value : value ? [value] : [];
  return ids.map((id) => map?.get(id as string)).filter(Boolean) as string[];
}

function renderCell(
  col: DefinitionColumn,
  row: DefinitionDoc,
  config: DefinitionConfig,
  lookups: Lookups,
): ReactNode {
  const value = row[col.key];

  switch (col.kind) {
    case "title": {
      const secondary = config.secondaryField
        ? row[config.secondaryField]
        : null;
      const secondaryText = Array.isArray(secondary)
        ? secondary.join(", ")
        : secondary;
      const image = config.imageField ? row[config.imageField] : null;
      return (
        <Group spacing={10} noWrap>
          {config.imageField &&
            (image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}
              />
            ))}
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} lineClamp={1}>
              {value || "—"}
            </Text>
            {secondaryText && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {secondaryText}
              </Text>
            )}
          </div>
        </Group>
      );
    }
    case "text":
      return (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {value || "—"}
        </Text>
      );
    case "mono":
      return value ? <Code style={{ fontSize: 11 }}>{value}</Code> : "—";
    case "number":
      return <Text size="sm">{value ?? "—"}</Text>;
    case "badge": {
      if (!value) return "—";
      const opt = col.options?.[value];
      return (
        <BadgeList
          items={[{ label: opt?.label ?? value, color: opt?.color ?? "gray" }]}
        />
      );
    }
    case "badges": {
      const arr: string[] = Array.isArray(value) ? value : [];
      return (
        <BadgeList
          max={3}
          items={arr.map((v) => ({
            label: col.options?.[v]?.label ?? v,
            color: col.options?.[v]?.color ?? "gray",
          }))}
        />
      );
    }
    case "status": {
      const opt = statusOptions[value ?? "draft"];
      return (
        <BadgeList
          items={[{ label: opt?.label ?? value, color: opt?.color ?? "gray" }]}
        />
      );
    }
    case "date":
      return <Text size="xs">{formatLiteraryDate(value)}</Text>;
    case "timestamp":
      return <Text size="xs">{formatTimestamp(value)}</Text>;
    case "ref":
      return (
        <Text size="sm" lineClamp={1}>
          {refNames(col, value, lookups)[0] ?? "—"}
        </Text>
      );
    case "refs":
      return (
        <BadgeList
          items={refNames(col, value, lookups).map((name) => ({
            label: name,
            color: "gray",
          }))}
        />
      );
  }
}

// ——— Tablo ———

export default function DefinitionTable({
  config,
  onChange
}: {
  config: DefinitionConfig;
   onChange?: () => void;
}) {
  const [data, setData] = useState<DefinitionDoc[] | null>(null);
  const [error, setError] = useState("");
  const loading = data === null && !error;

  useEffect(() => {
    return subscribeDefinitions(
      config.collection,
      (docs) => {
        setData(
          [...docs].sort((a, b) =>
            String(a[config.labelField] ?? "").localeCompare(
              String(b[config.labelField] ?? ""),
              "tr",
            ),
          ),
        );
      },
      (err) => setError(err.message),
    );
  }, [config.collection, config.labelField]);

  const refKeys = useMemo(
    () => [...new Set(config.columns.filter((c) => c.ref).map((c) => c.ref!))],
    [config],
  );
  const lookups = useLookups(refKeys);

const handleDelete = async (row: DefinitionDoc) => {
  const label = row[config.labelField] || "Bu kayıt";
  if (!window.confirm(`"${label}" silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) return;

  try {
    await deleteDefinition(config.collection, row.id);
    // Snapshot gecikse bile satır hemen kaybolsun
    setData((prev) => prev?.filter((d) => d.id !== row.id) ?? prev);
    onChange?.();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Silme işlemi başarısız");
  }
};

  const columns = useMemo<MRT_ColumnDef<DefinitionDoc>[]>(
    () =>
      config.columns.map((col) => ({
        id: col.key,
        header: col.header,
        size: col.size,
        // Global arama için düz metin değeri (referanslar isimle aranır)
        accessorFn: (row) => {
          const v = row[col.key];
          if (col.kind === "ref" || col.kind === "refs")
            return refNames(col, v, lookups).join(" ");
          if (col.kind === "title" && config.secondaryField) {
            const s = row[config.secondaryField];
            return `${v ?? ""} ${Array.isArray(s) ? s.join(" ") : (s ?? "")}`;
          }
          if (Array.isArray(v)) return v.join(" ");
          return typeof v === "string" || typeof v === "number"
            ? String(v)
            : "";
        },
        Cell: ({ row }) => renderCell(col, row.original, config, lookups),
      })),
    [config, lookups],
  );

  const table = useMantineReactTable({
    columns,
    data: data ?? [],
    getRowId: (row) => row.id,
    state: {
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
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    positionGlobalFilter: "left",
    mantineSearchTextInputProps: {
      placeholder: `${config.label} ara...`,
      style: { width: "240px" },
    },
    renderTopToolbarCustomActions: () => (
      <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
        <Link href={`${BASE_URL}/${config.key}/ekle`}>
          <IconPlus size={14} />
          {config.label} Ekle
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
            href={`${BASE_URL}/${config.key}/${row.original.id}`}
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Sil">
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => handleDelete(row.original)}
          >
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
      noRecordsToDisplay: `Henüz ${config.label.toLocaleLowerCase("tr")} tanımlanmadı`,
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
