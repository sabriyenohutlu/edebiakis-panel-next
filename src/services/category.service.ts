// src/services/category.service.ts
import {
  addDoc,
  collection, doc, getDocs, limit, onSnapshot, orderBy, query,
  serverTimestamp, where, writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase" // kendi firebase dosyanın yolu
import type { Category } from "../types/category";
import { categoryData } from "@/apilib/mockData/category.data";
import { updateDoc } from "firebase/firestore";

export type CategoryInput = Pick<
  Category,
  "title" | "name" | "slug" | "post_type" | "description" | "parent_id"
>;

export async function updateCategory(id: string, data: CategoryInput) {
  await updateDoc(doc(categoriesCol, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
const categoriesCol = collection(db, "categories");

// Canlı dinleme: Firestore'da değişiklik olunca tablo kendiliğinden güncellenir
export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onError: (err: Error) => void,
) {
  const q = query(categoriesCol, orderBy("order"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)),
    onError,
  );
}

// Ana kategoriyi alt kategorileriyle birlikte siler
export async function deleteCategory(id: string) {
  const batch = writeBatch(db);
  const children = await getDocs(query(categoriesCol, where("parent_id", "==", id)));
  children.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(categoriesCol, id));
  await batch.commit();
}

// Mock verileri bir kerelik Firestore'a yükler
export async function seedCategories() {
  const existing = await getDocs(query(categoriesCol, limit(1)));
  if (!existing.empty) throw new Error("Kategoriler zaten yüklenmiş.");

  const batch = writeBatch(db);
  const idMap = new Map<string, string>();

  // Önce ana kategoriler, sonra alt kategoriler (parent ID'leri hazır olsun diye)
  const ordered = [
    ...categoryData.filter((c) => !c.parent_id),
    ...categoryData.filter((c) => c.parent_id),
  ];

for (const c of ordered) {
  const ref = doc(categoriesCol);
  idMap.set(c.id, ref.id);
  batch.set(ref, {
    name: c.name,
    title: c.title,
    slug: c.slug,
    post_type: c.post_type,
    description: c.description,
    parent_id: c.parent_id ? idMap.get(c.parent_id)! : null,
    contentCount: c.contentCount,
    order: c.order, // c.id idi — artık string olduğu için sıralama için order alanını kullanıyoruz
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

  await batch.commit();
}
export async function createCategory(data: CategoryInput, order: number) {
  const ref = await addDoc(categoriesCol, {
    ...data,
    contentCount: 0,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}