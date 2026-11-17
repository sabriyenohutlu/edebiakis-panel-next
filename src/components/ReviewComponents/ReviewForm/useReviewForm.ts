// src/components/ReviewComponents/ReviewForm/useReviewForm.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeCategories } from "@/services/category.service";
import {
  createPost, deletePost, isPostSlugTaken, newPostId, updatePost, type PostInput,
} from "@/services/post.service";
import { deleteImage, uploadImage, validateImage } from "@/services/storage.service";
import { emptyImage, type ImageValue } from "@/components/ui/image-upload";
import { META_DESC } from "@/components/content/SeoCard";
import type { ComboboxOption } from "@/components/ui/combobox";
import {
  EXCERPT_LIMIT, countImagesWithoutAlt, countWords, fileExt, htmlToText, makeExcerpt,
  slugify, toOptions, useDefinitionDocs, useDefinitionOptions,
} from "@/lib/content-utils";
import type { Category } from "@/types/category";
import type { Post, PostStatus } from "@/types/post";
import type { BookPostConfig } from "../bookPostConfig";

export type ReviewFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  workId: string | null;
  authorId: string | null;
  periodIds: string[];
  rating: number | null;
  categoryId: string | null;
  tagIds: string[];
  themeIds: string[];
  socialPostIds: string[];
  isFeatured: boolean;
};

export type ReviewFormErrors = Partial<Record<keyof ReviewFormValues | "coverAlt", string>>;

const emptyValues: ReviewFormValues = {
  title: "", slug: "", excerpt: "", content: "", seoTitle: "", metaDescription: "",
  workId: null, authorId: null, periodIds: [], rating: null,
  categoryId: null, tagIds: [], themeIds: [], socialPostIds: [], isFeatured: false,
};

function valuesFromPost(post: Post): ReviewFormValues {
  const autoMeta = makeExcerpt(post.excerpt ?? "", META_DESC.max);
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    seoTitle: post.seo?.title && post.seo.title !== post.title ? post.seo.title : "",
    metaDescription: post.seo?.description && post.seo.description !== autoMeta ? post.seo.description : "",
    workId: post.workId ?? null,
    authorId: post.authorId ?? null,
    periodIds: post.periodIds ?? [],
    rating: post.rating ?? null,
    categoryId: post.categoryId ?? null,
    tagIds: post.tagIds ?? [],
    themeIds: post.themeIds ?? [],
    socialPostIds: post.socialPostIds ?? [],
    isFeatured: post.isFeatured ?? false,
  };
}

