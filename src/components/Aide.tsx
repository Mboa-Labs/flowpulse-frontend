import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AIDE, PARCOURS } from "../aide";
import type { Role } from "../api";
import { MENU } from "../routes";
import Icon from "./Icon";

const lire = (cle: string) => {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
};
const ecrire = (cle: string, valeur: string) => {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    /* stockage indisponible : l'aide s'affichera de nouveau */
  }
};

/** « Comment utiliser cet écran ? » : replié par défaut, ouvert d'un clic. */
export function AideEcran({ chemin }: { chemin: string }) {
  const aide = AIDE[chemin];
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => setOuvert(false), [chemin]);
  if (!aide) return null;
  const basculer = () => setOuvert((o) => !o);

  return (
    <section className={`aide${ouvert ? " ouverte" : ""}`} aria-label="Aide de l'écran">
      <button type="button" className="aide-bouton" aria-expanded={ouvert} onClick={basculer}>
        <span className="aide-pastille" aria-hidden="true">?</span>
        <span>{ouvert ? "Masquer l'aide" : "Comment utiliser cet écran ?"}</span>
      </button>
      {ouvert && (
        <div className="aide-corps">
          <div>
            <h2 className="label">Que faire</h2>
            <ol>{aide.etapes.map((e) => <li key={e}>{e}</li>)}</ol>
          </div>
          <div>
            <h2 className="label">Comment lire</h2>
            <ul>{aide.lecture.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={basculer}>J'ai compris</button>
        </div>
      )}
    </section>
  );
}

/** Message d'accueil à la première connexion : le parcours conseillé pour le rôle. */
export function Bienvenue({ role, nom }: { role: Role; nom: string }) {
  const cle = `fp_bienvenue_vue:${role}`;
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(lire(cle) === null), [cle]);
  if (!visible) return null;
  const parcours = PARCOURS[role];
  const fermer = () => {
    ecrire(cle, "1");
    setVisible(false);
  };

  return (
    <section className="card bienvenue" aria-labelledby="bienvenue-titre">
      <div className="row between">
        <h2 id="bienvenue-titre" className="h-card">Bienvenue, {nom.split(" ")[0]}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={fermer}>Fermer</button>
      </div>
      <p className="small muted">{parcours.titre} L'IA propose, vous décidez.</p>
      <ol className="parcours-cartes">
        {parcours.etapes.map((e) => {
          const m = MENU.find((x) => x.path === e.lien);
          return (
            <li key={e.lien}>
              <Link to={e.lien} onClick={fermer}>
                {m && <Icon name={m.icon} />}
                <span>{e.texte}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
