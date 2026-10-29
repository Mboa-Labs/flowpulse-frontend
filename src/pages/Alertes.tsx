import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge } from "../components/Badges";
import TracePanel from "../components/TracePanel";
import { erreur, getAlertes, lancerSurveillance, type Alerte } from "../flowpulse";

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

  return (
    <section className="card">
      <div className="row between">
        <div>
          <h2 className="h-card">Alertes de la dernière surveillance</h2>
          <p className="small muted">Dense à partir de 75 % de congestion, saturé à partir de 85 %. Une zone saturée déclenche une recommandation.</p>
        </div>
        {peutLancer && (
          <button className="btn btn-primary" type="button" onClick={surveiller} disabled={running}>
            {running ? "Analyse en cours…" : "Lancer une surveillance"}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      {alertes.length === 0 ? (
        <p className="muted">Aucune alerte pour l'instant.</p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Zone</th><th>Niveau</th><th className="r">Congestion</th><th className="r">Vitesse</th><th>Recommandation</th></tr></thead>
            <tbody>
              {alertes.map((a) => (
                <tr key={a.zone}>
                  <td>{a.zone}</td>
                  <td><NiveauBadge niveau={a.niveau} /></td>
                  <td className="r">{a.congestion} %</td>
                  <td className="r">{a.vitesse_moyenne} km/h</td>
                  <td>{a.recommendation_id ? <Link to="/flotte">{a.recommendation_id}</Link> : <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {traceId && (
        <>
          <button className="btn btn-ghost" type="button" onClick={() => setShowTrace((v) => !v)}>
            {showTrace ? "Masquer le raisonnement" : "Voir le raisonnement"}
          </button>
          {showTrace && <TracePanel traceId={traceId} />}
        </>
      )}
    </section>
  );
}
