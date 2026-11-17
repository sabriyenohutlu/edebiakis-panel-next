// src/components/BlogComponents/BlogForm/useBlogForm.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeCategories } from "@/services/category.service";
import { subscribeDefinitions } from "@/services/definitions.service";
import {
  createPost,
  deletePost,
  isPostSlugTaken,
  newPostId,
  updatePost,
  type PostInput,
} from "@/services/post.service";
import { deleteImage, uploadImage, validateImage } from "@/services/storage.service";
import { emptyImage, type ImageValue } from "@/components/ui/image-upload";
import { META_DESC } from "@/components/content/SeoCard";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { Category } from "@/types/category";
import type { Post, PostStatus } from "@/types/post";

// Liste sayfanın gerçek adresi; tablo linkleri de buradan okunuyor
export const LIST_URL = "/icerik-yonetimi/edebiyat-yazilari/tum-yazilar";
export const EXCERPT_LIMIT = 300;

// ——— Yardımcılar ———

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

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);
const fileExt = (file: File) => file.name.split(".").pop()?.toLowerCase() || "jpg";

// Kayıtlı HTML'den düz metin (kelime sayısı ve doğrulama için)
const htmlToText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countImagesWithoutAlt = (html: string) =>
  (html.match(/<img\b(?![^>]*\balt="[^"]+")[^>]*>/gi) ?? []).length;

function makeExcerpt(text: string, max = EXCERPT_LIMIT) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}

function useDefinitionOptions(collectionName: string, labelField: string) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  useEffect(() => {
    return subscribeDefinitions(
      collectionName,
      (docs) =>
        setOptions(
          docs
            .map((d) => ({ value: d.id, label: String(d[labelField] || "(adsız)") }))
            .sort((a, b) => a.label.localeCompare(b.label, "tr")),
        ),
      () => {},
    );
  }, [collectionName, labelField]);
  return options;
}

// ——— Tipler ———

export type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  categoryId: string | null;
  tagIds: string[];
  themeIds: string[];
  authorId: string | null;
  socialPostIds: string[];
  isFeatured: boolean;
};

export type BlogFormErrors = Partial<Record<keyof BlogFormValues | "coverAlt", string>>;

const initialValues: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seoTitle: "",
  metaDescription: "",
  categoryId: null,
  tagIds: [],
  themeIds: [],
  authorId: null,
  socialPostIds: [],
  isFeatured: false,
};

// Kayıtlı yazıdan form değerleri. SEO alanları otomatik üretilmişse boş gösterilir,
// böylece başlık/özet değişince SEO da onlarla birlikte güncellenmeye devam eder.
function valuesFromPost(post: Post): BlogFormValues {
  const autoMeta = makeExcerpt(post.excerpt ?? "", META_DESC.max);
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    seoTitle: post.seo?.title && post.seo.title !== post.title ? post.seo.title : "",
    metaDescription:
      post.seo?.description && post.seo.description !== autoMeta ? post.seo.description : "",
    categoryId: post.categoryId ?? null,
    tagIds: post.tagIds ?? [],
    themeIds: post.themeIds ?? [],
    authorId: post.authorId ?? null,
    socialPostIds: post.socialPostIds ?? [],
    isFeatured: post.isFeatured ?? false,
  };
}

// ——— Hook ———

export function useBlogForm({ post }: { post?: Post } = {}) {
  const router = useRouter();
  const mode: "create" | "edit" = post ? "edit" : "create";

  const [postId] = useState(() => post?.id ?? newPostId());
  const [values, setValues] = useState<BlogFormValues>(() =>
    post ? valuesFromPost(post) : initialValues,
  );
  const [contentText, setContentText] = useState(() => (post ? htmlToText(post.content ?? "") : ""));
  const [cover, setCover] = useState<ImageValue>(() =>
    post?.coverURL
      ? { file: null, url: post.coverURL, path: post.coverPath ?? null, alt: post.coverAlt ?? "" }
      : emptyImage,
  );
  const [slugManual, setSlugManual] = useState(mode === "edit"); // Düzenlemede URL sabit kalsın
  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  // Seçim listeleri
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);
  const tagOptions = useDefinitionOptions("tags", "name");
  const themeOptions = useDefinitionOptions("themes", "name");
  const authorOptions = useDefinitionOptions("authors", "fullName");
  const socialOptions = useDefinitionOptions("socialPosts", "title");

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    return categories
      .filter((c) => c.post_type === "blog")
      .map((c) => {
        const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
        return { value: c.id, label: parent ? `${parent.title} › ${c.title}` : c.title };
      });
  }, [categories]);

  const wordCount = countWords(contentText);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const autoExcerpt = makeExcerpt(contentText);

  // ——— Alan güncelleme ———

  const clearError = (key: keyof BlogFormErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
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
    const e: BlogFormErrors = {};
    if (!values.title.trim()) e.title = "Başlık zorunludur";
    if (!values.slug.trim()) e.slug = "Slug zorunludur";
    if (values.excerpt.length > EXCERPT_LIMIT) e.excerpt = `Özet en fazla ${EXCERPT_LIMIT} karakter olabilir`;

    if (status === "published") {
      if (!contentText.trim()) {
        e.content = "Yayınlamak için içerik gerekli";
      } else {
        const missing = countImagesWithoutAlt(values.content);
        if (missing > 0)
          e.content = `${missing} görselin alt metni eksik. Görsele tıklayıp araç çubuğundaki "Alt" butonuyla ekleyin.`;
      }
      if (!values.categoryId) e.categoryId = "Yayınlamak için kategori seçin";
      if ((cover.file || cover.url) && !cover.alt.trim()) e.coverAlt = "Kapak görseli için alt metin girin";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ——— Kaydetme (ekleme ve güncelleme) ———

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
        const res = await uploadImage(
          cover.file,
          `posts/${postId}/cover-${Date.now()}.${fileExt(cover.file)}`,
          setUploadProgress,
        );
        uploadedPath = res.path;
        coverURL = res.url;
        coverPath = res.path;
      }

      const title = values.title.trim();
      const excerpt = values.excerpt.trim() || autoExcerpt;

      const data: PostInput = {
        post_type: "blog",
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
        categoryId: values.categoryId,
        authorId: values.authorId,
        tagIds: values.tagIds,
        themeIds: values.themeIds,
        socialPostIds: values.socialPostIds,
        status,
        isFeatured: values.isFeatured,
        readingTime: wordCount > 0 ? readingTime : null,
      };

      if (post) {
        await updatePost(post, data);
        // Kapak değiştirildi veya kaldırıldıysa eskisini temizle
        if (post.coverPath && post.coverPath !== coverPath) {
          await deleteImage(post.coverPath).catch(() => {});
        }
      } else {
        await createPost(postId, data);
      }

      router.push(LIST_URL);
    } catch (err) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      setSubmitError(err instanceof Error ? err.message : "Yazı kaydedilemedi");
    } finally {
      setSaving(null);
      setUploadProgress(null);
    }
  };

  // ——— Silme (sadece düzenlemede) ———

  const remove = async () => {
    if (!post) return;
    try {
      setDeleting(true);
      setSubmitError("");
      await deletePost(post);
      router.push(LIST_URL);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Yazı silinemedi");
      setDeleting(false);
    }
  };

  return {
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
    options: {
      categories: categoryOptions,
      tags: tagOptions,
      themes: themeOptions,
      authors: authorOptions,
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
    cancel: () => router.push(LIST_URL),
  };
}

export type BlogForm = ReturnType<typeof useBlogForm>;