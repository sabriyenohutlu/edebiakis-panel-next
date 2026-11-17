"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/apilib/utils";
import { translateFirebaseError } from "@/utils/translateFirebaseError";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../../firebase";
import { ensureUserDoc } from "@/services/user.service";

const registerSchema = z
  .object({
    username: z.string().min(1, "Kullanıcı adı zorunludur"),
    email: z
      .string()
      .min(1, "E-posta zorunludur")
      .email("Geçerli bir e-posta girin"),
    password: z
      .string()
      .min(1, "Şifre zorunludur")
      .min(8, "Şifre en az 8 karakter olmalıdır"),
    passwordConfirm: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });
type RegisterFormData = z.infer<typeof registerSchema>;

// ——— Component ———

const RegisterComponents = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });
  // Şifre güç göstergesi
  const passwordValue = watch("password");

  const getPasswordStrength = () => {
    const p = passwordValue;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthConfig = [
    { label: "", color: "" },
    { label: "Zayıf", color: "bg-red-500" },
    { label: "Orta", color: "bg-amber-500" },
    { label: "İyi", color: "bg-blue-500" },
    { label: "Güçlü", color: "bg-emerald-500" },
  ];

  const strength = getPasswordStrength();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError("");

      // 1. Firebase Auth'ta kullanıcı oluştur
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      // 2. Kullanıcı adını Auth profiline yaz
      await updateProfile(user, { displayName: data.username });

      // 3. Firestore'da users/{uid} dokümanını oluştur
      await ensureUserDoc(user, data.username);

      router.push("/icerik-yonetimi");
    } catch (err: unknown) {
      let message = "Beklenmedik bir hata oluştu";
      if (err instanceof FirebaseError) {
        console.log("Firebase error code:", err.code);
        message = translateFirebaseError(err.code);
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Sol — koyu panel */}
      <div className="hidden lg:flex w-[45%] bg-foreground flex-col justify-between p-10 relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
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
            "Bir kitap, uyuyan bir ruhun
            <br />
            uyandığı yerdir."
          </p>
          <p className="text-xs text-background/40">İçerik Yönetim Paneli</p>
        </div>
      </div>

      {/* Sağ — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm flex flex-col gap-7">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Hesap oluştur
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Panele erişmek için kayıt olun
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Kullanıcı adı */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Kullanıcı Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="johndoe"
                autoComplete="username"
                className={cn(
                  "h-9 text-sm",
                  errors.username && "border-destructive",
                )}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-[10px] text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* E-posta */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                E-posta <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                placeholder="ahmet@edebiakis.com"
                autoComplete="email"
                className={cn(
                  "h-9 text-sm",
                  errors.email && "border-destructive",
                )}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Şifre */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Şifre <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="En az 8 karakter"
                  autoComplete="new-password"
                  className={cn(
                    "h-9 text-sm pr-9",
                    errors.password && "border-destructive",
                  )}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Şifre güç göstergesi */}
              {passwordValue && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i <= strength
                            ? strengthConfig[strength].color
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Şifre gücü:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        strength === 1 && "text-red-500",
                        strength === 2 && "text-amber-500",
                        strength === 3 && "text-blue-500",
                        strength === 4 && "text-emerald-500",
                      )}
                    >
                      {strengthConfig[strength].label}
                    </span>
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-[10px] text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Şifre tekrar */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium">
                Şifre Tekrar <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Şifrenizi tekrar girin"
                  autoComplete="new-password"
                  className={cn(
                    "h-9 text-sm pr-9",
                    errors.passwordConfirm && "border-destructive",
                  )}
                  {...register("passwordConfirm")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-[10px] text-destructive">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            {/* API hatası */}
            {error && (
              <p className="text-[10px] text-destructive text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-9 text-sm mt-1"
              disabled={loading}
            >
              {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/giris-yap"
              className="text-foreground font-medium hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponents;
