/** Appels métier vers le backend (qui relaie le service IA) et types associés. */
import { api, type Role } from "./api";

export type Niveau = "FLUIDE" | "DENSE" | "SATURE";
export type Statut = "PROPOSEE" | "APPROUVEE" | "REJETEE" | "APPLIQUEE" | "BLOQUEE";
export type Conformite = "CONFORME" | "CONFORME_SOUS_RESERVE" | "NON_CONFORME" | "NON_COUVERT";

export interface Zone {
  zone: string;
  vitesse_moyenne: number;
  niveau_congestion: number;
  vehicules_par_heure: number;
  lignes_actives?: string[];
  bus_en_reserve?: number;
  capacite?: number;
  niveau: Niveau;
}

export interface Alerte {
  zone: string;
  niveau: Exclude<Niveau, "FLUIDE">;
  congestion: number;
  vitesse_moyenne: number;
  recommendation_id: string | null;
}

export interface Citation {
  doc_id: string;
  titre: string;
  reference: string;
  article: string;
  extrait?: string;
  score?: number;
}

export interface Recommandation {
  id: string;
  zone: string;
  ligne: string;
  nb_bus: number;
  description: string;
  statut: Statut;
  conformite: Conformite;
  justification: string;
  citations: Citation[];
  trace_id: string | null;
}

export interface Etape {
  agent: string;
  action: string;
  entree: unknown;
  sortie: unknown;
  duree_ms: number;
  sources: Citation[];
}

export interface Trace {
  id: string;
  nature: string;
  debut: number;
  etapes: Etape[];
}

export interface Reponse {
  reponse: string;
  trace_id: string;
  outils: { name: string; args: Record<string, unknown> }[];
  recommandations: string[];
  citations: Citation[];
}

export interface Manque {
  id: string;
  categorie: string;
  description: string;
  decision_concernee: string;
  trace_id: string | null;
}

export interface Compte {
  id: string;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
}

export const getZones = () => api.get<Zone[]>("/zones").then((r) => r.data);
export const getAlertes = () => api.get<{ trace_id: string | null; alertes: Alerte[] }>("/alerts").then((r) => r.data);
export const lancerSurveillance = () => api.post<{ trace_id: string; alertes: Alerte[] }>("/alerts/run").then((r) => r.data);
export const getRecommandations = () => api.get<Recommandation[]>("/recommendations").then((r) => r.data);
export const decider = (id: string, decision: "appliquer" | "rejeter", motif?: string) =>
  api.post<Recommandation>(`/recommendations/${id}/decision`, { decision, motif }).then((r) => r.data);
export const demander = (question: string) => api.post<Reponse>("/assistant", { question }).then((r) => r.data);
export const getTrace = (id: string) => api.get<Trace>(`/traces/${id}`).then((r) => r.data);
export const getManques = () => api.get<Manque[]>("/gaps").then((r) => r.data);
export const getComptes = () => api.get<Compte[]>("/admin/users").then((r) => r.data);
export const creerCompte = (c: { nom: string; email: string; password: string; role: Role }) =>
  api.post<Compte>("/admin/users", c).then((r) => r.data);
export const modifierCompte = (id: string, c: Partial<Pick<Compte, "nom" | "role" | "actif">>) =>
  api.patch<Compte>(`/admin/users/${id}`, c).then((r) => r.data);

/** Message d'erreur lisible à partir d'une erreur Axios. */
export function erreur(e: unknown): string {
  const err = e as { response?: { status?: number; data?: unknown } };
  if (!err.response) return "Le serveur ne répond pas. Vérifiez que les services sont démarrés.";
  if (err.response.status === 403) return "Votre rôle ne permet pas cette action.";
  if (err.response.status === 503) return "Le service IA est indisponible. Vérifiez qu'Ollama et le service IA tournent.";
  const d = err.response.data as { message?: string; detail?: string } | string | undefined;
  if (typeof d === "string" && d) return d;
  return (d && typeof d === "object" && (d.detail || d.message)) || `Erreur ${err.response.status}.`;
}
