import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, clearTokens, hasTokens, login as apiLogin, type UserInfo } from "./api";

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const INACTIVITY_MS = 30 * 60 * 1000; // F0.2 : déconnexion après 30 min sans activité

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(hasTokens());
  const timer = useRef<number>();

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!hasTokens()) return;
    api
      .get<UserInfo>("/auth/me")
      .then((r) => setUser(r.data))
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    const reset = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(logout, INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      window.clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, logout]);

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
    return u;
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
