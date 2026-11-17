// src/types/post.ts
import type { Timestamp } from "firebase/firestore";
import type { PostType } from "@/types/category";

export type PostStatus = "draft" | "pending" | "published";

export interface Post {
  id: string;
  post_type: PostType;
  title: string;
  slug: string;
  excerpt: string; // Liste ve kartlarda görünen kısa özet
  content: string; // Yazının gövdesi
  coverURL: string | null;

  categoryId: string | null; // categories/{id}
  authorId: string | null; // authors/{id} — yazının ilgili olduğu yazar (opsiyonel)
  tagIds: string[]; // tags/{id}
  themeIds: string[]; // themes/{id}
formId?: string | null;   // genres/{id} — nazım şekli
meter?: string | null; 
  status: PostStatus;
  isFeatured: boolean;
  readingTime: number | null; // Dakika
  viewCount: number;
  book_kind?: "review" | "recommendation";
  publishedAt: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  authorName: string;
  displayDate?: string | null; 
  coverPath: string | null;
  workId?: string | null; // works/{id} — incelenen kitap
  periodIds?: string[]; // periods/{id}
  rating?: number | null; // 1–5 editör puanı
  // users/{uid} — yazıyı panelde ekleyen kişi
  coverAlt: string | null;
  seo: {
    title: string; // <title> etiketi
    description: string; // <meta name="description">
  };
  socialPostIds: string[];
}

export const postStatusConfig: Record<
  PostStatus,
  { label: string; color: string; mantineColor: string }
> = {
  draft: {
    label: "Taslak",
    color: "bg-gray-100 text-gray-700",
    mantineColor: "gray",
  },
  pending: {
    label: "Beklemede",
    color: "bg-amber-100 text-amber-700",
    mantineColor: "yellow",
  },
  published: {
    label: "Yayında",
    color: "bg-emerald-100 text-emerald-700",
    mantineColor: "green",
  },
};
