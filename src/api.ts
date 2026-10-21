import axios from "axios";

export type Role = "GESTIONNAIRE" | "OPERATEUR" | "URBANISTE" | "ADMIN";

export interface UserInfo {
  id: string;
  nom: string;
  email: string;
  role: Role;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

const ACCESS = "fp_access";
const REFRESH = "fp_refresh";

export const api = axios.create({ baseURL: "/api" });

export function saveTokens(t: TokenResponse) {
  localStorage.setItem(ACCESS, t.accessToken);
  localStorage.setItem(REFRESH, t.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export function hasTokens() {
  return localStorage.getItem(ACCESS) !== null;
}

export async function login(email: string, password: string): Promise<UserInfo> {
  const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
  saveTokens(data);
  return data.user;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Jeton d'accès expiré : on tente un seul rafraîchissement, puis on rejoue la requête.
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem(REFRESH);
    if (error.response?.status !== 401 || original._retried || !refresh || original.url?.startsWith("/auth/")) {
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      const { data } = await axios.post<TokenResponse>("/api/auth/refresh", { refreshToken: refresh });
      saveTokens(data);
      return api(original);
    } catch {
      clearTokens();
      window.location.assign("/login");
      return Promise.reject(error);
    }
  },
);
