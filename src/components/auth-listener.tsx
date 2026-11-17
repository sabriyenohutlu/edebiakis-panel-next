// src/components/auth-listener.tsx
"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../firebase"; // kendi firebase dosyanın yolu
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";

export default function AuthListener() {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        setAuthCookie(await user.getIdToken());
      } else {
        clearAuthCookie();
      }
    });
    return unsubscribe;
  }, []);

  return null;
}