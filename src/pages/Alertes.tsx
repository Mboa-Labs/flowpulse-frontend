import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge } from "../components/Badges";
import TracePanel from "../components/TracePanel";
import { acquitter, erreur, getAlertes, lancerSurveillance, transmettre, type Alerte } from "../flowpulse";

const STATUT: Record<Alerte["statut"], [string, string]> = {
  NOUVELLE: ["b-info", "Nouvelle"],
  ACQUITTEE: ["b-neutral", "Acquittée"],
  TRANSMISE: ["b-fluide", "Transmise"],
};

const DESTINATAIRES = ["Exploitant de bus", "Police municipale", "Régulation de la circulation", "Mairie d'arrondissement"];

function Carte({ alerte, peutTransmettre, onChange }: { alerte: Alerte; peutTransmettre: boolean; onChange: (a: Alerte) => void }) {
  const [dest, setDest] = useState(DESTINATAIRES[0]);
  const [note, setNote] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cls, label] = STATUT[alerte.statut] ?? STATUT.NOUVELLE;

  async function agir(fn: () => Promise<Alerte>) {
    setPending(true);
    setError(null);
    try {
      onChange(await fn());
      setOuvert(false);
    } catch (e) {
      setError(erreur(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <article className={`card alert-card ${alerte.niveau === "SATURE" ? "s" : "d"}`}>
      <div className="row between">
        <h3 className="h-card">{alerte.zone}</h3>
        <div className="row">
          <NiveauBadge niveau={alerte.niveau} />
          <span className={`badge ${cls}`}>{label}</span>
        </div>
      </div>
      <div className="facts">
        <span>Congestion <b>{alerte.congestion} %</b></span>
        <span>Vitesse <b>{alerte.vitesse_moyenne} km/h</b></span>
        {alerte.recommendation_id && <span>Recommandation <Link to="/flotte">{alerte.recommendation_id}</Link></span>}
      </div>

      {alerte.plan_contingence?.length > 0 && (
        <div className="plan">
          <span className="label">Plan de contingence</span>
          <ol>{alerte.plan_contingence.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
      )}

      {alerte.historique?.length > 0 && (
        <ul className="hist small muted">
          {alerte.historique.map((h, i) => (
            <li key={i}>
              {new Date(h.date * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {h.action === "acquitter" ? "Acquittée" : `Transmise à ${h.destinataire}`} par {h.par}
              {h.note ? ` : ${h.note}` : ""}
            </li>
          ))}
        </ul>
      )}

      <div className="row">
        {alerte.statut === "NOUVELLE" && (
          <button className="btn btn-secondary" type="button" disabled={pending} onClick={() => agir(() => acquitter(alerte.id))}>
            Acquitter
          </button>
        )}
        {peutTransmettre && !ouvert && (
          <button className="btn btn-ghost" type="button" onClick={() => setOuvert(true)}>Transmettre…</button>
        )}
      </div>
      {ouvert && (
        <form
          className="decision"
          onSubmit={(e) => {
            e.preventDefault();
            agir(() => transmettre(alerte.id, dest, note.trim() || undefined));
          }}
        >
          <div className="field">
            <label htmlFor={`dest-${alerte.id}`}>Transmettre à</label>
            <select id={`dest-${alerte.id}`} value={dest} onChange={(e) => setDest(e.target.value)}>
              {DESTINATAIRES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`note-${alerte.id}`}>Message (facultatif)</label>
            <input id={`note-${alerte.id}`} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Agent de régulation demandé au carrefour…" />
          </div>
          <div className="row">
            <button className="btn btn-primary" type="submit" disabled={pending}>Transmettre</button>
            <button className="btn btn-ghost" type="button" onClick={() => setOuvert(false)}>Annuler</button>
          </div>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </article>
  );
}

export default function Alertes() {
  const { user } = useAuth();
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const peutLancer = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  useEffect(() => {
    getAlertes()
      .then((r) => { setAlertes(r.alertes); setTraceId(r.trace_id); })
      .catch((e) => setError(erreur(e)));
  }, []);

  async function surveiller() {
    setRunning(true);
    setError(null);
    try {
      const r = await lancerSurveillance();
      setAlertes(r.alertes);
      setTraceId(r.trace_id);
    } catch (e) {
      setError(erreur(e));
    } finally {
      setRunning(false);
    }
  }

  const update = (a: Alerte) => setAlertes((all) => all.map((x) => (x.id === a.id ? a : x)));

  return (
    <>
      <div className="row between">
        <p className="small muted">Dense à partir de 75 % de congestion, saturé à partir de 85 %. Une zone saturée déclenche une recommandation et un plan de contingence.</p>
        {peutLancer && (
          <button className="btn btn-primary" type="button" onClick={surveiller} disabled={running}>
            {running ? "Analyse en cours…" : "Lancer une surveillance"}
          </button>
        )}
      </div>
      {error && <p className="error card">{error}</p>}
      {alertes.length === 0 ? (
        <p className="card muted">Aucune alerte pour l'instant.</p>
      ) : (
        <div className="cards">
          {alertes.map((a) => <Carte key={a.id || a.zone} alerte={a} peutTransmettre={peutLancer} onChange={update} />)}
        </div>
      )}
      {traceId && (
        <section className="card">
          <button className="btn btn-ghost" type="button" onClick={() => setShowTrace((v) => !v)}>
            {showTrace ? "Masquer le raisonnement" : "Voir le raisonnement de la surveillance"}
          </button>
          {showTrace && <TracePanel traceId={traceId} />}
        </section>
      )}
    </>
  );
}
