// src/components/content/SeoCard.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharCount, FormField, SectionCard } from "./form-parts";

export const SEO_TITLE = { min: 30, max: 60 };
export const META_DESC = { min: 70, max: 160 };

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || "edebiakis.com";

type Props = {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  fallbackTitle: string;       // Boşsa kullanılacak (H1)
  fallbackDescription: string; // Boşsa kullanılacak (özet)
  path: string;                // "/blog/yazi-slug"
  disabled?: boolean;
};

export default function SeoCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  fallbackTitle,
  fallbackDescription,
  path,
  disabled,
}: Props) {
  const effectiveTitle = title.trim() || fallbackTitle.trim();
  const effectiveDesc = description.trim() || fallbackDescription.trim();

  return (
    <SectionCard title="SEO">
      <FormField
        label="SEO Başlığı"
        hint={<CharCount count={effectiveTitle.length} {...SEO_TITLE} />}
        description="Arama sonuçlarında ve tarayıcı sekmesinde görünür. Boşsa yazı başlığı kullanılır."
      >
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={fallbackTitle || "Arama sonuçlarındaki başlık"}
          disabled={disabled}
          className="h-8 text-sm"
        />
      </FormField>

      <FormField
        label="Meta Açıklama"
        hint={<CharCount count={effectiveDesc.length} {...META_DESC} />}
        description="Arama sonucunda başlığın altında görünür. Boşsa özet kullanılır."
      >
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={fallbackDescription || "Yazıyı arama sonucunda anlatan 1-2 cümle"}
          rows={3}
          disabled={disabled}
          className="text-sm resize-none"
        />
      </FormField>

      {/* Google önizlemesi */}
      <div className="rounded-md border bg-muted/30 p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Google önizlemesi</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {SITE}
          {path}
        </p>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400 line-clamp-1 mt-0.5">
          {effectiveTitle || "SEO başlığı"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{effectiveDesc || "Meta açıklama"}</p>
      </div>
    </SectionCard>
  );
}