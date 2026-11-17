// src/config/definitions.config.ts
import type { LucideIcon } from "lucide-react";
import {
  User, BookOpen, Feather, Shapes, Lightbulb, Hourglass, Globe, Flag, Tag, Share2,
} from "lucide-react";

export type DefinitionKey =
  | "yazar" | "eser" | "siir" | "tur" | "tema"
  | "donem" | "cografya" | "milliyet" | "etiket" | "sosyal-medya";

export type ColumnKind =
  | "title"      // Ana alan + ikincil alan + (varsa) görsel
  | "text" | "mono" | "number"
  | "badge"      // Tek seçimli alan (options ile)
  | "badges"     // Çok seçimli alan (options ile)
  | "status"
  | "date"       // LiteraryDate
  | "timestamp"  // Firestore Timestamp
  | "ref"        // Başka koleksiyona tek referans
  | "refs";      // Başka koleksiyona çoklu referans

type BadgeOptions = Record<string, { label: string; color: string }>;

export interface DefinitionColumn {
  key: string;
  header: string;
  kind: ColumnKind;
  size?: number;
  ref?: DefinitionKey;
  options?: BadgeOptions;
}

export type DefinitionGroup = "Temel" | "Sınıflandırma" | "Yayın";

export interface DefinitionConfig {
  key: DefinitionKey;        // URL'deki ad
  label: string;             // "Yazar"
  pluralLabel: string;       // "Yazarlar"
  description: string;
  icon: LucideIcon;
  collection: string;        // Firestore koleksiyonu
  group: DefinitionGroup;
  labelField: string;        // Kaydın görünen adı
  secondaryField?: string;
  imageField?: string;
  columns: DefinitionColumn[];
}

// ——— Ortak seçenekler ———

export const statusOptions: BadgeOptions = {
  draft:     { label: "Taslak",    color: "gray" },
  published: { label: "Yayında",   color: "green" },
  scheduled: { label: "Planlandı", color: "blue" },
};

export const meterOptions: BadgeOptions = {
  aruz:    { label: "Aruz",    color: "grape" },
  hece:    { label: "Hece",    color: "teal" },
  serbest: { label: "Serbest", color: "blue" },
  diger:   { label: "Diğer",   color: "gray" },
};

export const genreScopeOptions: BadgeOptions = {
  work: { label: "Eser",      color: "violet" },
  poem: { label: "Şiir",      color: "teal" },
  both: { label: "Her ikisi", color: "gray" },
};

export const periodKindOptions: BadgeOptions = {
  period:   { label: "Dönem", color: "indigo" },
  movement: { label: "Akım",  color: "orange" },
};

export const geographyKindOptions: BadgeOptions = {
  continent: { label: "Kıta",  color: "grape" },
  country:   { label: "Ülke",  color: "blue" },
  region:    { label: "Bölge", color: "teal" },
  city:      { label: "Şehir", color: "cyan" },
};

export const platformOptions: BadgeOptions = {
  instagram: { label: "Instagram", color: "pink" },
  x:         { label: "X",         color: "dark" },
  facebook:  { label: "Facebook",  color: "blue" },
  tiktok:    { label: "TikTok",    color: "gray" },
  youtube:   { label: "YouTube",   color: "red" },
  linkedin:  { label: "LinkedIn",  color: "indigo" },
};

export const socialContentTypeOptions: BadgeOptions = {
  quote:               { label: "Alıntı",          color: "violet" },
  poem_excerpt:        { label: "Şiir Kesiti",     color: "teal" },
  author_anniversary:  { label: "Yıl Dönümü",      color: "yellow" },
  book_recommendation: { label: "Kitap Önerisi",   color: "blue" },
  daily_word:          { label: "Günün Sözü",      color: "pink" },
  other:               { label: "Diğer",           color: "gray" },
};

const statusColumn: DefinitionColumn = { key: "status", header: "Durum", kind: "status", size: 90 };

// ——— Tanımlar ———

