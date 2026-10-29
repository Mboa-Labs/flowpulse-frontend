import { useEffect, useState, type FormEvent } from "react";
import { ConformiteBadge, NiveauBadge } from "../components/Badges";
import HexMap, { type Hotspot } from "../components/HexMap";
import TracePanel, { Citations } from "../components/TracePanel";
import { erreur, getSimulations, getZones, simuler, type EtatZone, type Scenario, type Simulation as Sim, type TypeScenario } from "../flowpulse";

const TYPES: Record<TypeScenario, string> = {
  fermeture: "Fermeture d'un axe",
  evenement: "Événement (match, marché, cérémonie)",
  renfort: "Renfort de bus",
};

/** Position des zones de démonstration sur la carte schématique. */
const POSITION: Record<string, [number, number]> = {
  Almadies: [0.2, 0.32],
  "Grand Dakar": [0.48, 0.48],
  "Dakar Plateau": [0.74, 0.66],
};

/** Intensité accentuée (carré de la charge) pour que l'écart avant / après se voie sur la carte. */
function hotspots(etats: EtatZone[]): Hotspot[] {
  return etats.map((e) => {
    const [x, y] = POSITION[e.zone] ?? [0.5, 0.5];
    return [x, y, Math.min(1.3, (e.charge / 100) ** 2)];
  });
}

const PIN = { SATURE: "#C92A2A", DENSE: "#E8590C", FLUIDE: "#1F9D55" } as const;
const pinColors = (etats: EtatZone[]) => etats.map((e) => PIN[e.niveau]);

