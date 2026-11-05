import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { erreur, getHorloge, HORLOGE_CHANGEE, momentAffiche, reglerHorloge, type Horloge } from "../flowpulse";
import Info from "./Info";

const HEURES = Array.from({ length: 24 }, (_, h) => h);

/**
 * Moment affiché : un jour type (jour ordinaire, fête, grand rassemblement) et une heure.
 * Les écrans écoutent HORLOGE_CHANGEE pour se recharger.
 */
export default function HorlogeDemo() {
  const { user } = useAuth();
  const [h, setH] = useState<Horloge | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const peutRegler = user?.role === "GESTIONNAIRE" || user?.role === "URBANISTE" || user?.role === "ADMIN";

  useEffect(() => {
    getHorloge().then(setH).catch(() => undefined);
  }, []);

  if (!h) return null;
  if (h.source !== "d4d" || !h.t) {
    return <p className="small muted">Données de démonstration (3 zones).</p>;
  }

  async function aller(t: string) {
    setPending(true);
    setError(null);
    try {
      const r = await reglerHorloge(t);
      setH(r);
      window.dispatchEvent(new Event(HORLOGE_CHANGEE));
    } catch (e) {
      setError(erreur(e));
    } finally {
      setPending(false);
    }
  }

  const jour = h.journees.find((j) => j.t.slice(0, 10) === h.t!.slice(0, 10));
  const heure = new Date(h.t).getHours();

  return (
    <section className="card horloge">
      <div className="row between">
        <div>
          <span className="label">
            {h.territoire ?? "Ville"} · moment affiché{" "}
            {h.mention && <Info titre="Origine des données" texte={`${h.mention}. Choisissez un jour type et une heure : tout l'écran se met à jour.`} />}
          </span>
          <h2 className="h-card">{momentAffiche(h.t, jour?.libelle)}</h2>
        </div>
        {h.modele && <span className="badge b-fluide">Prévisions actives</span>}
      </div>
      {peutRegler && (
        <div className="horloge-choix">
          <div className="suggest" role="group" aria-label="Jours types">
            {h.journees.map((j) => (
              <button key={j.t} type="button" className={j.t === h.t ? "on" : undefined} disabled={pending} onClick={() => aller(j.t)}>
                {j.libelle}
              </button>
            ))}
          </div>
          <label className="horloge-heure">
            Heure
            <select value={heure} disabled={pending} onChange={(e) => aller(`${h.t!.slice(0, 10)}T${String(e.target.value).padStart(2, "0")}:00`)}>
              {HEURES.map((x) => <option key={x} value={x}>{x} h</option>)}
            </select>
          </label>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
