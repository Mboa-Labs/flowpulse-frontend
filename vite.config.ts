import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// En développement, /api et /ws sont redirigés vers le backend Spring Boot.
// BACKEND_URL (variable ou fichier .env.local) si le port 8080 est déjà pris.
export default defineConfig(({ mode }) => {
  const backend = loadEnv(mode, process.cwd(), "").BACKEND_URL ?? "http://localhost:8080";
  return {
    // Textes de l'interface traduits au rendu (src/i18n) : le JSX passe par notre environnement
    plugins: [react({ jsxImportSource: "@fp/i18n" })],
    resolve: { alias: { "@fp/i18n": fileURLToPath(new URL("./src/i18n", import.meta.url)) } },
    server: {
      port: 5173,
      proxy: {
        "/api": backend,
        "/ws": { target: backend.replace(/^http/, "ws"), ws: true },
      },
    },
  };
});
