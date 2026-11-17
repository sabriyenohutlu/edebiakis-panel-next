"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/apilib/utils";

const tabs = [
  { label: "Site Ayarları", href: "/icerik-yonetimi/genel-ayarlar/site-ayarlari" },
  { label: "Editörler",     href: "/icerik-yonetimi/genel-ayarlar/editorler" },
];

export default function GenelAyarlarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              pathname.startsWith(tab.href)
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}