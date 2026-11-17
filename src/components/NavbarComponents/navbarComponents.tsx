"use client";

import Link from "next/link";
import { LogOut, Bell, ChevronDown, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import MainNavbar from "./mainNavbar";
import MobileNavbar from "./mobileNavbar";

const NavbarComponents = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Sol — Logo + Nav */}
        <div className="flex flex-row items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary rounded-md p-1.5">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Edebi Akış
            </span>
          </Link>

          <div className="h-5 w-px bg-border hidden lg:block" />

          <MainNavbar />
          <MobileNavbar />
        </div>

        {/* Sağ — Bildirim + Profil */}
        <div className="flex items-center gap-1">
          <Link href="/icerik-yonetimi/bildirimler">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </Link>

          <div className="h-5 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 h-8 pl-1.5 pr-2 rounded-full"
              >
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium">
                  EA
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    admin@edebiakis.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/icerik-yonetimi/profil-ayarlari">
                  <User className="mr-2 h-4 w-4" />
                  Profil Ayarları
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/icerik-yonetimi/genel-ayarlar">
                  <Settings className="mr-2 h-4 w-4" />
                  Genel Ayarlar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
export default NavbarComponents;
