// src/components/BiographyComponents/BiographyForm.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, Eye, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import ImageUpload from "@/components/ui/image-upload";
import RichTextEditor from "@/components/editor/RichTextEditor";
import SeoCard from "@/components/content/SeoCard";
import PostFormHeader from "@/components/content/PostFormHeader";
import RelatedSocialCard from "@/components/content/RelatedSocialCard";
import { CharCount, FormField, SectionCard } from "@/components/content/form-parts";
import { EXCERPT_LIMIT } from "@/lib/content-utils";
import { cn } from "@/apilib/utils";
import AuthorSummary from "./AuthorSummary";
import { BIOGRAPHY_ROUTES, useBiographyForm, type BiographyForm } from "./useBiographyForm";

export function BiographyFormLayout({ form }: { form: BiographyForm }) {
  const { values, errors, options, busy, selectedAuthor, cover } = form;
  const isEdit = form.mode === "edit";
  const canUsePhoto = !!selectedAuthor?.photoURL && !cover.file && cover.url !== selectedAuthor.photoURL;

  return (
    <div className="flex flex-col gap-5">
      <PostFormHeader
        breadcrumb={`Biyografiler › ${isEdit ? "Düzenle" : "Yeni Biyografi"}`}
        title={isEdit ? form.post?.title || "Biyografiyi Düzenle" : "Yeni Biyografi"}
        status={form.post?.status}
        saving={form.saving}
        deleting={form.deleting}
        busy={busy}
        uploadProgress={form.uploadProgress}
        submitError={form.submitError}
        onSubmit={form.submit}
        onCancel={form.cancel}
        onDelete={isEdit ? form.remove : undefined}
        deleteTitle="Biyografiyi sil"
        deleteDescription={<><strong>{form.post?.title}</strong> kalıcı olarak silinecek.</>}
        extra={
          isEdit && (
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <Link href={BIOGRAPHY_ROUTES.detail(form.postId)}>
                <Eye className="w-3.5 h-3.5" />
                Görüntüle
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        {/* ——— Sol ——— */}
        <div className="flex flex-col gap-5 min-w-0">
          <SectionCard title="Biyografisi Yazılan Kişi">
            <FormField
              label="Kişi"
              required
              error={errors.authorId}
              description={
                <>
                  Listede yoksa{" "}
                  <Link href="/icerik-yonetimi/tanimlamalar?tip=yazar" className="underline hover:text-foreground">
                    Tanımlamalar › Yazarlar
                  </Link>{" "}
                  bölümünden ekleyin. Doğum, ölüm ve eser bilgileri oradan gelir.
                </>
              }
            >
              <Combobox
                clearable
                options={options.authors}
                value={values.authorId}
                onChange={form.setSubject}
                placeholder="Yazar veya şair seçin"
                searchPlaceholder="Yazar ara..."
                emptyText="Yazar bulunamadı"
                error={!!errors.authorId}
                disabled={busy}
              />
            </FormField>

            <AuthorSummary authorId={values.authorId} />

            {form.otherBiographies.length > 0 && (
              <div className="flex gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>
                  Bu kişi için zaten biyografi var:{" "}
                  {form.otherBiographies.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ", "}
                      <Link href={BIOGRAPHY_ROUTES.detail(p.id)} className="underline font-medium">
                        {p.title}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Biyografi Bilgileri">
            <FormField label="Başlık (H1)" required error={errors.title} description="Sayfada en üstte görünen ana başlık.">
              <Input
                value={values.title}
                onChange={(e) => form.setTitle(e.target.value)}
                placeholder={
                  selectedAuthor ? `${selectedAuthor.fullName} Kimdir? Hayatı ve Eserleri` : "Biyografinin başlığı"
                }
                disabled={busy}
                className={cn("h-10 text-base font-medium", errors.title && "border-destructive")}
              />
            </FormField>

            <FormField label="Slug" required error={errors.slug}>
              <div
                className={cn(
                  "flex items-center h-8 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring",
                  errors.slug && "border-destructive",
                )}
              >
                <span className="px-2.5 text-xs text-muted-foreground bg-muted border-r border-input h-full flex items-center shrink-0">
                  /biyografi/
                </span>
                <input
                  value={values.slug}
                  onChange={(e) => form.setSlug(e.target.value)}
                  disabled={busy}
                  placeholder="yazar-adi-kimdir"
                  className="flex-1 h-full px-2.5 text-sm bg-transparent outline-none font-mono"
                />
              </div>
            </FormField>

            <FormField
              label="Özet"
              hint={<CharCount count={values.excerpt.length} min={50} max={EXCERPT_LIMIT} />}
              error={errors.excerpt}
              description="Liste ve kartlarda görünür. Boşsa içeriğin başından otomatik oluşturulur."
            >
              <Textarea
                value={values.excerpt}
                onChange={(e) => form.setField("excerpt", e.target.value)}
                placeholder={form.autoExcerpt || (selectedAuthor?.shortBio as string) || "Biyografinin kısa özeti"}
                rows={4}
                disabled={busy}
                className={cn("text-sm resize-none", errors.excerpt && "border-destructive")}
              />
            </FormField>
          </SectionCard>

          <FormField
            label="Biyografi İçeriği"
            hint={form.wordCount > 0 ? `${form.wordCount} kelime · ~${form.readingTime} dk okuma` : undefined}
            error={errors.content}
          >
            <RichTextEditor
              value={values.content}
              onChange={form.setContent}
              onUploadImage={form.uploadContentImage}
              placeholder="Hayatı, edebi kişiliği, eserleri..."
              error={!!errors.content}
              disabled={busy}
            />
          </FormField>

          <SeoCard
            title={values.seoTitle}
            description={values.metaDescription}
            onTitleChange={(v) => form.setField("seoTitle", v)}
            onDescriptionChange={(v) => form.setField("metaDescription", v)}
            fallbackTitle={values.title}
            fallbackDescription={values.excerpt || form.autoExcerpt}
            path={`/biyografi/${values.slug || "biyografi-adresi"}`}
            disabled={busy}
          />
        </div>

        {/* ——— Sağ ——— */}
        <aside className="flex flex-col gap-5">
          <SectionCard title="Kapak Görseli">
            <ImageUpload
              value={cover}
              onChange={form.setCover}
              progress={form.uploadProgress}
              disabled={busy}
              altError={errors.coverAlt}
            />
            {canUsePhoto && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={form.applyAuthorPhoto}
                disabled={busy}
              >
                <UserRound className="w-3.5 h-3.5" />
                Yazarın fotoğrafını kullan
              </Button>
            )}
          </SectionCard>

          <SectionCard title="Sınıflandırma">
            <FormField label="Kategori" required error={errors.categoryId}>
              <Combobox
                options={options.categories}
                value={values.categoryId}
                onChange={(v) => form.setField("categoryId", v)}
                placeholder="Kategori seçin"
                emptyText="Biyografi kategorisi bulunamadı"
                error={!!errors.categoryId}
                disabled={busy}
              />
            </FormField>
            <FormField label="Dönem / Akım" description="Kişi seçilince otomatik dolar">
              <Combobox
                multiple
                options={options.periods}
                value={values.periodIds}
                onChange={(v) => form.setField("periodIds", v)}
                placeholder="Dönem seçin"
                emptyText="Dönem bulunamadı"
                disabled={busy}
              />
            </FormField>
            <FormField label="Temalar">
              <Combobox
                multiple
                options={options.themes}
                value={values.themeIds}
                onChange={(v) => form.setField("themeIds", v)}
                placeholder="Tema seçin"
                emptyText="Tema bulunamadı"
                disabled={busy}
              />
            </FormField>
            <FormField label="Etiketler">
              <Combobox
                multiple
                options={options.tags}
                value={values.tagIds}
                onChange={(v) => form.setField("tagIds", v)}
                placeholder="Etiket seçin"
                emptyText="Etiket bulunamadı"
                disabled={busy}
              />
            </FormField>
          </SectionCard>

          <RelatedSocialCard
            options={options.social}
            value={values.socialPostIds}
            onChange={(v) => form.setField("socialPostIds", v)}
            disabled={busy}
          />

          <SectionCard title="Ayarlar">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="isFeatured" className="text-xs font-medium">Öne çıkan biyografi</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ana sayfadaki öne çıkanlarda gösterilir</p>
              </div>
              <Switch
                id="isFeatured"
                checked={values.isFeatured}
                onCheckedChange={(v) => form.setField("isFeatured", v)}
                disabled={busy}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-xs">
              <span className="text-muted-foreground">Okuma süresi</span>
              <span className="font-medium tabular-nums">{form.wordCount > 0 ? `~${form.readingTime} dk` : "—"}</span>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

const AddBiographyComponents = () => {
  const form = useBiographyForm();
  return <BiographyFormLayout form={form} />;
};

export default AddBiographyComponents;