function signe(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function Resultat({ sim }: { sim: Sim }) {
  const [showTrace, setShowTrace] = useState(false);
  const i = sim.indicateurs;
  const ligne = (z: string) => sim.apres.find((a) => a.zone === z)!;

  return (
    <div className="sim-result">
      <div className="row between">
        <h2 className="h-card">{sim.libelle}</h2>
        <span className="small muted mono">{sim.id}</span>
      </div>

      <div className="kpis">
        <div className="card kpi">
          <span className="label">Temps de parcours</span>
          <span className="v" style={{ color: i.temps_parcours_pct > 0 ? "var(--dense)" : i.temps_parcours_pct < 0 ? "var(--fluide)" : undefined }}>
            {signe(i.temps_parcours_pct)}<small>%</small>
          </span>
        </div>
        <div className="card kpi">
          <span className="label">Zones saturées</span>
          <span className="v">{i.zones_saturees_avant} → {i.zones_saturees_apres}</span>
        </div>
        <div className="card kpi">
          <span className="label">Zone la plus touchée</span>
          <span className="v sm">{i.zone_la_plus_touchee}</span>
          <span className="small muted">{signe(i.variation_max_points)} points{i.ligne_la_plus_touchee ? ` · ${i.ligne_la_plus_touchee}` : ""}</span>
        </div>
        <div className="card kpi">
          <span className="label">Personnes concernées</span>
          <span className="v">≈ {i.personnes_concernees.toLocaleString("fr-FR")}</span>
        </div>
      </div>

      <div className="compare">
        <figure className="card">
          <span className="label">Avant</span>
          <HexMap width={440} height={300} seed={6} hot={hotspots(sim.avant)} pins pinColors={pinColors(sim.avant)} label="Carte de densité avant le scénario" />
        </figure>
        <figure className="card">
          <span className="label">Après</span>
          <HexMap width={440} height={300} seed={6} hot={hotspots(sim.apres)} pins pinColors={pinColors(sim.apres)} label="Carte de densité après le scénario" />
        </figure>
      </div>

      <section className="card">
        <h3 className="h-card">Effet par zone</h3>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Zone</th><th className="r">Avant</th><th className="r">Après</th><th className="r">Écart</th><th className="r">km/h</th><th>État</th></tr>
            </thead>
            <tbody>
              {sim.avant.map((a) => {
                const b = ligne(a.zone);
                const d = b.charge - a.charge;
                return (
                  <tr key={a.zone}>
                    <td>{a.zone}</td>
                    <td className="r">{a.charge} %</td>
                    <td className="r">{b.charge} %</td>
                    <td className="r" style={{ color: d > 0 ? "var(--dense)" : d < 0 ? "var(--fluide)" : undefined }}>{signe(d)}</td>
                    <td className="r">{a.vitesse_moyenne} → {b.vitesse_moyenne}</td>
                    <td><NiveauBadge niveau={b.niveau} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">Avant et après : charge de la zone, c'est-à-dire la demande rapportée à sa capacité. Au-delà de 100 %, des files d'attente se forment.</p>
      </section>

      <section className="card">
        <h3 className="h-card">Vérification réglementaire</h3>
        {sim.mesures.length === 0 && <p className="small muted">Aucune mesure à vérifier pour ce scénario.</p>}
        {sim.mesures.map((m) => (
          <div key={m.description} className={`verdict ${m.verdict === "NON_CONFORME" ? "v-ko" : m.verdict === "CONFORME" ? "v-ok" : "v-warn"}`}>
            <div className="row between">
              <b className="small">{m.description}</b>
              <ConformiteBadge conformite={m.verdict} />
            </div>
            <span className="small">{m.justification}</span>
            <Citations citations={m.citations} />
          </div>
        ))}
        <p className="small muted">Bac à sable : rien n'est appliqué. Les renforts éventuels passent ensuite par la validation de l'opérateur.</p>
      </section>

      <details className="card">
        <summary className="h-card">Hypothèses du modèle</summary>
        <ul className="small muted hyp">
          {sim.hypotheses.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </details>

      <button className="btn btn-ghost" type="button" onClick={() => setShowTrace((v) => !v)}>
        {showTrace ? "Masquer le raisonnement" : "Voir le raisonnement"}
      </button>
      {showTrace && <div className="card"><TracePanel traceId={sim.trace_id} /></div>}
    </div>
  );
}

export default function Simulation() {
  const [zones, setZones] = useState<string[]>([]);
  const [form, setForm] = useState<Scenario>({ type: "fermeture", zone: "", debut: "08:00", fin: "12:00", participants: 20000, nbBus: 3 });
  const [sim, setSim] = useState<Sim | null>(null);
  const [historique, setHistorique] = useState<Sim[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getZones()
      .then((z) => {
        setZones(z.map((x) => x.zone));
        setForm((f) => ({ ...f, zone: f.zone || z[0]?.zone || "" }));
      })
      .catch((e) => setError(erreur(e)));
    getSimulations().then(setHistorique).catch(() => undefined);
  }, []);

  async function lancer(e: FormEvent) {
    e.preventDefault();
    if (form.fin <= form.debut) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const s = await simuler({
        ...form,
        participants: form.type === "evenement" ? form.participants : 0,
        nbBus: form.type === "renfort" ? form.nbBus : 0,
      });
      setSim(s);
      setHistorique((h) => [s, ...h]);
    } catch (err) {
      setError(erreur(err));
    } finally {
      setPending(false);
    }
  }

  const set = <K extends keyof Scenario>(k: K, v: Scenario[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="sim">
      <form className="card sim-form" onSubmit={lancer}>
        <h2 className="h-card">Scénario</h2>
        <div className="field">
          <label htmlFor="s-type">Événement</label>
          <select id="s-type" value={form.type} onChange={(e) => set("type", e.target.value as TypeScenario)}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="s-zone">Zone concernée</label>
          <select id="s-zone" value={form.zone} onChange={(e) => set("zone", e.target.value)} required>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="pair">
          <div className="field">
            <label htmlFor="s-debut">Début</label>
            <input id="s-debut" type="time" value={form.debut} onChange={(e) => set("debut", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="s-fin">Fin</label>
            <input id="s-fin" type="time" value={form.fin} onChange={(e) => set("fin", e.target.value)} required />
          </div>
        </div>
        {form.type === "evenement" && (
          <div className="field">
            <label htmlFor="s-part">Participants attendus</label>
            <input id="s-part" type="number" inputMode="numeric" min={0} max={200000} step={500} value={form.participants} onChange={(e) => set("participants", Number(e.target.value))} required />
          </div>
        )}
        {form.type === "renfort" && (
          <div className="field">
            <label htmlFor="s-bus">Bus supplémentaires</label>
            <input id="s-bus" type="number" inputMode="numeric" min={1} max={50} value={form.nbBus} onChange={(e) => set("nbBus", Number(e.target.value))} required />
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={pending || !form.zone}>
          {pending ? "Simulation en cours…" : "Lancer la simulation"}
        </button>
        <span className="small muted">Quelques secondes, vérification réglementaire comprise. Données de démonstration.</span>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      {sim ? (
        <Resultat sim={sim} />
      ) : (
        <div className="card muted sim-empty">
          <p>Testez un événement ou un aménagement avant qu'il n'ait lieu : FlowPulse estime où le trafic se reporte, l'effet sur les temps de parcours, et vérifie les mesures d'accompagnement au regard des textes.</p>
        </div>
      )}

      {historique.length > 0 && (
        <section className="card sim-hist-card">
          <h2 className="h-card">Simulations précédentes</h2>
          <ul className="sim-hist">
            {historique.map((h) => (
              <li key={h.id}>
                <button type="button" className={sim?.id === h.id ? "on" : undefined} onClick={() => setSim(h)}>
                  <span>{h.libelle}</span>
                  <small>{new Date(h.date * 1000).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
