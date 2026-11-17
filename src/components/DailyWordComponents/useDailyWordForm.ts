// src/components/DailyWordComponents/useDailyWordForm.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeCategories } from "@/services/category.service";
import {
  createPost, deletePost, isDisplayDateTaken, newPostId, updatePost, type PostInput,
} from "@/services/post.service";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { PostRoutes } from "@/components/content/PostsTable";
import { makeExcerpt, toOptions, useDefinitionDocs, useDefinitionOptions } from "@/lib/content-utils";
import type { Category } from "@/types/category";
import type { Post, PostStatus } from "@/types/post";

// Sayfa adresleri — klasör yapın farklıysa sadece burayı değiştir
export const DAILY_WORD_ROUTES: PostRoutes = {
  list: "/icerik-yonetimi/gunluk-soz/tum-sozler",
  create: "/icerik-yonetimi/gunluk-soz/soz-ekle",
  detail: (id) => `/icerik-yonetimi/gunluk-soz/${id}`,
  edit: (id) => `/icerik-yonetimi/gunluk-soz/${id}/duzenle`,
};

export const QUOTE_LIMIT = 500;

export type DailyWordValues = {
  text: string;
  authorId: string | null;
  workId: string | null;
  displayDate: string; // "YYYY-MM-DD" veya ""
  categoryId: string | null;
  tagIds: string[];
  themeIds: string[];
  socialPostIds: string[];
  isFeatured: boolean;
};

type Errors = Partial<Record<keyof DailyWordValues, string>>;

const emptyValues: DailyWordValues = {
  text: "", authorId: null, workId: null, displayDate: "",
  categoryId: null, tagIds: [], themeIds: [], socialPostIds: [], isFeatured: false,
};

const valuesFromPost = (post: Post): DailyWordValues => ({
  text: post.content ?? "",
  authorId: post.authorId ?? null,
  workId: post.workId ?? null,
  displayDate: post.displayDate ?? "",
  categoryId: post.categoryId ?? null,
  tagIds: post.tagIds ?? [],
  themeIds: post.themeIds ?? [],
  socialPostIds: post.socialPostIds ?? [],
  isFeatured: post.isFeatured ?? false,
});

export function useDailyWordForm({ post }: { post?: Post } = {}) {
  const router = useRouter();
  const mode: "create" | "edit" = post ? "edit" : "create";

  const [postId] = useState(() => post?.id ?? newPostId());
  const [values, setValues] = useState<DailyWordValues>(() => (post ? valuesFromPost(post) : emptyValues));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ——— Seçim listeleri ———
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);

  const authorDocs = useDefinitionDocs("authors");
  const workDocs = useDefinitionDocs("works");
  const authorOptions = useMemo(() => toOptions(authorDocs, "fullName"), [authorDocs]);
  const tagOptions = useDefinitionOptions("tags", "name");
  const themeOptions = useDefinitionOptions("themes", "name");
  const socialOptions = useDefinitionOptions("socialPosts", "title");

  // Yazar seçiliyse sadece onun eserleri
  const workOptions = useMemo(
    () =>
      toOptions(
        values.authorId ? workDocs.filter((w) => (w.authorIds ?? []).includes(values.authorId)) : workDocs,
        "title",
      ),
    [workDocs, values.authorId],
  );

  const categoryOptions = useMemo<ComboboxOption[]>(
    () =>
      categories
        .filter((c) => c.post_type === "dailyword")
        .map((c) => {
          const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
          return { value: c.id, label: parent ? `${parent.title} › ${c.title}` : c.title };
        }),
    [categories],
  );

  const authorName = authorDocs.find((a) => a.id === values.authorId)?.fullName as string | undefined;
  const workTitle = workDocs.find((w) => w.id === values.workId)?.title as string | undefined;

  // ——— Alan güncelleme ———
  const setField = <K extends keyof DailyWordValues>(key: K, value: DailyWordValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  // Yazar değişince, yeni yazara ait olmayan eser seçimini temizle
  const setAuthor = (authorId: string | null) => {
    setValues((prev) => {
      const work = workDocs.find((w) => w.id === prev.workId);
      const keepWork = !authorId || !work || (work.authorIds ?? []).includes(authorId);
      return { ...prev, authorId, workId: keepWork ? prev.workId : null };
    });
  };

  // ——— Doğrulama ———
  const validate = (status: PostStatus) => {
    const e: Errors = {};
    if (!values.text.trim()) e.text = "Söz zorunludur";
    else if (values.text.length > QUOTE_LIMIT) e.text = `Söz en fazla ${QUOTE_LIMIT} karakter olabilir`;
    if (status !== "draft" && !values.categoryId) e.categoryId = "Kategori seçin";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ——— Kaydetme ———
  const submit = async (status: PostStatus) => {
    if (!validate(status)) {
      setSubmitError("Lütfen işaretli alanları kontrol edin.");
      return;
    }

    try {
      setSaving(status);
      setSubmitError("");

      if (values.displayDate && status !== "draft" && (await isDisplayDateTaken(values.displayDate, post?.id))) {
        setErrors((prev) => ({ ...prev, displayDate: "Bu güne başka bir söz atanmış" }));
        setSubmitError("Lütfen işaretli alanları kontrol edin.");
        return;
      }

      const text = values.text.trim();
      const short = makeExcerpt(text, 80);

      const data: PostInput = {
        post_type: "dailyword",
        title: short,
        slug: post?.slug ?? `soz-${postId.toLowerCase()}`,
        excerpt: text,
        content: text, // Söz düz metin olarak tutulur
        coverURL: null,
        coverPath: null,
        coverAlt: null,
        seo: {
          title: authorName ? `${short} — ${authorName}` : short,
          description: makeExcerpt(text, 160),
        },
        authorId: values.authorId,
        workId: values.workId,
        displayDate: values.displayDate || null,
        categoryId: values.categoryId,
        tagIds: values.tagIds,
        themeIds: values.themeIds,
        socialPostIds: values.socialPostIds,
        status,
        isFeatured: values.isFeatured,
        readingTime: null,
      };

      if (post) await updatePost(post, data);
      else await createPost(postId, data);

      router.push(DAILY_WORD_ROUTES.detail(postId));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Söz kaydedilemedi");
    } finally {
      setSaving(null);
    }
  };

  const remove = async () => {
    if (!post) return;
    try {
      setDeleting(true);
      await deletePost(post);
      router.push(DAILY_WORD_ROUTES.list);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Söz silinemedi");
      setDeleting(false);
    }
  };

  return {
    mode,
    post,
    postId,
    values,
    errors,
    saving,
    deleting,
    busy: saving !== null || deleting,
    submitError,
    authorName,
    workTitle,
    options: {
      authors: authorOptions,
      works: workOptions,
      categories: categoryOptions,
      tags: tagOptions,
      themes: themeOptions,
      social: socialOptions,
    },
    setField,
    setAuthor,
    submit,
    remove,
    cancel: () => router.push(post ? DAILY_WORD_ROUTES.detail(post.id) : DAILY_WORD_ROUTES.list),
  };
}

export type DailyWordForm = ReturnType<typeof useDailyWordForm>;