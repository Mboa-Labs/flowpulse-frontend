import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// En développement, /api et /ws sont redirigés vers le backend Spring Boot.
// BACKEND_URL (variable ou fichier .env.local) si le port 8080 est déjà pris.
export default defineConfig(({ mode }) => {
  const backend = loadEnv(mode, process.cwd(), "").BACKEND_URL ?? "http://localhost:8080";
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": backend,
        "/ws": { target: backend.replace(/^http/, "ws"), ws: true },
      },
    },
  };
});
