import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge, niveauColor } from "../components/Badges";
import CourbeTension from "../components/CourbeTension";
import HexMap from "../components/HexMap";
import HorlogeDemo from "../components/HorlogeDemo";
import { erreur, getAlertes, getSerie, getZones, HORLOGE_CHANGEE, lancerSurveillance, type Alerte, type PointSerie, type Zone } from "../flowpulse";
import { hotspots, pinColors, positions } from "../zones";

const RAMP = ["#F1E4D6", "#E6C3A1", "#D59A6C", "#C2703D", "#93412C", "#5A2230"];
const nombre = (n: number) => n.toLocaleString("fr-FR");

export default function Dashboard() {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [choix, setChoix] = useState<string | null>(null);
  const [serie, setSerie] = useState<PointSerie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const peutLancer = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  const charger = useCallback(() => {
    getZones().then(setZones).catch((e) => setError(erreur(e)));
    getAlertes().then((r) => setAlertes(r.alertes)).catch(() => undefined);
  }, []);

  useEffect(() => {
    charger();
    window.addEventListener(HORLOGE_CHANGEE, charger);
    return () => window.removeEventListener(HORLOGE_CHANGEE, charger);
  }, [charger]);

  const reel = zones?.[0]?.source === "d4d";
  const zoneCourbe = choix ?? (zones && [...zones].sort((a, b) => b.niveau_congestion - a.niveau_congestion)[0]?.zone);
  useEffect(() => {
    if (reel && zoneCourbe) getSerie(zoneCourbe, 30).then(setSerie).catch(() => setSerie([]));
  }, [reel, zoneCourbe, zones]);

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
  const reserve = zones.reduce((s, z) => s + (z.bus_en_reserve ?? 0), 0);
  const tri = [...zones].sort((a, b) => b.niveau_congestion - a.niveau_congestion);
  const prevMax = reel ? tri.reduce<Zone | null>((m, z) => ((z.prevision_1h ?? -1) > (m?.prevision_1h ?? -1) ? z : m), null) : null;
  const pos = positions(zones);

  return (
    <>
      <HorlogeDemo />

      <div className="kpis">
        <div className="card kpi"><span className="label">Tension moyenne</span><span className="v">{congestion}<small>/ 100</small></span></div>
        <div className="card kpi"><span className="label">Alertes actives</span><span className="v">{alertes.length}</span></div>
        {reel && prevMax ? (
          <div className="card kpi">
            <span className="label">Plus forte prévision à 1 h</span>
            <span className="v">{Math.round(prevMax.prevision_1h ?? 0)}<small>{prevMax.zone}</small></span>
          </div>
        ) : (
          <div className="card kpi">
            <span className="label">Vitesse moyenne</span>
            <span className="v">{(zones.reduce((s, z) => s + (z.vitesse_moyenne ?? 0), 0) / zones.length).toFixed(1)}<small>km/h</small></span>
          </div>
        )}
        <div className="card kpi">
          <span className="label">Bus en réserve</span>
          <span className="v">{reserve}{reel && <small>démonstration</small>}</span>
        </div>
      </div>

      <section className="card map-card">
        <div className="row between">
          <h2 className="h-card">Tension par zone</h2>
          <span className="small muted">{reel ? `Région de Dakar · ${zones.length} arrondissements · D4D-Sénégal 2013` : "Données de démonstration"}</span>
        </div>
        <div className="map-wrap">
          <HexMap width={1100} height={reel ? 520 : 420} seed={2} hot={hotspots(zones)} pins pinColors={pinColors(zones)} etalement={reel ? 0.065 : 0.12} label="Carte de densité : tension par zone" />
          {zones.map((z) => {
            const [x, y] = pos[z.zone] ?? [0.5, 0.5];
            return (
              <button key={z.zone} type="button" className={`map-tag${zoneCourbe === z.zone ? " on" : ""}`}
                      style={{ left: `${x * 100}%`, top: `${y * 100}%` }} onClick={() => setChoix(z.zone)}>
                {z.zone} · {z.niveau_congestion}
              </button>
            );
          })}
        </div>
        <div className="legend small muted" aria-hidden="true">
          <span>Faible</span>
          <span className="ramp">{RAMP.map((c) => <i key={c} style={{ background: c }} />)}</span>
          <span>Forte tension</span>
        </div>
      </section>

      {reel && zoneCourbe && (
        <section className="card">
          <div className="row between">
            <h2 className="h-card">{zoneCourbe} : observé et prévu</h2>
            <span className="small muted">30 dernières heures, prévision à 1 h et 2 h</span>
          </div>
          <CourbeTension points={serie} zone={zoneCourbe} />
        </section>
      )}

      <div className="split">
        <section className="card">
          <div className="row between">
            <h2 className="h-card">Zones</h2>
            <span className="small muted">{reel ? "Cliquer une zone pour sa courbe" : "Données de démonstration"}</span>
          </div>
          <ul className="zones">
            {tri.map((z) => (
              <li key={z.zone}>
                <div className="row between">
                  <button type="button" className="lien-zone" onClick={() => setChoix(z.zone)}><b>{z.zone}</b></button>
                  <NiveauBadge niveau={z.niveau} />
                </div>
                <div className="bar" aria-hidden="true">
                  <i style={{ width: `${z.niveau_congestion}%`, background: niveauColor(z.niveau) }} />
                </div>
                {reel ? (
                  <div className="facts">
                    <span>Tension <b>{z.niveau_congestion}</b></span>
                    {z.prevision_1h != null && <span>Dans 1 h <b>{Math.round(z.prevision_1h)}</b></span>}
                    {z.prevision_2h != null && <span>Dans 2 h <b>{Math.round(z.prevision_2h)}</b></span>}
                    <span>Appels <b>{nombre(z.appels ?? 0)}/h</b></span>
                    <span>Arrivées <b>{nombre(z.arrivees ?? 0)}</b></span>
                  </div>
                ) : (
                  <div className="facts">
                    <span>Congestion <b>{z.niveau_congestion} %</b></span>
                    <span>Vitesse <b>{z.vitesse_moyenne} km/h</b></span>
                    <span>Flux <b>{nombre(z.vehicules_par_heure)} véh/h</b></span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {reel && (
            <p className="small muted">
              Indice de tension : activité téléphonique de la zone rapportée à son haut niveau habituel. Il reflète la présence et les
              déplacements, pas directement le trafic routier.
            </p>
          )}
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
              <div key={a.id || a.zone} className={`alert-item ${a.niveau === "SATURE" ? "s" : "d"}`}>
                <div className="row between"><b>{a.zone}</b><NiveauBadge niveau={a.niveau} /></div>
                <span className="small muted">
                  Tension {a.congestion}
                  {a.prevision_1h != null ? ` · prévu ${Math.round(a.prevision_1h)} dans 1 h` : ""}
                  {a.vitesse_moyenne != null ? ` · ${a.vitesse_moyenne} km/h` : ""}
                  {a.prevue ? " · alerte anticipée" : ""}
                </span>
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
