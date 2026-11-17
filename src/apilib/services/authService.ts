import { apiClient } from "@/apilib/apiClient";

export const authService = {

  login: async (token: { token: string }) => {
    const res = await apiClient.post(
  '/auth/login',
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
    return res.data;
  },

  register: async (data: { token: string; payload: { email: string; username: string; password: string } }) => {
    const res = await apiClient.post("/auth/register", data.payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
    });
    return res.data;
  },

  state: async () => {
    const res = await apiClient.get("/auth/state");
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.get("/auth/logout");
    return res.data;
  },
};