export function useReviewForm({ post, config }: { post?: Post; config: BookPostConfig }) {
  const router = useRouter();
  const mode: "create" | "edit" = post ? "edit" : "create";
  const singularLower = config.singular.toLocaleLowerCase("tr");

  const [postId] = useState(() => post?.id ?? newPostId());
  const [values, setValues] = useState<ReviewFormValues>(() => (post ? valuesFromPost(post) : emptyValues));
  const [contentText, setContentText] = useState(() => (post ? htmlToText(post.content ?? "") : ""));
  const [cover, setCover] = useState<ImageValue>(() =>
    post?.coverURL
      ? { file: null, url: post.coverURL, path: post.coverPath ?? null, alt: post.coverAlt ?? "" }
      : emptyImage,
  );
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  // ——— Seçim listeleri ———
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);

  const workDocs = useDefinitionDocs("works");
  const workOptions = useMemo(() => toOptions(workDocs, "title"), [workDocs]);
  const authorOptions = useDefinitionOptions("authors", "fullName");
  const periodOptions = useDefinitionOptions("periods", "name");
  const tagOptions = useDefinitionOptions("tags", "name");
  const themeOptions = useDefinitionOptions("themes", "name");
  const socialOptions = useDefinitionOptions("socialPosts", "title");

  // Sadece kitap kategorileri
  const categoryOptions = useMemo<ComboboxOption[]>(
    () =>
      categories
        .filter((c) => c.post_type === "book")
        .map((c) => {
          const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
          return { value: c.id, label: parent ? `${parent.title} › ${c.title}` : c.title };
        }),
    [categories],
  );

  const selectedWork = workDocs.find((w) => w.id === values.workId) ?? null;

  const wordCount = countWords(contentText);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const autoExcerpt = makeExcerpt(contentText);

  // ——— Alan güncelleme ———
  const clearError = (key: keyof ReviewFormErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const setTitle = (title: string) => {
    setValues((prev) => ({ ...prev, title, slug: slugManual ? prev.slug : slugify(title) }));
    clearError("title");
    clearError("slug");
  };

  const setSlug = (slug: string) => {
    setSlugManual(true);
    setField("slug", slugify(slug));
  };

  // Kitap seçilince boş olan yazar ve dönem alanları kitabın tanımından dolar
  const setWork = (workId: string | null) => {
    const work = workDocs.find((w) => w.id === workId);
    setValues((prev) => ({
      ...prev,
      workId,
      authorId: prev.authorId ?? work?.authorIds?.[0] ?? null,
      periodIds: prev.periodIds.length ? prev.periodIds : (work?.periodIds ?? []),
    }));
    clearError("workId");
  };

  const setContent = (html: string, text: string) => {
    setValues((prev) => ({ ...prev, content: html }));
    setContentText(text);
    clearError("content");
  };

  const updateCover = (value: ImageValue) => {
    setCover(value);
    clearError("coverAlt");
  };

  // Kitabın tanımındaki kapağı yazının kapağı olarak kullan
  const applyWorkCover = () => {
    if (!selectedWork?.coverURL) return;
    updateCover({ file: null, url: selectedWork.coverURL, path: null, alt: `${selectedWork.title} kitap kapağı` });
  };

  const uploadContentImage = async (file: File) => {
    const msg = validateImage(file);
    if (msg) throw new Error(msg);
    const { url } = await uploadImage(file, `posts/${postId}/content/${Date.now()}.${fileExt(file)}`);
    return url;
  };

  // ——— Doğrulama: taslak için başlık yeter; onaya gönderme ve yayın için her şey tam olmalı ———
  const validate = (status: PostStatus) => {
    const e: ReviewFormErrors = {};
    if (!values.title.trim()) e.title = "Başlık zorunludur";
    if (!values.slug.trim()) e.slug = "Slug zorunludur";
    if (values.excerpt.length > EXCERPT_LIMIT) e.excerpt = `Özet en fazla ${EXCERPT_LIMIT} karakter olabilir`;

    if (status !== "draft") {
      if (!values.workId) e.workId = "Kitap seçin";
      if (!values.categoryId) e.categoryId = "Kategori seçin";
      if (!contentText.trim()) {
        e.content = `${config.singular} içeriği gerekli`;
      } else {
        const missing = countImagesWithoutAlt(values.content);
        if (missing > 0) e.content = `${missing} görselin alt metni eksik. Görsele tıklayıp "Alt" butonuyla ekleyin.`;
      }
      if ((cover.file || cover.url) && !cover.alt.trim()) e.coverAlt = "Kapak görseli için alt metin girin";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ——— Kaydetme ———
  const submit = async (status: PostStatus) => {
    if (!validate(status)) {
      setSubmitError("Lütfen işaretli alanları kontrol edin.");
      return;
    }

    let uploadedPath: string | null = null;

    try {
      setSaving(status);
      setSubmitError("");

      if (await isPostSlugTaken(values.slug, post?.id)) {
        setErrors((prev) => ({ ...prev, slug: "Bu slug başka bir yazıda kullanılıyor" }));
        setSubmitError("Lütfen işaretli alanları kontrol edin.");
        return;
      }

      let coverURL = cover.url;
      let coverPath = cover.path;
      if (cover.file) {
        setUploadProgress(0);
        const res = await uploadImage(cover.file, `posts/${postId}/cover-${Date.now()}.${fileExt(cover.file)}`, setUploadProgress);
        uploadedPath = res.path;
        coverURL = res.url;
        coverPath = res.path;
      }

      const title = values.title.trim();
      const excerpt = values.excerpt.trim() || autoExcerpt;

      const data: PostInput = {
        post_type: "book",
        book_kind: config.kind,
        title,
        slug: values.slug,
        excerpt,
        content: values.content,
        coverURL,
        coverPath,
        coverAlt: coverURL ? cover.alt.trim() || null : null,
        seo: {
          title: values.seoTitle.trim() || title,
          description: values.metaDescription.trim() || makeExcerpt(excerpt, META_DESC.max),
        },
        workId: values.workId,
        authorId: values.authorId,
        periodIds: values.periodIds,
        rating: values.rating,
        categoryId: values.categoryId,
        tagIds: values.tagIds,
        themeIds: values.themeIds,
        socialPostIds: values.socialPostIds,
        status,
        isFeatured: values.isFeatured,
        readingTime: wordCount > 0 ? readingTime : null,
      };

      if (post) {
        await updatePost(post, data);
        if (post.coverPath && post.coverPath !== coverPath) await deleteImage(post.coverPath).catch(() => {});
      } else {
        await createPost(postId, data);
      }

      router.push(config.routes.list);
    } catch (err) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      setSubmitError(err instanceof Error ? err.message : `${config.singular} kaydedilemedi`);
    } finally {
      setSaving(null);
      setUploadProgress(null);
    }
  };

  const remove = async () => {
    if (!post) return;
    try {
      setDeleting(true);
      setSubmitError("");
      await deletePost(post);
      router.push(config.routes.list);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : `${config.singular} silinemedi`);
      setDeleting(false);
    }
  };

  return {
    config,
    mode,
    post,
    values,
    errors,
    cover,
    saving,
    deleting,
    busy: saving !== null || deleting,
    uploadProgress,
    submitError,
    wordCount,
    readingTime,
    autoExcerpt,
    selectedWork,
    singularLower,
    options: {
      works: workOptions,
      authors: authorOptions,
      periods: periodOptions,
      categories: categoryOptions,
      tags: tagOptions,
      themes: themeOptions,
      social: socialOptions,
    },
    setField,
    setTitle,
    setSlug,
    setWork,
    setContent,
    setCover: updateCover,
    applyWorkCover,
    uploadContentImage,
    submit,
    remove,
    cancel: () => router.push(config.routes.list),
  };
}

export type ReviewForm = ReturnType<typeof useReviewForm>;