// src/components/BlogComponents/BlogForm/BlogCoverCard.tsx
"use client";

import ImageUpload from "@/components/ui/image-upload";
import { SectionCard } from "@/components/content/form-parts";
import type { BlogForm } from "./useBlogForm";

export default function BlogCoverCard({ form }: { form: BlogForm }) {
  return (
    <SectionCard title="Kapak Görseli">
      <ImageUpload
        value={form.cover}
        onChange={form.setCover}
        progress={form.uploadProgress}
        disabled={form.busy}
        altError={form.errors.coverAlt}
      />
      <p className="text-[10px] text-muted-foreground">Önerilen boyut 1200×675 (16:9).</p>
    </SectionCard>
  );
}