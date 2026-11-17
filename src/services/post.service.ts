import {
  collection, doc, getDoc, getDocs, increment, limit, onSnapshot,
  query, serverTimestamp, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../firebase"; // kendi firebase dosyanın yolu
import { deleteImage } from "@/services/storage.service";
import type { Post, PostStatus } from "@/types/post";
import type { PostType } from "@/types/category";

const postsCol = collection(db, "posts");
// Tablodan hızlı durum değişikliği (onayla / yayından kaldır)
export async function setPostStatus(post: Post, status: PostStatus) {
  await updateDoc(doc(postsCol, post.id), {
    status,
    ...(status === "published" && !post.publishedAt ? { publishedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function setPostFeatured(id: string, isFeatured: boolean) {
  await updateDoc(doc(postsCol, id), { isFeatured, updatedAt: serverTimestamp() });
}
export function subscribePosts(
  postType: PostType,
  onData: (posts: Post[]) => void,
  onError: (err: Error) => void,
) {
  const q = query(postsCol, where("post_type", "==", postType));
  return onSnapshot(
    q,
    (snap) => {
      try {
        const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
        // En yeni üstte
        posts.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
        onData(posts);
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    onError,
  );
}

export const newPostId = () => doc(postsCol).id;

export async function isPostSlugTaken(slug: string, excludeId?: string) {
  const snap = await getDocs(query(postsCol, where("slug", "==", slug), limit(2)));
  return snap.docs.some((d) => d.id !== excludeId);
}

export type PostInput = Omit<
  Post,
  "id" | "createdAt" | "updatedAt" | "publishedAt" | "viewCount" | "createdBy" | "authorName"
>;

export async function createPost(id: string, data: PostInput) {
  const user = auth.currentUser;
  const batch = writeBatch(db);

  batch.set(doc(postsCol, id), {
    ...data,
    authorName: user?.displayName || user?.email || "Bilinmiyor",
    createdBy: user?.uid ?? null,
    viewCount: 0,
    publishedAt: data.status === "published" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Kategorideki içerik sayısını artır
  if (data.categoryId) {
    batch.update(doc(db, "categories", data.categoryId), { contentCount: increment(1) });
  }

  await batch.commit();
}

export async function deletePost(post: Pick<Post, "id" | "categoryId" | "coverPath">) {
  const batch = writeBatch(db);
  batch.delete(doc(postsCol, post.id));

  // Kategori silinmişse sayacı güncellemeye çalışma (yoksa tüm işlem başarısız olur)
  if (post.categoryId) {
    const catRef = doc(db, "categories", post.categoryId);
    if ((await getDoc(catRef)).exists()) {
      batch.update(catRef, { contentCount: increment(-1) });
    }
  }

  await batch.commit();
  if (post.coverPath) await deleteImage(post.coverPath).catch(() => {});
}
export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(postsCol, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Post) : null;
}

export async function updatePost(prev: Post, data: PostInput) {
  const batch = writeBatch(db);

  // İlk kez yayınlanıyorsa yayın tarihini yaz; daha önce yayınlandıysa ilk tarih korunur
  const firstPublish = data.status === "published" && !prev.publishedAt;

  batch.update(doc(postsCol, prev.id), {
    ...data,
    ...(firstPublish ? { publishedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });

  // Kategori değiştiyse sayaçları taşı
  if (prev.categoryId !== data.categoryId) {
    if (prev.categoryId) {
      const oldRef = doc(db, "categories", prev.categoryId);
      if ((await getDoc(oldRef)).exists()) {
        batch.update(oldRef, { contentCount: increment(-1) });
      }
    }
    if (data.categoryId) {
      batch.update(doc(db, "categories", data.categoryId), { contentCount: increment(1) });
    }
  }

  await batch.commit();
}
// Tek bir yazıyı canlı dinler (detay sayfası için)
export function subscribePost(
  id: string,
  onData: (post: Post | null) => void,
  onError: (err: Error) => void,
) {
  return onSnapshot(
    doc(postsCol, id),
    (snap) => onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as Post) : null),
    onError,
  );
}
export async function isDisplayDateTaken(date: string, excludeId?: string) {
  const snap = await getDocs(
    query(postsCol, where("post_type", "==", "dailyword"), where("displayDate", "==", date), limit(2)),
  );
  return snap.docs.some((d) => d.id !== excludeId);
}