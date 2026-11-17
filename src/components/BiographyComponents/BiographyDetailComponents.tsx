// src/components/BiographyComponents/BiographyDetailComponents.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import { Chips, InfoCard, PostDetailShell, Row, usePostDetail } from "@/components/content/PostDetail";
import { subscribeCategories } from "@/services/category.service";
import { useDefinitionDocs } from "@/lib/content-utils";
import type { Category } from "@/types/category";
import type { DefinitionDoc } from "@/services/definitions.service";
import AuthorSummary from "./AuthorSummary";
import { BIOGRAPHY_ROUTES } from "./useBiographyForm";

const nameMap = (docs: DefinitionDoc[], field: string) => new Map(docs.map((d) => [d.id, String(d[field] ?? "")]));
const names = (map: Map<string, string>, ids?: string[] | null) =>
  (ids ?? []).map((id) => map.get(id)).filter(Boolean) as string[];

export default function BiographyDetailComponents() {
  const detail = usePostDetail("biography", BIOGRAPHY_ROUTES.list);
  const content = detail.post?.content;

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);
  const periods = useDefinitionDocs("periods");
  const themes = useDefinitionDocs("themes");
  const tags = useDefinitionDocs("tags");

  const maps = useMemo(
    () => ({
      periods: nameMap(periods, "name"),
      themes: nameMap(themes, "name"),
      tags: nameMap(tags, "name"),
    }),
    [periods, themes, tags],
  );

  // İçerik güvenli hale getirilip gösteriliyor
  const html = useMemo(() => (content ? DOMPurify.sanitize(content) : ""), [content]);

  return (
    <PostDetailShell
      detail={detail}
      routes={BIOGRAPHY_ROUTES}
      plural="Biyografiler"
      singular="Biyografi"
      accusative="Biyografiyi"
      slugPrefix="/biyografi/"
      renderMain={(post) => (
        <Card className="overflow-hidden">
          {post.coverURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverURL} alt={post.coverAlt ?? ""} className="w-full aspect-video object-cover" />
          )}
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold tracking-tight">{post.title}</h2>
            {post.excerpt && <p className="text-sm italic text-muted-foreground mt-3">{post.excerpt}</p>}
            <div className="rich-editor mt-4 -mx-5">
              <div className="tiptap !min-h-0" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </CardContent>
        </Card>
      )}
      renderSidebar={(post) => (
        <>
          <InfoCard title="Hakkında">
            <AuthorSummary authorId={post.authorId ?? null} />
          </InfoCard>
          <InfoCard title="Biyografi Bilgileri">
            <Row label="Kategori">{categories.find((c) => c.id === post.categoryId)?.title}</Row>
            <Row label="Dönem / Akım">{names(maps.periods, post.periodIds).join(", ")}</Row>
            <Row label="Okuma süresi">{post.readingTime ? `~${post.readingTime} dk` : null}</Row>
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