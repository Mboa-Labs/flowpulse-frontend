import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En développement, /api et /ws sont redirigés vers le backend Spring Boot (BACKEND_URL si le port 8080 est déjà pris).
const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": backend,
      "/ws": { target: backend.replace(/^http/, "ws"), ws: true },
    },
  },
});
