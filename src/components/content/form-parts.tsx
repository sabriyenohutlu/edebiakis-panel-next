// src/components/content/form-parts.tsx
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/apilib/utils";

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

export function FormField({
  label,
  required,
  hint,
  description,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground tabular-nums">{hint}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-[10px] text-destructive">{error}</p>
      ) : (
        description && <p className="text-[10px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// İdeal aralıkta yeşil, kısaysa sarı, uzunsa kırmızı
export function CharCount({ count, min, max }: { count: number; min: number; max: number }) {
  return (
    <span
      className={cn(
        count === 0 ? "text-muted-foreground" : count > max ? "text-destructive" : count < min ? "text-amber-600" : "text-emerald-600",
      )}
    >
      {count}/{max}
    </span>
  );
}