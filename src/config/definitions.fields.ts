// src/config/definitions.fields.ts
import type { DefinitionDoc } from "@/services/definitions.service";
import {
  genreScopeOptions,
  geographyKindOptions,
  meterOptions,
  periodKindOptions,
  platformOptions,
  socialContentTypeOptions,
  type DefinitionKey,
} from "./definitions.config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;

export type FieldKind =
  | "text" | "textarea" | "number"
  | "select"        // Tek seçim (options)
  | "multiselect"   // Çoklu seçim (options)
  | "ref"           // Başka koleksiyondan tek kayıt
  | "refs"          // Başka koleksiyondan çoklu kayıt
  | "list"          // Serbest metin listesi (mahlaslar, hashtag'ler…)
  | "date"          // LiteraryDate (gün/ay opsiyonel)
  | "datetime"      // Firestore Timestamp
  | "image"         // Görsel URL'i + önizleme
  | "links"         // [{ label, url }]
  | "coordinates"   // { lat, lng }
  | "boolean"
  | "color"
  | "linkedEntity"; // { type, id } — sosyal medya içeriği için

type Options = Record<string, { label: string; color: string }>;

export interface RefFilterContext {
  id?: string;        // Düzenlenen kaydın ID'si
  values: FormValues; // Formun anlık değerleri
}

export interface DefinitionField {
  key: string;
  label: string;
  kind: FieldKind;
  section: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options?: Options;
  ref?: DefinitionKey;
  refFilter?: (doc: DefinitionDoc, ctx: RefFilterContext) => boolean;
  suggestions?: string[];
  rows?: number;
  nullable?: boolean;  // Boş bırakılırsa "" yerine null kaydedilir
  mono?: boolean;
  uppercase?: boolean;
  maxLength?: number;
  defaultValue?: unknown;
}

export interface DefinitionFormConfig {
  sections: string[];
  fields: DefinitionField[];
  slugFrom?: string;    // Slug hangi alandan üretilsin (yoksa slug alanı gösterilmez)
  statuses?: string[];  // Varsayılan: ["draft", "published"]
  validate?: (values: FormValues) => Record<string, string>;
}

// ——— Yardımcı filtreler ———

const notSelf = (doc: DefinitionDoc, ctx: RefFilterContext) => doc.id !== ctx.id;
const topLevelNotSelf = (doc: DefinitionDoc, ctx: RefFilterContext) =>
  !doc.parentId && doc.id !== ctx.id;
const genreFor = (scope: "work" | "poem") => (doc: DefinitionDoc) =>
  doc.scope === scope || doc.scope === "both";

// ——— Ek seçenekler ———

export const languageOptions: Options = {
  tr: { label: "Türkçe", color: "gray" },
  en: { label: "İngilizce", color: "gray" },
  fr: { label: "Fransızca", color: "gray" },
  de: { label: "Almanca", color: "gray" },
  ru: { label: "Rusça", color: "gray" },
  ar: { label: "Arapça", color: "gray" },
  fa: { label: "Farsça", color: "gray" },
  other: { label: "Diğer", color: "gray" },
};

export const linkedEntityTypeOptions: Options = {
  author: { label: "Yazar", color: "gray" },
  work: { label: "Eser", color: "gray" },
  poem: { label: "Şiir", color: "gray" },
  period: { label: "Dönem / Akım", color: "gray" },
  theme: { label: "Tema", color: "gray" },
};

export const linkedTypeKey: Record<string, DefinitionKey> = {
  author: "yazar",
  work: "eser",
  poem: "siir",
  period: "donem",
  theme: "tema",
};

// ——— Formlar ———

