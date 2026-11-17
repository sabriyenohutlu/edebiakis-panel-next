// src/components/content/RelatedSocialCard.tsx
"use client";

import Link from "next/link";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { SectionCard } from "./form-parts";

type Props = {
  options: ComboboxOption[];
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
};

export default function RelatedSocialCard({ options, value, onChange, disabled }: Props) {
  return (
    <SectionCard title="İlgili Sosyal Medya">
      <Combobox
        multiple
        options={options}
        value={value}
        onChange={onChange}
        placeholder="İçerik seçin (opsiyonel)"
        searchPlaceholder="Sosyal medya içeriği ara..."
        emptyText="Sosyal medya içeriği bulunamadı"
        disabled={disabled}
      />
      <p className="text-[10px] text-muted-foreground">
        Listede yoksa{" "}
        <Link href="/icerik-yonetimi/tanimlamalar?tip=sosyal-medya" className="underline hover:text-foreground">
          Tanımlamalar › Sosyal Medya
        </Link>{" "}
        bölümünden ekleyebilirsiniz.
      </p>
    </SectionCard>
  );
}