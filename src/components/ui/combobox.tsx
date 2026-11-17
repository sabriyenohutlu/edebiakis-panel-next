// src/components/ui/combobox.tsx
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/apilib/utils";

export type ComboboxOption = { value: string; label: string };

type BaseProps = {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: boolean;
  disabled?: boolean;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
  clearable?: boolean;
};

type MultiProps = BaseProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export function Combobox(props: SingleProps | MultiProps) {
  const {
    options,
    placeholder = "Seçin",
    searchPlaceholder = "Ara...",
    emptyText = "Sonuç bulunamadı",
    error,
    disabled,
  } = props;
  const [open, setOpen] = useState(false);

  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  const toggle = (v: string) => {
    if (props.multiple) {
      props.onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    } else {
      props.onChange(v === props.value && props.clearable ? null : v);
      setOpen(false);
    }
  };

  const clear = (v?: string) => {
    if (props.multiple) props.onChange(v ? selected.filter((x) => x !== v) : []);
    else props.onChange(null);
  };

  // Rozetteki X'e tıklayınca popover açılmasın
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const showClear = !disabled && selected.length > 0 && (props.multiple || props.clearable);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex min-h-8 w-full items-center gap-2 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-left transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
            error && "border-destructive",
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1 min-w-0">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : props.multiple ? (
              selected.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1 pr-1 font-normal">
                  {labelOf(v)}
                  {!disabled && (
                    <span
                      role="button"
                      aria-label="Kaldır"
                      onPointerDown={stop}
                      onClick={(e) => {
                        stop(e);
                        clear(v);
                      }}
                      className="rounded-sm opacity-60 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="truncate">{labelOf(selected[0])}</span>
            )}
          </div>

          {showClear && !props.multiple && (
            <span
              role="button"
              aria-label="Temizle"
              onPointerDown={stop}
              onClick={(e) => {
                stop(e);
                clear();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-sm" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)} className="text-sm">
                  <Check
                    className={cn("w-3.5 h-3.5", selected.includes(o.value) ? "opacity-100" : "opacity-0")}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}