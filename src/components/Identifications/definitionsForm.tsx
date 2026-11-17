// src/components/Identifications/DefinitionForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox, MultiSelect, Select, Switch } from "@mantine/core";
import { Timestamp } from "firebase/firestore";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/apilib/utils";
import {
  definitionMap,
  statusOptions,
  type DefinitionConfig,
  type DefinitionKey,
} from "@/config/definitions.config";
import {
  definitionForms,
  linkedEntityTypeOptions,
  linkedTypeKey,
  type DefinitionField,
  type DefinitionFormConfig,
  type FormValues,
  type RefFilterContext,
} from "@/config/definitions.fields";
import {
  createDefinition,
  getDefinition,
  isSlugTaken,
  subscribeDefinitions,
  updateDefinition,
  type DefinitionDoc,
} from "@/services/definitions.service";
import type { LiteraryDate } from "@/types/definitions";

const BASE_URL = "/icerik-yonetimi/tanimlamalar";
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const MONTH_DATA = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));

type RefDocs = Partial<Record<DefinitionKey, DefinitionDoc[]>>;

// ——— Yardımcılar ———

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function optionsData(options?: Record<string, { label: string }>) {
  return Object.entries(options ?? {}).map(([value, o]) => ({ value, label: o.label }));
}

function docsToData(key: DefinitionKey, docs: DefinitionDoc[]) {
  const labelField = definitionMap[key].labelField;
  return docs
    .map((d) => ({ value: d.id, label: String(d[labelField] || "(adsız)") }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));
}

function defaultFor(f: DefinitionField): unknown {
  if (f.defaultValue !== undefined) return f.defaultValue;
  switch (f.kind) {
    case "multiselect": case "refs": case "list": case "links":
      return [];
    case "boolean":
      return false;
    case "number": case "select": case "ref": case "date":
    case "datetime": case "coordinates": case "linkedEntity":
      return null;
    default:
      return "";
  }
}

function buildInitial(formCfg: DefinitionFormConfig, doc: DefinitionDoc | null): FormValues {
  const v: FormValues = {};
  for (const f of formCfg.fields) v[f.key] = doc?.[f.key] ?? defaultFor(f);
  if (formCfg.slugFrom) v.slug = doc?.slug ?? "";
  v.status = doc?.status ?? "draft";
  return v;
}

function isEmpty(f: DefinitionField, v: unknown) {
  if (f.kind === "date") return !(v as LiteraryDate | null)?.year;
  if (v == null) return true;
  if (typeof v === "string") return !v.trim();
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function normalizeDate(v: Partial<LiteraryDate> | null): LiteraryDate | null {
  if (!v?.year) return null;
  const out: LiteraryDate = { year: v.year };
  if (v.month) out.month = v.month;
  if (v.day) out.day = v.day;
  if (v.approximate) out.approximate = true;
  return out;
}

// Firestore undefined kabul etmez; her alanı temiz bir değere çevirir
function normalize(formCfg: DefinitionFormConfig, values: FormValues) {
  const out: FormValues = {};
  for (const f of formCfg.fields) {
    let v = values[f.key];
    switch (f.kind) {
      case "date":
        v = normalizeDate(v);
        break;
      case "coordinates":
        v = Number.isFinite(v?.lat) && Number.isFinite(v?.lng) ? { lat: v.lat, lng: v.lng } : null;
        break;
      case "links":
        v = (v ?? [])
          .filter((l: { url: string }) => l.url?.trim())
          .map((l: { label: string; url: string }) => ({
            label: l.label?.trim() || l.url.trim(),
            url: l.url.trim(),
          }));
        break;
      case "list":
        v = [...new Set((v ?? []).map((s: string) => s.trim()).filter(Boolean))];
        if (f.key === "hashtags") v = v.map((h: string) => h.replace(/^#/, ""));
        break;
      case "linkedEntity":
        v = v?.type && v?.id ? { type: v.type, id: v.id } : null;
        break;
      default:
        if (typeof v === "string") {
          v = v.trim();
          if (!v && (f.nullable || f.kind === "image")) v = null;
        }
    }
    out[f.key] = v ?? null;
  }
  if (formCfg.slugFrom) out.slug = values.slug;
  out.status = values.status;
  return out;
}

function validate(formCfg: DefinitionFormConfig, values: FormValues) {
  const errs: Record<string, string> = {};
  for (const f of formCfg.fields) {
    const v = values[f.key];
    if (f.required && isEmpty(f, v)) errs[f.key] = `${f.label} zorunludur`;
    if (f.kind === "date" && v && !v.year && (v.month || v.day))
      errs[f.key] = "Gün veya ay için yıl da girilmeli";
    if (f.kind === "coordinates" && v && Number.isFinite(v.lat) !== Number.isFinite(v.lng))
      errs[f.key] = "Enlem ve boylam birlikte girilmeli";
  }
  if (formCfg.slugFrom && !String(values.slug ?? "").trim()) errs.slug = "Slug zorunludur";
  return { ...errs, ...(formCfg.validate?.(values) ?? {}) };
}

// Formdaki referans alanları için ilgili koleksiyonları dinler
function useRefDocs(keys: DefinitionKey[]) {
  const [docs, setDocs] = useState<RefDocs>({});
  const depKey = keys.join(",");

  useEffect(() => {
    const unsubscribes = keys.map((key) =>
      subscribeDefinitions(
        definitionMap[key].collection,
        (list) => setDocs((prev) => ({ ...prev, [key]: list })),
        () => {},
      ),
    );
    return () => unsubscribes.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return docs;
}

// ——— Alan bileşenleri ———

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
    <div className="grid gap-2 sm:grid-cols-3 sm:gap-4 items-start">
      <div className="pt-1">
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

type InputProps = {
  field: DefinitionField;
  value: FormValues[string];
  onChange: (value: unknown) => void;
  error?: string;
};

function ListInput({ field, value, onChange, error }: InputProps) {
  const list: string[] = value ?? [];
  const [created, setCreated] = useState<string[]>([]);
  const data = [...new Set([...(field.suggestions ?? []), ...created, ...list])];

  return (
    <MultiSelect
      size="xs"
      withinPortal
      searchable
      creatable
      data={data}
      value={list}
      onChange={onChange}
      getCreateLabel={(q) => `+ "${q}" ekle`}
      onCreate={(q) => {
        const item = q.trim();
        setCreated((c) => [...c, item]);
        return item;
      }}
      placeholder={field.placeholder ?? "Yazıp Enter'a basın"}
      error={!!error}
    />
  );
}

function LiteraryDateInput({ value, onChange }: InputProps) {
  const d: Partial<LiteraryDate> = value ?? {};
  const patch = (p: Partial<LiteraryDate>) => onChange({ ...d, ...p });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="number"
        min={1}
        max={31}
        placeholder="Gün"
        className="h-8 w-16 text-sm"
        value={d.day ?? ""}
        onChange={(e) => patch({ day: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Select
        size="xs"
        withinPortal
        clearable
        placeholder="Ay"
        data={MONTH_DATA}
        value={d.month ? String(d.month) : null}
        onChange={(v) => patch({ month: v ? Number(v) : undefined })}
        style={{ width: 120 }}
      />
      <Input
        type="number"
        placeholder="Yıl"
        className="h-8 w-24 text-sm"
        value={d.year || ""}
        onChange={(e) => patch({ year: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Checkbox
        size="xs"
        label="Yaklaşık"
        checked={!!d.approximate}
        onChange={(e) => patch({ approximate: e.currentTarget.checked })}
      />
    </div>
  );
}

function toLocalInput(ts: Timestamp | null) {
  if (!ts?.toDate) return "";
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function LinksInput({ value, onChange }: InputProps) {
  const links: { label: string; url: string }[] = value ?? [];
  const update = (i: number, p: Partial<{ label: string; url: string }>) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...p } : l)));

  return (
    <div className="flex flex-col gap-2">
      {links.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Başlık"
            className="h-8 text-sm w-36"
            value={l.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            placeholder="https://..."
            className="h-8 text-sm flex-1"
            value={l.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onChange(links.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1 w-fit"
        onClick={() => onChange([...links, { label: "", url: "" }])}
      >
        <Plus className="w-3 h-3" />
        Bağlantı ekle
      </Button>
    </div>
  );
}

function CoordinatesInput({ value, onChange }: InputProps) {
  const c: { lat?: number; lng?: number } = value ?? {};
  const num = (s: string) => (s === "" ? undefined : Number(s));

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        step="any"
        placeholder="Enlem (41.0082)"
        className="h-8 text-sm"
        value={c.lat ?? ""}
        onChange={(e) => onChange({ ...c, lat: num(e.target.value) })}
      />
      <Input
        type="number"
        step="any"
        placeholder="Boylam (28.9784)"
        className="h-8 text-sm"
        value={c.lng ?? ""}
        onChange={(e) => onChange({ ...c, lng: num(e.target.value) })}
      />
    </div>
  );
}

function LinkedEntityInput({ value, onChange, refDocs }: InputProps & { refDocs: RefDocs }) {
  const v: { type?: string; id?: string } | null = value;
  const key = v?.type ? linkedTypeKey[v.type] : null;
  const data = key ? docsToData(key, refDocs[key] ?? []) : [];

  return (
    <div className="flex gap-2">
      <Select
        size="xs"
        withinPortal
        clearable
        placeholder="Tür"
        data={optionsData(linkedEntityTypeOptions)}
        value={v?.type ?? null}
        onChange={(t) => onChange(t ? { type: t, id: "" } : null)}
        style={{ width: 150 }}
      />
      <Select
        size="xs"
        withinPortal
        searchable
        disabled={!key}
        placeholder="Kayıt seçin"
        nothingFound="Kayıt bulunamadı"
        data={data}
        value={v?.id || null}
        onChange={(id) => v?.type && onChange({ type: v.type, id: id ?? "" })}
        style={{ flex: 1 }}
      />
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  error,
  refDocs,
  ctx,
}: InputProps & { refDocs: RefDocs; ctx: RefFilterContext }) {
  const errorCls = error ? "border-destructive" : undefined;

  switch (field.kind) {
    case "text":
      return (
        <Input
          value={value ?? ""}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.uppercase ? e.target.value.toUpperCase() : e.target.value)}
          className={cn("h-8 text-sm", field.mono && "font-mono", errorCls)}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={value ?? ""}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn("text-sm", errorCls)}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={cn("h-8 text-sm w-40", errorCls)}
        />
      );

    case "select":
      return (
        <Select
          size="xs"
          withinPortal
          data={optionsData(field.options)}
          value={value ?? null}
          onChange={onChange}
          clearable={!field.required}
          placeholder={field.placeholder ?? "Seçiniz"}
          error={!!error}
        />
      );

    case "multiselect":
      return (
        <MultiSelect
          size="xs"
          withinPortal
          data={optionsData(field.options)}
          value={value ?? []}
          onChange={onChange}
          placeholder={field.placeholder ?? "Seçiniz"}
          error={!!error}
        />
      );

    case "ref":
    case "refs": {
      const key = field.ref!;
      const docs = (refDocs[key] ?? []).filter((d) => !field.refFilter || field.refFilter(d, ctx));
      const common = {
        size: "xs" as const,
        withinPortal: true,
        searchable: true,
        clearable: true,
        nothingFound: "Kayıt bulunamadı",
        data: docsToData(key, docs),
        placeholder: field.placeholder ?? `${definitionMap[key].label} seçin`,
        error: !!error,
      };
      return field.kind === "ref" ? (
        <Select {...common} value={value ?? null} onChange={onChange} />
      ) : (
        <MultiSelect {...common} value={value ?? []} onChange={onChange} />
      );
    }

    case "list":
      return <ListInput field={field} value={value} onChange={onChange} error={error} />;

    case "date":
      return <LiteraryDateInput field={field} value={value} onChange={onChange} />;

    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={toLocalInput(value)}
          onChange={(e) =>
            onChange(e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : null)
          }
          className={cn("h-8 text-sm w-60", errorCls)}
        />
      );

    case "image":
      return (
        <div className="flex items-center gap-3">
          <Input
            value={value ?? ""}
            placeholder="https://..."
            onChange={(e) => onChange(e.target.value)}
            className={cn("h-8 text-sm flex-1", errorCls)}
          />
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-10 h-10 rounded-md object-cover border shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted shrink-0" />
          )}
        </div>
      );

    case "links":
      return <LinksInput field={field} value={value} onChange={onChange} />;

    case "coordinates":
      return <CoordinatesInput field={field} value={value} onChange={onChange} />;

    case "boolean":
      return (
        <Switch
          size="sm"
          checked={!!value}
          onChange={(e) => onChange(e.currentTarget.checked)}
          label={field.placeholder}
        />
      );

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#6b7280"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 rounded-md border border-input bg-transparent cursor-pointer"
          />
          <Input
            value={value ?? ""}
            placeholder="#6b7280"
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm w-32 font-mono"
          />
        </div>
      );

    case "linkedEntity":
      return <LinkedEntityInput field={field} value={value} onChange={onChange} refDocs={refDocs} />;
  }
}

// ——— Form ———

function DefinitionForm({
  config,
  formCfg,
  mode,
  id,
  initialDoc,
}: {
  config: DefinitionConfig;
  formCfg: DefinitionFormConfig;
  mode: "create" | "edit";
  id?: string;
  initialDoc: DefinitionDoc | null;
}) {
  const router = useRouter();
  const backUrl = `${BASE_URL}?tip=${config.key}`;

  const [values, setValues] = useState<FormValues>(() => buildInitial(formCfg, initialDoc));
  const [slugManual, setSlugManual] = useState(mode === "edit"); // düzenlemede URL sabit kalsın
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const refKeys = useMemo(() => {
    const keys = new Set<DefinitionKey>();
    for (const f of formCfg.fields) {
      if (f.ref) keys.add(f.ref);
      if (f.kind === "linkedEntity") Object.values(linkedTypeKey).forEach((k) => keys.add(k));
    }
    return [...keys];
  }, [formCfg]);
  const refDocs = useRefDocs(refKeys);

  const ctx: RefFilterContext = { id, values };
  const statuses = formCfg.statuses ?? ["draft", "published"];

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const setValue = (key: string, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      if (formCfg.slugFrom === key && !slugManual) next.slug = slugify(String(v ?? ""));
      return next;
    });
    clearError(key);
    if (formCfg.slugFrom === key) clearError("slug");
  };

  const handleSubmit = async () => {
    const errs = validate(formCfg, values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitError("Lütfen işaretli alanları kontrol edin.");
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      const data = normalize(formCfg, values);

      if (formCfg.slugFrom && (await isSlugTaken(config.collection, data.slug, id))) {
        setErrors({ slug: "Bu slug başka bir kayıtta kullanılıyor" });
        setSubmitError("Lütfen işaretli alanları kontrol edin.");
        setSaving(false);
        return;
      }

      if (mode === "create") await createDefinition(config.collection, data);
      else await updateDefinition(config.collection, id!, data);

      router.push(backUrl);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Kaydetme başarısız");
      setSaving(false);
    }
  };

  const Icon = config.icon;
  const title =
    mode === "create"
      ? `Yeni ${config.label}`
      : String(initialDoc?.[config.labelField] || config.label);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Üst bilgi */}
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {mode === "create" ? `${config.pluralLabel} › Ekle` : `${config.pluralLabel} › Düzenleniyor`}
          </p>
          <p className="text-sm font-medium">{title}</p>
        </div>
      </div>

      {/* Bölümler */}
      {formCfg.sections.map((section) => {
        const fields = formCfg.fields.filter((f) => f.section === section);
        if (fields.length === 0) return null;
        return (
          <Card key={section}>
            <CardContent className="pt-5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
                {section}
              </p>
              <div className="flex flex-col gap-4">
                {fields.map((f) => (
                  <FormRow key={f.key} label={f.label} hint={f.hint} required={f.required}>
                    <div>
                      <FieldInput
                        field={f}
                        value={values[f.key]}
                        onChange={(v) => setValue(f.key, v)}
                        error={errors[f.key]}
                        refDocs={refDocs}
                        ctx={ctx}
                      />
                      {errors[f.key] && (
                        <p className="text-[10px] text-destructive mt-1">{errors[f.key]}</p>
                      )}
                    </div>
                  </FormRow>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Yayın */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
            Yayın
          </p>
          <div className="flex flex-col gap-4">
            {formCfg.slugFrom && (
              <FormRow
                label="Slug"
                hint={mode === "create" ? "Otomatik oluşur, değiştirilebilir" : "URL'de görünecek kısım"}
                required
              >
                <div>
                  <div
                    className={cn(
                      "flex items-center h-8 rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring",
                      errors.slug && "border-destructive",
                    )}
                  >
                    <span className="px-2.5 text-xs text-muted-foreground bg-muted border-r border-input h-full flex items-center shrink-0">
                      /{config.key}/
                    </span>
                    <input
                      value={values.slug ?? ""}
                      onChange={(e) => {
                        setSlugManual(true);
                        setValues((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                        clearError("slug");
                      }}
                      className="flex-1 h-full px-2.5 text-sm bg-transparent outline-none font-mono"
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-[10px] text-destructive mt-1">{errors.slug}</p>
                  )}
                </div>
              </FormRow>
            )}

            <FormRow label="Durum" required>
              <Select
                size="xs"
                withinPortal
                data={statuses.map((s) => ({ value: s, label: statusOptions[s]?.label ?? s }))}
                value={values.status}
                onChange={(v) => setValue("status", v ?? "draft")}
                style={{ width: 180 }}
              />
            </FormRow>
          </div>
        </CardContent>
      </Card>

      {submitError && <p className="text-xs text-destructive">{submitError}</p>}

      {/* Aksiyonlar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={saving}
          className="gap-1.5 text-muted-foreground"
          onClick={() => router.push(backUrl)}
        >
          <X className="w-3.5 h-3.5" />
          İptal
        </Button>
        <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}

// ——— Sayfa sarmalayıcı: URL'den tipi ve ID'yi okur, düzenlemede veriyi yükler ———

export default function DefinitionFormPage({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();
  const params = useParams();
  const tip = params.tip as DefinitionKey;
  const id = mode === "edit" ? (params.id as string) : undefined;

  const config = definitionMap[tip];
  const formCfg = definitionForms[tip];

  const [doc, setDoc] = useState<DefinitionDoc | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !config || !id) return;
    getDefinition(config.collection, id)
      .then((d) => {
        if (!d) setLoadError(`${config.label} bulunamadı.`);
        setDoc(d);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [mode, config, id]);

  if (!config || !formCfg || loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-muted-foreground">{loadError || "Tanım tipi bulunamadı."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(BASE_URL)}>
          Tanımlamalara Dön
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DefinitionForm
      key={id ?? "new"}
      config={config}
      formCfg={formCfg}
      mode={mode}
      id={id}
      initialDoc={doc}
    />
  );
}