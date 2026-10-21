import type { Role } from "./api";

/** Écran d'accueil par rôle (F0.1 : redirection automatique après connexion). */
export const HOME: Record<Role, string> = {
  GESTIONNAIRE: "/dashboard",
  OPERATEUR: "/flotte",
  URBANISTE: "/simulation",
  ADMIN: "/admin",
};
