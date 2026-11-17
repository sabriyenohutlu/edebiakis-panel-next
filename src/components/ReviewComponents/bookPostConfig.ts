// src/components/ReviewComponents/bookPostConfig.ts
export type BookKind = "review" | "recommendation";

export type BookPostConfig = {
  kind: BookKind;
  singular: string;         // "İnceleme"
  plural: string;           // "Kitap İncelemeleri"
  newTitle: string;         // "Yeni Kitap İncelemesi"
  accusative: string;       // "İncelemeyi"
  workLabel: string;        // "İncelenen Kitap"
  titleSuffix: string;      // Başlık önerisi: "<kitap adı> üzerine bir inceleme"
  slugPrefix: string;       // "/inceleme/"
  routes: { list: string; create: string; edit: (id: string) => string };
};

export const BOOK_CONFIGS: Record<BookKind, BookPostConfig> = {
  review: {
    kind: "review",
    singular: "İnceleme",
    plural: "Kitap İncelemeleri",
    newTitle: "Yeni Kitap İncelemesi",
    accusative: "İncelemeyi",
    workLabel: "İncelenen Kitap",
    titleSuffix: "üzerine bir inceleme",
    slugPrefix: "/inceleme/",
    routes: {
      list: "/icerik-yonetimi/kitap/inceleme/tum-incelemeler",
      create: "/icerik-yonetimi/kitap/inceleme/inceleme-ekle",
      edit: (id) => `/icerik-yonetimi/kitap/inceleme/${id}/duzenle`,
    },
  },
  recommendation: {
    kind: "recommendation",
    singular: "Öneri",
    plural: "Kitap Önerileri",
    newTitle: "Yeni Kitap Önerisi",
    accusative: "Öneriyi",
    workLabel: "Önerilen Kitap",
    titleSuffix: "neden okunmalı?",
    slugPrefix: "/oneri/",
    routes: {
      list: "/icerik-yonetimi/kitap/oneri/tum-oneriler",
      create: "/icerik-yonetimi/kitap/oneriler/oneri-ekle",
      edit: (id) => `/icerik-yonetimi/kitap/oneri/${id}/duzenle`,
    },
  },
};