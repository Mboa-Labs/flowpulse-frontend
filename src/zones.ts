import type { Hotspot } from "./components/HexMap";
import type { Niveau } from "./flowpulse";

/** Position des zones de démonstration sur la carte schématique (0–1). */
export const POSITION: Record<string, [number, number]> = {
  Almadies: [0.2, 0.32],
  "Grand Dakar": [0.48, 0.48],
  "Dakar Plateau": [0.74, 0.66],
};

const PIN: Record<Niveau, string> = { SATURE: "#C92A2A", DENSE: "#E8590C", FLUIDE: "#1F9D55" };

/** Intensité accentuée (carré de la charge) pour que les écarts entre zones se voient sur la carte. */
export function hotspots(zones: { zone: string; charge?: number; niveau_congestion: number }[]): Hotspot[] {
  return zones.map((z) => {
    const [x, y] = POSITION[z.zone] ?? [0.5, 0.5];
    return [x, y, Math.min(1.3, ((z.charge ?? z.niveau_congestion) / 100) ** 2)];
  });
}

export const pinColors = (zones: { niveau: Niveau }[]) => zones.map((z) => PIN[z.niveau]);
