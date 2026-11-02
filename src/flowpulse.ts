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
  id: string;
  zone: string;
  niveau: Exclude<Niveau, "FLUIDE">;
  congestion: number;
  vitesse_moyenne: number;
  recommendation_id: string | null;
  statut: "NOUVELLE" | "ACQUITTEE" | "TRANSMISE";
  plan_contingence: string[];
  historique: { action: string; par: string; destinataire: string | null; note: string | null; date: number }[];
}

export interface Arret {
  arret: string;
  zone: string;
  ligne: string;
  demande_par_heure: number;
  bus_par_heure: number;
  offre_par_heure: number;
  tension: number;
  attente_min: number;
  niveau: Niveau;
}

export interface DocumentKb {
  id: string;
  titre: string;
  reference: string;
  type: string;
  domaine: string;
  pays: string;
  statut: string;
  fichier: string;
  url_source: string;
  notes: string;
  passages: number;
}

export interface Indexation {
  etat: "inactive" | "en_cours" | "terminee" | "echec";
  debut: number | null;
  fin: number | null;
  journal: string;
}

export interface EntreeAudit {
  id: string;
  date: string;
  utilisateur: string;
  action: string;
  objet: string | null;
  details: string | null;
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

export type TypeScenario = "fermeture" | "evenement" | "renfort";

export interface Scenario {
  type: TypeScenario;
  zone: string;
  debut: string;
  fin: string;
  participants?: number;
  nbBus?: number;
}

export interface EtatZone {
  zone: string;
  niveau_congestion: number;
  /** Demande rapportée à la capacité, en % : peut dépasser 100 */
  charge: number;
  surcharge: boolean;
  vehicules_par_heure: number;
  vitesse_moyenne: number;
  niveau: Niveau;
}

export interface Mesure {
  description: string;
  verdict: Conformite;
  justification: string;
  citations: Citation[];
}

export interface Simulation {
  id: string;
  libelle: string;
  scenario: { type: TypeScenario; zone: string; debut: string; fin: string; participants: number; nb_bus: number };
  avant: EtatZone[];
  apres: EtatZone[];
  indicateurs: {
    temps_parcours_pct: number;
    zones_saturees_avant: number;
    zones_saturees_apres: number;
    zone_la_plus_touchee: string;
    variation_max_points: number;
    ligne_la_plus_touchee: string | null;
    personnes_concernees: number;
  };
  mesures: Mesure[];
  hypotheses: string[];
  trace_id: string;
  date: number;
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
export const acquitter = (id: string) => api.post<Alerte>(`/alerts/${id}/ack`).then((r) => r.data);
export const transmettre = (id: string, destinataire: string, note?: string) =>
  api.post<Alerte>(`/alerts/${id}/transmit`, { destinataire, note }).then((r) => r.data);
export const getArrets = () => api.get<Arret[]>("/stops").then((r) => r.data);
export const getBaseConnaissances = () =>
  api.get<{ documents: DocumentKb[]; collections: Record<string, number>; indexation: Indexation }>("/kb/documents").then((r) => r.data);
export const reindexer = () => api.post<Indexation>("/kb/reindex").then((r) => r.data);
export const getAudit = (page: number, taille = 50) =>
  api.get<{ entrees: EntreeAudit[]; total: number; page: number; taille: number }>("/admin/audit", { params: { page, taille } }).then((r) => r.data);

/** Télécharge le journal d'audit en CSV (le jeton passe par l'en-tête, pas par un lien). */
export async function exporterAudit() {
  const { data } = await api.get<Blob>("/admin/audit/export", { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "journal_audit_flowpulse.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export const getRecommandations = () => api.get<Recommandation[]>("/recommendations").then((r) => r.data);
export const decider = (id: string, decision: "appliquer" | "rejeter", motif?: string) =>
  api.post<Recommandation>(`/recommendations/${id}/decision`, { decision, motif }).then((r) => r.data);
export const demander = (question: string) => api.post<Reponse>("/assistant", { question }).then((r) => r.data);
export const getTrace = (id: string) => api.get<Trace>(`/traces/${id}`).then((r) => r.data);
export const getManques = () => api.get<Manque[]>("/gaps").then((r) => r.data);
export const simuler = (s: Scenario) => api.post<Simulation>("/scenarios", s).then((r) => r.data);
export const getSimulations = () => api.get<Simulation[]>("/scenarios").then((r) => r.data);
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
