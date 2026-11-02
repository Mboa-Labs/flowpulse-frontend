import { useEffect, useState } from "react";
import { erreur, exporterAudit, getAudit, type EntreeAudit } from "../flowpulse";

const TAILLE = 50;

/** Libellés lisibles des actions journalisées par le backend. */
const ACTION: Record<string, string> = {
  LOGIN_OK: "Connexion",
  LOGIN_ECHEC: "Échec de connexion",
  UTILISATEUR_CREE: "Compte créé",
  UTILISATEUR_MODIFIE: "Compte modifié",
  SURVEILLANCE_LANCEE: "Surveillance lancée",
  ALERTE_ACQUITTEE: "Alerte acquittée",
  ALERTE_TRANSMISE: "Alerte transmise",
  RECOMMANDATION_APPLIQUEE: "Recommandation appliquée",
  RECOMMANDATION_REJETEE: "Recommandation rejetée",
  QUESTION_SUPERVISEUR: "Question au superviseur",
  SIMULATION_LANCEE: "Simulation lancée",
  KB_REINDEXATION: "Réindexation des textes",
};

export default function Journal() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ entrees: EntreeAudit[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAudit(page, TAILLE).then(setData).catch((e) => setError(erreur(e)));
  }, [page]);

  if (error) return <p className="error card">{error}</p>;
  if (!data) return <p className="muted">Chargement…</p>;
  const pages = Math.max(1, Math.ceil(data.total / TAILLE));

  return (
    <section className="card">
      <div className="row between">
        <div>
          <h2 className="h-card">Qui a fait quoi, et quand</h2>
          <p className="small muted">{data.total} entrées · connexions, décisions, alertes, simulations, gestion des comptes.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => exporterAudit().catch((e) => setError(erreur(e)))}>
          Exporter en CSV
        </button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Objet</th><th>Détails</th></tr>
          </thead>
          <tbody>
            {data.entrees.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" })}</td>
                <td>{e.utilisateur}</td>
                <td>{ACTION[e.action] ?? e.action}</td>
                <td className="mono">{e.objet ?? "—"}</td>
                <td className="wrap">{e.details ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="row between">
          <button className="btn btn-ghost" type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Plus récentes</button>
          <span className="small muted">Page {page + 1} sur {pages}</span>
          <button className="btn btn-ghost" type="button" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Plus anciennes</button>
        </div>
      )}
    </section>
  );
}
