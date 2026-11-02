import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth";
import { erreur, getBaseConnaissances, reindexer, type DocumentKb, type Indexation } from "../flowpulse";

const STATUT: Record<string, [string, string]> = {
  indexe: ["b-fluide", "Indexé"],
  verifie: ["b-info", "Vérifié"],
  collecte: ["b-neutral", "Collecté"],
  a_collecter: ["b-modere", "À collecter"],
};

const INDEXATION: Record<Indexation["etat"], string> = {
  inactive: "Aucune indexation lancée depuis le démarrage du service.",
  en_cours: "Indexation en cours…",
  terminee: "Dernière indexation terminée.",
  echec: "La dernière indexation a échoué.",
};

const COLLECTION: Record<string, string> = {
  kb_reglementaire: "Textes réglementaires",
  kb_framework: "Cadres ITU et normes",
  kb_manques: "Manques documentés",
};

export default function Connaissances() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentKb[] | null>(null);
  const [collections, setCollections] = useState<Record<string, number>>({});
  const [indexation, setIndexation] = useState<Indexation | null>(null);
  const [filtre, setFiltre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number>();
  const estAdmin = user?.role === "ADMIN";

  function charger() {
    getBaseConnaissances()
      .then((r) => {
        setDocs(r.documents);
        setCollections(r.collections);
        setIndexation(r.indexation);
        window.clearTimeout(timer.current);
        if (r.indexation.etat === "en_cours") timer.current = window.setTimeout(charger, 5000);
      })
      .catch((e) => setError(erreur(e)));
  }

  useEffect(() => {
    charger();
    return () => window.clearTimeout(timer.current);
  }, []);

  async function relancer() {
    setError(null);
    try {
      setIndexation(await reindexer());
      timer.current = window.setTimeout(charger, 3000);
    } catch (e) {
      setError(erreur(e));
    }
  }

  if (error && !docs) return <p className="error card">{error}</p>;
  if (!docs) return <p className="muted">Chargement…</p>;
  const q = filtre.trim().toLowerCase();
  const visibles = q ? docs.filter((d) => `${d.titre} ${d.reference} ${d.pays} ${d.domaine}`.toLowerCase().includes(q)) : docs;
  const indexes = docs.filter((d) => d.passages > 0).length;

  return (
    <>
      <div className="kpis">
        <div className="card kpi"><span className="label">Textes inventoriés</span><span className="v">{docs.length}</span></div>
        <div className="card kpi"><span className="label">Textes indexés</span><span className="v">{indexes}</span></div>
        {Object.entries(collections).slice(0, 2).map(([k, v]) => (
          <div className="card kpi" key={k}><span className="label">{COLLECTION[k] ?? k}</span><span className="v">{v}<small>passages</small></span></div>
        ))}
      </div>

      <section className="card">
        <div className="row between">
          <div>
            <h2 className="h-card">Indexation</h2>
            <p className="small muted">
              {indexation ? INDEXATION[indexation.etat] : ""} Les agents ne citent que les textes indexés. Il faut Ollama et le modèle nomic-embed-text.
            </p>
          </div>
          {estAdmin && (
            <button className="btn btn-primary" type="button" onClick={relancer} disabled={indexation?.etat === "en_cours"}>
              {indexation?.etat === "en_cours" ? "Indexation en cours…" : "Réindexer les textes"}
            </button>
          )}
        </div>
        {indexation?.journal && (
          <details>
            <summary className="small">Journal de la dernière indexation</summary>
            <pre className="log">{indexation.journal}</pre>
          </details>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <div className="row between">
          <h2 className="h-card">Textes</h2>
          <input className="search" type="search" placeholder="Filtrer : titre, pays, domaine…" value={filtre} onChange={(e) => setFiltre(e.target.value)} aria-label="Filtrer les textes" />
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Texte</th><th>Pays</th><th>Domaine</th><th>Statut</th><th className="r">Passages</th></tr>
            </thead>
            <tbody>
              {visibles.map((d) => {
                const [cls, label] = STATUT[d.statut] ?? ["b-neutral", d.statut];
                return (
                  <tr key={d.id}>
                    <td className="wrap">
                      <b>{d.titre}</b>
                      <div className="small muted">
                        {d.reference}
                        {d.url_source && <> · <a href={d.url_source} target="_blank" rel="noreferrer">source</a></>}
                      </div>
                    </td>
                    <td>{d.pays}</td>
                    <td>{d.domaine.replace(/_/g, " ")}</td>
                    <td><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="r">{d.passages || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
