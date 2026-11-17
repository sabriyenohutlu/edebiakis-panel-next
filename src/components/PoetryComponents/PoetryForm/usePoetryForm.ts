// src/components/PoetryComponents/PoetryForm/usePoetryForm.ts
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
import { meterOptions } from "@/config/definitions.config";
import type { Category } from "@/types/category";
import type { Post, PostStatus } from "@/types/post";

// Sayfa adresleri — klasör yapın farklıysa sadece burayı değiştir
export const POETRY_ROUTES = {
  list: "/icerik-yonetimi/siir/tum-siirler",
  create: "/icerik-yonetimi/siir/siir-ekle",
  detail: (id: string) => `/icerik-yonetimi/siir/${id}`,
  edit: (id: string) => `/icerik-yonetimi/siir/${id}/duzenle`,
};

export const METER_OPTIONS: ComboboxOption[] = Object.entries(meterOptions).map(([value, o]) => ({
  value,
  label: o.label,
}));

export type PoetryFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  authorId: string | null; // Şair
  formId: string | null;   // Nazım şekli
  meter: string | null;
  periodIds: string[];
  categoryId: string | null;
  tagIds: string[];
  themeIds: string[];
  socialPostIds: string[];
  isFeatured: boolean;
};

export type PoetryFormErrors = Partial<Record<keyof PoetryFormValues | "coverAlt", string>>;

const emptyValues: PoetryFormValues = {
  title: "", slug: "", excerpt: "", content: "", seoTitle: "", metaDescription: "",
  authorId: null, formId: null, meter: null, periodIds: [],
  categoryId: null, tagIds: [], themeIds: [], socialPostIds: [], isFeatured: false,
};

function valuesFromPost(post: Post): PoetryFormValues {
  const autoMeta = makeExcerpt(post.excerpt ?? "", META_DESC.max);
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    seoTitle: post.seo?.title && post.seo.title !== post.title ? post.seo.title : "",
    metaDescription: post.seo?.description && post.seo.description !== autoMeta ? post.seo.description : "",
    authorId: post.authorId ?? null,
    formId: post.formId ?? null,
    meter: post.meter ?? null,
    periodIds: post.periodIds ?? [],
    categoryId: post.categoryId ?? null,
    tagIds: post.tagIds ?? [],
    themeIds: post.themeIds ?? [],
    socialPostIds: post.socialPostIds ?? [],
    isFeatured: post.isFeatured ?? false,
  };
}

export function usePoetryForm({ post }: { post?: Post } = {}) {
  const router = useRouter();
  const mode: "create" | "edit" = post ? "edit" : "create";

  const [postId] = useState(() => post?.id ?? newPostId());
  const [values, setValues] = useState<PoetryFormValues>(() => (post ? valuesFromPost(post) : emptyValues));
  const [contentText, setContentText] = useState(() => (post ? htmlToText(post.content ?? "") : ""));
  const [cover, setCover] = useState<ImageValue>(() =>
    post?.coverURL
      ? { file: null, url: post.coverURL, path: post.coverPath ?? null, alt: post.coverAlt ?? "" }
      : emptyImage,
  );
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [errors, setErrors] = useState<PoetryFormErrors>({});
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  // ——— Seçim listeleri ———
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);

  const poetOptions = useDefinitionOptions("authors", "fullName");
  const periodOptions = useDefinitionOptions("periods", "name");
  const tagOptions = useDefinitionOptions("tags", "name");
  const themeOptions = useDefinitionOptions("themes", "name");
  const socialOptions = useDefinitionOptions("socialPosts", "title");

  // Sadece şiirde kullanılabilen türler (gazel, koşma, sone…)
  const genreDocs = useDefinitionDocs("genres");
  const formOptions = useMemo(
    () => toOptions(genreDocs.filter((g) => g.scope === "poem" || g.scope === "both"), "name"),
    [genreDocs],
  );

  const categoryOptions = useMemo<ComboboxOption[]>(
    () =>
      categories
        .filter((c) => c.post_type === "poetry")
        .map((c) => {
          const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
          return { value: c.id, label: parent ? `${parent.title} › ${c.title}` : c.title };
        }),
    [categories],
  );

  const wordCount = countWords(contentText);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const autoExcerpt = makeExcerpt(contentText);

  // ——— Alan güncelleme ———
  const clearError = (key: keyof PoetryFormErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof PoetryFormValues>(key: K, value: PoetryFormValues[K]) => {
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

  const setContent = (html: string, text: string) => {
    setValues((prev) => ({ ...prev, content: html }));
    setContentText(text);
    clearError("content");
  };

  const updateCover = (value: ImageValue) => {
    setCover(value);
    clearError("coverAlt");
  };

  const uploadContentImage = async (file: File) => {
    const msg = validateImage(file);
    if (msg) throw new Error(msg);
    const { url } = await uploadImage(file, `posts/${postId}/content/${Date.now()}.${fileExt(file)}`);
    return url;
  };

  // ——— Doğrulama ———
  const validate = (status: PostStatus) => {
    const e: PoetryFormErrors = {};
    if (!values.title.trim()) e.title = "Başlık zorunludur";
    if (!values.slug.trim()) e.slug = "Slug zorunludur";
    if (values.excerpt.length > EXCERPT_LIMIT) e.excerpt = `Özet en fazla ${EXCERPT_LIMIT} karakter olabilir`;

    if (status !== "draft") {
      if (!values.authorId) e.authorId = "Şairi seçin";
      if (!values.categoryId) e.categoryId = "Kategori seçin";
      if (!contentText.trim()) {
        e.content = "Şiir metni gerekli";
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
        post_type: "poetry",
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
        authorId: values.authorId,
        formId: values.formId,
        meter: values.meter,
        periodIds: values.periodIds,
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

      // Kaydettikten sonra şiirin detay sayfasına git
      router.push(POETRY_ROUTES.detail(postId));
    } catch (err) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      setSubmitError(err instanceof Error ? err.message : "Şiir kaydedilemedi");
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
      router.push(POETRY_ROUTES.list);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Şiir silinemedi");
      setDeleting(false);
    }
  };

  return {
    mode,
    post,
    postId,
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
    options: {
      poets: poetOptions,
      forms: formOptions,
      meters: METER_OPTIONS,
      periods: periodOptions,
      categories: categoryOptions,
      tags: tagOptions,
      themes: themeOptions,
      social: socialOptions,
    },
    setField,
    setTitle,
    setSlug,
    setContent,
    setCover: updateCover,
    uploadContentImage,
    submit,
    remove,
    cancel: () => router.push(post ? POETRY_ROUTES.detail(post.id) : POETRY_ROUTES.list),
  };
}

export type PoetryForm = ReturnType<typeof usePoetryForm>;