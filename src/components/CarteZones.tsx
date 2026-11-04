import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Niveau } from "../flowpulse";

/** Zone à représenter : contour officiel s'il existe (GeoJSON), sinon un repère à sa position. */
export interface ZoneCarte {
  zone: string;
  lon?: number;
  lat?: number;
  /** Valeur affichée et colorée (indice de tension ou charge, sur 100) */
  valeur: number;
  niveau: Niveau;
  detail?: string;
}

interface Props {
  zones: ZoneCarte[];
  contours?: GeoJSON.FeatureCollection | null;
  choix?: string | null;
  onChoix?: (zone: string) => void;
  hauteur?: number;
  label: string;
}

/** Palette séquentielle de la charte (aplats), du plus calme au plus tendu */
const RAMP = ["#F1E4D6", "#E6C3A1", "#D59A6C", "#C2703D", "#93412C", "#5A2230"];
const BORD: Record<Niveau, string> = { FLUIDE: "#1F9D55", DENSE: "#E8590C", SATURE: "#C92A2A" };

export function couleur(valeur: number) {
  return RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor((valeur - 40) / 12)))];
}

const sombre = () => document.documentElement.getAttribute("data-theme") === "dark";
const fond = () =>
  `https://{s}.basemaps.cartocdn.com/${sombre() ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`;

/**
 * Vraie carte (OpenStreetMap, fond CARTO) : contours officiels des zones colorés selon la tension,
 * étiquette par zone, clic pour choisir une zone. Se redessine quand les valeurs ou le thème changent.
 */
export default function CarteZones({ zones, contours, choix, onChoix, hauteur = 420, label }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<L.Map | null>(null);
  const tuiles = useRef<L.TileLayer | null>(null);
  const calque = useRef<L.LayerGroup | null>(null);
  const cadre = useRef<string>("");

  // Création de la carte, une seule fois
  useEffect(() => {
    if (!conteneur.current) return;
    const m = L.map(conteneur.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
    tuiles.current = L.tileLayer(fond(), {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
    }).addTo(m);
    calque.current = L.layerGroup().addTo(m);
    carte.current = m;
    // Fond clair ou sombre selon le thème de l'application
    const obs = new MutationObserver(() => tuiles.current?.setUrl(fond()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      obs.disconnect();
      m.remove();
      carte.current = null;
    };
  }, []);

  // Zones : contours colorés (ou repères), étiquettes, cadrage
  useEffect(() => {
    const m = carte.current, groupe = calque.current;
    if (!m || !groupe) return;
    groupe.clearLayers();
    const parZone = new Map(zones.map((z) => [z.zone, z]));
    const limites: L.LatLngBounds[] = [];

    const etiquette = (z: ZoneCarte) => `<b>${z.zone}</b> · ${Math.round(z.valeur)}${z.detail ? `<br><span>${z.detail}</span>` : ""}`;
    const features = contours?.features.filter((f) => parZone.has(String(f.properties?.zone))) ?? [];

    if (features.length) {
      for (const f of features) {
        const z = parZone.get(String(f.properties?.zone))!;
        const couche = L.geoJSON(f, {
          style: {
            color: z.zone === choix ? "#1B1F2A" : BORD[z.niveau],
            weight: z.zone === choix ? 3 : 1.5,
            fillColor: couleur(z.valeur),
            fillOpacity: 0.62,
          },
        });
        couche.bindTooltip(etiquette(z), { permanent: true, direction: "center", className: "carte-etiquette" });
        couche.on("click", () => onChoix?.(z.zone));
        couche.addTo(groupe);
        limites.push(couche.getBounds());
      }
    } else {
      for (const z of zones) {
        if (z.lat == null || z.lon == null) continue;
        const rond = L.circleMarker([z.lat, z.lon], {
          radius: 10 + z.valeur / 8,
          color: z.zone === choix ? "#1B1F2A" : BORD[z.niveau],
          weight: z.zone === choix ? 3 : 2,
          fillColor: couleur(z.valeur),
          fillOpacity: 0.75,
        });
        rond.bindTooltip(etiquette(z), { permanent: true, direction: "top", offset: [0, -10], className: "carte-etiquette" });
        rond.on("click", () => onChoix?.(z.zone));
        rond.addTo(groupe);
        limites.push(L.latLngBounds([z.lat, z.lon], [z.lat, z.lon]));
      }
    }

    // Cadrer seulement quand l'ensemble des zones change (pas à chaque mise à jour des valeurs)
    const cle = zones.map((z) => z.zone).join("|");
    if (limites.length && cle !== cadre.current) {
      const tout = limites.reduce((acc, b) => acc.extend(b), L.latLngBounds(limites[0].getSouthWest(), limites[0].getNorthEast()));
      m.fitBounds(tout.pad(0.08));
      cadre.current = cle;
    }
  }, [zones, contours, choix, onChoix]);

  return <div ref={conteneur} className="carte-zones" style={{ height: hauteur }} role="region" aria-label={label} />;
}
