import { Category, PostType } from "@/types/category";

// src/types/category.ts
export const postTypeConfig: Record<PostType, { label: string; color: string; mantineColor: string }> = {
  book:      { label: "book",      color: "bg-violet-100 text-violet-700",   mantineColor: "violet" },
  poetry:    { label: "poetry",    color: "bg-emerald-100 text-emerald-700", mantineColor: "teal" },
  story:     { label: "story",     color: "bg-blue-100 text-blue-700",       mantineColor: "cyan" },
  blog:      { label: "blog",      color: "bg-sky-100 text-sky-700",         mantineColor: "blue" },
  biography: { label: "biography", color: "bg-amber-100 text-amber-700",     mantineColor: "yellow" },
  dailyword: { label: "dailyword", color: "bg-pink-100 text-pink-700",       mantineColor: "pink" },
};
export const categoryData: Category[] = [
  { id: "1",  name: "book",      title: "Kitap",        slug: "book",         post_type: "book",      description: "Kitap türündeki tüm eserler",    parent_id: null, contentCount: 89,  order: 1  },
  { id: "2",  name: "book",      title: "Modern Roman", slug: "modern-roman", post_type: "book",      description: "Modern dönem kitapları",         parent_id: "1",  contentCount: 34,  order: 2  },
  { id: "3",  name: "book",      title: "Klasik Roman", slug: "klasik-roman", post_type: "book",      description: "Klasik dönem eserleri",          parent_id: "1",  contentCount: 22,  order: 3  },
  { id: "4",  name: "poetry",    title: "Şiir",         slug: "siir",         post_type: "poetry",    description: "Tüm şiir türleri",               parent_id: null, contentCount: 134, order: 4  },
  { id: "5",  name: "poetry",    title: "Lirik Şiir",   slug: "lirik-siir",   post_type: "poetry",    description: "Duygu yoğunluklu şiirler",       parent_id: "4",  contentCount: 67,  order: 5  },
  { id: "6",  name: "poetry",    title: "Epik Şiir",    slug: "epik-siir",    post_type: "poetry",    description: "Destansı şiirler",               parent_id: "4",  contentCount: 28,  order: 6  },
  { id: "7",  name: "blog",      title: "Blog",         slug: "blog",         post_type: "blog",      description: "Genel blog yazıları",            parent_id: null, contentCount: 48,  order: 7  },
  { id: "8",  name: "story",     title: "Hikaye",       slug: "hikaye",       post_type: "story",     description: "Kısa ve uzun hikayeler",         parent_id: null, contentCount: 31,  order: 8  },
  { id: "9",  name: "biography", title: "Biyografi",    slug: "biyografi",    post_type: "biography", description: "Yazar ve şair biyografileri",    parent_id: null, contentCount: 14,  order: 9  },
  { id: "10", name: "dailyword", title: "Günün Sözü",   slug: "gunun-sozu",   post_type: "dailyword", description: "Her güne özel alıntı ve sözler", parent_id: null, contentCount: 22,  order: 10 },
];