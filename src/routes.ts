import type { Role } from "./api";
import type { IconName } from "./components/Icon";

/** Écran d'accueil par rôle (F0.1 : redirection automatique après connexion). */
export const HOME: Record<Role, string> = {
  GESTIONNAIRE: "/dashboard",
  OPERATEUR: "/flotte",
  URBANISTE: "/simulation",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  GESTIONNAIRE: "Gestionnaire urbain",
  OPERATEUR: "Opérateur de bus",
  URBANISTE: "Urbaniste",
  ADMIN: "Administrateur",
};

export interface MenuItem {
  path: string;
  label: string;
  icon: IconName;
  roles: Role[];
}

/** Menu de la barre latérale : chaque rôle ne voit que ses écrans (voir les maquettes). */
export const MENU: MenuItem[] = [
  { path: "/dashboard", label: "Tableau de bord", icon: "home", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/flotte", label: "Flotte", icon: "bus", roles: ["OPERATEUR"] },
  { path: "/alertes", label: "Alertes", icon: "alert", roles: ["GESTIONNAIRE", "OPERATEUR"] },
  { path: "/simulation", label: "Simulation", icon: "sim", roles: ["URBANISTE"] },
  { path: "/manques", label: "Manques réglementaires", icon: "scale", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/assistant", label: "Superviseur IA", icon: "chat", roles: ["GESTIONNAIRE", "OPERATEUR", "URBANISTE"] },
  { path: "/admin", label: "Administration", icon: "users", roles: ["ADMIN"] },
];