export const definitionForms: Record<DefinitionKey, DefinitionFormConfig> = {
  yazar: {
    slugFrom: "fullName",
    sections: ["Kimlik", "Yaşam", "Sınıflandırma", "Biyografi", "Diğer"],
    fields: [
      { key: "fullName", label: "Ad Soyad", kind: "text", section: "Kimlik", required: true, placeholder: "Mehmet Âkif Ersoy" },
      { key: "penNames", label: "Mahlas / Takma Ad", kind: "list", section: "Kimlik", hint: "Yazıp Enter'a basın" },
      { key: "occupations", label: "Meslekler", kind: "list", section: "Kimlik",
        suggestions: ["şair", "romancı", "hikâyeci", "denemeci", "oyun yazarı", "gazeteci", "çevirmen", "eleştirmen", "akademisyen"] },
      { key: "photoURL", label: "Fotoğraf", kind: "image", section: "Kimlik", hint: "Görsel URL'i" },

      { key: "birthDate", label: "Doğum Tarihi", kind: "date", section: "Yaşam", hint: "Sadece yıl da girilebilir" },
      { key: "birthPlaceId", label: "Doğum Yeri", kind: "ref", ref: "cografya", section: "Yaşam" },
      { key: "deathDate", label: "Ölüm Tarihi", kind: "date", section: "Yaşam" },
      { key: "deathPlaceId", label: "Ölüm Yeri", kind: "ref", ref: "cografya", section: "Yaşam" },

      { key: "nationalityIds", label: "Milliyet", kind: "refs", ref: "milliyet", section: "Sınıflandırma" },
      { key: "periodIds", label: "Dönem / Akım", kind: "refs", ref: "donem", section: "Sınıflandırma" },
      { key: "genreIds", label: "Eser Verdiği Türler", kind: "refs", ref: "tur", section: "Sınıflandırma" },
      { key: "themeIds", label: "Temalar", kind: "refs", ref: "tema", section: "Sınıflandırma" },
      { key: "tagIds", label: "Etiketler", kind: "refs", ref: "etiket", section: "Sınıflandırma" },

      { key: "shortBio", label: "Kısa Biyografi", kind: "textarea", section: "Biyografi", rows: 2, hint: "Liste ve kartlarda görünür" },
      { key: "biography", label: "Biyografi", kind: "textarea", section: "Biyografi", rows: 10 },

      { key: "externalLinks", label: "Bağlantılar", kind: "links", section: "Diğer", hint: "Vikipedi, resmi site vb." },
      { key: "isFeatured", label: "Öne Çıkar", kind: "boolean", section: "Diğer", placeholder: "Ana sayfada öne çıkan yazarlarda göster" },
    ],
  },

  eser: {
    slugFrom: "title",
    sections: ["Temel Bilgiler", "Yayın Bilgileri", "Sınıflandırma", "İçerik"],
    fields: [
      { key: "title", label: "Eser Adı", kind: "text", section: "Temel Bilgiler", required: true },
      { key: "originalTitle", label: "Özgün Adı", kind: "text", section: "Temel Bilgiler", nullable: true, hint: "Çeviri eserlerde" },
      { key: "authorIds", label: "Yazar", kind: "refs", ref: "yazar", section: "Temel Bilgiler", required: true },
      { key: "translators", label: "Çevirmenler", kind: "list", section: "Temel Bilgiler" },
      { key: "coverURL", label: "Kapak", kind: "image", section: "Temel Bilgiler", hint: "Görsel URL'i" },

      { key: "firstPublished", label: "İlk Yayın", kind: "date", section: "Yayın Bilgileri" },
      { key: "language", label: "Dil", kind: "select", options: languageOptions, section: "Yayın Bilgileri", required: true, defaultValue: "tr" },
      { key: "originalLanguage", label: "Özgün Dil", kind: "select", options: languageOptions, section: "Yayın Bilgileri" },
      { key: "publisher", label: "Yayınevi", kind: "text", section: "Yayın Bilgileri", nullable: true },
      { key: "pageCount", label: "Sayfa Sayısı", kind: "number", section: "Yayın Bilgileri" },
      { key: "isbn", label: "ISBN", kind: "text", section: "Yayın Bilgileri", nullable: true, mono: true },

      { key: "genreIds", label: "Tür", kind: "refs", ref: "tur", refFilter: genreFor("work"), section: "Sınıflandırma" },
      { key: "periodIds", label: "Dönem / Akım", kind: "refs", ref: "donem", section: "Sınıflandırma" },
      { key: "themeIds", label: "Temalar", kind: "refs", ref: "tema", section: "Sınıflandırma" },
      { key: "settingIds", label: "Geçtiği Yerler", kind: "refs", ref: "cografya", section: "Sınıflandırma" },
      { key: "tagIds", label: "Etiketler", kind: "refs", ref: "etiket", section: "Sınıflandırma" },

      { key: "summary", label: "Özet", kind: "textarea", section: "İçerik", rows: 6 },
      { key: "isFeatured", label: "Öne Çıkar", kind: "boolean", section: "İçerik", placeholder: "Öne çıkan eserlerde göster" },
    ],
  },

  siir: {
    slugFrom: "title",
    sections: ["Temel Bilgiler", "Metin", "Biçim", "Sınıflandırma"],
    fields: [
      { key: "title", label: "Şiir Adı", kind: "text", section: "Temel Bilgiler", required: true },
      { key: "authorId", label: "Şair", kind: "ref", ref: "yazar", section: "Temel Bilgiler", required: true },
      { key: "workId", label: "Yer Aldığı Kitap", kind: "ref", ref: "eser", section: "Temel Bilgiler",
        hint: "Seçili şairin eserleri listelenir",
        refFilter: (doc, { values }) => !values.authorId || (doc.authorIds ?? []).includes(values.authorId) },
      { key: "writtenDate", label: "Yazılış Tarihi", kind: "date", section: "Temel Bilgiler" },

      { key: "text", label: "Şiir Metni", kind: "textarea", section: "Metin", required: true, rows: 16, hint: "Satır ve kıta boşlukları korunur" },

      { key: "formId", label: "Nazım Şekli", kind: "ref", ref: "tur", refFilter: genreFor("poem"), section: "Biçim" },
      { key: "meter", label: "Ölçü", kind: "select", options: meterOptions, section: "Biçim", required: true, defaultValue: "serbest" },
      { key: "meterDetail", label: "Ölçü Detayı", kind: "text", section: "Biçim", nullable: true, placeholder: "7+7 veya fâilâtün fâilâtün fâilün" },
      { key: "rhymeScheme", label: "Kafiye Düzeni", kind: "text", section: "Biçim", nullable: true, mono: true, placeholder: "aaba" },
      { key: "stanzaCount", label: "Kıta Sayısı", kind: "number", section: "Biçim" },

      { key: "periodIds", label: "Dönem / Akım", kind: "refs", ref: "donem", section: "Sınıflandırma" },
      { key: "themeIds", label: "Temalar", kind: "refs", ref: "tema", section: "Sınıflandırma" },
      { key: "tagIds", label: "Etiketler", kind: "refs", ref: "etiket", section: "Sınıflandırma" },
      { key: "note", label: "Editör Notu", kind: "textarea", section: "Sınıflandırma", rows: 3, nullable: true },
    ],
  },

  tur: {
    slugFrom: "name",
    sections: ["Temel Bilgiler"],
    fields: [
      { key: "name", label: "Tür Adı", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Roman, Gazel, Psikolojik Roman…" },
      { key: "parentId", label: "Üst Tür", kind: "ref", ref: "tur", refFilter: topLevelNotSelf, section: "Temel Bilgiler", hint: "Boşsa ana tür olur" },
      { key: "scope", label: "Kapsam", kind: "select", options: genreScopeOptions, section: "Temel Bilgiler", required: true, defaultValue: "both",
        hint: "Eser ve şiir formlarında nerede seçilebilir" },
      { key: "description", label: "Açıklama", kind: "textarea", section: "Temel Bilgiler", rows: 3 },
      { key: "characteristics", label: "Özellikler", kind: "list", section: "Temel Bilgiler", hint: "Türün belirgin özellikleri" },
    ],
  },

  tema: {
    slugFrom: "name",
    sections: ["Temel Bilgiler"],
    fields: [
      { key: "name", label: "Tema Adı", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Aşk, Ölüm, Gurbet…" },
      { key: "description", label: "Açıklama", kind: "textarea", section: "Temel Bilgiler", rows: 3 },
      { key: "relatedThemeIds", label: "İlişkili Temalar", kind: "refs", ref: "tema", refFilter: notSelf, section: "Temel Bilgiler" },
    ],
  },

  donem: {
    slugFrom: "name",
    sections: ["Temel Bilgiler", "Kapsam"],
    fields: [
      { key: "name", label: "Ad", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Tanzimat, Servet-i Fünun, Garip Akımı…" },
      { key: "kind", label: "Tip", kind: "select", options: periodKindOptions, section: "Temel Bilgiler", required: true, defaultValue: "period" },
      { key: "parentId", label: "Üst Dönem", kind: "ref", ref: "donem", refFilter: topLevelNotSelf, section: "Temel Bilgiler", hint: "Örn. Tanzimat 1. Dönem → Tanzimat" },
      { key: "startYear", label: "Başlangıç Yılı", kind: "number", section: "Temel Bilgiler" },
      { key: "endYear", label: "Bitiş Yılı", kind: "number", section: "Temel Bilgiler" },

      { key: "geographyIds", label: "Coğrafya", kind: "refs", ref: "cografya", section: "Kapsam", hint: "Hangi edebiyatlara ait" },
      { key: "description", label: "Açıklama", kind: "textarea", section: "Kapsam", rows: 4 },
      { key: "characteristics", label: "Özellikler", kind: "list", section: "Kapsam", hint: "Temel özellikleri tek tek ekleyin" },
    ],
    validate: (v): Record<string, string> =>
  v.startYear != null && v.endYear != null && v.endYear < v.startYear
    ? { endYear: "Bitiş yılı başlangıçtan önce olamaz" }
    : {},
  },

  cografya: {
    slugFrom: "name",
    sections: ["Temel Bilgiler"],
    fields: [
      { key: "name", label: "Ad", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Anadolu, İstanbul, Balkanlar…" },
      { key: "kind", label: "Tip", kind: "select", options: geographyKindOptions, section: "Temel Bilgiler", required: true, defaultValue: "country" },
      { key: "parentId", label: "Bağlı Olduğu Yer", kind: "ref", ref: "cografya", refFilter: notSelf, section: "Temel Bilgiler", hint: "İstanbul → Türkiye" },
      { key: "description", label: "Açıklama", kind: "textarea", section: "Temel Bilgiler", rows: 3 },
      { key: "coordinates", label: "Koordinatlar", kind: "coordinates", section: "Temel Bilgiler", hint: "İleride harita için, opsiyonel" },
    ],
  },

  milliyet: {
    slugFrom: "name",
    sections: ["Temel Bilgiler"],
    fields: [
      { key: "name", label: "Milliyet", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Türk, Rus, Fransız…" },
      { key: "countryName", label: "Ülke", kind: "text", section: "Temel Bilgiler", required: true, placeholder: "Türkiye" },
      { key: "countryCode", label: "Ülke Kodu", kind: "text", section: "Temel Bilgiler", required: true, mono: true, uppercase: true, maxLength: 2,
        placeholder: "TR", hint: "ISO 3166 iki harfli kod" },
    ],
  },

  etiket: {
    slugFrom: "name",
    sections: ["Temel Bilgiler"],
    fields: [
      { key: "name", label: "Etiket", kind: "text", section: "Temel Bilgiler", required: true },
      { key: "color", label: "Renk", kind: "color", section: "Temel Bilgiler", nullable: true },
    ],
  },

  "sosyal-medya": {
    statuses: ["draft", "scheduled", "published"],
    sections: ["İçerik", "Bağlantı ve Plan"],
    fields: [
      { key: "title", label: "İç Başlık", kind: "text", section: "İçerik", required: true, hint: "Sadece panelde görünür" },
      { key: "contentType", label: "İçerik Tipi", kind: "select", options: socialContentTypeOptions, section: "İçerik", required: true, defaultValue: "quote" },
      { key: "platforms", label: "Platformlar", kind: "multiselect", options: platformOptions, section: "İçerik", required: true },
      { key: "caption", label: "Metin", kind: "textarea", section: "İçerik", required: true, rows: 6 },
      { key: "hashtags", label: "Hashtag'ler", kind: "list", section: "İçerik", hint: "# olmadan yazabilirsiniz" },
      { key: "mediaURLs", label: "Medya URL'leri", kind: "list", section: "İçerik" },

      { key: "linkedEntity", label: "İlgili Kayıt", kind: "linkedEntity", section: "Bağlantı ve Plan", hint: "İçerik hangi yazar/eser/şiirle ilgili" },
      { key: "scheduledAt", label: "Yayın Zamanı", kind: "datetime", section: "Bağlantı ve Plan" },
    ],
    validate: (v): Record<string, string> =>
  v.status === "scheduled" && !v.scheduledAt
    ? { scheduledAt: "Planlanan içerik için yayın zamanı seçin" }
    : {},
  },
};