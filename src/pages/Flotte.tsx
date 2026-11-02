import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { ConformiteBadge, StatutBadge } from "../components/Badges";
import TracePanel, { Citations } from "../components/TracePanel";
import { NiveauBadge } from "../components/Badges";
import { decider, erreur, getArrets, getRecommandations, type Arret, type Recommandation } from "../flowpulse";

function Carte({ reco, peutDecider, onChange }: { reco: Recommandation; peutDecider: boolean; onChange: (r: Recommandation) => void }) {
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  async function decision(d: "appliquer" | "rejeter") {
    if (d === "rejeter" && !motif.trim()) {
      setError("Indiquez le motif du rejet (par exemple : bus en maintenance).");
      return;
    }
    setPending(true);
    setError(null);
    try {
      onChange(await decider(reco.id, d, d === "rejeter" ? motif.trim() : undefined));
    } catch (e) {
      setError(erreur(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="card">
      <div className="row between">
        <span className="label">{reco.id} · {reco.zone}</span>
        <StatutBadge statut={reco.statut} />
      </div>
      <h3 className="h-card">+{reco.nb_bus} bus sur la {reco.ligne}</h3>
      <p className="small muted">{reco.description}</p>
      <div className={`verdict ${reco.conformite === "NON_CONFORME" ? "v-ko" : reco.conformite === "CONFORME" ? "v-ok" : "v-warn"}`}>
        <ConformiteBadge conformite={reco.conformite} />
        <span className="small">{reco.justification}</span>
      </div>
      <Citations citations={reco.citations} />
      {peutDecider && reco.statut === "PROPOSEE" && (
        <div className="decision">
          <div className="field">
            <label htmlFor={`motif-${reco.id}`}>Motif en cas de rejet</label>
            <input id={`motif-${reco.id}`} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Bus en maintenance, chauffeur indisponible…" />
          </div>
          <div className="row">
            <button className="btn btn-primary" type="button" disabled={pending} onClick={() => decision("appliquer")}>Appliquer la recommandation</button>
            <button className="btn btn-danger" type="button" disabled={pending} onClick={() => decision("rejeter")}>Rejeter</button>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {reco.trace_id && (
        <>
          <button className="btn btn-ghost" type="button" onClick={() => setShowTrace((v) => !v)}>
            {showTrace ? "Masquer le raisonnement" : "Voir le raisonnement"}
          </button>
          {showTrace && <TracePanel traceId={reco.trace_id} />}
        </>
      )}
    </article>
  );
}

/** F2.1 : adéquation offre / demande arrêt par arrêt. */
function Arrets() {
  const [arrets, setArrets] = useState<Arret[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArrets().then(setArrets).catch((e) => setError(erreur(e)));
  }, []);

  if (error) return <p className="error card">{error}</p>;
  if (!arrets) return null;
  return (
    <section className="card">
      <div>
        <h2 className="h-card">Offre et demande par arrêt</h2>
        <p className="small muted">Tension : personnes arrivant à l'arrêt par heure, rapportées aux places offertes par les bus qui passent. Au-delà de 100 %, des usagers restent à quai.</p>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Arrêt</th><th>Ligne</th><th className="r">Demande /h</th><th className="r">Places /h</th><th className="r">Tension</th><th className="r">Attente</th><th>État</th></tr>
          </thead>
          <tbody>
            {arrets.map((a) => (
              <tr key={a.arret}>
                <td>{a.arret}<div className="small muted">{a.zone}</div></td>
                <td>{a.ligne}</td>
                <td className="r">{a.demande_par_heure}</td>
                <td className="r">{a.offre_par_heure} <span className="small muted">({a.bus_par_heure} bus)</span></td>
                <td className="r"><b>{a.tension} %</b></td>
                <td className="r">{a.attente_min} min</td>
                <td><NiveauBadge niveau={a.niveau} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Flotte() {
  const { user } = useAuth();
  const [recos, setRecos] = useState<Recommandation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const peutDecider = user?.role === "OPERATEUR" || user?.role === "ADMIN";

  useEffect(() => {
    getRecommandations().then(setRecos).catch((e) => setError(erreur(e)));
  }, []);

  if (error) return <p className="error card">{error}</p>;
  if (!recos) return <p className="muted">Chargement…</p>;
  const enAttente = recos.filter((r) => r.statut === "PROPOSEE");
  const traitees = recos.filter((r) => r.statut !== "PROPOSEE");
  const update = (r: Recommandation) => setRecos((all) => (all ?? []).map((x) => (x.id === r.id ? r : x)));

  return (
    <>
      <p className="muted">
        Les agents proposent, vous décidez : aucune réaffectation n'est appliquée sans votre validation.
      </p>
      <Arrets />
      {recos.length === 0 && <p className="card muted">Aucune recommandation. Elles apparaissent après une surveillance ou une demande au superviseur.</p>}
      {enAttente.length > 0 && <h2 className="h-sec">En attente de décision ({enAttente.length})</h2>}
      <div className="cards">{enAttente.map((r) => <Carte key={r.id} reco={r} peutDecider={peutDecider} onChange={update} />)}</div>
      {traitees.length > 0 && <h2 className="h-sec">Traitées ({traitees.length})</h2>}
      <div className="cards">{traitees.map((r) => <Carte key={r.id} reco={r} peutDecider={false} onChange={update} />)}</div>
    </>
  );
}
