import type { PointSerie } from "../flowpulse";

const W = 640;
const H = 244;
const M = { haut: 16, droite: 64, bas: 54, gauche: 44 };
const JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

const heure = (t: string) => new Date(t).getHours();
const quand = (t: string) => {
  const d = new Date(t);
  return `${JOURS[d.getDay()]} ${d.getHours()} h`;
};

/**
 * Indice de tension sur 100 : observé (trait plein) et prévu par le modèle (pointillés, 1 h et 2 h).
 * Axe titré, jours et heures, repère « maintenant », seuils nommés, valeur au survol de chaque heure.
 */
export default function CourbeTension({ points, zone }: { points: PointSerie[]; zone: string }) {
  if (points.length < 2) return <p className="small muted">Pas assez de données pour tracer la courbe.</p>;
  const pas = (W - M.gauche - M.droite) / (points.length - 1);
  const x = (i: number) => M.gauche + i * pas;
  const y = (v: number) => M.haut + (1 - v / 100) * (H - M.haut - M.bas);
  const obs = points.map((p, i) => (p.observe != null ? [x(i), y(p.observe)] : null)).filter(Boolean) as number[][];
  const dernier = points.reduce((k, p, i) => (p.observe != null ? i : k), -1);
  const prev = points.map((p, i) => (p.prevu != null ? [x(i), y(p.prevu)] : null)).filter(Boolean) as number[][];
  const chemin = (pts: number[][]) => pts.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)} ${b.toFixed(1)}`).join(" ");
  const graduations = points.map((p, i) => ({ i, h: heure(p.t), t: p.t })).filter((g) => g.h % 6 === 0);
  const fin = points[points.length - 1];
  const actuel = dernier >= 0 ? points[dernier] : null;

  return (
    <figure className="courbe">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Indice de tension à ${zone}, sur 100 : ${obs.length} heures observées${actuel ? `, ${actuel.observe} maintenant` : ""}${prev.length ? `, prévision ${fin.prevu} dans ${prev.length} h` : ""}`}>
        <text x={12} y={M.haut + (H - M.haut - M.bas) / 2} className="titre-axe" textAnchor="middle"
              transform={`rotate(-90 12 ${M.haut + (H - M.haut - M.bas) / 2})`}>Indice (sur 100)</text>
        {[0, 25, 50, 100].map((v) => (
          <g key={v}>
            <line x1={M.gauche} x2={W - M.droite} y1={y(v)} y2={y(v)} className="grille" />
            <text x={M.gauche - 6} y={y(v) + 4} textAnchor="end" className="axe">{v}</text>
          </g>
        ))}
        <line x1={M.gauche} x2={W - M.droite} y1={y(85)} y2={y(85)} className="seuil-sature" />
        <text x={W - M.droite + 6} y={y(85) - 2} className="seuil-txt s">Saturé 85</text>
        <line x1={M.gauche} x2={W - M.droite} y1={y(75)} y2={y(75)} className="seuil-dense" />
        <text x={W - M.droite + 6} y={y(75) + 10} className="seuil-txt d">Dense 75</text>

        {graduations.map((g) => (
          <g key={g.i}>
            <text x={x(g.i)} y={H - 38} textAnchor="middle" className="axe">{g.h} h</text>
            {g.h === 0 && <text x={x(g.i)} y={H - 24} textAnchor="middle" className="axe">{JOURS[new Date(g.t).getDay()]}</text>}
          </g>
        ))}

        <text x={M.gauche + (W - M.gauche - M.droite) / 2} y={H - 2} textAnchor="middle" className="titre-axe">Heure de la journée</text>
        {actuel && (
          <g>
            <line x1={x(dernier)} x2={x(dernier)} y1={M.haut} y2={H - M.bas} className="maintenant" />
            <text x={x(dernier)} y={M.haut - 4} textAnchor="middle" className="axe">maintenant</text>
          </g>
        )}

        <path d={chemin(obs)} className="obs" />
        {prev.length > 0 && actuel?.observe != null && (
          <path d={chemin([[x(dernier), y(actuel.observe)], ...prev])} className="prev" />
        )}
        {prev.map(([a, b], i) => <circle key={i} cx={a} cy={b} r={4} className="prev-pt" />)}
        {actuel?.observe != null && <circle cx={x(dernier)} cy={y(actuel.observe)} r={4} className="obs-pt" />}

        {/* Survol : une bande par heure, avec sa valeur */}
        {points.map((p, i) => (
          <rect key={p.t} x={x(i) - pas / 2} y={M.haut} width={pas} height={H - M.haut - M.bas} className="zone-survol">
            <title>
              {quand(p.t)} : {p.observe != null ? `observé ${p.observe}/100` : `prévu ${Math.round(p.prevu ?? 0)}/100`}
            </title>
          </rect>
        ))}
      </svg>
      <figcaption className="legende small muted">
        <span><i className="l-obs" /> Observé</span>
        <span><i className="l-prev" /> Prévu par le modèle (1 h et 2 h)</span>
        <span><i className="l-sature" /> Saturé (85)</span>
        <span><i className="l-dense" /> Dense (75)</span>
        <span>Survolez la courbe pour lire la valeur d'une heure.</span>
      </figcaption>
    </figure>
  );
}
