// src/components/editor/RichTextEditor.tsx
"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/apilib/utils";
import EditorToolbar from "./EditorToolbar";

type Props = {
  value: string;
  onChange: (html: string, text: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = "Yazmaya başlayın...",
  error,
  disabled,
}: Props) {
  // Editör bir kez kurulduğu için en güncel onChange'i ref'te tutuyoruz
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false, // Next.js SSR için zorunlu
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.isEmpty ? "" : editor.getHTML(), editor.getText());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rich-editor rounded-md border border-input bg-background transition-colors focus-within:ring-1 focus-within:ring-ring",
        error && "border-destructive",
        disabled && "opacity-70",
      )}
    >
      <EditorToolbar editor={editor} onUploadImage={onUploadImage} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}