export const definitionConfigs: DefinitionConfig[] = [
  {
    key: "yazar",
    label: "Yazar",
    pluralLabel: "Yazarlar",
    description: "Yazar ve şairler; biyografi, milliyet, dönem ve tür bilgileriyle.",
    icon: User,
    collection: "authors",
    group: "Temel",
    labelField: "fullName",
    secondaryField: "penNames",
    imageField: "photoURL",
    columns: [
      { key: "fullName", header: "Yazar", kind: "title", size: 220 },
      { key: "nationalityIds", header: "Milliyet", kind: "refs", ref: "milliyet", size: 120 },
      { key: "periodIds", header: "Dönem / Akım", kind: "refs", ref: "donem", size: 170 },
      { key: "birthDate", header: "Doğum", kind: "date", size: 110 },
      { key: "deathDate", header: "Ölüm", kind: "date", size: 110 },
      statusColumn,
    ],
  },
  {
    key: "eser",
    label: "Eser",
    pluralLabel: "Eserler / Kitaplar",
    description: "Kitaplar ve eserler; yazar, tür, dönem ve yayın bilgileriyle.",
    icon: BookOpen,
    collection: "works",
    group: "Temel",
    labelField: "title",
    secondaryField: "originalTitle",
    imageField: "coverURL",
    columns: [
      { key: "title", header: "Eser", kind: "title", size: 220 },
      { key: "authorIds", header: "Yazar", kind: "refs", ref: "yazar", size: 170 },
      { key: "genreIds", header: "Tür", kind: "refs", ref: "tur", size: 150 },
      { key: "firstPublished", header: "İlk Yayın", kind: "date", size: 100 },
      statusColumn,
    ],
  },
  {
    key: "siir",
    label: "Şiir",
    pluralLabel: "Şiirler",
    description: "Şiirler; şair, nazım şekli, ölçü ve tema bilgileriyle.",
    icon: Feather,
    collection: "poems",
    group: "Temel",
    labelField: "title",
    columns: [
      { key: "title", header: "Şiir", kind: "title", size: 200 },
      { key: "authorId", header: "Şair", kind: "ref", ref: "yazar", size: 160 },
      { key: "workId", header: "Kitap", kind: "ref", ref: "eser", size: 160 },
      { key: "meter", header: "Ölçü", kind: "badge", options: meterOptions, size: 90 },
      { key: "themeIds", header: "Tema", kind: "refs", ref: "tema", size: 150 },
      statusColumn,
    ],
  },
  {
    key: "tur",
    label: "Tür",
    pluralLabel: "Türler / Alt Türler",
    description: "Edebi türler ve nazım şekilleri. Alt türler bir üst türe bağlanır.",
    icon: Shapes,
    collection: "genres",
    group: "Sınıflandırma",
    labelField: "name",
    columns: [
      { key: "name", header: "Tür", kind: "title", size: 200 },
      { key: "parentId", header: "Üst Tür", kind: "ref", ref: "tur", size: 150 },
      { key: "scope", header: "Kapsam", kind: "badge", options: genreScopeOptions, size: 100 },
      { key: "slug", header: "Slug", kind: "mono", size: 150 },
      statusColumn,
    ],
  },
  {
    key: "tema",
    label: "Tema",
    pluralLabel: "Temalar",
    description: "Aşk, ölüm, gurbet gibi eser ve şiirlerde işlenen temalar.",
    icon: Lightbulb,
    collection: "themes",
    group: "Sınıflandırma",
    labelField: "name",
    secondaryField: "description",
    columns: [
      { key: "name", header: "Tema", kind: "title", size: 240 },
      { key: "relatedThemeIds", header: "İlişkili Temalar", kind: "refs", ref: "tema", size: 200 },
      { key: "slug", header: "Slug", kind: "mono", size: 140 },
      statusColumn,
    ],
  },
  {
    key: "donem",
    label: "Dönem",
    pluralLabel: "Dönemler / Akımlar",
    description: "Edebi dönemler ve akımlar; yıl aralığı ve özellikleriyle.",
    icon: Hourglass,
    collection: "periods",
    group: "Sınıflandırma",
    labelField: "name",
    columns: [
      { key: "name", header: "Ad", kind: "title", size: 200 },
      { key: "kind", header: "Tip", kind: "badge", options: periodKindOptions, size: 90 },
      { key: "parentId", header: "Üst Dönem", kind: "ref", ref: "donem", size: 150 },
      { key: "startYear", header: "Başlangıç", kind: "number", size: 90 },
      { key: "endYear", header: "Bitiş", kind: "number", size: 90 },
      statusColumn,
    ],
  },
  {
    key: "cografya",
    label: "Coğrafya",
    pluralLabel: "Edebiyat Coğrafyası",
    description: "Kıta, ülke, bölge ve şehirler. Yazar doğum yeri ve eser mekânı için kullanılır.",
    icon: Globe,
    collection: "geographies",
    group: "Sınıflandırma",
    labelField: "name",
    columns: [
      { key: "name", header: "Ad", kind: "title", size: 200 },
      { key: "kind", header: "Tip", kind: "badge", options: geographyKindOptions, size: 90 },
      { key: "parentId", header: "Bağlı Olduğu", kind: "ref", ref: "cografya", size: 160 },
      statusColumn,
    ],
  },
  {
    key: "milliyet",
    label: "Milliyet",
    pluralLabel: "Milliyetler",
    description: "Yazarların milliyet bilgisi.",
    icon: Flag,
    collection: "nationalities",
    group: "Sınıflandırma",
    labelField: "name",
    secondaryField: "countryName",
    columns: [
      { key: "name", header: "Milliyet", kind: "title", size: 200 },
      { key: "countryCode", header: "Ülke Kodu", kind: "mono", size: 100 },
      statusColumn,
    ],
  },
  {
    key: "etiket",
    label: "Etiket",
    pluralLabel: "Etiketler",
    description: "Tüm içeriklerde serbestçe kullanılabilen etiketler.",
    icon: Tag,
    collection: "tags",
    group: "Sınıflandırma",
    labelField: "name",
    columns: [
      { key: "name", header: "Etiket", kind: "title", size: 220 },
      { key: "slug", header: "Slug", kind: "mono", size: 160 },
      statusColumn,
    ],
  },
  {
    key: "sosyal-medya",
    label: "Sosyal Medya İçeriği",
    pluralLabel: "Sosyal Medya İçerikleri",
    description: "Platformlarda paylaşılacak içerikler; planlama ve yayın durumuyla.",
    icon: Share2,
    collection: "socialPosts",
    group: "Yayın",
    labelField: "title",
    secondaryField: "caption",
    columns: [
      { key: "title", header: "İçerik", kind: "title", size: 220 },
      { key: "platforms", header: "Platform", kind: "badges", options: platformOptions, size: 170 },
      { key: "contentType", header: "Tip", kind: "badge", options: socialContentTypeOptions, size: 120 },
      { key: "scheduledAt", header: "Planlanan", kind: "timestamp", size: 130 },
      statusColumn,
    ],
  },
];

export const definitionMap = Object.fromEntries(
  definitionConfigs.map((c) => [c.key, c]),
) as Record<DefinitionKey, DefinitionConfig>;

export const definitionGroups: DefinitionGroup[] = ["Temel", "Sınıflandırma", "Yayın"];