// src/types/definitions.ts
import type { Timestamp } from "firebase/firestore";

// ——— Ortak ———

export type DefinitionStatus = "draft" | "published";

export interface BaseDefinition {
  id: string;
  slug: string;
  status: DefinitionStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string; // users/{uid}
}

// Eski yazarlar için kısmi tarih: "1207", "1207 civarı", "3 Mart 1902"
export interface LiteraryDate {
  year: number;
  month?: number; // 1-12
  day?: number;
  approximate?: boolean; // "civarı"
}

// ——— 1. Yazar ———

export interface Author extends BaseDefinition {
  fullName: string;              // Gerçek adı: "Mehmet Âkif Ersoy"
  penNames: string[];            // Mahlas / takma ad: ["Âkif"]
  shortBio: string;              // Liste ve kartlarda görünen 1-2 cümle
  biography: string;             // Uzun biyografi (zengin metin)
  photoURL: string | null;

  birthDate: LiteraryDate | null;
  deathDate: LiteraryDate | null;
  birthPlaceId: string | null;   // geographies/{id}
  deathPlaceId: string | null;   // geographies/{id}

  nationalityIds: string[];      // nationalities/{id}
  periodIds: string[];           // periods/{id} — dönem ve akımlar
  genreIds: string[];            // genres/{id} — eser verdiği türler
  themeIds: string[];            // themes/{id}
  tagIds: string[];              // tags/{id}

  occupations: string[];         // "şair", "romancı", "gazeteci"
  externalLinks: { label: string; url: string }[]; // Vikipedi vb.
  isFeatured: boolean;
}

// ——— 2. Eser / Kitap ———

export interface Work extends BaseDefinition {
  title: string;
  originalTitle: string | null;  // Çeviri eserlerde özgün adı
  authorIds: string[];           // Ortak yazarlı eserler için dizi
  translators: string[];

  genreIds: string[];            // roman, hikâye kitabı, deneme, tiyatro…
  periodIds: string[];
  themeIds: string[];
  settingIds: string[];          // geographies/{id} — eserin geçtiği yerler
  tagIds: string[];

  firstPublished: LiteraryDate | null;
  language: string;              // "tr"
  originalLanguage: string | null;
  publisher: string | null;
  pageCount: number | null;
  isbn: string | null;

  summary: string;
  coverURL: string | null;
  isFeatured: boolean;
}

// ——— 3. Şiir ———

export type PoemMeter = "aruz" | "hece" | "serbest" | "diger";

export interface Poem extends BaseDefinition {
  title: string;
  authorId: string;              // authors/{id}
  workId: string | null;         // works/{id} — yer aldığı şiir kitabı

  text: string;                  // Şiir metni (satır sonları korunur)
  formId: string | null;         // genres/{id} — nazım şekli: gazel, koşma, sone…
  meter: PoemMeter;              // Ölçü
  meterDetail: string | null;    // "fâilâtün fâilâtün fâilün", "7+7"
  rhymeScheme: string | null;    // Kafiye düzeni: "aaba"
  stanzaCount: number | null;

  writtenDate: LiteraryDate | null;
  periodIds: string[];
  themeIds: string[];
  tagIds: string[];

  note: string | null;           // Editör notu / açıklama
}

// ——— 4. Tür / Alt Tür ———

export type GenreScope = "work" | "poem" | "both";

export interface Genre extends BaseDefinition {
  name: string;                  // "Roman", "Gazel", "Psikolojik Roman"
  parentId: string | null;       // Alt tür ise üst türün ID'si
  scope: GenreScope;             // Eserlerde mi, şiirlerde mi seçilebilir
  description: string;
  characteristics: string[];     // Türün belirgin özellikleri
}

// ——— 5. Tema ———

export interface Theme extends BaseDefinition {
  name: string;                  // "Aşk", "Ölüm", "Gurbet", "Vatan"
  description: string;
  relatedThemeIds: string[];     // "Gurbet" ↔ "Özlem"
}

// ——— 6. Dönem / Akım ———

export type PeriodKind = "period" | "movement"; // Dönem mi, akım mı

export interface Period extends BaseDefinition {
  name: string;                  // "Tanzimat", "Servet-i Fünun", "Garip Akımı"
  kind: PeriodKind;
  parentId: string | null;       // "Tanzimat 1. Dönem" → "Tanzimat"
  startYear: number | null;
  endYear: number | null;
  geographyIds: string[];        // Hangi edebiyatlara ait
  description: string;
  characteristics: string[];     // Dönemin/akımın temel özellikleri
}

// ——— 7. Edebiyat Coğrafyası ———

export type GeographyKind = "continent" | "country" | "region" | "city";

export interface Geography extends BaseDefinition {
  name: string;                  // "Anadolu", "İstanbul", "Balkanlar"
  kind: GeographyKind;
  parentId: string | null;       // İstanbul → Türkiye
  description: string;
  coordinates: { lat: number; lng: number } | null; // İleride harita için
}

// ——— 8. Milliyet ———

export interface Nationality extends BaseDefinition {
  name: string;                  // "Türk", "Rus", "Fransız"
  countryName: string;           // "Türkiye"
  countryCode: string;           // ISO-3166 alpha-2: "TR"
}

// ——— 9. Etiket ———

export interface Tag extends BaseDefinition {
  name: string;
  color: string | null;
}

// ——— 10. Sosyal Medya İçeriği ———

export type SocialPlatform = "instagram" | "x" | "facebook" | "tiktok" | "youtube" | "linkedin";

export type SocialContentType =
  | "quote"              // Alıntı
  | "poem_excerpt"       // Şiirden kesit
  | "author_anniversary" // Doğum / ölüm yıl dönümü
  | "book_recommendation"
  | "daily_word"
  | "other";

export type SocialStatus = "draft" | "scheduled" | "published";

export type LinkedEntityType = "author" | "work" | "poem" | "period" | "theme";

export interface SocialPost extends Omit<BaseDefinition, "status"> {
  title: string;                 // Panelde görünen iç başlık
  platforms: SocialPlatform[];
  contentType: SocialContentType;
  caption: string;
  hashtags: string[];
  mediaURLs: string[];

  linkedEntity: { type: LinkedEntityType; id: string } | null; // İlgili yazar/eser/şiir

  status: SocialStatus;
  scheduledAt: Timestamp | null;
  publishedAt: Timestamp | null;
  postURLs: Partial<Record<SocialPlatform, string>>; // Yayından sonra linkler
}