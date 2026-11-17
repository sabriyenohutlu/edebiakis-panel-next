"use client"
import { getActiveMeta, getAddLabel, getAddUrl, getBreadcrumbs } from "@/apilib/breadcrumpUtils";
import { Home, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PageHeader = () => {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const isHome = pathname === "/icerik-yonetimi";
  const pageTitle = isHome ? "Panel" : (crumbs.at(-1)?.title ?? "");
  const meta = getActiveMeta(pathname);
  const addUrl = getAddUrl(pathname);
  const addLabel = getAddLabel(pathname);

  return (
    <div className="w-full bg-foreground pb-10 "style={{ minHeight: "140px" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 flex flex-col gap-4">
        {/* Breadcrumb — anasayfada sadece home ikonu */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/icerik-yonetimi"
            className="text-background/40 hover:text-background/60 transition-colors"
          >
            <Home className="w-3 h-3" />
          </Link>
          {!isHome &&
            crumbs.map((crumb, i) => (
              <span key={crumb.url} className="flex items-center gap-1.5">
                <span className="w-[3px] h-[3px] rounded-full bg-background/25" />
                {i === crumbs.length - 1 ? (
                  <span className="text-[11px] tracking-wide text-background/60">
                    {crumb.title}
                  </span>
                ) : (
                  <Link
                    href={crumb.url}
                    className="text-[11px] tracking-wide text-background/38 hover:text-background/60 transition-colors"
                  >
                    {crumb.title}
                  </Link>
                )}
              </span>
            ))}
        </div>

        {/* Alt satır */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold tracking-tight leading-none text-background">
              {pageTitle}
            </h1>

            {!isHome && meta && (
              <div className="flex items-center gap-3">
                {meta.count !== undefined && (
                  <span className="flex items-center gap-1 text-[11px] text-background/45">
                    <span className="text-[13px] font-medium text-background/75 tabular-nums">
                      {meta.count}
                    </span>
                    {meta.label}
                  </span>
                )}
                {meta.extra?.map((item, i) => (
                  <span key={i} className="flex items-center gap-3">
                    <span className="w-[3px] h-[3px] rounded-full bg-background/20" />
                    <span className="flex items-center gap-1 text-[11px] text-background/45">
                      <span className="text-[13px] font-medium text-background/75 tabular-nums">
                        {item.count}
                      </span>
                      {item.label}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {!isHome && addUrl && (
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-[7px] bg-background/[0.06] border border-background/10 text-background/60 hover:bg-background/10 hover:text-background/80 transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-[7px] bg-background/[0.06] border border-background/10 text-background/60 hover:bg-background/10 hover:text-background/80 transition-colors">
                <List className="w-3.5 h-3.5" />
              </button>
              <Link
                href={addUrl}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-[7px] bg-background/10 border border-background/15 text-[12px] font-medium text-background/85 hover:bg-background/15 hover:text-background transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {addLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PageHeader;
