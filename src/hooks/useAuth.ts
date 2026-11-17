"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { translateFirebaseError } from "@/utils/translateFirebaseError";
import { auth } from "../../firebase";
import { clearAuthCookie, setAuthCookie } from "@/lib/auth-cookie";
import { ensureUserDoc } from "@/services/user.service";
const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await ensureUserDoc(userCredential.user);
      setAuthCookie(await userCredential.user.getIdToken());
      const idToken = await userCredential.user.getIdToken();
      setAuthCookie(idToken);

      router.push("/icerik-yonetimi");
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

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError("");

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName: name });
      await ensureUserDoc(user, name);

      setAuthCookie(await user.getIdToken());
      router.push("/icerik-yonetimi");
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

  const logout = async () => {
    await signOut(auth);
    clearAuthCookie();
    router.push("/giris-yap");
  };

  return { login, register, logout, loading, error };
};
export default useAuth;
