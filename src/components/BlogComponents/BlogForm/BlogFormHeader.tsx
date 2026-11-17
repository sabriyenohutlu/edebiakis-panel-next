// src/components/BlogComponents/BlogForm/BlogFormHeader.tsx
"use client";

import { FileText, Loader2, RefreshCw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/apilib/utils";
import { postStatusConfig } from "@/types/post";
import type { BlogForm } from "./useBlogForm";

export default function BlogFormHeader({ form }: { form: BlogForm }) {
  const { mode, post, saving, deleting, busy, uploadProgress, submitError } = form;
  const isEdit = mode === "edit";
  const wasPublished = post?.status === "published";

  const statusCfg = post ? postStatusConfig[post.status] : null;

  // Butonlar yazının mevcut durumuna göre değişir
  const draftLabel = isEdit && wasPublished ? "Yayından Kaldır" : "Taslak Kaydet";
  const publishLabel = isEdit && wasPublished ? "Güncelle" : "Yayınla";
  const PublishIcon = isEdit && wasPublished ? RefreshCw : Send;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Bloglar › {isEdit ? "Düzenle" : "Yeni Yazı"}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight truncate">
              {isEdit ? post?.title || "Yazıyı Düzenle" : "Yeni Blog Yazısı"}
            </h1>
            {statusCfg && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
                  statusCfg.color,
                )}
              >
                {statusCfg.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yazıyı sil</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{post?.title}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={form.remove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={form.cancel} disabled={busy}>
            İptal
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => form.submit("draft")} disabled={busy}>
            {saving === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {draftLabel}
          </Button>

          <Button size="sm" className="gap-1.5" onClick={() => form.submit("published")} disabled={busy}>
            {saving === "published" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PublishIcon className="w-3.5 h-3.5" />
            )}
            {saving === "published" && uploadProgress !== null ? `Yükleniyor %${uploadProgress}` : publishLabel}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {submitError}
        </div>
      )}
    </div>
  );
}