export const translateFirebaseError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/user-not-found":      "Kullanıcı bulunamadı",
    "auth/wrong-password":      "Hatalı şifre",
    "auth/email-already-in-use": "Bu e-posta zaten kullanımda",
    "auth/invalid-email":       "Geçersiz e-posta",
    "auth/weak-password":       "Şifre çok zayıf",
    "auth/too-many-requests":   "Çok fazla deneme, lütfen bekleyin",
    "auth/network-request-failed": "Ağ hatası, bağlantınızı kontrol edin",
  };
  return map[code] ?? "Beklenmedik bir hata oluştu";
};