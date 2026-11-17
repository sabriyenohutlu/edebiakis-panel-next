// src/components/BiographyComponents/AuthorSummary.tsx
"use client";

import { UserRound } from "lucide-react";
import { useDefinitionDocs } from "@/lib/content-utils";
import type { LiteraryDate } from "@/types/definitions";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function formatLiteraryDate(d?: LiteraryDate | null) {
  if (!d?.year) return null;
  const parts = [d.day, d.month ? MONTHS[d.month - 1] : undefined, d.year].filter(Boolean);
  return `${d.approximate ? "~ " : ""}${parts.join(" ")}`;
}

export default function AuthorSummary({ authorId }: { authorId: string | null }) {
  const authors = useDefinitionDocs("authors");
  const geographies = useDefinitionDocs("geographies");
  const nationalities = useDefinitionDocs("nationalities");
  const works = useDefinitionDocs("works");

  const author = authors.find((a) => a.id === authorId);
  if (!authorId || !author) return null;

  const place = (id?: string | null) => (id ? geographies.find((g) => g.id === id)?.name : undefined);
  const birth = formatLiteraryDate(author.birthDate);
  const death = formatLiteraryDate(author.deathDate);
  const birthPlace = place(author.birthPlaceId);
  const deathPlace = place(author.deathPlaceId);
  const nations = (author.nationalityIds ?? [])
    .map((id: string) => nationalities.find((n) => n.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  const workCount = works.filter((w) => (w.authorIds ?? []).includes(author.id)).length;
  const penNames: string[] = author.penNames ?? [];

  return (
    <div className="flex gap-3 rounded-md border bg-muted/30 p-3">
      {author.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.photoURL} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
          <UserRound className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 text-xs space-y-0.5">
        <p className="text-sm font-medium">{author.fullName}</p>
        {penNames.length > 0 && <p className="text-muted-foreground">Mahlas: {penNames.join(", ")}</p>}
        {birth && (
          <p>
            <span className="text-muted-foreground">Doğum:</span> {birth}
            {birthPlace && `, ${birthPlace}`}
          </p>
        )}
        {death && (
          <p>
            <span className="text-muted-foreground">Ölüm:</span> {death}
            {deathPlace && `, ${deathPlace}`}
          </p>
        )}
        {nations && (
          <p>
            <span className="text-muted-foreground">Milliyet:</span> {nations}
          </p>
        )}
        <p className="text-muted-foreground">{workCount} eser tanımlı</p>
        {author.shortBio && <p className="text-muted-foreground line-clamp-3 pt-1">{author.shortBio}</p>}
      </div>
    </div>
  );
}