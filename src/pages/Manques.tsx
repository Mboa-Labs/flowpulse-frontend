import { useEffect, useState } from "react";
import { erreur, getManques, type Manque } from "../flowpulse";

const CATEGORIE: Record<string, string> = {
  RESPONSABILITE_FLOUE: "Responsabilité floue",
  NORME_ABSENTE: "Norme absente",
  VIDE_JURIDIQUE: "Vide juridique",
  COORDINATION: "Coordination",
  OBJECTIFS_CONTRADICTOIRES: "Objectifs contradictoires",
};

export default function Manques() {
  const [manques, setManques] = useState<Manque[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getManques().then(setManques).catch((e) => setError(erreur(e)));
  }, []);

  if (error) return <p className="error card">{error}</p>;
  if (!manques) return <p className="muted">Chargement…</p>;

  return (
    <section className="card">
      <div>
        <h2 className="h-card">Manques réglementaires détectés</h2>
        <p className="small muted">Décisions pour lesquelles aucun texte de la base de connaissances ne s'applique. Ils alimentent le rapport remis au jury.</p>
      </div>
      {manques.length === 0 ? (
        <p className="muted">Aucun manque détecté pour l'instant.</p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Catégorie</th><th>Décision concernée</th><th>Constat</th></tr></thead>
            <tbody>
              {manques.map((m) => (
                <tr key={m.id}>
                  <td><span className="badge b-neutral">{CATEGORIE[m.categorie] ?? m.categorie}</span></td>
                  <td className="wrap">{m.decision_concernee}</td>
                  <td className="wrap">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
