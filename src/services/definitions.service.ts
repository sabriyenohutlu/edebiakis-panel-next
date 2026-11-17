// src/services/definitions.service.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
export type DefinitionDoc = { id: string } & DocumentData;

// ——— Okuma ———

export function subscribeDefinitions(
  collectionName: string,
  onData: (docs: DefinitionDoc[]) => void,
  onError: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, collectionName),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}

export async function getDefinition(collectionName: string, id: string) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DefinitionDoc) : null;
}

export async function countDefinitions(collectionNames: string[]) {
  const results = await Promise.all(
    collectionNames.map(async (name) => {
      const snap = await getCountFromServer(collection(db, name));
      return [name, snap.data().count] as const;
    }),
  );
  return Object.fromEntries(results) as Record<string, number>;
}

export async function isSlugTaken(collectionName: string, slug: string, excludeId?: string) {
  const snap = await getDocs(
    query(collection(db, collectionName), where("slug", "==", slug), limit(2)),
  );
  return snap.docs.some((d) => d.id !== excludeId);
}

// ——— Yazma ———

export async function createDefinition(collectionName: string, data: DocumentData) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdBy: auth.currentUser?.uid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDefinition(collectionName: string, id: string, data: DocumentData) {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDefinition(collectionName: string, id: string) {
  await deleteDoc(doc(db, collectionName, id));
}