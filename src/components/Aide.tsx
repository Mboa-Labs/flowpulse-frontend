import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AIDE, PARCOURS } from "../aide";
import type { Role } from "../api";

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

/**
 * « Comment utiliser cet écran ? » : ouvert à la première visite de chaque écran, puis replié
 * (le choix est gardé sur l'appareil). Toujours rouvrable d'un clic.
 */
export function AideEcran({ chemin }: { chemin: string }) {
  const aide = AIDE[chemin];
  const cle = `fp_aide_vue:${chemin}`;
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    setOuvert(lire(cle) === null);
  }, [cle]);

  if (!aide) return null;

  function basculer() {
    setOuvert((o) => !o);
    ecrire(cle, "1");
  }

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
        <h2 id="bienvenue-titre" className="h-card">Bienvenue sur FlowPulse, {nom.split(" ")[0]}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={fermer}>Fermer</button>
      </div>
      <p>
        FlowPulse prévoit les zones de la ville qui vont saturer, propose des renforts de bus et vérifie chaque proposition au regard des
        lois. <b>L'IA propose, vous décidez</b> : rien n'est appliqué sans une personne.
      </p>
      <p className="small muted">{parcours.titre}</p>
      <ol className="parcours">
        {parcours.etapes.map((e, i) => (
          <li key={e.lien}>
            <span className="num" aria-hidden="true">{i + 1}</span>
            <Link to={e.lien} onClick={fermer}>{e.texte}</Link>
          </li>
        ))}
      </ol>
      <p className="small muted">Sur chaque écran, le bouton « Comment utiliser cet écran ? » explique quoi faire et comment lire les résultats.</p>
    </section>
  );
}
