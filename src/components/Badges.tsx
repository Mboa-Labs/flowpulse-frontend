import type { Conformite, Niveau, Statut } from "../flowpulse";

const NIVEAU: Record<Niveau, [string, string]> = {
  FLUIDE: ["b-fluide", "Fluide"],
  DENSE: ["b-dense", "Dense"],
  SATURE: ["b-sature", "Saturé"],
};

const STATUT: Record<Statut, [string, string]> = {
  PROPOSEE: ["b-info", "En attente de décision"],
  APPROUVEE: ["b-fluide", "Approuvée"],
  APPLIQUEE: ["b-fluide", "Appliquée"],
  REJETEE: ["b-neutral", "Rejetée"],
  BLOQUEE: ["b-sature", "Bloquée"],
  REMPLACEE: ["b-neutral", "Remplacée"],
};

const CONFORMITE: Record<Conformite, [string, string]> = {
  CONFORME: ["b-fluide", "Conforme"],
  CONFORME_SOUS_RESERVE: ["b-modere", "Conforme sous réserve"],
  NON_CONFORME: ["b-sature", "Non conforme"],
  NON_COUVERT: ["b-neutral", "Aucun texte applicable"],
};

/** Un état n'est jamais porté par la couleur seule : chaque badge a son libellé. */
export function NiveauBadge({ niveau }: { niveau: Niveau }) {
  const [cls, label] = NIVEAU[niveau];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function StatutBadge({ statut }: { statut: Statut }) {
  const [cls, label] = STATUT[statut];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function ConformiteBadge({ conformite }: { conformite: Conformite }) {
  const [cls, label] = CONFORMITE[conformite];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function niveauColor(niveau: Niveau) {
  return niveau === "SATURE" ? "var(--sature)" : niveau === "DENSE" ? "var(--dense)" : "var(--fluide)";
}
