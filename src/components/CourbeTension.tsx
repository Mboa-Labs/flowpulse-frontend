import type { PointSerie } from "../flowpulse";

const W = 640;
const H = 200;
const M = { haut: 12, droite: 12, bas: 26, gauche: 32 };

/**
 * Indice de tension observé (trait plein) et prévu par le modèle (pointillés, 1 h et 2 h),
 * avec les seuils dense (75) et saturé (85). Aplats et traits simples, sans dégradé.
 */
export default function CourbeTension({ points, zone }: { points: PointSerie[]; zone: string }) {
  if (points.length < 2) return <p className="small muted">Pas assez de données pour tracer la courbe.</p>;
  const x = (i: number) => M.gauche + (i / (points.length - 1)) * (W - M.gauche - M.droite);
  const y = (v: number) => M.haut + (1 - v / 100) * (H - M.haut - M.bas);
  const obs = points.map((p, i) => (p.observe != null ? [x(i), y(p.observe)] : null)).filter(Boolean) as number[][];
  const dernier = points.reduce((k, p, i) => (p.observe != null ? i : k), -1);
  const prev = points.map((p, i) => (p.prevu != null ? [x(i), y(p.prevu)] : null)).filter(Boolean) as number[][];
  const chemin = (pts: number[][]) => pts.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)} ${b.toFixed(1)}`).join(" ");
  const graduations = points.map((p, i) => ({ i, h: new Date(p.t).getHours() })).filter((g) => g.h % 6 === 0);
  const fin = points[points.length - 1];

  return (
    <figure className="courbe">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Indice de tension à ${zone} : ${obs.length} heures observées${prev.length ? `, prévision ${fin.prevu} dans ${prev.length} h` : ""}`}>
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={M.gauche} x2={W - M.droite} y1={y(v)} y2={y(v)} className="grille" />
            <text x={M.gauche - 6} y={y(v) + 4} textAnchor="end" className="axe">{v}</text>
          </g>
        ))}
        <line x1={M.gauche} x2={W - M.droite} y1={y(85)} y2={y(85)} className="seuil-sature" />
        <line x1={M.gauche} x2={W - M.droite} y1={y(75)} y2={y(75)} className="seuil-dense" />
        {graduations.map((g) => (
          <text key={g.i} x={x(g.i)} y={H - 8} textAnchor="middle" className="axe">{g.h} h</text>
        ))}
        <path d={chemin(obs)} className="obs" />
        {prev.length > 0 && dernier >= 0 && points[dernier].observe != null && (
          <path d={chemin([[x(dernier), y(points[dernier].observe!)], ...prev])} className="prev" />
        )}
        {prev.map(([a, b], i) => <circle key={i} cx={a} cy={b} r={4} className="prev-pt" />)}
        {dernier >= 0 && <circle cx={x(dernier)} cy={y(points[dernier].observe!)} r={4} className="obs-pt" />}
      </svg>
      <figcaption className="legende small muted">
        <span><i className="l-obs" /> Observé</span>
        <span><i className="l-prev" /> Prévu par le modèle</span>
        <span><i className="l-sature" /> Saturé (85)</span>
        <span><i className="l-dense" /> Dense (75)</span>
      </figcaption>
    </figure>
  );
}
