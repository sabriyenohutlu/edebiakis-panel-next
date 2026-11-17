"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Search,
  Share2,
  Mail,
  Save,
  Upload,
} from "lucide-react";

// ——— Static Data ———

const initialData = {
  genel: {
    siteName: "Edebi Akış",
    siteDescription: "Edebiyat dünyasına dair blog yazıları, roman incelemeleri, şiirler ve öneriler.",
    siteUrl: "https://edebiakis.com",
    logo: "",
    favicon: "",
    language: "tr",
    timezone: "Europe/Istanbul",
  },
  seo: {
    metaTitle: "Edebi Akış — Edebiyat Dünyası",
    metaDescription: "Roman incelemeleri, şiirler, blog yazıları ve edebiyat önerileri.",
    metaKeywords: "edebiyat, roman inceleme, şiir, türk edebiyatı",
    robotsIndex: true,
    robotsFollow: true,
    sitemapEnabled: true,
    canonicalUrl: "https://edebiakis.com",
    ogImage: "",
  },
  sosyal: {
    twitter: "https://twitter.com/edebiakis",
    instagram: "https://instagram.com/edebiakis",
    facebook: "",
    youtube: "",
    linkedin: "",
  },
  iletisim: {
    email: "iletisim@edebiakis.com",
    phone: "+90 555 000 00 00",
    address: "İstanbul, Türkiye",
    mapUrl: "",
    contactFormEnabled: true,
  },
};

// ——— Section başlığı ———

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
  );
}

// ——— Form satırı ———

function FormRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

// ——— Page ———

