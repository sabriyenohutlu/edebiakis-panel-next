// src/components/BiographyComponents/useBiographyForm.ts
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
import { usePostsList } from "@/components/content/PostsList";
import type { PostRoutes } from "@/components/content/PostsTable";
import type { ComboboxOption } from "@/components/ui/combobox";
import {
  EXCERPT_LIMIT, countImagesWithoutAlt, countWords, fileExt, htmlToText, makeExcerpt,
  slugify, toOptions, useDefinitionDocs, useDefinitionOptions,
} from "@/lib/content-utils";
import type { Category } from "@/types/category";
import type { Post, PostStatus } from "@/types/post";

// Sayfa adresleri — klasör yapın farklıysa sadece burayı değiştir
export const BIOGRAPHY_ROUTES: PostRoutes = {
  list: "/icerik-yonetimi/biyografi/tum-biyografiler",
  create: "/icerik-yonetimi/biyografi/biyografi-ekle",
  detail: (id) => `/icerik-yonetimi/biyografi/${id}`,
  edit: (id) => `/icerik-yonetimi/biyografi/${id}/duzenle`,
};

export type BiographyValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  authorId: string | null; // Biyografisi yazılan kişi
  periodIds: string[];
  categoryId: string | null;
  tagIds: string[];
  themeIds: string[];
  socialPostIds: string[];
  isFeatured: boolean;
};

type Errors = Partial<Record<keyof BiographyValues | "coverAlt", string>>;

const emptyValues: BiographyValues = {
  title: "", slug: "", excerpt: "", content: "", seoTitle: "", metaDescription: "",
  authorId: null, periodIds: [], categoryId: null, tagIds: [], themeIds: [], socialPostIds: [], isFeatured: false,
};

function valuesFromPost(post: Post): BiographyValues {
  const autoMeta = makeExcerpt(post.excerpt ?? "", META_DESC.max);
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    seoTitle: post.seo?.title && post.seo.title !== post.title ? post.seo.title : "",
    metaDescription: post.seo?.description && post.seo.description !== autoMeta ? post.seo.description : "",
    authorId: post.authorId ?? null,
    periodIds: post.periodIds ?? [],
    categoryId: post.categoryId ?? null,
    tagIds: post.tagIds ?? [],
    themeIds: post.themeIds ?? [],
    socialPostIds: post.socialPostIds ?? [],
    isFeatured: post.isFeatured ?? false,
  };
}

export function useBiographyForm({ post }: { post?: Post } = {}) {
  const router = useRouter();
  const mode: "create" | "edit" = post ? "edit" : "create";

  const [postId] = useState(() => post?.id ?? newPostId());
  const [values, setValues] = useState<BiographyValues>(() => (post ? valuesFromPost(post) : emptyValues));
  const [contentText, setContentText] = useState(() => (post ? htmlToText(post.content ?? "") : ""));
  const [cover, setCover] = useState<ImageValue>(() =>
    post?.coverURL
      ? { file: null, url: post.coverURL, path: post.coverPath ?? null, alt: post.coverAlt ?? "" }
      : emptyImage,
  );
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<PostStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");

  // ——— Seçim listeleri ———
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => subscribeCategories(setCategories, () => {}), []);

  const authorDocs = useDefinitionDocs("authors");
  const authorOptions = useMemo(() => toOptions(authorDocs, "fullName"), [authorDocs]);
  const periodOptions = useDefinitionOptions("periods", "name");
  const tagOptions = useDefinitionOptions("tags", "name");
  const themeOptions = useDefinitionOptions("themes", "name");
  const socialOptions = useDefinitionOptions("socialPosts", "title");

  const categoryOptions = useMemo<ComboboxOption[]>(
    () =>
      categories
        .filter((c) => c.post_type === "biography")
        .map((c) => {
          const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
          return { value: c.id, label: parent ? `${parent.title} › ${c.title}` : c.title };
        }),
    [categories],
  );

  const selectedAuthor = authorDocs.find((a) => a.id === values.authorId) ?? null;

  // Aynı yazar için yazılmış diğer biyografiler (uyarı için)
  const { posts: allBiographies } = usePostsList("biography");
  const otherBiographies = useMemo(
    () => (values.authorId ? allBiographies.filter((p) => p.authorId === values.authorId && p.id !== postId) : []),
    [allBiographies, values.authorId, postId],
  );

  const wordCount = countWords(contentText);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const autoExcerpt = makeExcerpt(contentText);

  // ——— Alan güncelleme ———
  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof BiographyValues>(key: K, value: BiographyValues[K]) => {
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

  // Kişi seçilince boş olan dönem alanı yazarın tanımından dolar
  const setSubject = (authorId: string | null) => {
    const author = authorDocs.find((a) => a.id === authorId);
    setValues((prev) => ({
      ...prev,
      authorId,
      periodIds: prev.periodIds.length ? prev.periodIds : (author?.periodIds ?? []),
    }));
    clearError("authorId");
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

  const applyAuthorPhoto = () => {
    if (!selectedAuthor?.photoURL) return;
    updateCover({ file: null, url: selectedAuthor.photoURL, path: null, alt: `${selectedAuthor.fullName} portresi` });
  };

  const uploadContentImage = async (file: File) => {
    const msg = validateImage(file);
    if (msg) throw new Error(msg);
    const { url } = await uploadImage(file, `posts/${postId}/content/${Date.now()}.${fileExt(file)}`);
    return url;
  };

  // ——— Doğrulama ———
  const validate = (status: PostStatus) => {
    const e: Errors = {};
    if (!values.title.trim()) e.title = "Başlık zorunludur";
    if (!values.slug.trim()) e.slug = "Slug zorunludur";
    if (values.excerpt.length > EXCERPT_LIMIT) e.excerpt = `Özet en fazla ${EXCERPT_LIMIT} karakter olabilir`;

    if (status !== "draft") {
      if (!values.authorId) e.authorId = "Biyografisi yazılan kişiyi seçin";
      if (!values.categoryId) e.categoryId = "Kategori seçin";
      if (!contentText.trim()) {
        e.content = "Biyografi içeriği gerekli";
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
        post_type: "biography",
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

      router.push(BIOGRAPHY_ROUTES.detail(postId));
    } catch (err) {
      if (uploadedPath) await deleteImage(uploadedPath).catch(() => {});
      setSubmitError(err instanceof Error ? err.message : "Biyografi kaydedilemedi");
    } finally {
      setSaving(null);
      setUploadProgress(null);
    }
  };

  const remove = async () => {
    if (!post) return;
    try {
      setDeleting(true);
      await deletePost(post);
      router.push(BIOGRAPHY_ROUTES.list);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Biyografi silinemedi");
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
    selectedAuthor,
    otherBiographies,
    options: {
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
    setSubject,
    setContent,
    setCover: updateCover,
    applyAuthorPhoto,
    uploadContentImage,
    submit,
    remove,
    cancel: () => router.push(post ? BIOGRAPHY_ROUTES.detail(post.id) : BIOGRAPHY_ROUTES.list),
  };
}

export type BiographyForm = ReturnType<typeof useBiographyForm>;