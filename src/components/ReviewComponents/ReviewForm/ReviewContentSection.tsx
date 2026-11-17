// src/components/ReviewComponents/ReviewForm/ReviewContentSection.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/editor/RichTextEditor";
import SeoCard from "@/components/content/SeoCard";
import { CharCount, FormField, SectionCard } from "@/components/content/form-parts";
import { EXCERPT_LIMIT } from "@/lib/content-utils";
import { cn } from "@/apilib/utils";
import type { ReviewForm } from "./useReviewForm";

export default function ReviewContentSection({ form }: { form: ReviewForm }) {
  const { values, errors, busy, selectedWork } = form;

  return (
    <>
      <SectionCard title="İnceleme Bilgileri">
        <FormField label="İnceleme Başlığı (H1)" required error={errors.title} description="Sayfada en üstte görünen ana başlık.">
          <Input
            value={values.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder={selectedWork ? `${selectedWork.title} üzerine bir inceleme` : "İncelemenin başlığı"}
            disabled={busy}
            className={cn("h-10 text-base font-medium", errors.title && "border-destructive")}
          />
        </FormField>

        <FormField label="Slug" required error={errors.slug}>
          <div
            className={cn(
              "flex items-center h-8 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring",
              errors.slug && "border-destructive",
            )}
          >
            <span className="px-2.5 text-xs text-muted-foreground bg-muted border-r border-input h-full flex items-center shrink-0">
              /inceleme/
            </span>
            <input
              value={values.slug}
              onChange={(e) => form.setSlug(e.target.value)}
              disabled={busy}
              placeholder="inceleme-basligi"
              className="flex-1 h-full px-2.5 text-sm bg-transparent outline-none font-mono"
            />
          </div>
        </FormField>

        <FormField
          label="Özet"
          hint={<CharCount count={values.excerpt.length} min={50} max={EXCERPT_LIMIT} />}
          error={errors.excerpt}
          description="Liste ve kartlarda görünür. Boşsa içeriğin başından otomatik oluşturulur."
        >
          <Textarea
            value={values.excerpt}
            onChange={(e) => form.setField("excerpt", e.target.value)}
            placeholder={form.autoExcerpt || "İncelemenin kısa özeti"}
            rows={4}
            disabled={busy}
            className={cn("text-sm resize-none", errors.excerpt && "border-destructive")}
          />
        </FormField>
      </SectionCard>

      <FormField
        label="İnceleme İçeriği"
        hint={form.wordCount > 0 ? `${form.wordCount} kelime · ~${form.readingTime} dk okuma` : undefined}
        error={errors.content}
      >
        <RichTextEditor
          value={values.content}
          onChange={form.setContent}
          onUploadImage={form.uploadContentImage}
          placeholder="İncelemenizi buraya yazın..."
          error={!!errors.content}
          disabled={busy}
        />
      </FormField>

      <SeoCard
        title={values.seoTitle}
        description={values.metaDescription}
        onTitleChange={(v) => form.setField("seoTitle", v)}
        onDescriptionChange={(v) => form.setField("metaDescription", v)}
        fallbackTitle={values.title}
        fallbackDescription={values.excerpt || form.autoExcerpt}
        path={`/inceleme/${values.slug || "inceleme-adresi"}`}
        disabled={busy}
      />
    </>
  );
}