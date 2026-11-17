"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/apilib/utils";
import { Button } from "@/components/ui/button";
import { navbarItems } from "@/config/navbar.config";

export default function MobileNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (id: number) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {open && (
        <div className="absolute top-14 left-0 right-0 z-50 border-b bg-background shadow-sm">
          <nav className="mx-auto max-w-7xl px-4 py-2 flex flex-col gap-0.5">
            {navbarItems.map((item) => (
              <div key={item.id}>
                {item.nested ? (
                  <>
                    <button
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname.startsWith(item.url)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          expanded === item.id && "rotate-180"
                        )}
                      />
                    </button>

                    {expanded === item.id && (
                      <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l pl-3 mb-1">
                        {item.nest?.map((sub) => (
                          <Link
                            key={sub.url}
                            href={sub.url}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-md text-sm transition-colors",
                              pathname === sub.url
                                ? "bg-accent text-foreground font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.url}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.url
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}