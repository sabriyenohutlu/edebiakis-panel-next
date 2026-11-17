// src/components/AuthComponents/forgotPasswordComponents.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/apilib/utils";
import { translateFirebaseError } from "@/utils/translateFirebaseError";
import { auth } from "../../../firebase"; // kendi firebase dosyanın yolu

const schema = z.object({
  email: z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta girin"),
});

type FormData = z.infer<typeof schema>;

const RESEND_SECONDS = 60;

const ForgotPasswordComponents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // Tekrar gönderme için geri sayım
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendReset = async (email: string) => {
    try {
      setLoading(true);
      setError("");

      auth.languageCode = "tr"; // Firebase e-postası Türkçe gelsin
      await sendPasswordResetEmail(auth, email, {
        // Şifre değiştirildikten sonra "Devam" butonu giriş sayfasına döner
        url: `${window.location.origin}/giris-yap`,
      });

      setSentTo(email);
      setCooldown(RESEND_SECONDS);
    } catch (err: unknown) {
      let message = "Beklenmedik bir hata oluştu";
      if (err instanceof FirebaseError) {
        message = translateFirebaseError(err.code);
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: FormData) => sendReset(data.email.trim());

  return (
    <div className="min-h-screen flex">
      {/* Sol — koyu panel */}
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
          <span className="text-sm font-semibold text-background tracking-tight">Edebi Akış</span>
        </div>
        <div className="relative z-10">
          <p className="text-base font-medium text-background leading-relaxed mb-2">
            "Unutmak da hatırlamanın
            <br />
            bir başka biçimidir."
          </p>
          <p className="text-xs text-background/40">İçerik Yönetim Paneli</p>
        </div>
      </div>

      {/* Sağ — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm flex flex-col gap-7">
          {sentTo ? (
            /* ——— Gönderildi ekranı ——— */
            <div className="flex flex-col gap-5">
              <div className="rounded-full bg-muted w-10 h-10 flex items-center justify-center">
                <MailCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">E-postanızı kontrol edin</h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  <span className="font-medium text-foreground">{sentTo}</span> adresi kayıtlıysa,
                  şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzda göremezseniz spam
                  klasörünü de kontrol edin.
                </p>
              </div>

              {error && <p className="text-[10px] text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="h-9 text-sm"
                  disabled={loading || cooldown > 0}
                  onClick={() => sendReset(sentTo)}
                >
                  {loading
                    ? "Gönderiliyor..."
                    : cooldown > 0
                      ? `Tekrar gönder (${cooldown} sn)`
                      : "Tekrar gönder"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 text-sm text-muted-foreground"
                  onClick={() => {
                    setSentTo(null);
                    setError("");
                  }}
                >
                  Farklı bir e-posta dene
                </Button>
              </div>
            </div>
          ) : (
            /* ——— Form ekranı ——— */
            <>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Şifrenizi mi unuttunuz?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@edebiakis.com"
                    autoComplete="email"
                    autoFocus
                    defaultValue={getValues("email")}
                    className={cn("h-9 text-sm", errors.email && "border-destructive")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {error && <p className="text-[10px] text-destructive text-center">{error}</p>}

                <Button type="submit" className="h-9 text-sm mt-1" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </Button>
              </form>
            </>
          )}

          <Link
            href="/giris-yap"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordComponents;