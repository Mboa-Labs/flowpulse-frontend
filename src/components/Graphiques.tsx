import { niveauColor } from "./Badges";
import type { Niveau, Zone } from "../flowpulse";

const LIBELLE: Record<Niveau, string> = { FLUIDE: "Fluide", DENSE: "Dense", SATURE: "Saturé" };

/**
 * Classement des zones : barre = tension maintenant (couleur et libellé de l'état),
 * trait = prévision à 1 h, repères dense (75) et saturé (85). Clic pour choisir une zone.
 */
export function BarresZones({ zones, choix, onChoix }: { zones: Zone[]; choix?: string | null; onChoix?: (z: string) => void }) {
  const tri = [...zones].sort((a, b) => b.niveau_congestion - a.niveau_congestion);
  return (
    <div className="barres" role="list">
      <div className="barres-axe" aria-hidden="true">
        <span className="g" style={{ left: "75%" }}>75 dense</span>
        <span className="d" style={{ left: "85%" }}>85 saturé</span>
      </div>
      {tri.map((z) => {
        const p1 = z.prevision_1h != null ? Math.round(z.prevision_1h) : null;
        const titre = `${z.zone} : ${z.niveau_congestion}/100 maintenant (${LIBELLE[z.niveau].toLowerCase()})${p1 != null ? `, ${p1}/100 prévu dans 1 h` : ""}`;
        return (
          <button key={z.zone} type="button" role="listitem" title={titre} aria-label={titre}
                  className={`barre${choix === z.zone ? " on" : ""}`} onClick={() => onChoix?.(z.zone)}>
            <span className="barre-nom">{z.zone}</span>
            <span className="barre-piste" aria-hidden="true">
              <i className="barre-seuil" style={{ left: "75%" }} />
              <i className="barre-seuil s" style={{ left: "85%" }} />
              <i className="barre-val" style={{ width: `${Math.max(2, z.niveau_congestion)}%`, background: niveauColor(z.niveau) }} />
              {p1 != null && <i className="barre-prev" style={{ left: `${Math.min(100, p1)}%` }} />}
            </span>
            <span className="barre-chiffre">
              <b>{z.niveau_congestion}</b>
              {z.tendance_1h != null && z.tendance_1h !== 0 && (
                <small className={z.tendance_1h > 0 ? "hausse" : "baisse"}>{z.tendance_1h > 0 ? `▲${z.tendance_1h}` : `▼${-z.tendance_1h}`}</small>
              )}
            </span>
          </button>
        );
      })}
      <p className="legende small muted">
        <span><i className="l-barre" /> Maintenant (sur 100)</span>
        <span><i className="l-prev-v" /> Prévu dans 1 h</span>
        <span>▲▼ évolution sur la dernière heure</span>
      </p>
    </div>
  );
}

/** Répartition des zones par état : anneau à trois parts, nombre de zones au centre. */
export function Repartition({ zones }: { zones: Zone[] }) {
  const ordre: Niveau[] = ["SATURE", "DENSE", "FLUIDE"];
  const n = Object.fromEntries(ordre.map((k) => [k, zones.filter((z) => z.niveau === k).length])) as Record<Niveau, number>;
  const R = 52, C = 2 * Math.PI * R, ECART = zones.length > 1 ? 3 : 0;
  let debut = 0;
  const parts = ordre.filter((k) => n[k] > 0).map((k) => {
    const long = (n[k] / zones.length) * C;
    const p = { k, dash: `${Math.max(0, long - ECART)} ${C}`, offset: -debut };
    debut += long;
    return p;
  });
  return (
    <div className="repartition">
      <svg viewBox="0 0 140 140" role="img" aria-label={ordre.map((k) => `${n[k]} ${LIBELLE[k].toLowerCase()}`).join(", ")}>
        <circle cx="70" cy="70" r={R} className="anneau-fond" />
        {parts.map((p) => (
          <circle key={p.k} cx="70" cy="70" r={R} fill="none" stroke={niveauColor(p.k)} strokeWidth="16"
                  strokeDasharray={p.dash} strokeDashoffset={p.offset} transform="rotate(-90 70 70)">
            <title>{`${LIBELLE[p.k]} : ${n[p.k]} zone${n[p.k] > 1 ? "s" : ""}`}</title>
          </circle>
        ))}
        <text x="70" y="68" textAnchor="middle" className="anneau-total">{zones.length}</text>
        <text x="70" y="88" textAnchor="middle" className="anneau-sous">zones</text>
      </svg>
      <ul className="repartition-legende">
        {ordre.map((k) => (
          <li key={k}><i style={{ background: niveauColor(k) }} /> {LIBELLE[k]} <b>{n[k]}</b></li>
        ))}
      </ul>
    </div>
  );
}
