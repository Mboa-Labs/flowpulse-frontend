import type { Hotspot } from "./components/HexMap";
import type { Niveau } from "./flowpulse";

/** Position des zones de démonstration sur la carte schématique (0–1). */
export const POSITION: Record<string, [number, number]> = {
  Almadies: [0.2, 0.32],
  "Grand Dakar": [0.48, 0.48],
  "Dakar Plateau": [0.74, 0.66],
};

const PIN: Record<Niveau, string> = { SATURE: "#C92A2A", DENSE: "#E8590C", FLUIDE: "#1F9D55" };

type Lieu = { zone: string; lon?: number; lat?: number };

/**
 * Position sur la carte schématique (0–1). Avec les données réelles, les coordonnées des antennes
 * sont ramenées dans le cadre de la carte ; sinon, positions fixes des zones de démonstration.
 */
export function positions(zones: Lieu[]): Record<string, [number, number]> {
  const geo = zones.filter((z) => z.lon != null && z.lat != null);
  if (geo.length < 2) return POSITION;
  const lons = geo.map((z) => z.lon!), lats = geo.map((z) => z.lat!);
  const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
  const out: Record<string, [number, number]> = {};
  for (const z of geo) {
    out[z.zone] = [0.08 + 0.84 * ((z.lon! - x0) / (x1 - x0 || 1)), 0.88 - 0.76 * ((z.lat! - y0) / (y1 - y0 || 1))];
  }
  return out;
}

/** Intensité accentuée (carré de la charge) pour que les écarts entre zones se voient sur la carte. */
export function hotspots(zones: (Lieu & { charge?: number; niveau_congestion: number })[]): Hotspot[] {
  const pos = positions(zones);
  return zones.map((z) => {
    const [x, y] = pos[z.zone] ?? POSITION[z.zone] ?? [0.5, 0.5];
    return [x, y, Math.min(1.3, ((z.charge ?? z.niveau_congestion) / 100) ** 2)];
  });
}

export const pinColors = (zones: { niveau: Niveau }[]) => zones.map((z) => PIN[z.niveau]);
