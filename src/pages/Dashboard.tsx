import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge, niveauColor } from "../components/Badges";
import CourbeTension from "../components/CourbeTension";
import CarteZones, { EchelleTension } from "../components/CarteZones";
import HorlogeDemo from "../components/HorlogeDemo";
import { erreur, getAlertes, getCarte, getHorloge, getSerie, getZones, HORLOGE_CHANGEE, lancerSurveillance, type Alerte, type Horloge, type PointSerie, type Zone } from "../flowpulse";

const nombre = (n: number) => n.toLocaleString("fr-FR");

export default function Dashboard() {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [choix, setChoix] = useState<string | null>(null);
  const [serie, setSerie] = useState<PointSerie[]>([]);
  const [territoire, setTerritoire] = useState<Horloge | null>(null);
  const [contours, setContours] = useState<GeoJSON.FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const peutLancer = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  const charger = useCallback(() => {
    getZones().then(setZones).catch((e) => setError(erreur(e)));
    getHorloge().then(setTerritoire).catch(() => undefined);
    getCarte().then(setContours).catch(() => undefined);
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

  return (
    <>
      <HorlogeDemo />

      <div className="kpis">
        <div className="card kpi">
          <span className="label">Tension moyenne</span>
          <span className="v">{congestion}<small>/ 100</small></span>
          <span className="kpi-aide">{congestion >= 85 ? "Ville saturée" : congestion >= 75 ? "Ville dense" : "Circulation globalement fluide"}</span>
        </div>
        <div className="card kpi">
          <span className="label">Alertes actives</span>
          <span className="v">{alertes.length}</span>
          <span className="kpi-aide">{alertes.length ? "Zones à traiter dans Alertes" : "Lancez une surveillance pour vérifier"}</span>
        </div>
        {reel && prevMax ? (
          <div className="card kpi">
            <span className="label">Plus forte prévision à 1 h</span>
            <span className="v">{Math.round(prevMax.prevision_1h ?? 0)}<small>/ 100 · {prevMax.zone}</small></span>
            <span className="kpi-aide">La zone la plus à risque dans l'heure</span>
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
          <span className="kpi-aide">Disponibles pour un renfort</span>
        </div>
      </div>

      <section className="card map-card">
        <div className="row between">
          <h2 className="h-card">Tension par zone</h2>
          <span className="small muted">{reel ? `${territoire?.territoire ?? ""} · ${zones.length} zones` : "Données de démonstration"}</span>
        </div>
        <CarteZones
          zones={zones.map((z) => ({ zone: z.zone, lon: z.lon, lat: z.lat, valeur: z.niveau_congestion, niveau: z.niveau,
                                     detail: z.prevision_1h != null ? `dans 1 h : ${Math.round(z.prevision_1h)}/100` : undefined }))}
          contours={contours}
          choix={zoneCourbe}
          onChoix={setChoix}
          hauteur={460}
          label="Carte de la ville : tension par zone"
        />
        <EchelleTension />
      </section>

      {reel && zoneCourbe && (
        <section className="card">
          <div className="row between">
            <h2 className="h-card">{zoneCourbe} : observé et prévu</h2>
            <span className="small muted">Indice de tension sur 100 · 30 dernières heures et 2 h de prévision</span>
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
                    <span>Maintenant <b>{z.niveau_congestion}/100</b></span>
                    {z.tendance_1h != null && (
                      <span className={`tendance ${z.tendance_1h > 0 ? "hausse" : z.tendance_1h < 0 ? "baisse" : ""}`}
                            title="Évolution de l'indice depuis l'heure précédente">
                        {z.tendance_1h > 0 ? "▲" : z.tendance_1h < 0 ? "▼" : "="} <b>{z.tendance_1h > 0 ? `+${z.tendance_1h}` : z.tendance_1h}</b> en 1 h
                      </span>
                    )}
                    {z.prevision_1h != null && <span>Dans 1 h <b>{Math.round(z.prevision_1h)}/100</b></span>}
                    {z.prevision_2h != null && <span>Dans 2 h <b>{Math.round(z.prevision_2h)}/100</b></span>}
                    {z.volumes_representatifs !== false && <span>Arrivées <b>{nombre(z.arrivees ?? 0)}/h</b></span>}
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
              Indice sur 100 : activité de la zone rapportée à son haut niveau habituel (75 = dense, 85 = saturé). Il reflète la présence
              et les déplacements, pas directement le trafic routier.
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
