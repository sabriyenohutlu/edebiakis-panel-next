// src/components/ReviewComponents/ReviewForm/ReviewBookCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { FormField, SectionCard } from "@/components/content/form-parts";
import { cn } from "@/apilib/utils";
import type { ReviewForm } from "./useReviewForm";

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`${n} puan`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(value === n ? null : n)} // Aynı yıldıza tekrar tıklamak puanı kaldırır
          className="p-0.5 disabled:opacity-50"
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-xs text-muted-foreground tabular-nums">{value ? `${value}/5` : "Puan verilmedi"}</span>
    </div>
  );
}

export default function ReviewBookCard({ form }: { form: ReviewForm }) {
  const { values, errors, options, busy, selectedWork } = form;
  const year = selectedWork?.firstPublished?.year;

  return (
    <SectionCard title="İncelenen Kitap">
      <FormField
        label="Kitap"
        required
        error={errors.workId}
        description={
          <>
            Listede yoksa{" "}
            <Link href="/icerik-yonetimi/tanimlamalar?tip=eser" className="underline hover:text-foreground">
              Tanımlamalar › Eserler
            </Link>{" "}
            bölümünden ekleyin.
          </>
        }
      >
        <Combobox
          clearable
          options={options.works}
          value={values.workId}
          onChange={form.setWork}
          placeholder="İncelenen kitabı seçin"
          searchPlaceholder="Kitap ara..."
          emptyText="Kitap bulunamadı"
          error={!!errors.workId}
          disabled={busy}
        />
      </FormField>

      {/* Seçilen kitabın özeti */}
      {selectedWork && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-2.5">
          {selectedWork.coverURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedWork.coverURL} alt="" className="w-10 h-14 rounded object-cover shrink-0" />
          ) : (
            <div className="w-10 h-14 rounded bg-muted flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{selectedWork.title}</p>
            <p className="text-xs text-muted-foreground">
              {[selectedWork.originalTitle, year].filter(Boolean).join(" · ") || "Kitap tanımı"}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Kitabın Yazarı" description="Kitap seçilince otomatik dolar">
          <Combobox
            clearable
            options={options.authors}
            value={values.authorId}
            onChange={(v) => form.setField("authorId", v)}
            placeholder="Yazar seçin"
            emptyText="Yazar bulunamadı"
            disabled={busy}
          />
        </FormField>

        <FormField label="Dönem / Akım" description="Opsiyonel">
          <Combobox
            multiple
            options={options.periods}
            value={values.periodIds}
            onChange={(v) => form.setField("periodIds", v)}
            placeholder="Dönem seçin"
            emptyText="Dönem bulunamadı"
            disabled={busy}
          />
        </FormField>
      </div>

      <FormField label="Editör Puanı" description="Opsiyonel">
        <RatingInput value={values.rating} onChange={(v) => form.setField("rating", v)} disabled={busy} />
      </FormField>
    </SectionCard>
  );
}