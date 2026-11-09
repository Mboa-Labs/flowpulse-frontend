import { EN, MOTIFS_EN } from "./en";

/** Langue de l'interface : anglais par défaut, français au choix (mémorisé dans le navigateur). */
export type Langue = "en" | "fr";
const CLE = "fp_lang";

function lire(): Langue {
  try {
    const v = localStorage.getItem(CLE);
    if (v === "fr" || v === "en") return v;
  } catch {
    /* stockage indisponible : langue par défaut */
  }
  return "en";
}

export const LANGUE: Langue = lire();
if (typeof document !== "undefined") document.documentElement.lang = LANGUE;

/** Change de langue : la page est rechargée pour que tout l'écran suive. */
export function changerLangue(l: Langue) {
  try {
    localStorage.setItem(CLE, l);
  } catch {
    /* ignoré */
  }
  location.reload();
}

const cache = new Map<string, string>();

/**
 * Traduit un texte français de l'interface. Les textes sont écrits en français dans le code ;
 * le dictionnaire donne leur version anglaise. Un texte absent (nom propre, contenu saisi) reste tel quel.
 */
export function traduire(texte: string): string {
  if (LANGUE === "fr" || !texte || !/[A-Za-zÀ-ÿ]/.test(texte)) return texte;
  const deja = cache.get(texte);
  if (deja !== undefined) return deja;
  const debut = texte.match(/^\s*/)![0];
  const fin = texte.match(/\s*$/)![0];
  const cle = texte.trim().replace(/\s+/g, " ");
  let res: string | undefined = EN[cle];
  if (res === undefined) {
    for (const [motif, remplacement] of MOTIFS_EN) {
      const m = cle.match(motif);
      if (m) {
        res = typeof remplacement === "function" ? remplacement(m, traduire) : cle.replace(motif, remplacement);
        break;
      }
    }
  }
  const out = res === undefined ? texte : debut + res + fin;
  cache.set(texte, out);
  return out;
}

/** Pour le code hors JSX (titres de page, notifications système). */
export const t = traduire;

/** Format des nombres selon la langue (séparateur des milliers). */
export const nombre = (n: number) => n.toLocaleString(LANGUE === "fr" ? "fr-FR" : "en-GB");
