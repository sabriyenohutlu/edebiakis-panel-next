// src/components/ReviewComponents/ReviewForm/ReviewSidebar.tsx
"use client";

import { BookImage } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RelatedSocialCard from "@/components/content/RelatedSocialCard";
import { FormField, SectionCard } from "@/components/content/form-parts";
import type { ReviewForm } from "./useReviewForm";

export default function ReviewSidebar({ form }: { form: ReviewForm }) {
  const { values, errors, options, busy, cover, selectedWork } = form;
  const canUseWorkCover = !!selectedWork?.coverURL && !cover.file && cover.url !== selectedWork.coverURL;

  return (
    <aside className="flex flex-col gap-5">
      {/* Kapak */}
      <SectionCard title="Kapak Görseli">
        <ImageUpload
          value={cover}
          onChange={form.setCover}
          progress={form.uploadProgress}
          disabled={busy}
          altError={errors.coverAlt}
        />
        {canUseWorkCover && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={form.applyWorkCover}
            disabled={busy}
          >
            <BookImage className="w-3.5 h-3.5" />
            Kitabın kapağını kullan
          </Button>
        )}
      </SectionCard>

      {/* Sınıflandırma */}
      <SectionCard title="Sınıflandırma">
        <FormField label="Kategori" required error={errors.categoryId}>
          <Combobox
            options={options.categories}
            value={values.categoryId}
            onChange={(v) => form.setField("categoryId", v)}
            placeholder="Kategori seçin"
            emptyText="Kitap kategorisi bulunamadı"
            error={!!errors.categoryId}
            disabled={busy}
          />
        </FormField>

        <FormField label="Etiketler">
          <Combobox
            multiple
            options={options.tags}
            value={values.tagIds}
            onChange={(v) => form.setField("tagIds", v)}
            placeholder="Etiket seçin"
            emptyText="Etiket bulunamadı"
            disabled={busy}
          />
        </FormField>

        <FormField label="Temalar">
          <Combobox
            multiple
            options={options.themes}
            value={values.themeIds}
            onChange={(v) => form.setField("themeIds", v)}
            placeholder="Tema seçin"
            emptyText="Tema bulunamadı"
            disabled={busy}
          />
        </FormField>
      </SectionCard>

      <RelatedSocialCard
        options={options.social}
        value={values.socialPostIds}
        onChange={(v) => form.setField("socialPostIds", v)}
        disabled={busy}
      />

      {/* Ayarlar */}
      <SectionCard title="Ayarlar">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="isFeatured" className="text-xs font-medium">Öne çıkan inceleme</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ana sayfadaki öne çıkanlarda gösterilir</p>
          </div>
          <Switch
            id="isFeatured"
            checked={values.isFeatured}
            onCheckedChange={(v) => form.setField("isFeatured", v)}
            disabled={busy}
          />
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-xs">
          <span className="text-muted-foreground">Okuma süresi</span>
          <span className="font-medium tabular-nums">{form.wordCount > 0 ? `~${form.readingTime} dk` : "—"}</span>
        </div>
      </SectionCard>
    </aside>
  );
}