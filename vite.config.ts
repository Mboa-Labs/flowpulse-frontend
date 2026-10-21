import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En développement, /api et /ws sont redirigés vers le backend Spring Boot.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
      "/ws": { target: "ws://localhost:8080", ws: true },
    },
  },
});
