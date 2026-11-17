// src/components/PoetryComponents/PoetryForm/PoetryContentSection.tsx
"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import RichTextEditor from "@/components/editor/RichTextEditor";
import SeoCard from "@/components/content/SeoCard";
import { CharCount, FormField, SectionCard } from "@/components/content/form-parts";
import { EXCERPT_LIMIT } from "@/lib/content-utils";
import { cn } from "@/apilib/utils";
import type { PoetryForm } from "./usePoetryForm";

export default function PoetryContentSection({ form }: { form: PoetryForm }) {
  const { values, errors, busy, options } = form;

  return (
    <div className="flex flex-col gap-5 min-w-0">
      <SectionCard title="Şair ve Biçim">
        <FormField
          label="Şair"
          required
          error={errors.authorId}
          description={
            <>
              Listede yoksa{" "}
              <Link href="/icerik-yonetimi/tanimlamalar?tip=yazar" className="underline hover:text-foreground">
                Tanımlamalar › Yazarlar
              </Link>{" "}
              bölümünden ekleyin.
            </>
          }
        >
          <Combobox
            clearable
            options={options.poets}
            value={values.authorId}
            onChange={(v) => form.setField("authorId", v)}
            placeholder="Şairi seçin"
            searchPlaceholder="Şair ara..."
            emptyText="Şair bulunamadı"
            error={!!errors.authorId}
            disabled={busy}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Nazım Şekli" description="Opsiyonel">
            <Combobox
              clearable
              options={options.forms}
              value={values.formId}
              onChange={(v) => form.setField("formId", v)}
              placeholder="Seçin"
              emptyText="Nazım şekli yok"
              disabled={busy}
            />
          </FormField>
          <FormField label="Ölçü" description="Opsiyonel">
            <Combobox
              clearable
              options={options.meters}
              value={values.meter}
              onChange={(v) => form.setField("meter", v)}
              placeholder="Seçin"
              disabled={busy}
            />
          </FormField>
          <FormField label="Dönem / Akım" description="Opsiyonel">
            <Combobox
              multiple
              options={options.periods}
              value={values.periodIds}
              onChange={(v) => form.setField("periodIds", v)}
              placeholder="Seçin"
              emptyText="Dönem bulunamadı"
              disabled={busy}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Şiir Bilgileri">
        <FormField label="Şiir Başlığı (H1)" required error={errors.title} description="Sayfada en üstte görünen ana başlık.">
          <Input
            value={values.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder="Şiirin adı"
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
              /siir/
            </span>
            <input
              value={values.slug}
              onChange={(e) => form.setSlug(e.target.value)}
              disabled={busy}
              placeholder="siirin-adi"
              className="flex-1 h-full px-2.5 text-sm bg-transparent outline-none font-mono"
            />
          </div>
        </FormField>

        <FormField
          label="Özet"
          hint={<CharCount count={values.excerpt.length} min={50} max={EXCERPT_LIMIT} />}
          error={errors.excerpt}
          description="Liste ve kartlarda görünür. Boşsa şiirin ilk dizelerinden oluşturulur."
        >
          <Textarea
            value={values.excerpt}
            onChange={(e) => form.setField("excerpt", e.target.value)}
            placeholder={form.autoExcerpt || "Şiir hakkında kısa bir not"}
            rows={3}
            disabled={busy}
            className={cn("text-sm resize-none", errors.excerpt && "border-destructive")}
          />
        </FormField>
      </SectionCard>

      <FormField
        label="Şiir Metni"
        hint={form.wordCount > 0 ? `${form.wordCount} kelime` : undefined}
        error={errors.content}
        description="Dize sonunda Shift+Enter, yeni kıta için Enter kullanın."
      >
        <RichTextEditor
          value={values.content}
          onChange={form.setContent}
          onUploadImage={form.uploadContentImage}
          placeholder="Şiiri buraya yazın..."
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
        path={`/siir/${values.slug || "siir-adresi"}`}
        disabled={busy}
      />
    </div>
  );
}