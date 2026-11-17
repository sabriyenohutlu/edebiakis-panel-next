// src/components/content/PostDetail.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Pencil, Pin, PinOff, Trash2, Undo2 } from "lucide-react";
import type { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/apilib/utils";
import { deletePost, setPostFeatured, setPostStatus, subscribePost } from "@/services/post.service";
import { postStatusConfig, type Post } from "@/types/post";
import type { PostType } from "@/types/category";
import type { PostRoutes } from "./PostsTable";

export const formatDateTime = (t?: Timestamp | null) =>
  t?.toDate ? t.toDate().toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

export function Row({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-xs border-b last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{children || "—"}</span>
    </div>
  );
}

export function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="text-[11px] rounded-full bg-muted px-2 py-0.5">{t}</span>
      ))}
    </div>
  );
}

// Detay sayfası verisi ve işlemleri
export function usePostDetail(postType: PostType, listUrl: string) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null | undefined>(undefined); // undefined = yükleniyor
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    return subscribePost(id, (p) => setPost(p && p.post_type === postType ? p : null), (e) => setError(e.message));
  }, [id, postType]);

  const run = async (action: () => Promise<void>) => {
    try {
      setBusy(true);
      setError("");
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    run(async () => {
      if (!post) return;
      await deletePost(post);
      router.push(listUrl);
    });

  return { post, error, busy, run, remove };
}

type ShellProps = {
  detail: ReturnType<typeof usePostDetail>;
  routes: PostRoutes;
  plural: string;          // "Sözler"
  singular: string;        // "Söz"
  accusative: string;      // "Sözü"
  slugPrefix?: string;     // "/biyografi/" — verilirse adres satırı gösterilir
  showSeo?: boolean;
  renderMain: (post: Post) => ReactNode;
  renderSidebar?: (post: Post) => ReactNode;
};

export function PostDetailShell({
  detail, routes, plural, singular, accusative, slugPrefix, showSeo = true, renderMain, renderSidebar,
}: ShellProps) {
  const router = useRouter();
  const { post, error, busy, run, remove } = detail;

  if (post === undefined && !error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-muted-foreground">{error || `${singular} bulunamadı.`}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(routes.list)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  const statusCfg = postStatusConfig[post.status];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href={routes.list} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3 h-3" />
            {plural}
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight truncate">{post.title}</h1>
            <span className={cn("inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full", statusCfg?.color)}>
              {statusCfg?.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={busy} className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{accusative} sil</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>{post.title}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" size="sm" className="gap-1.5" disabled={busy} onClick={() => run(() => setPostFeatured(post.id, !post.isFeatured))}>
            {post.isFeatured ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            {post.isFeatured ? "Öne Çıkarmayı Kaldır" : "Öne Çıkar"}
          </Button>

          {post.status === "pending" && (
            <Button variant="outline" size="sm" className="gap-1.5" disabled={busy} onClick={() => run(() => setPostStatus(post, "published"))}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Onayla ve Yayınla
            </Button>
          )}
          {post.status === "published" && (
            <Button variant="outline" size="sm" className="gap-1.5" disabled={busy} onClick={() => run(() => setPostStatus(post, "draft"))}>
              <Undo2 className="w-3.5 h-3.5" />
              Yayından Kaldır
            </Button>
          )}

          <Button size="sm" className="gap-1.5" asChild>
            <Link href={routes.edit(post.id)}>
              <Pencil className="w-3.5 h-3.5" />
              Düzenle
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="min-w-0">{renderMain(post)}</div>

        <aside className="flex flex-col gap-5">
          {renderSidebar?.(post)}

          <InfoCard title="Yayın">
            <Row label="Durum">{statusCfg?.label}</Row>
            <Row label="Öne çıkan">{post.isFeatured ? "Evet" : "Hayır"}</Row>
            <Row label="Ekleyen">{post.authorName}</Row>
            <Row label="Oluşturulma">{formatDateTime(post.createdAt)}</Row>
            <Row label="Yayın tarihi">{formatDateTime(post.publishedAt)}</Row>
            <Row label="Son güncelleme">{formatDateTime(post.updatedAt)}</Row>
            {slugPrefix && (
              <Row label="Adres">
                <code className="text-[11px]">{slugPrefix}{post.slug}</code>
              </Row>
            )}
          </InfoCard>

          {showSeo && (
            <InfoCard title="SEO">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 line-clamp-1">{post.seo?.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{post.seo?.description}</p>
            </InfoCard>
          )}
        </aside>
      </div>
    </div>
  );
}