import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { dateHorloge, erreur, getHorloge, HORLOGE_CHANGEE, reglerHorloge, type Horloge } from "../flowpulse";

/**
 * Horloge de démonstration : choisit l'instant de 2013 que FlowPulse rejoue avec les données D4D.
 * Les écrans écoutent HORLOGE_CHANGEE pour se recharger.
 */
export default function HorlogeDemo() {
  const { user } = useAuth();
  const [h, setH] = useState<Horloge | null>(null);
  const [saisie, setSaisie] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const peutRegler = user?.role === "GESTIONNAIRE" || user?.role === "URBANISTE" || user?.role === "ADMIN";

  useEffect(() => {
    getHorloge().then((r) => { setH(r); setSaisie(r.t ?? ""); }).catch(() => undefined);
  }, []);

  if (!h) return null;
  if (h.source !== "d4d" || !h.t) {
    return <p className="small muted">Données de démonstration (3 zones). Les données D4D apparaissent quand le pipeline a produit ses résultats.</p>;
  }

  async function aller(t: string) {
    setPending(true);
    setError(null);
    try {
      const r = await reglerHorloge(t);
      setH(r);
      setSaisie(r.t ?? t);
      window.dispatchEvent(new Event(HORLOGE_CHANGEE));
    } catch (e) {
      setError(erreur(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card horloge">
      <div className="row between">
        <div>
          <span className="label">Données D4D-Sénégal · instant rejoué</span>
          <h2 className="h-card">{dateHorloge(h.t)}</h2>
        </div>
        {h.modele && <span className="badge b-fluide">Prévisions du modèle actives</span>}
      </div>
      {peutRegler && (
        <>
          <div className="suggest" role="group" aria-label="Journées proposées">
            {h.journees.map((j) => (
              <button key={j.t} type="button" className={j.t === h.t ? "on" : undefined} disabled={pending} onClick={() => aller(j.t)}>
                {j.libelle}
              </button>
            ))}
          </div>
          <form className="row" onSubmit={(e) => { e.preventDefault(); aller(saisie); }}>
            <label className="sr-only" htmlFor="horloge-t">Autre instant</label>
            <input id="horloge-t" className="search" type="datetime-local" step={3600} min={h.debut} max={h.fin}
                   value={saisie} onChange={(e) => setSaisie(e.target.value)} />
            <button className="btn btn-secondary" type="submit" disabled={pending || !saisie}>Rejouer cet instant</button>
          </form>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}
