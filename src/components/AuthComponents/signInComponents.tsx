"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/apilib/utils";
import useAuth from "@/hooks/useAuth";

const signInSchema = z.object({
  email:    z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre zorunludur"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInComponents = () => {
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex w-[45%] bg-foreground flex-col justify-between p-10 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div className="flex items-center gap-2 relative z-10">
          <div className="bg-background rounded-md p-1.5">
            <div className="w-4 h-4 bg-foreground rounded-sm rotate-45" />
          </div>
          <span className="text-sm font-semibold text-background tracking-tight">
            Edebi Akış
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-base font-medium text-background leading-relaxed mb-2">
            "Edebiyat, insanın kendini<br />keşfetme yolculuğudur."
          </p>
          <p className="text-xs text-background/40">İçerik Yönetim Paneli</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm flex flex-col gap-7">

          <div>
            <h1 className="text-lg font-semibold tracking-tight">Hoş geldiniz</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Devam etmek için giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">E-posta</Label>
              <Input
                type="email"
                placeholder="admin@edebiakis.com"
                autoComplete="email"
                className={cn("h-9 text-sm", errors.email && "border-destructive")}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Şifre</Label>
                <Link
                  href="/sifremi-unuttum"
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn("h-9 text-sm pr-9", errors.password && "border-destructive")}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* API hatası */}
            {error && (
              <p className="text-[10px] text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="h-9 text-sm mt-1" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

          </form>

          <p className="text-center text-xs text-muted-foreground">
            Bir hesabınız yok mu?
            <Link href="/kayit-ol" className="ml-2 text-foreground hover:underline">
              Kayıt Olun
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default SignInComponents;