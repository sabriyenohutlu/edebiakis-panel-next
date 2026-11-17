// src/components/editor/EditorToolbar.tsx
"use client";
import { Label } from "@/components/ui/label";
import { useRef, useState, type ComponentProps } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/apilib/utils";

// ——— Küçük parçalar ———

function ToolbarButton({
  active,
  className,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      // Tıklayınca editördeki seçim kaybolmasın
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none",
        "[&_svg]:w-3.5 [&_svg]:h-3.5",
        active && "bg-muted text-foreground",
        className,
      )}
      {...props}
    />
  );
}

const Divider = () => <div className="w-px h-5 bg-border mx-1 shrink-0" />;

function normalizeUrl(url: string) {
  if (/^(https?:\/\/|mailto:|\/)/i.test(url)) return url;
  return `https://${url}`;
}

function LinkButton({
  editor,
  active,
  disabled,
}: {
  editor: Editor;
  active: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (next) setUrl(editor.getAttributes("link").href ?? "");
    setOpen(next);
  };

  const apply = () => {
    const href = url.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href: normalizeUrl(href) }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <ToolbarButton title="Bağlantı" active={active} disabled={disabled}>
          <Link2 />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="flex gap-2">
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
            placeholder="https://..."
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8 text-xs" onClick={apply}>
            Uygula
          </Button>
        </div>
        {active && (
          <button
            type="button"
            onClick={remove}
            className="mt-2 text-[11px] text-destructive hover:underline"
          >
            Bağlantıyı kaldır
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
function ImageButton({
  editor,
  onUpload,
  disabled,
}: {
  editor: Editor;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setFile(null);
    setAlt("");
    setError("");
  };

  const insert = async () => {
    if (!file) return setError("Bir görsel seçin");
    if (!alt.trim()) return setError("Alt metin zorunludur");
    try {
      setUploading(true);
      setError("");
      const src = await onUpload(file);
      editor.chain().focus().setImage({ src, alt: alt.trim() }).run();
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (uploading) return;
        setOpen(next);
        if (!next) reset();
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarButton title="Görsel ekle" active={open} disabled={disabled}>
          <ImagePlus />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3 flex flex-col gap-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setError("");
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs justify-start gap-2 font-normal"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {file ? file.name : "Görsel seç (JPG, PNG, WEBP)"}
          </span>
        </Button>

        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">
            Alt metin <span className="text-destructive">*</span>
          </Label>
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insert();
              }
            }}
            placeholder="Görselde ne görünüyor?"
            maxLength={150}
            disabled={uploading}
            className="h-8 text-sm"
          />
        </div>

        {error && <p className="text-[10px] text-destructive">{error}</p>}

        <Button
          type="button"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={insert}
          disabled={uploading}
        >
          {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {uploading ? "Yükleniyor..." : "Ekle"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function AltButton({
  editor,
  alt,
  disabled,
}: {
  editor: Editor;
  alt: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const apply = () => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", { alt: value.trim() || null })
      .run();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setValue(alt);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <ToolbarButton
          title="Görselin alt metni"
          active={open}
          disabled={disabled}
          className={cn(
            "w-auto px-2 text-[11px] font-medium",
            !alt && "text-destructive",
          )}
        >
          Alt
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <div className="flex gap-2">
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
            placeholder="Görselde ne görünüyor?"
            maxLength={150}
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8 text-xs" onClick={apply}>
            Kaydet
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
// ——— Araç çubuğu ———

type Props = {
  editor: Editor | null;
  onUploadImage?: (file: File) => Promise<string>;
  disabled?: boolean;
};

export default function EditorToolbar({
  editor,
  onUploadImage,
  disabled,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Sadece butonların aktifliği değişince yeniden çizilir
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        paragraph: e.isActive("paragraph"),
        h2: e.isActive("heading", { level: 2 }),
        h3: e.isActive("heading", { level: 3 }),
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        image: e.isActive("image"),
        imageAlt: (e.getAttributes("image").alt as string | undefined) ?? "",
        strike: e.isActive("strike"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        codeBlock: e.isActive("codeBlock"),
        link: e.isActive("link"),
        alignLeft: e.isActive({ textAlign: "left" }),
        alignCenter: e.isActive({ textAlign: "center" }),
        alignRight: e.isActive({ textAlign: "right" }),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  if (!editor || !s) return <div className="h-[41px] border-b" />;

  const handleImage = async (file?: File) => {
    if (!file || !onUploadImage) return;
    try {
      setUploading(true);
      setImageError("");
      const src = await onUploadImage(file);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const c = () => editor.chain().focus();

  return (
    <div className="border-b">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <ToolbarButton
          title="Geri al"
          disabled={disabled || !s.canUndo}
          onClick={() => c().undo().run()}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          title="Yinele"
          disabled={disabled || !s.canRedo}
          onClick={() => c().redo().run()}
        >
          <Redo2 />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Paragraf"
          active={s.paragraph}
          disabled={disabled}
          onClick={() => c().setParagraph().run()}
        >
          <Pilcrow />
        </ToolbarButton>
        <ToolbarButton
          title="Başlık"
          active={s.h2}
          disabled={disabled}
          onClick={() => c().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          title="Alt başlık"
          active={s.h3}
          disabled={disabled}
          onClick={() => c().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Kalın (Ctrl+B)"
          active={s.bold}
          disabled={disabled}
          onClick={() => c().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          title="İtalik (Ctrl+I)"
          active={s.italic}
          disabled={disabled}
          onClick={() => c().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          title="Altı çizili (Ctrl+U)"
          active={s.underline}
          disabled={disabled}
          onClick={() => c().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Üstü çizili"
          active={s.strike}
          disabled={disabled}
          onClick={() => c().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Madde listesi"
          active={s.bulletList}
          disabled={disabled}
          onClick={() => c().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          title="Numaralı liste"
          active={s.orderedList}
          disabled={disabled}
          onClick={() => c().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          title="Alıntı"
          active={s.blockquote}
          disabled={disabled}
          onClick={() => c().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          title="Kod bloğu"
          active={s.codeBlock}
          disabled={disabled}
          onClick={() => c().toggleCodeBlock().run()}
        >
          <Code />
        </ToolbarButton>
        <ToolbarButton
          title="Ayırıcı çizgi"
          disabled={disabled}
          onClick={() => c().setHorizontalRule().run()}
        >
          <Minus />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Sola hizala"
          active={s.alignLeft}
          disabled={disabled}
          onClick={() => c().setTextAlign("left").run()}
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          title="Ortala"
          active={s.alignCenter}
          disabled={disabled}
          onClick={() => c().setTextAlign("center").run()}
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          title="Sağa hizala"
          active={s.alignRight}
          disabled={disabled}
          onClick={() => c().setTextAlign("right").run()}
        >
          <AlignRight />
        </ToolbarButton>

        <Divider />

        <LinkButton editor={editor} active={s.link} disabled={disabled} />

        {onUploadImage && (
          <ImageButton
            editor={editor}
            onUpload={onUploadImage}
            disabled={disabled}
          />
        )}
        {s.image && (
          <AltButton editor={editor} alt={s.imageAlt} disabled={disabled} />
        )}
      </div>

      {imageError && (
        <p className="px-3 pb-1.5 text-[10px] text-destructive">{imageError}</p>
      )}
    </div>
  );
}
