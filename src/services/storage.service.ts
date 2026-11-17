// src/services/storage.service.ts
// Görseller Cloudinary'de tutuluyor (Firebase Storage yerine).
// Fonksiyon adları aynı kaldığı için formlar ve editör değişmeden çalışır.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Sadece JPG, PNG veya WEBP yükleyebilirsiniz.";
  if (file.size > IMAGE_MAX_BYTES) return "Görsel en fazla 5 MB olabilir.";
  return null;
}

// Tarayıcıya en uygun formatı (WebP/AVIF) ve kaliteyi otomatik seçtirir
export function optimizeImageUrl(url: string) {
  if (!url.includes("/image/upload/") || url.includes("/image/upload/f_auto")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
}

/**
 * Görseli Cloudinary'ye yükler.
 * path: "posts/abc123/cover-1700000000.png" → uzantı atılıp Cloudinary'de kimlik (public_id) olarak kullanılır.
 * Dönen path, Cloudinary public_id'sidir (Firestore'da coverPath olarak saklanır).
 */
export function uploadImage(
  file: File,
  path: string,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; path: string }> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error("Cloudinary ayarları eksik. .env.local dosyasını kontrol edip sunucuyu yeniden başlatın."),
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("public_id", path.replace(/\.[^/.]+$/, ""));

  return new Promise((resolve, reject) => {
    // fetch yükleme ilerlemesini vermediği için XMLHttpRequest kullanıyoruz
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let data: CloudinaryResponse | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // yanıt JSON değilse aşağıda genel hata verilir
      }

      if (xhr.status >= 200 && xhr.status < 300 && data?.secure_url && data.public_id) {
        resolve({ url: optimizeImageUrl(data.secure_url), path: data.public_id });
      } else {
        const detail = data?.error?.message;
        reject(new Error(detail ? `Görsel yüklenemedi: ${detail}` : "Görsel yüklenemedi"));
      }
    };

    xhr.onerror = () => reject(new Error("Görsel yüklenemedi: bağlantı hatası"));
    xhr.send(form);
  });
}

/**
 * Cloudinary'de silme işlemi API secret gerektirdiği için tarayıcıdan yapılamaz.
 * Şimdilik bir şey yapmıyor; silinen yazıların görselleri Cloudinary panelinden
 * (Media Library) elle silinebilir. Backend gelince burası doldurulacak.
 */
export async function deleteImage(path: string): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[storage] Cloudinary görseli tarayıcıdan silinemez, elle silinmeli:", path);
  }
}