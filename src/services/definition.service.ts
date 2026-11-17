// src/services/definition.service.ts
import {
  addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs,
  limit, onSnapshot, query, serverTimestamp, updateDoc, where,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../firebase"; // kendi firebase dosyanın yolu
import { DefinitionDoc } from "./definitions.service";

// ... subscribeDefinitions, deleteDefinition, countDefinitions aynen kalıyor ...

export async function getDefinition(collectionName: string, id: string) {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DefinitionDoc) : null;
}

export async function isSlugTaken(collectionName: string, slug: string, excludeId?: string) {
  const snap = await getDocs(
    query(collection(db, collectionName), where("slug", "==", slug), limit(2)),
  );
  return snap.docs.some((d) => d.id !== excludeId);
}

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