// src/lib/content-utils.ts
import { useEffect, useMemo, useState } from "react";
import { subscribeDefinitions, type DefinitionDoc } from "@/services/definitions.service";
import type { ComboboxOption } from "@/components/ui/combobox";

export const EXCERPT_LIMIT = 300;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
export const fileExt = (file: File) => file.name.split(".").pop()?.toLowerCase() || "jpg";

export const htmlToText = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const countImagesWithoutAlt = (html: string) =>
  (html.match(/<img\b(?![^>]*\balt="[^"]+")[^>]*>/gi) ?? []).length;

export function makeExcerpt(text: string, max = EXCERPT_LIMIT) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}

export function toOptions(docs: DefinitionDoc[], labelField: string): ComboboxOption[] {
  return docs
    .map((d) => ({ value: d.id, label: String(d[labelField] || "(adsız)") }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));
}

// Tanım koleksiyonunu canlı dinler (eser, yazar, etiket…)
export function useDefinitionDocs(collectionName: string) {
  const [docs, setDocs] = useState<DefinitionDoc[]>([]);
  useEffect(() => subscribeDefinitions(collectionName, setDocs, () => {}), [collectionName]);
  return docs;
}

export function useDefinitionOptions(collectionName: string, labelField: string) {
  const docs = useDefinitionDocs(collectionName);
  return useMemo(() => toOptions(docs, labelField), [docs, labelField]);
}