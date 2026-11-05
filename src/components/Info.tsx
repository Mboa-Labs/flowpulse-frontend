import { useId } from "react";

/** Pastille « ? » : la description d'une métrique, au survol ou au clavier (focus). */
export default function Info({ texte, titre }: { texte: string; titre?: string }) {
  const id = useId();
  return (
    <span className="info" tabIndex={0} aria-describedby={id} aria-label={titre ? `À propos : ${titre}` : "Explication"}>
      ?
      <span role="tooltip" id={id} className="info-bulle">{texte}</span>
    </span>
  );
}
