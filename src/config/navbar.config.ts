import {
  Home,
  Boxes,
  ChartColumnStacked,
  MessageSquareMore,
  Package,
  Store,
} from "lucide-react";

export type NavbarNestItem = {
  title: string;
  url: string;
  breadcrumpTitle?: string;
};

export type NavbarItemMeta = {
  count?: number;
  label?: string;
  extra?: { count: number; label: string }[];
};

export type NavbarItem = {
  id: number;
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  nested?: boolean;
  nest?: NavbarNestItem[];
  localization: string;
  notification?: boolean;
  meta?: NavbarItemMeta;
  iconOnly?: boolean;
  breadcrumpTitle?: string;
};

export const navbarItems: NavbarItem[] = [
  {
    id: 1,
    title: "",
    url: "/icerik-yonetimi",
    breadcrumpTitle: "Anasayfa",
    icon: Home,
    nested: false,
    localization: "navbar-content",
    notification: false,
    meta: { count: 0 },
  },
  {
    id: 2,
    title: "Edebiyat Yazıları",
    breadcrumpTitle: "Blog",
    url: "/icerik-yonetimi/edebiyat-yazilari",
    icon: Boxes,
    nested: true,
    nest: [
      {
        title: "Tüm Yazılar",
        url: "/icerik-yonetimi/edebiyat-yazilari/tum-yazilar",
        breadcrumpTitle: "Tüm Yazılar",
      },
    ],
    localization: "navbar-content",
    notification: false,
    meta: { count: 48, label: "yayınlanan yazı" },
  },
  {
    id: 3,
    title: "Kitap",
    url: "/icerik-yonetimi/kitap/inceleme",
    icon: Store,
    breadcrumpTitle: "",
    nested: true,
    nest: [
      {
        title: "Tüm İncelemeler",
        url: "/icerik-yonetimi/kitap/inceleme/tum-incelemeler",
        breadcrumpTitle: "Tüm İncelemeler",
      },
      {
        title: "Tüm Öneriler",
        url: "/icerik-yonetimi/kitap/oneriler/tum-oneriler",
        breadcrumpTitle: "Tüm Öneriler",
      },
    ],
    localization: "navbar-content",
    notification: false,
    meta: { count: 23, label: "inceleme" },
  },
  {
    id: 5,
    title: "Şiirler",
    url: "/icerik-yonetimi/siir",
    breadcrumpTitle: "",
    icon: Package,
    nested: true,
    nest: [
      {
        title: "Tüm Şiirler",
        url: "/icerik-yonetimi/siir/tum-siirler",
        breadcrumpTitle: "Tüm Şiirler",
      },
    ],
    localization: "navbar-content",
    notification: false,
    meta: { count: 134, label: "şiir" },
  },
   {
    id: 6,
    title: "Biyografiler",
    url: "/biyografi/tum-biyografiler",
    breadcrumpTitle: "",
    icon: Package,
    nested: true,
    nest: [
      {
        title: "Tüm Biyografiler",
        url: "/biyografi/tum-biyografiler",
        breadcrumpTitle: "Tüm Biyografiler",
      },
    ],
    localization: "navbar-content",
    notification: false,
    meta: { count: 134, label: "biyografi" },
  },
  {
    id: 7,
    title: "Kategoriler",
    url: "/icerik-yonetimi/kategoriler",
    breadcrumpTitle: "Kategoriler",
    icon: ChartColumnStacked,
    nested: false,
    localization: "navbar-content",
    notification: false,
    meta: { count: 12, label: "kategori" },
  },
  {
    id: 8,
    title: "Tanımlamalar",
    url: "/icerik-yonetimi/tanimlamalar",
    breadcrumpTitle: "Tanımlamalar",
    icon: ChartColumnStacked,
    nested: false,
    localization: "navbar-content",
    notification: false,
    meta: { count: 12, label: "tanımalamalar" },
  },
  {
    id: 9,
    title: "Mesajlar",
    url: "/icerik-yonetimi/mesajlar",
    icon: MessageSquareMore,
    nested: false,
    localization: "navbar-content",
    breadcrumpTitle: "Mesajlar",
    notification: false,
    meta: { count: 5, label: "okunmamış mesaj" },
  },
];
export const routeLabels: Record<string, string> = {
  "/icerik-yonetimi/profil-ayarlari": "Profil Ayarları",
  "/icerik-yonetimi/genel-ayarlar": "Genel Ayarlar",
  "/icerik-yonetimi/genel-ayarlar/site-ayarlari": "Site Ayarları",
  "/icerik-yonetimi/genel-ayarlar/editorler":     "Editörler",
  "/icerik-yonetimi/bildirimler":"Bildirimler"
};