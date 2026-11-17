// src/services/user.service.ts
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../../firebase";

export type UserRole = "admin" | "editor";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

const userRef = (uid: string) => doc(db, "users", uid);

// Doküman yoksa oluşturur, varsa son giriş zamanını günceller
export async function ensureUserDoc(user: User, displayName?: string) {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? "",
      displayName: displayName ?? user.displayName ?? "",
      photoURL: user.photoURL ?? null,
      role: "editor",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
  }
}

export async function getUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}