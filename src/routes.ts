import type { Role } from "./api";
import type { IconName } from "./components/Icon";

/** Écran d'accueil par rôle (F0.1 : redirection automatique après connexion). */
export const HOME: Record<Role, string> = {
  GESTIONNAIRE: "/dashboard",
  OPERATEUR: "/flotte",
  URBANISTE: "/simulation",
  ADMIN: "/dashboard",
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
  /** Libellé court pour la barre d'onglets mobile */
  short?: string;
}

/** Menu de la barre latérale : chaque rôle ne voit que ses écrans ; l'administrateur a accès à tout. */
export const MENU: MenuItem[] = [
  { path: "/dashboard", label: "Tableau de bord", short: "Accueil", icon: "home", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/flotte", label: "Flotte", icon: "bus", roles: ["OPERATEUR", "ADMIN"] },
  { path: "/alertes", label: "Alertes", icon: "alert", roles: ["GESTIONNAIRE", "OPERATEUR", "ADMIN"] },
  { path: "/simulation", label: "Simulation", icon: "sim", roles: ["URBANISTE", "ADMIN"] },
  { path: "/manques", label: "Manques réglementaires", short: "Manques", icon: "scale", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/assistant", label: "Superviseur IA", short: "Superviseur", icon: "chat", roles: ["GESTIONNAIRE", "OPERATEUR", "URBANISTE", "ADMIN"] },
  { path: "/connaissances", label: "Base de connaissances", short: "Textes", icon: "book", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/admin", label: "Administration", short: "Admin", icon: "users", roles: ["ADMIN"] },
  { path: "/journal", label: "Journal d'audit", short: "Journal", icon: "journal", roles: ["ADMIN"] },
];
