// src/lib/auth-cookie.ts
export const setAuthCookie = (token: string) => {
  document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
};

export const clearAuthCookie = () => {
  document.cookie = "auth-token=; path=/; max-age=0";
};