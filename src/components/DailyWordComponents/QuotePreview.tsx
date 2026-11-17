// src/components/DailyWordComponents/QuotePreview.tsx
import { cn } from "@/apilib/utils";

type Props = {
  text: string;
  author?: string;
  work?: string;
  size?: "md" | "lg";
};

export default function QuotePreview({ text, author, work, size = "md" }: Props) {
  return (
    <figure className={cn("rounded-lg bg-muted/40 text-center", size === "lg" ? "px-8 py-14" : "px-6 py-8")}>
      <blockquote
        className={cn(
          "font-serif italic leading-relaxed whitespace-pre-line",
          size === "lg" ? "text-2xl" : "text-lg",
          !text && "text-muted-foreground",
        )}
      >
        “{text || "Söz burada görünecek"}”
      </blockquote>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        — {author || "Anonim"}
        {work && <span className="italic">, {work}</span>}
      </figcaption>
    </figure>
  );
}