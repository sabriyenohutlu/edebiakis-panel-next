// src/components/PoetryComponents/PoetryForm/PoetrySidebar.tsx
"use client";

import ImageUpload from "@/components/ui/image-upload";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RelatedSocialCard from "@/components/content/RelatedSocialCard";
import { FormField, SectionCard } from "@/components/content/form-parts";
import type { PoetryForm } from "./usePoetryForm";

export default function PoetrySidebar({ form }: { form: PoetryForm }) {
  const { values, errors, options, busy } = form;

  return (
    <aside className="flex flex-col gap-5">
      <SectionCard title="Kapak Görseli">
        <ImageUpload
          value={form.cover}
          onChange={form.setCover}
          progress={form.uploadProgress}
          disabled={busy}
          altError={errors.coverAlt}
        />
      </SectionCard>

      <SectionCard title="Sınıflandırma">
        <FormField label="Kategori" required error={errors.categoryId}>
          <Combobox
            options={options.categories}
            value={values.categoryId}
            onChange={(v) => form.setField("categoryId", v)}
            placeholder="Kategori seçin"
            emptyText="Şiir kategorisi bulunamadı"
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
            <Label htmlFor="isFeatured" className="text-xs font-medium">Öne çıkan şiir</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ana sayfadaki öne çıkanlarda gösterilir</p>
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
  );
}