export default function SiteAyarlariPage() {
  const [genel, setGenel] = useState(initialData.genel);
  const [seo, setSeo] = useState(initialData.seo);
  const [sosyal, setSosyal] = useState(initialData.sosyal);
  const [iletisim, setIletisim] = useState(initialData.iletisim);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ——— Genel Bilgiler ——— */}
      <Card>
        <CardContent className="pt-5">
          <SectionHeader icon={Globe} title="Genel Bilgiler" />
          <div className="flex flex-col gap-4">

            <FormRow label="Site Adı" hint="Tarayıcı sekmesinde görünür">
              <Input
                value={genel.siteName}
                onChange={(e) => setGenel({ ...genel, siteName: e.target.value })}
                className="h-8 text-sm"
              />
            </FormRow>

            <Separator />

            <FormRow label="Site Açıklaması" hint="Kısa tanıtım metni">
              <Textarea
                value={genel.siteDescription}
                onChange={(e) => setGenel({ ...genel, siteDescription: e.target.value })}
                className="text-sm resize-none"
                rows={2}
              />
            </FormRow>

            <Separator />

            <FormRow label="Site URL">
              <Input
                value={genel.siteUrl}
                onChange={(e) => setGenel({ ...genel, siteUrl: e.target.value })}
                className="h-8 text-sm"
                placeholder="https://edebiakis.com"
              />
            </FormRow>

            <Separator />

            <FormRow label="Logo" hint="PNG veya SVG, maks. 2MB">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Dosya seç veya sürükle
                </div>
              </div>
            </FormRow>

            <Separator />

            <FormRow label="Favicon" hint="ICO veya PNG, 32x32">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Dosya seç veya sürükle
                </div>
              </div>
            </FormRow>

          </div>
        </CardContent>
      </Card>

      {/* ——— SEO Ayarları ——— */}
      <Card>
        <CardContent className="pt-5">
          <SectionHeader icon={Search} title="SEO Ayarları" />
          <div className="flex flex-col gap-4">

            <FormRow label="Meta Başlık" hint="Maks. 60 karakter">
              <div className="flex flex-col gap-1">
                <Input
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  className="h-8 text-sm"
                  maxLength={60}
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {seo.metaTitle.length}/60
                </p>
              </div>
            </FormRow>

            <Separator />

            <FormRow label="Meta Açıklama" hint="Maks. 160 karakter">
              <div className="flex flex-col gap-1">
                <Textarea
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  className="text-sm resize-none"
                  rows={2}
                  maxLength={160}
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {seo.metaDescription.length}/160
                </p>
              </div>
            </FormRow>

            <Separator />

            <FormRow label="Anahtar Kelimeler" hint="Virgülle ayır">
              <Input
                value={seo.metaKeywords}
                onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })}
                className="h-8 text-sm"
                placeholder="edebiyat, roman, şiir"
              />
            </FormRow>

            <Separator />

            <FormRow label="Canonical URL">
              <Input
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                className="h-8 text-sm"
              />
            </FormRow>

            <Separator />

            <FormRow label="OG Görseli" hint="Sosyal medya paylaşım görseli">
              <div className="h-8 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Dosya seç veya sürükle
              </div>
            </FormRow>

            <Separator />

            <FormRow label="Robots">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Sayfaları indexle</Label>
                  <Switch
                    checked={seo.robotsIndex}
                    onCheckedChange={(v) => setSeo({ ...seo, robotsIndex: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Linkleri takip et</Label>
                  <Switch
                    checked={seo.robotsFollow}
                    onCheckedChange={(v) => setSeo({ ...seo, robotsFollow: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Sitemap aktif</Label>
                  <Switch
                    checked={seo.sitemapEnabled}
                    onCheckedChange={(v) => setSeo({ ...seo, sitemapEnabled: v })}
                  />
                </div>
              </div>
            </FormRow>

          </div>
        </CardContent>
      </Card>

      {/* ——— Sosyal Medya ——— */}
      <Card>
        <CardContent className="pt-5">
          <SectionHeader icon={Share2} title="Sosyal Medya" />
          <div className="flex flex-col gap-4">
            {(
              [
                { key: "twitter",   label: "X (Twitter)",  placeholder: "https://twitter.com/kullanici" },
                { key: "instagram", label: "Instagram",    placeholder: "https://instagram.com/kullanici" },
                { key: "facebook",  label: "Facebook",     placeholder: "https://facebook.com/sayfa" },
                { key: "youtube",   label: "YouTube",      placeholder: "https://youtube.com/kanal" },
                { key: "linkedin",  label: "LinkedIn",     placeholder: "https://linkedin.com/company/..." },
              ] as const
            ).map((item, i, arr) => (
              <div key={item.key}>
                <FormRow label={item.label}>
                  <Input
                    value={sosyal[item.key]}
                    onChange={(e) => setSosyal({ ...sosyal, [item.key]: e.target.value })}
                    className="h-8 text-sm"
                    placeholder={item.placeholder}
                  />
                </FormRow>
                {i < arr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ——— İletişim Bilgileri ——— */}
      <Card>
        <CardContent className="pt-5">
          <SectionHeader icon={Mail} title="İletişim Bilgileri" />
          <div className="flex flex-col gap-4">

            <FormRow label="E-posta">
              <Input
                value={iletisim.email}
                onChange={(e) => setIletisim({ ...iletisim, email: e.target.value })}
                className="h-8 text-sm"
                placeholder="iletisim@site.com"
                type="email"
              />
            </FormRow>

            <Separator />

            <FormRow label="Telefon">
              <Input
                value={iletisim.phone}
                onChange={(e) => setIletisim({ ...iletisim, phone: e.target.value })}
                className="h-8 text-sm"
                placeholder="+90 555 000 00 00"
              />
            </FormRow>

            <Separator />

            <FormRow label="Adres">
              <Textarea
                value={iletisim.address}
                onChange={(e) => setIletisim({ ...iletisim, address: e.target.value })}
                className="text-sm resize-none"
                rows={2}
                placeholder="Şehir, Ülke"
              />
            </FormRow>

            <Separator />

            <FormRow label="Harita URL" hint="Google Maps embed linki">
              <Input
                value={iletisim.mapUrl}
                onChange={(e) => setIletisim({ ...iletisim, mapUrl: e.target.value })}
                className="h-8 text-sm"
                placeholder="https://maps.google.com/..."
              />
            </FormRow>

            <Separator />

            <FormRow label="İletişim Formu" hint="Sitede iletişim formu göster">
              <Switch
                checked={iletisim.contactFormEnabled}
                onCheckedChange={(v) => setIletisim({ ...iletisim, contactFormEnabled: v })}
              />
            </FormRow>

          </div>
        </CardContent>
      </Card>

      {/* ——— Kaydet ——— */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" size="sm">
          <Save className="w-3.5 h-3.5" />
          {saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
        </Button>
      </div>

    </div>
  );
}