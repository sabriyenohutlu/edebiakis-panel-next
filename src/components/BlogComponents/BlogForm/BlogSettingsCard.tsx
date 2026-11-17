// src/components/BlogComponents/BlogForm/BlogSettingsCard.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "@/components/content/form-parts";
import type { BlogForm } from "./useBlogForm";

export default function BlogSettingsCard({ form }: { form: BlogForm }) {
  return (
    <SectionCard title="Ayarlar">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="isFeatured" className="text-xs font-medium">Öne çıkan yazı</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ana sayfadaki öne çıkanlarda gösterilir</p>
        </div>
        <Switch
          id="isFeatured"
          checked={form.values.isFeatured}
          onCheckedChange={(v) => form.setField("isFeatured", v)}
          disabled={form.busy}
        />
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-xs">
        <span className="text-muted-foreground">Okuma süresi</span>
        <span className="font-medium tabular-nums">{form.wordCount > 0 ? `~${form.readingTime} dk` : "—"}</span>
      </div>
    </SectionCard>
  );
}