// src/components/ReviewComponents/ReviewForm/ReviewFormHeader.tsx
"use client";

import { FileText, Loader2, RefreshCw, Send, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/apilib/utils";
import { postStatusConfig } from "@/types/post";
import type { ReviewForm } from "./useReviewForm";

const spin = <Loader2 className="w-3.5 h-3.5 animate-spin" />;

export default function ReviewFormHeader({ form }: { form: ReviewForm }) {
  const { mode, post, saving, deleting, busy, uploadProgress, submitError } = form;
  const isEdit = mode === "edit";
  const wasPublished = post?.status === "published";
  const statusCfg = post ? postStatusConfig[post.status] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Kitap İncelemeleri › {isEdit ? "Düzenle" : "Yeni İnceleme"}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight truncate">
              {isEdit ? post?.title || "İncelemeyi Düzenle" : "Yeni Kitap İncelemesi"}
            </h1>
            {statusCfg && (
              <span className={cn("inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full", statusCfg.color)}>
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
                  {deleting ? spin : <Trash2 className="w-3.5 h-3.5" />}
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>İncelemeyi sil</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{post?.title}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
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
            {saving === "draft" ? spin : <FileText className="w-3.5 h-3.5" />}
            {wasPublished ? "Yayından Kaldır" : "Taslak Kaydet"}
          </Button>

          {!wasPublished && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => form.submit("pending")} disabled={busy}>
              {saving === "pending" ? spin : <SendHorizontal className="w-3.5 h-3.5" />}
              Onaya Gönder
            </Button>
          )}

          <Button size="sm" className="gap-1.5" onClick={() => form.submit("published")} disabled={busy}>
            {saving === "published" ? spin : wasPublished ? <RefreshCw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {saving === "published" && uploadProgress !== null
              ? `Yükleniyor %${uploadProgress}`
              : wasPublished
                ? "Güncelle"
                : "Yayınla"}
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