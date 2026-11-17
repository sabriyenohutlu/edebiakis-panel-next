// src/components/content/PostFormHeader.tsx
"use client";

import type { ReactNode } from "react";
import { FileText, Loader2, RefreshCw, Send, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/apilib/utils";
import { postStatusConfig, type PostStatus } from "@/types/post";

type Props = {
  breadcrumb: string;
  title: string;
  status?: PostStatus | null;          // Düzenlemede mevcut durum
  saving: PostStatus | null;
  deleting?: boolean;
  busy: boolean;
  uploadProgress: number | null;
  submitError: string;
  onSubmit: (status: PostStatus) => void;
  onCancel: () => void;
  onDelete?: () => void;               // Verilirse "Sil" butonu çıkar
  deleteTitle?: string;
  deleteDescription?: ReactNode;
  extra?: ReactNode;                   // Ek butonlar (ör. "Görüntüle")
};

const spin = <Loader2 className="w-3.5 h-3.5 animate-spin" />;

export default function PostFormHeader(p: Props) {
  const wasPublished = p.status === "published";
  const statusCfg = p.status ? postStatusConfig[p.status] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{p.breadcrumb}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight truncate">{p.title}</h1>
            {statusCfg && (
              <span className={cn("inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full", statusCfg.color)}>
                {statusCfg.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {p.onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={p.busy}
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {p.deleting ? spin : <Trash2 className="w-3.5 h-3.5" />}
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{p.deleteTitle ?? "Kaydı sil"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {p.deleteDescription ?? "Bu kayıt kalıcı olarak silinecek."} Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={p.onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {p.extra}

          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={p.onCancel} disabled={p.busy}>
            İptal
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => p.onSubmit("draft")} disabled={p.busy}>
            {p.saving === "draft" ? spin : <FileText className="w-3.5 h-3.5" />}
            {wasPublished ? "Yayından Kaldır" : "Taslak Kaydet"}
          </Button>

          {!wasPublished && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => p.onSubmit("pending")} disabled={p.busy}>
              {p.saving === "pending" ? spin : <SendHorizontal className="w-3.5 h-3.5" />}
              Onaya Gönder
            </Button>
          )}

          <Button size="sm" className="gap-1.5" onClick={() => p.onSubmit("published")} disabled={p.busy}>
            {p.saving === "published" ? spin : wasPublished ? <RefreshCw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {p.saving === "published" && p.uploadProgress !== null
              ? `Yükleniyor %${p.uploadProgress}`
              : wasPublished
                ? "Güncelle"
                : "Yayınla"}
          </Button>
        </div>
      </div>

      {p.submitError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {p.submitError}
        </div>
      )}
    </div>
  );
}