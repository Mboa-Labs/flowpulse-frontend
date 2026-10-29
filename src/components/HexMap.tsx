import { useEffect, useRef } from "react";

/** Palette séquentielle de densité, en aplats (aucun dégradé). */
const RAMP = ["#F1E4D6", "#E6C3A1", "#D59A6C", "#C2703D", "#93412C", "#5A2230"];
const PIN = ["#C92A2A", "#E8590C", "#D99800"];
const LINE = [[0.08, 0.86], [0.26, 0.64], [0.4, 0.42], [0.58, 0.46], [0.8, 0.3]];
const ROADS = [
  [0, 0.3, 0.35, 0.22, 0.65, 0.42, 1, 0.34],
  [0.22, 0, 0.3, 0.35, 0.38, 0.7, 0.46, 1],
  [0, 0.78, 0.4, 0.7, 0.7, 0.86, 1, 0.8],
  [0.55, 0, 0.5, 0.4, 0.62, 0.6, 0.66, 1],
];

/** Point chaud : position relative (0–1) et intensité. */
export type Hotspot = [x: number, y: number, s: number];

interface Props {
  width: number;
  height: number;
  hot: Hotspot[];
  seed?: number;
  line?: boolean;
  pins?: boolean;
  /** Couleur de chaque repère (par défaut : rouge, orange, jaune dans l'ordre) */
  pinColors?: string[];
  label: string;
}

function rnd(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function draw(W: number, H: number, hot: Hotspot[], seed: number, line: boolean, pins: boolean, pinColors?: string[]) {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  const bg = dark ? "#1A1F29" : "#EEEEE8";
  const road = dark ? "#2C3342" : "#FFFFFF";
  const water = dark ? "#1C2633" : "#E1E5E6";
  const pts = hot.map(([x, y, s]) => ({ x: x * W, y: y * H, s }));
  const R = Math.max(10, Math.round(W / 46));
  const r = rnd(seed);

  let out = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  out += `<path d="M${W * 0.78} 0 C${W * 0.72} ${H * 0.3} ${W * 0.9} ${H * 0.55} ${W * 0.84} ${H}L${W} ${H}L${W} 0Z" fill="${water}"/>`;
  for (const q of ROADS) {
    out += `<path d="M${q[0] * W} ${q[1] * H} C${q[2] * W} ${q[3] * H} ${q[4] * W} ${q[5] * H} ${q[6] * W} ${q[7] * H}" fill="none" stroke="${road}" stroke-width="${R * 0.7}" stroke-linecap="round"/>`;
  }
  const hw = Math.sqrt(3) * R;
  const sg = W * 0.12;
  for (let row = -1; row * R * 1.5 < H + R; row++) {
    for (let col = -1; col * hw < W + hw; col++) {
      const cx = col * hw + (row % 2 ? hw / 2 : 0);
      const cy = row * R * 1.5;
      let v = 0;
      for (const h of pts) v += h.s * Math.exp(-((cx - h.x) ** 2 + (cy - h.y) ** 2) / (2 * sg * sg));
      v += (r() - 0.5) * 0.12;
      if (v < 0.24) continue;
      const cls = Math.min(RAMP.length - 1, Math.floor((v - 0.24) / 0.13));
      const poly = [];
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 180) * (60 * k - 30);
        poly.push(`${(cx + (R - 1.2) * Math.cos(a)).toFixed(1)},${(cy + (R - 1.2) * Math.sin(a)).toFixed(1)}`);
      }
      out += `<polygon points="${poly.join(" ")}" fill="${RAMP[cls]}" fill-opacity="0.78"/>`;
    }
  }
  if (line) {
    out += `<polyline points="${LINE.map(([x, y]) => `${x * W},${y * H}`).join(" ")}" fill="none" stroke="#D6336C" stroke-width="${R * 0.42}" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const [x, y] of LINE.slice(1)) out += `<circle cx="${x * W}" cy="${y * H}" r="${R * 0.42}" fill="#fff" stroke="#D6336C" stroke-width="${R * 0.22}"/>`;
  }
  if (pins) {
    pts.forEach((h, i) => {
      out += `<circle cx="${h.x}" cy="${h.y}" r="${R * 0.62}" fill="${pinColors?.[i] ?? PIN[Math.min(i, 2)]}" stroke="#fff" stroke-width="${R * 0.22}"/>`;
    });
  }
  return out;
}

/** Carte de densité en cellules hexagonales ; se redessine quand le thème change. */
export default function HexMap({ width, height, hot, seed = 1, line = false, pins = false, pinColors, label }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const key = JSON.stringify([hot, pinColors]);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const render = () => (svg.innerHTML = draw(width, height, hot, seed, line, pins, pinColors));
    render();
    const obs = new MutationObserver(render);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, key, seed, line, pins]);

  return <svg ref={ref} className="hexmap" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} />;
}
