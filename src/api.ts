import { LANGUE } from "./i18n/langue";
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
  // Langue de l'interface : les agents répondent dans cette langue
  config.headers["Accept-Language"] = LANGUE;
  return config;
});

// Jeton d'accès expiré : on tente un seul rafraîchissement, puis on rejoue la requête.
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    // Serveur en cours de redémarrage (mise à jour) : on relance une lecture jusqu'à 3 fois, toutes les 3 secondes
    const statut = error.response?.status;
    if ([502, 503, 504].includes(statut) && original && (original.method ?? "get") === "get" && (original._essais ?? 0) < 3) {
      original._essais = (original._essais ?? 0) + 1;
      await new Promise((r) => setTimeout(r, 3000));
      return api(original);
    }
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
