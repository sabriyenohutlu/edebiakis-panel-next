// src/components/DailyWordComponents/DailyWordDetailComponents.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Chips, InfoCard, PostDetailShell, Row, usePostDetail } from "@/components/content/PostDetail";
import { subscribeCategories } from "@/services/category.service";
import { useDefinitionDocs } from "@/lib/content-utils";
import type { Category } from "@/types/category";
import type { DefinitionDoc } from "@/services/definitions.service";
import QuotePreview from "./QuotePreview";
import { DAILY_WORD_ROUTES } from "./useDailyWordForm";

const nameMap = (docs: DefinitionDoc[], field: string) => new Map(docs.map((d) => [d.id, String(d[field] ?? "")]));
const names = (map: Map<string, string>, ids?: string[] | null) =>
  (ids ?? []).map((id) => map.get(id)).filter(Boolean) as string[];

export default function DailyWordDetailComponents() {
  const detail = usePostDetail("dailyword", DAILY_WORD_ROUTES.list);

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);
  const authors = useDefinitionDocs("authors");
  const works = useDefinitionDocs("works");
  const themes = useDefinitionDocs("themes");
  const tags = useDefinitionDocs("tags");

  const maps = useMemo(
    () => ({
      authors: nameMap(authors, "fullName"),
      works: nameMap(works, "title"),
      themes: nameMap(themes, "name"),
      tags: nameMap(tags, "name"),
    }),
    [authors, works, themes, tags],
  );

  return (
    <PostDetailShell
      detail={detail}
      routes={DAILY_WORD_ROUTES}
      plural="Günün Sözü"
      singular="Söz"
      accusative="Sözü"
      showSeo={false}
      renderMain={(post) => (
        <Card>
          <CardContent className="pt-6">
            <QuotePreview
              size="lg"
              text={post.content}
              author={post.authorId ? maps.authors.get(post.authorId) : undefined}
              work={post.workId ? maps.works.get(post.workId) : undefined}
            />
          </CardContent>
        </Card>
      )}
      renderSidebar={(post) => (
        <>
          <InfoCard title="Söz Bilgileri">
            <Row label="Söz sahibi">{post.authorId ? maps.authors.get(post.authorId) : "Anonim"}</Row>
            <Row label="Kaynak eser">{post.workId && maps.works.get(post.workId)}</Row>
            <Row label="Yayın günü">
              {post.displayDate &&
                new Date(`${post.displayDate}T00:00:00`).toLocaleDateString("tr-TR", { dateStyle: "long" })}
            </Row>
            <Row label="Kategori">{categories.find((c) => c.id === post.categoryId)?.title}</Row>
          </InfoCard>
          <InfoCard title="Temalar">
            <Chips items={names(maps.themes, post.themeIds)} />
          </InfoCard>
          <InfoCard title="Etiketler">
            <Chips items={names(maps.tags, post.tagIds)} />
          </InfoCard>
        </>
      )}
    />
  );
}