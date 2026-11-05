import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { NiveauBadge } from "../components/Badges";
import CourbeTension from "../components/CourbeTension";
import CarteZones, { EchelleTension } from "../components/CarteZones";
import { BarresZones, Repartition } from "../components/Graphiques";
import HorlogeDemo from "../components/HorlogeDemo";
import Icon, { type IconName } from "../components/Icon";
import Info from "../components/Info";
import { erreur, getAlertes, getCarte, getSerie, getZones, HORLOGE_CHANGEE, lancerSurveillance, type Alerte, type PointSerie, type Zone } from "../flowpulse";

const INDICE = "Indice de tension : activité de la zone (téléphones présents et déplacements) rapportée à son niveau le plus haut habituel. 0 = calme, 100 = niveau le plus haut habituel ; 75 = dense, 85 = saturé.";

function Kpi({ icone, titre, valeur, unite, aide, info, ton }: {
  icone: IconName; titre: string; valeur: string | number; unite?: string; aide: string; info: string; ton?: "ok" | "warn" | "ko";
}) {
  return (
    <div className={`card kpi kpi-i${ton ? ` t-${ton}` : ""}`}>
      <div className="row between">
        <span className="kpi-icone" aria-hidden="true"><Icon name={icone} /></span>
        <Info titre={titre} texte={info} />
      </div>
      <span className="label">{titre}</span>
      <span className="v">{valeur}{unite && <small>{unite}</small>}</span>
      <span className="kpi-aide">{aide}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [choix, setChoix] = useState<string | null>(null);
  const [serie, setSerie] = useState<PointSerie[]>([]);
  const [contours, setContours] = useState<GeoJSON.FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const peutLancer = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  const charger = useCallback(() => {
    getZones().then(setZones).catch((e) => setError(erreur(e)));
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

  const tension = Math.round(zones.reduce((s, z) => s + z.niveau_congestion, 0) / zones.length);
  const reserve = zones.reduce((s, z) => s + (z.bus_en_reserve ?? 0), 0);
  const prevMax = zones.reduce<Zone | null>((m, z) => ((z.prevision_1h ?? -1) > (m?.prevision_1h ?? -1) ? z : m), null);
  const p1 = prevMax?.prevision_1h != null ? Math.round(prevMax.prevision_1h) : null;
  const saturees = alertes.filter((a) => a.niveau === "SATURE").length;

  return (
    <>
      <HorlogeDemo />

      {/* 1. L'essentiel en quatre chiffres */}
      <div className="kpis">
        <Kpi icone="home" titre="Tension moyenne" valeur={tension} unite="/ 100"
             ton={tension >= 85 ? "ko" : tension >= 75 ? "warn" : "ok"}
             aide={tension >= 85 ? "Ville saturée" : tension >= 75 ? "Ville dense" : "Circulation globalement fluide"}
             info={`Moyenne de l'indice de tension des ${zones.length} zones. ${INDICE}`} />
        <Kpi icone="alert" titre="Alertes signalées" valeur={alertes.length} ton={saturees ? "ko" : alertes.length ? "warn" : "ok"}
             aide={alertes.length ? `Dont ${saturees} saturée${saturees > 1 ? "s" : ""}, à traiter dans Alertes` : "Aucune zone en alerte"}
             info="Zones signalées par la dernière surveillance : tension dense ou saturée maintenant, ou prévue dans l'heure par le modèle." />
        {p1 != null && prevMax ? (
          <Kpi icone="sim" titre="Plus forte prévision à 1 h" valeur={p1} unite={`/ 100 · ${prevMax.zone}`}
               ton={p1 >= 85 ? "ko" : p1 >= 75 ? "warn" : "ok"} aide="La zone la plus à risque dans l'heure"
               info="Indice de tension que le modèle de prévision (entraîné sur l'historique des zones) attend dans une heure. Erreur moyenne d'environ 3 points sur 100." />
        ) : (
          <Kpi icone="sim" titre="Vitesse moyenne" valeur={(zones.reduce((s, z) => s + (z.vitesse_moyenne ?? 0), 0) / zones.length).toFixed(1)} unite="km/h"
               aide="Moyenne des zones" info="Vitesse moyenne des véhicules dans les zones (données de démonstration)." />
        )}
        <Kpi icone="bus" titre="Bus en réserve" valeur={reserve} aide="Disponibles pour un renfort"
             info="Bus de réserve que l'exploitant peut envoyer en renfort, toutes zones confondues. Valeur fictive en attendant les données d'un exploitant." />
      </div>

      {/* 2. La carte, l'état des zones et les alertes */}
      <div className="split">
        <section className="card map-card">
          <div className="row between">
            <h2 className="h-card">Carte de la tension <Info titre="Carte" texte={`Chaque zone est colorée selon son indice de tension maintenant. Cliquez une zone pour voir sa courbe. ${INDICE}`} /></h2>
            <span className="small muted">{reel ? `${zones.length} communes` : "Données de démonstration"}</span>
          </div>
          <CarteZones
            zones={zones.map((z) => ({ zone: z.zone, lon: z.lon, lat: z.lat, valeur: z.niveau_congestion, niveau: z.niveau,
                                       detail: z.prevision_1h != null ? `dans 1 h : ${Math.round(z.prevision_1h)}/100` : undefined }))}
            contours={contours}
            choix={zoneCourbe}
            onChoix={setChoix}
            hauteur={440}
            label="Carte de la ville : tension par zone"
          />
          <EchelleTension />
        </section>

        <div className="pile">
          <section className="card">
            <h2 className="h-card">État des zones <Info titre="État des zones" texte="Nombre de zones fluides (moins de 75), denses (75 à 84) et saturées (85 et plus) à l'instant affiché." /></h2>
            <Repartition zones={zones} />
          </section>

          <section className="card">
            <div className="row between">
              <h2 className="h-card">Alertes signalées</h2>
              <Link className="small" to="/alertes">Tout voir</Link>
            </div>
            {alertes.length === 0 ? (
              <p className="muted small">Aucune alerte.{peutLancer ? " Lancez une surveillance pour analyser les zones." : ""}</p>
            ) : (
              alertes.slice(0, 4).map((a) => (
                <div key={a.id || a.zone} className={`alert-item ${a.niveau === "SATURE" ? "s" : "d"}`}>
                  <div className="row between"><b>{a.zone}</b><NiveauBadge niveau={a.niveau} /></div>
                  <span className="small muted">
                    {a.congestion}/100{a.prevision_1h != null ? ` · ${Math.round(a.prevision_1h)}/100 dans 1 h` : ""}{a.prevue ? " · anticipée" : ""}
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
      </div>

      {/* 3. Classement des zones, 4. courbe de la zone choisie */}
      <div className="duo">
        <section className="card">
          <div className="row between">
            <h2 className="h-card">Classement des zones <Info titre="Classement" texte={`Zones de la plus tendue à la plus calme. Barre : indice maintenant. Trait foncé : prévision dans 1 h. ${INDICE}`} /></h2>
            <span className="small muted">Cliquer pour la courbe</span>
          </div>
          <BarresZones zones={zones} choix={zoneCourbe} onChoix={setChoix} />
        </section>

        {reel && zoneCourbe && (
          <section className="card">
            <h2 className="h-card">Évolution à {zoneCourbe} <Info titre="Courbe" texte="Axe horizontal : heure de la journée (30 dernières heures, puis 2 heures de prévision). Axe vertical : indice de tension sur 100. Trait plein : observé. Pointillés : prévu par le modèle. Lignes : seuils dense (75) et saturé (85)." /></h2>
            <CourbeTension points={serie} zone={zoneCourbe} />
          </section>
        )}
      </div>
    </>
  );
}
