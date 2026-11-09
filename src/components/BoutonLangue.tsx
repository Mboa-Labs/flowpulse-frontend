import { changerLangue, LANGUE } from "../i18n/langue";

/** Bascule anglais / français ; le nom de l'autre langue est écrit dans cette langue. */
export function BoutonLangue({ className = "" }: { className?: string }) {
  const autre = LANGUE === "en" ? "fr" : "en";
  return (
    <button type="button" className={`langue ${className}`.trim()} lang={autre} onClick={() => changerLangue(autre)}
            aria-label={autre === "fr" ? "Afficher en français" : "Show in English"}>
      {autre === "fr" ? "🌐 Français" : "🌐 English"}
    </button>
  );
}
