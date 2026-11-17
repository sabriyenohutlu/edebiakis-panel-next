"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/apilib/utils";
import {
  definitionConfigs,
  definitionGroups,
  definitionMap,
  type DefinitionKey,
} from "@/config/definitions.config";
import { countDefinitions } from "@/services/definitions.service";
import DefinitionTable from "./definitionTable"; // dosyayı nereye koyduysan

const DEFAULT_KEY: DefinitionKey = "yazar";

const IdentificationsInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tip = searchParams.get("tip") as DefinitionKey | null;
  const active = tip && tip in definitionMap ? definitionMap[tip] : definitionMap[DEFAULT_KEY];

  const [counts, setCounts] = useState<Record<string, number>>({});

  // Sekme değiştikçe sayıları tazele
  useEffect(() => {
    countDefinitions(definitionConfigs.map((c) => c.collection))
      .then(setCounts)
      .catch(() => {});
  }, [active.key]);

  const select = (key: DefinitionKey) => {
    router.replace(`?tip=${key}`, { scroll: false });
  };

  const ActiveIcon = active.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sol menü */}
      <aside className="lg:w-60 shrink-0">
        <nav className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {definitionGroups.map((group) => (
            <div key={group} className="flex lg:flex-col gap-1 shrink-0">
              <p className="hidden lg:block text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2.5 mb-1">
                {group}
              </p>
              {definitionConfigs
                .filter((c) => c.group === group)
                .map((c) => {
                  const Icon = c.icon;
                  const isActive = c.key === active.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => select(c.key)}
                      className={cn(
                        "flex items-center gap-2 h-8 px-2.5 rounded-md text-sm whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 text-left">{c.pluralLabel}</span>
                      {counts[c.collection] !== undefined && (
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {counts[c.collection]}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>

      {/* İçerik */}
      <section className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted p-2">
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{active.pluralLabel}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{active.description}</p>
          </div>
        </div>

        {/* key: sekme değişince tablo sıfırdan kurulsun */}
        <DefinitionTable key={active.key} config={active} />
      </section>
    </div>
  );
};

// useSearchParams, Next.js'te Suspense içinde olmalı
const IdentificationsComponents = () => (
  <Suspense fallback={null}>
    <IdentificationsInner />
  </Suspense>
);

export default IdentificationsComponents;