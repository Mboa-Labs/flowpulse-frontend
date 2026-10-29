import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge, niveauColor } from "../components/Badges";
import { erreur, getAlertes, getZones, lancerSurveillance, type Alerte, type Zone } from "../flowpulse";

export default function Dashboard() {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const peutLancer = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  useEffect(() => {
    getZones().then(setZones).catch((e) => setError(erreur(e)));
    getAlertes().then((r) => setAlertes(r.alertes)).catch(() => undefined);
  }, []);

  async function surveiller() {
    setRunning(true);
    setError(null);
    try {
      setAlertes((await lancerSurveillance()).alertes);
    } catch (e) {
      setError(erreur(e));
    } finally {
      setRunning(false);
    }
  }

  if (error && !zones) return <p className="error card">{error}</p>;
  if (!zones) return <p className="muted">Chargement…</p>;

  const congestion = Math.round(zones.reduce((s, z) => s + z.niveau_congestion, 0) / zones.length);
  const vitesse = (zones.reduce((s, z) => s + z.vitesse_moyenne, 0) / zones.length).toFixed(1);
  const reserve = zones.reduce((s, z) => s + (z.bus_en_reserve ?? 0), 0);
  const tri = [...zones].sort((a, b) => b.niveau_congestion - a.niveau_congestion);

  return (
    <>
      <div className="kpis">
        <div className="card kpi"><span className="label">Congestion moyenne</span><span className="v">{congestion}<small>%</small></span></div>
        <div className="card kpi"><span className="label">Alertes actives</span><span className="v">{alertes.length}</span></div>
        <div className="card kpi"><span className="label">Vitesse moyenne</span><span className="v">{vitesse}<small>km/h</small></span></div>
        <div className="card kpi"><span className="label">Bus en réserve</span><span className="v">{reserve}</span></div>
      </div>

      <div className="split">
        <section className="card">
          <div className="row between">
            <h2 className="h-card">Zones</h2>
            <span className="small muted">Données de démonstration</span>
          </div>
          <ul className="zones">
            {tri.map((z) => (
              <li key={z.zone}>
                <div className="row between">
                  <b>{z.zone}</b>
                  <NiveauBadge niveau={z.niveau} />
                </div>
                <div className="bar" aria-hidden="true">
                  <i style={{ width: `${z.niveau_congestion}%`, background: niveauColor(z.niveau) }} />
                </div>
                <div className="facts">
                  <span>Congestion <b>{z.niveau_congestion} %</b></span>
                  <span>Vitesse <b>{z.vitesse_moyenne} km/h</b></span>
                  <span>Flux <b>{z.vehicules_par_heure.toLocaleString("fr-FR")} véh/h</b></span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="row between">
            <h2 className="h-card">Alertes</h2>
            <Link className="small" to="/alertes">Tout voir</Link>
          </div>
          {alertes.length === 0 ? (
            <p className="muted small">Aucune alerte. {peutLancer ? "Lancez une surveillance pour analyser les zones." : ""}</p>
          ) : (
            alertes.map((a) => (
              <div key={a.zone} className={`alert-item ${a.niveau === "SATURE" ? "s" : "d"}`}>
                <div className="row between"><b>{a.zone}</b><NiveauBadge niveau={a.niveau} /></div>
                <span className="small muted">Congestion {a.congestion} % · {a.vitesse_moyenne} km/h</span>
              </div>
            ))
          )}
          {peutLancer && (
            <button className="btn btn-secondary" type="button" onClick={surveiller} disabled={running}>
              {running ? "Analyse en cours…" : "Lancer une surveillance"}
            </button>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      </div>
    </>
  );
}
