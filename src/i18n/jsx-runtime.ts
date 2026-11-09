// Environnement JSX de FlowPulse : identique à celui de React, mais chaque texte affiché
// (contenu des balises et attributs lisibles : placeholder, title, aria-label, alt, label)
// passe par le dictionnaire de la langue choisie. Le code reste écrit en français.
import * as R from "react/jsx-runtime";
import { traduire } from "./langue";

const ATTRIBUTS = ["placeholder", "title", "aria-label", "alt", "label"];

function enfants(c: unknown): unknown {
  if (typeof c === "string") return traduire(c);
  if (Array.isArray(c)) return c.map(enfants);
  return c;
}

export function traduireProps(type: unknown, props: Record<string, unknown> | null) {
  if (!props) return props;
  let p = props;
  if ("children" in p) p = { ...p, children: enfants(p.children) };
  for (const a of ATTRIBUTS) {
    const v = p[a];
    if (typeof v === "string" && !(type === "input" && a === "label")) {
      if (p === props) p = { ...p };
      p[a] = traduire(v);
    }
  }
  return p;
}

export const Fragment = R.Fragment;
export function jsx(type: React.ElementType, props: Record<string, unknown>, key?: React.Key) {
  return R.jsx(type, traduireProps(type, props) as never, key);
}
export function jsxs(type: React.ElementType, props: Record<string, unknown>, key?: React.Key) {
  return R.jsxs(type, traduireProps(type, props) as never, key);
}
