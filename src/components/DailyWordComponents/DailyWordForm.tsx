// src/components/DailyWordComponents/DailyWordForm.tsx
"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import PostFormHeader from "@/components/content/PostFormHeader";
import RelatedSocialCard from "@/components/content/RelatedSocialCard";
import { CharCount, FormField, SectionCard } from "@/components/content/form-parts";
import { cn } from "@/apilib/utils";
import QuotePreview from "./QuotePreview";
import { DAILY_WORD_ROUTES, QUOTE_LIMIT, useDailyWordForm, type DailyWordForm } from "./useDailyWordForm";

export function DailyWordFormLayout({ form }: { form: DailyWordForm }) {
  const { values, errors, options, busy } = form;
  const isEdit = form.mode === "edit";

  return (
    <div className="flex flex-col gap-5">
      <PostFormHeader
        breadcrumb={`Günün Sözü › ${isEdit ? "Düzenle" : "Yeni Söz"}`}
        title={isEdit ? form.post?.title || "Sözü Düzenle" : "Yeni Söz"}
        status={form.post?.status}
        saving={form.saving}
        deleting={form.deleting}
        busy={busy}
        uploadProgress={null}
        submitError={form.submitError}
        onSubmit={form.submit}
        onCancel={form.cancel}
        onDelete={isEdit ? form.remove : undefined}
        deleteTitle="Sözü sil"
        extra={
          isEdit && (
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <Link href={DAILY_WORD_ROUTES.detail(form.postId)}>
                <Eye className="w-3.5 h-3.5" />
                Görüntüle
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <SectionCard title="Söz">
            <FormField
              label="Söz"
              required
              hint={<CharCount count={values.text.length} min={20} max={QUOTE_LIMIT} />}
              error={errors.text}
            >
              <Textarea
                value={values.text}
                onChange={(e) => form.setField("text", e.target.value)}
                rows={5}
                placeholder="Sözü buraya yazın..."
                disabled={busy}
                className={cn("text-base leading-relaxed", errors.text && "border-destructive")}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Söz Sahibi" description="Boş bırakılırsa anonim gösterilir">
                <Combobox
                  clearable
                  options={options.authors}
                  value={values.authorId}
                  onChange={form.setAuthor}
                  placeholder="Yazar seçin"
                  searchPlaceholder="Yazar ara..."
                  emptyText="Yazar bulunamadı"
                  disabled={busy}
                />
              </FormField>
              <FormField label="Kaynak Eser" description="Sözün geçtiği eser (opsiyonel)">
                <Combobox
                  clearable
                  options={options.works}
                  value={values.workId}
                  onChange={(v) => form.setField("workId", v)}
                  placeholder="Eser seçin"
                  searchPlaceholder="Eser ara..."
                  emptyText={values.authorId ? "Bu yazara ait eser yok" : "Eser bulunamadı"}
                  disabled={busy}
                />
              </FormField>
            </div>

            <FormField
              label="Yayın Günü"
              error={errors.displayDate}
              description="Sözün sitede gösterileceği gün. Her güne bir söz atanabilir."
            >
              <Input
                type="date"
                value={values.displayDate}
                onChange={(e) => form.setField("displayDate", e.target.value)}
                disabled={busy}
                className={cn("h-8 text-sm w-48", errors.displayDate && "border-destructive")}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Önizleme">
            <QuotePreview text={values.text.trim()} author={form.authorName} work={form.workTitle} />
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-5">
          <SectionCard title="Sınıflandırma">
            <FormField label="Kategori" required error={errors.categoryId}>
              <Combobox
                options={options.categories}
                value={values.categoryId}
                onChange={(v) => form.setField("categoryId", v)}
                placeholder="Kategori seçin"
                emptyText="Günün Sözü kategorisi bulunamadı"
                error={!!errors.categoryId}
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
          </SectionCard>

          <RelatedSocialCard
            options={options.social}
            value={values.socialPostIds}
            onChange={(v) => form.setField("socialPostIds", v)}
            disabled={busy}
          />

          <SectionCard title="Ayarlar">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="isFeatured" className="text-xs font-medium">Öne çıkan söz</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Öne çıkanlarda gösterilir</p>
              </div>
              <Switch
                id="isFeatured"
                checked={values.isFeatured}
                onCheckedChange={(v) => form.setField("isFeatured", v)}
                disabled={busy}
              />
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

const AddDailyWordComponents = () => {
  const form = useDailyWordForm();
  return <DailyWordFormLayout form={form} />;
};

export default AddDailyWordComponents;