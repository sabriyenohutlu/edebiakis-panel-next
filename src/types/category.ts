import type { Timestamp } from "firebase/firestore";

export type PostType = "book" | "poetry" | "story" | "blog" | "biography" | "dailyword";

export type Category = {
  id: string;
  name: string;
  title: string;
  slug: string;
  post_type: PostType;
  description: string | null;
  parent_id: string | null;
  contentCount: number;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export const postTypeConfig: Record<PostType, { label: string; color: string; mantineColor: string }> = {
  book:      { label: "book",      color: "bg-violet-100 text-violet-700",   mantineColor: "violet" },
  poetry:    { label: "poetry",    color: "bg-emerald-100 text-emerald-700", mantineColor: "teal" },
  story:     { label: "story",     color: "bg-blue-100 text-blue-700",       mantineColor: "cyan" },
  blog:      { label: "blog",      color: "bg-sky-100 text-sky-700",         mantineColor: "blue" },
  biography: { label: "biography", color: "bg-amber-100 text-amber-700",     mantineColor: "yellow" },
  dailyword: { label: "dailyword", color: "bg-pink-100 text-pink-700",       mantineColor: "pink" },
};
