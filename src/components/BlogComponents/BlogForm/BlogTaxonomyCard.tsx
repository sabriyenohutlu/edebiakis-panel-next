// src/components/BlogComponents/BlogForm/BlogTaxonomyCard.tsx
"use client";

import { Combobox } from "@/components/ui/combobox";
import { FormField, SectionCard } from "@/components/content/form-parts";
import type { BlogForm } from "./useBlogForm";

export default function BlogTaxonomyCard({ form }: { form: BlogForm }) {
  const { values, errors, options, busy } = form;

  return (
    <SectionCard title="Sınıflandırma">
      <FormField label="Kategori" required error={errors.categoryId}>
        <Combobox
          options={options.categories}
          value={values.categoryId}
          onChange={(v) => form.setField("categoryId", v)}
          placeholder="Kategori seçin"
          emptyText="Blog kategorisi bulunamadı"
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

      <FormField label="İlgili Yazar">
        <Combobox
          clearable
          options={options.authors}
          value={values.authorId}
          onChange={(v) => form.setField("authorId", v)}
          placeholder="Yazı bir yazarla ilgiliyse"
          emptyText="Yazar bulunamadı"
          disabled={busy}
        />
      </FormField>
    </SectionCard>
  );
}