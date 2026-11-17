"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, X, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/apilib/utils";
import { Category, PostType, postTypeConfig } from "@/types/category";
import {
  deleteCategory,
  subscribeCategories,
  updateCategory,
} from "@/services/category.service";

// ——— Helpers ———

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function FormRow({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <div className="pt-1">
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

const postTypes = Object.keys(postTypeConfig) as PostType[];
const LIST_URL = "/icerik-yonetimi/kategoriler";

// ——— Dış bileşen: veriyi yükler ———

const UpdateCategory = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeCategories(
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      (err) => {
        setLoadError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const category = categories.find((c) => c.id === id);

  if (loading || leaving) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-muted-foreground">
          {loadError || "Kategori bulunamadı."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push(LIST_URL)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  // key: başka bir kategoriye geçilince form sıfırlansın
  return (
    <UpdateCategoryForm
      key={category.id}
      category={category}
      categories={categories}
      onLeave={() => {
        setLeaving(true);
        router.push(LIST_URL);
      }}
    />
  );
};

// ——— İç bileşen: form ———

function UpdateCategoryForm({
  category,
  categories,
  onLeave,
}: {
  category: Category;
  categories: Category[];
  onLeave: () => void;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: category.title,
    name: category.name,
    slug: category.slug,
    post_type: category.post_type as PostType | "",
    description: category.description ?? "",
    parent_id: category.parent_id,
  });
  const [slugManual, setSlugManual] = useState(true); // mevcut slug korunsun
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const children = categories.filter((c) => c.parent_id === category.id);
  const hasChildren = children.length > 0;
  const parentCategories = categories.filter(
    (c) => !c.parent_id && c.id !== category.id,
  );

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManual ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.title.trim()) newErrors.title = "Başlık zorunludur";
    if (!form.name.trim()) newErrors.name = "İsim zorunludur";
    if (!form.slug.trim()) newErrors.slug = "Slug zorunludur";
    else if (categories.some((c) => c.slug === form.slug && c.id !== category.id))
      newErrors.slug = "Bu slug başka bir kategoride kullanılıyor";
    if (!form.post_type) newErrors.post_type = "Post type seçiniz";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setSubmitError("");
      await updateCategory(category.id, {
        title: form.title.trim(),
        name: form.name.trim(),
        slug: form.slug,
        post_type: form.post_type as PostType,
        description: form.description.trim() || null,
        parent_id: form.parent_id,
      });
      onLeave();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Kaydetme başarısız");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setSubmitError("");
      await deleteCategory(category.id);
      onLeave();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Silme başarısız");
      setDeleting(false);
    }
  };

  const busy = saving || deleting;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Üst bilgi */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Düzenleniyor</p>
          <p className="text-sm font-medium">{category.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
              postTypeConfig[category.post_type]?.color,
            )}
          >
            {category.post_type}
          </span>
          <span className="text-xs text-muted-foreground">
            {category.contentCount ?? 0} içerik
          </span>
        </div>
      </div>

      {/* Temel Bilgiler */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Temel Bilgiler
          </p>
          <div className="flex flex-col gap-4">
            <FormRow label="Başlık" hint="Görünen kategori adı" required>
              <div>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={cn("h-8 text-sm", errors.title && "border-destructive")}
                />
                {errors.title && (
                  <p className="text-[10px] text-destructive mt-1">{errors.title}</p>
                )}
              </div>
            </FormRow>

            <FormRow label="İsim" hint="Sistem içi tekil isim (İngilizce)" required>
              <div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase() })}
                  className={cn("h-8 text-sm", errors.name && "border-destructive")}
                />
                {errors.name && (
                  <p className="text-[10px] text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            </FormRow>

            <FormRow label="Slug" hint="URL'de görünecek kısım" required>
              <div>
                <div
                  className={cn(
                    "flex items-center h-8 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring",
                    errors.slug && "border-destructive",
                  )}
                >
                  <span className="px-2.5 text-xs text-muted-foreground bg-muted border-r border-input h-full flex items-center shrink-0">
                    /kategori/
                  </span>
                  <input
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 h-full px-2.5 text-sm bg-transparent outline-none font-mono"
                  />
                </div>
                {errors.slug && (
                  <p className="text-[10px] text-destructive mt-1">{errors.slug}</p>
                )}
              </div>
            </FormRow>

            <FormRow label="Açıklama">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="text-sm resize-none"
                rows={2}
              />
            </FormRow>
          </div>
        </CardContent>
      </Card>

      {/* Sınıflandırma */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Sınıflandırma
          </p>
          <div className="flex flex-col gap-4">
            <FormRow label="Post Type" required>
              <div>
                <Select
                  value={form.post_type}
                  onValueChange={(v) => setForm({ ...form, post_type: v as PostType })}
                >
                  <SelectTrigger
                    className={cn("h-8 text-sm", errors.post_type && "border-destructive")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        <span
                          className={cn(
                            "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full",
                            postTypeConfig[pt].color,
                          )}
                        >
                          {postTypeConfig[pt].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.post_type && (
                  <p className="text-[10px] text-destructive mt-1">{errors.post_type}</p>
                )}
              </div>
            </FormRow>

            <FormRow
              label="Üst Kategori"
              hint={
                hasChildren
                  ? "Alt kategorisi olan bir kategori başka bir kategorinin altına taşınamaz"
                  : "Boş bırakılırsa ana kategori olur"
              }
            >
              <Select
                value={form.parent_id ?? "none"}
                onValueChange={(v) =>
                  setForm({ ...form, parent_id: v === "none" ? null : v })
                }
                disabled={hasChildren}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">— Ana kategori —</span>
                  </SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>
        </CardContent>
      </Card>

      {/* Alt kategoriler */}
      {hasChildren && (
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Alt Kategoriler ({children.length})
            </p>
            <div className="flex flex-col divide-y">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{child.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{child.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => router.push(`${LIST_URL}/${child.id}/duzenle`)}
                  >
                    Düzenle
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {submitError && (
        <p className="text-xs text-destructive">{submitError}</p>
      )}

      {/* Aksiyon butonları */}
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Siliniyor..." : "Kategoriyi Sil"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{category.title}</strong> kategorisi silinecek.
                {hasChildren && (
                  <span className="block mt-1 text-destructive">
                    Bu kategoriye bağlı {children.length} alt kategori de silinecek.
                  </span>
                )}{" "}
                Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            className="gap-1.5 text-muted-foreground"
            onClick={() => router.push(LIST_URL)}
          >
            <X className="w-3.5 h-3.5" />
            İptal
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={busy}>
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpdateCategory;