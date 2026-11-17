// src/components/ui/image-upload.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/apilib/utils";
import { validateImage } from "@/services/storage.service";

export type ImageValue = {
  file: File | null;
  url: string | null;
  path: string | null;
  alt: string;
};

export const emptyImage: ImageValue = { file: null, url: null, path: null, alt: "" };

type Props = {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  progress?: number | null;
  disabled?: boolean;
  aspect?: "video" | "square" | "portrait";
  altError?: string;
};

const aspectClass = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
};

export default function ImageUpload({
  value,
  onChange,
  progress = null,
  disabled,
  aspect = "video",
  altError
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Seçilen dosya için önizleme adresi
  useEffect(() => {
    if (!value.file) {
      setPreview(value.url);
      return;
    }
    const objectUrl = URL.createObjectURL(value.file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value.file, value.url]);

  const pickFile = (file?: File | null) => {
    if (!file) return;
    const msg = validateImage(file);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    onChange({ file, url: null, path: null, alt: value.alt }); 
  };

  const applyUrl = () => {
    const url = urlInput.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      setError("Geçerli bir görsel adresi girin (https://...)");
      return;
    }
    setError("");
   onChange({ file: null, url, path: null, alt: value.alt }); 
    setUrlMode(false);
    setUrlInput("");
  };

  const uploading = progress !== null;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = ""; // Aynı dosya tekrar seçilebilsin
        }}
      />

      {preview ? (
        <div className={cn("relative rounded-lg overflow-hidden border bg-muted", aspectClass[aspect])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Kapak görseli" className="w-full h-full object-cover" />

          {uploading && (
            <div className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Yükleniyor</span>
                <span className="tabular-nums">%{progress}</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {!uploading && !disabled && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-7 w-7 shadow-sm"
                onClick={() => inputRef.current?.click()}
                title="Değiştir"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-7 w-7 shadow-sm text-destructive"
                onClick={() => onChange(emptyImage)}
                title="Kaldır"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : urlMode ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="https://..."
            className="h-8 text-sm"
          />
          <Button type="button" size="sm" className="h-8 text-xs" onClick={applyUrl}>
            Ekle
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors px-4",
            aspectClass[aspect],
            dragging ? "border-foreground bg-muted" : "border-input hover:bg-muted/50",
          )}
        >
          <ImagePlus className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium">Sürükleyip bırakın veya seçin</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP · en fazla 5 MB</p>
          </div>
        </button>
      )}

      {preview && (
  <div className="flex flex-col gap-1">
    <Input
      value={value.alt}
      onChange={(e) => onChange({ ...value, alt: e.target.value })}
      placeholder="Alt metin: görselde ne görünüyor?"
      maxLength={150}
      disabled={disabled}
      className={cn("h-8 text-xs", altError && "border-destructive")}
    />
    {altError && <p className="text-[10px] text-destructive">{altError}</p>}
  </div>
)}

      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}