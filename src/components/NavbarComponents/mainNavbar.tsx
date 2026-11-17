"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/apilib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navbarItems } from "@/config/navbar.config";

export default function MainNavbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex flex-row items-center gap-0.5">
      {navbarItems.map((item) =>
        item.nested ? (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors outline-none",
                pathname.startsWith(item.url)
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {item.title}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 mt-1">
              {item.nest?.map((sub) => (
                <DropdownMenuItem key={sub.url} asChild>
                  <Link
                    href={sub.url}
                    className={cn(
                      "text-sm cursor-pointer",
                      pathname === sub.url && "font-medium text-foreground",
                    )}
                  >
                    {sub.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            key={item.id}
            href={item.url}
            className={cn(
              "flex items-center gap-1.5 h-8 rounded-md text-sm font-medium transition-colors",
              item.iconOnly ? "w-8 justify-center px-0" : "px-3",
              pathname === item.url
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {!item.iconOnly && item.title}
          </Link>
        ),
      )}
    </nav>
  );
}
