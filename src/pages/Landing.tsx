import { Link } from "react-router-dom";
import rondPoint from "../assets/yaounde-rond-point.jpg";
import vueAerienne from "../assets/yaounde-vue-aerienne.jpg";
import sprite from "../assets/illustrations.svg?raw";
import HexMap from "../components/HexMap";
import Logo from "../components/Logo";
import { useAuth } from "../auth";
import { HOME } from "../routes";

function Il({ id, w, h, label }: { id: string; w: number; h: number; label?: string }) {
  return (
    <svg className="il" viewBox={`0 0 ${w} ${h}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <use href={`#${id}`} />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const STEPS = [
  { il: "il-detect", t: "Détecter", p: "Les flux entre antennes sont agrégés par quartier et par heure. Un agent surveille en continu et repère les pics avant qu'ils ne bloquent la circulation." },
  { il: "il-reco", t: "Recommander", p: "Un agent d'optimisation propose où envoyer les bus de réserve. L'opérateur valide ou rejette ; rien ne s'applique sans lui." },
  { il: "il-justify", t: "Justifier", p: "Chaque recommandation est vérifiée au regard des lois et règlements, cite l'article applicable et garde la trace complète du raisonnement." },
];

const PERSONAS = [
  { il: "il-mairie", tag: "Municipalité", t: "Gestionnaire urbain", items: ["Carte de la ville en temps réel", "Alertes anticipées et plans de contingence", "Questions en langage naturel au superviseur"] },
  { il: "il-operateur", tag: "Exploitant", t: "Opérateur de bus", items: ["Arrêts en tension, ligne par ligne", "Réaffectations proposées et justifiées", "Décision tracée, avec motif en cas de rejet"] },
  { il: "il-urbaniste", tag: "Planification", t: "Urbaniste", items: ["Simulation d'événements et de travaux", "Comparaison avant / après", "Registre des manques réglementaires"] },
];

const PIPELINE: [string, string][] = [
  ["SRC", "Antennes, réseau routier, bus, lois"],
  ["C", "Collecte et contrôle"],
  ["PP", "Anonymisation, indicateurs"],
  ["M", "Prédiction, zones de tension"],
  ["P", "Conformité réglementaire"],
  ["D", "Distribution des alertes"],
  ["SINK", "Tableau de bord, opérateur"],
];

const TEAM: [string, string, string][] = [
  ["EK", "Emile Cabrel Kamdem Fosso", "Chef d'équipe"],
  ["YD", "Yvanna Djaha Tchesseu", "Membre"],
  ["JT", "Jorel Tiomela Zangue", "Membre"],
  ["MT", "Martin Yvan Tsemegne", "Membre"],
];

export default function Landing() {
  const { user } = useAuth();
  const app = user ? HOME[user.role] : "/login";
  const appLabel = user ? "Ouvrir l'application" : "Se connecter";

  return (
    <div className="lp">
      <div className="sprite" dangerouslySetInnerHTML={{ __html: sprite }} />

      <header className="lp-in lp-nav">
        <Link to="/" className="lp-logo" aria-label="FlowPulse, accueil">
          <Logo />
        </Link>
        <nav aria-label="Sections">
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#pour-qui">Pour qui</a>
          <a href="#conformite">Conformité</a>
          <a href="#equipe">Équipe</a>
        </nav>
        <Link className="btn btn-secondary btn-sm" to={app}>
          {appLabel}
        </Link>
      </header>

      <main>
        <section className="lp-in lp-hero">
          <div>
            <span className="eyebrow">Mobilité urbaine · IA responsable</span>
            <h1>Voir la congestion venir, et déplacer les bus avant qu'elle ne bloque la ville.</h1>
            <p className="lead">
              FlowPulse lit les flux des antennes mobiles, prévoit les zones saturées 30 à 60 minutes à l'avance et propose des réaffectations de bus justifiées par les textes en vigueur.
            </p>
            <div className="row lp-actions">
              <Link className="btn btn-primary" to={app}>
                Voir la démo
                <Arrow />
              </Link>
              <a className="btn btn-secondary" href="#fonctionnement">
                Notre approche
              </a>
            </div>
            <div className="lp-trust">
              <span><b>30–60 min</b>d'anticipation visée</span>
              <span><b>4 agents</b>spécialisés</span>
              <span><b>100 %</b>des décisions validées par un humain</span>
            </div>
          </div>
          <div className="lp-visual">
            <Il id="il-hero" w={560} h={420} label="Illustration : la ville, une antenne mobile, un bus de la ligne 3 et des personnes à l'arrêt" />
          </div>
        </section>

        <section className="lp-in lp-sec" aria-labelledby="constat">
          <div className="lp-sec-head">
            <span className="eyebrow">Le constat</span>
            <h2 id="constat">Des carrefours bloqués, des arrêts qui débordent</h2>
            <p>Les lignes et les arrêts sont planifiés sur des données anciennes. Aux heures de pointe, l'offre de bus ne suit pas la demande réelle, et personne ne voit venir la saturation.</p>
          </div>
          <div className="constat">
            <figure className="photo big">
              <img src={rondPoint} alt="Vue aérienne d'un rond-point du centre de Yaoundé, avec taxis jaunes et voitures autour du monument « I love my country Cameroon »" loading="lazy" />
              <figcaption>Rond-point du centre de Yaoundé · Photo Pexels</figcaption>
            </figure>
            <div className="side-col">
              <figure className="photo">
                <img src={vueAerienne} alt="Vue aérienne de Yaoundé : quartiers administratifs, collines et étalement de la ville" loading="lazy" />
                <figcaption>Yaoundé vue du ciel · Photo Pexels</figcaption>
              </figure>
              <div className="fact">
                <b>Ce que FlowPulse change</b>
                <p>L'opérateur sait à l'avance quels arrêts vont saturer, et peut y envoyer des bus de réserve avant que la file ne se forme.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-in lp-sec" aria-labelledby="apercu">
          <div className="lp-sec-head">
            <span className="eyebrow">Aperçu</span>
            <h2 id="apercu">La ville en temps réel, et la décision à portée de main</h2>
            <p>La densité s'affiche par quartier en cellules hexagonales. Les alertes et les recommandations apparaissent là où elles se produisent.</p>
          </div>
          <div className="preview">
            <HexMap width={1100} height={460} seed={1} hot={[[0.46, 0.46, 1], [0.74, 0.66, 0.6]]} line pins label="Carte de densité de population en cellules hexagonales, avec une ligne de bus" />
            <div className="float-card fc-alert">
              <span className="badge b-sature">Saturé à 17 h 45</span>
              <b>Yaoundé II · Mokolo</b>
              <span className="muted">Tension 92 / 100 · 3 bus de réserve disponibles</span>
            </div>
            <div className="float-card fc-reco">
              <span className="label">Recommandation</span>
              <b>
                +3 bus sur la ligne <span className="line">3</span>
              </b>
              <span className="badge b-fluide">Conforme sous réserve</span>
            </div>
          </div>
        </section>

        <div className="lp-band" id="fonctionnement">
          <section className="lp-in lp-sec" aria-labelledby="h-fonct">
            <div className="lp-sec-head">
              <span className="eyebrow">Fonctionnement</span>
              <h2 id="h-fonct">Trois étapes, de l'antenne au bus</h2>
              <p>Les données restent agrégées par zone : aucune personne n'est suivie individuellement.</p>
            </div>
            <div className="grid-3">
              {STEPS.map((s) => (
                <article className="step-card" key={s.t}>
                  <Il id={s.il} w={240} h={140} />
                  <h3>{s.t}</h3>
                  <p>{s.p}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="lp-in lp-sec" id="pour-qui" aria-labelledby="h-qui">
          <div className="lp-sec-head">
            <span className="eyebrow">Pour qui</span>
            <h2 id="h-qui">Un outil, trois métiers</h2>
          </div>
          <div className="grid-3">
            {PERSONAS.map((p) => (
              <article className="persona" key={p.t}>
                <Il id={p.il} w={240} h={120} />
                <span className="badge b-primary">{p.tag}</span>
                <h3>{p.t}</h3>
                <ul>
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <div className="lp-band" id="conformite">
          <section className="lp-in lp-sec" aria-labelledby="h-conf">
            <div className="lp-sec-head">
              <span className="eyebrow">Conformité et normes</span>
              <h2 id="h-conf">Construit selon la norme ITU-T Y.3172</h2>
              <p>Chaque étape du pipeline correspond à un nœud de la norme. L'étape « Politique » vérifie toute décision avant qu'elle n'atteigne l'utilisateur.</p>
            </div>
            <ol className="pipeline">
              {PIPELINE.map(([n, t]) => (
                <li key={n} className={n === "P" ? "p" : undefined}>
                  <b>{n}</b>
                  {t}
                </li>
              ))}
            </ol>
            <div className="grid-4">
              <div className="stat"><b>7</b><span>nœuds de la norme Y.3172 couverts par le pipeline</span></div>
              <div className="stat"><b>21</b><span>textes officiels inventoriés dans la base de connaissances</span></div>
              <div className="stat"><b>100 %</b><span>des recommandations tracées, sources citées</span></div>
              <div className="stat"><b>0</b><span>donnée individuelle stockée</span></div>
            </div>
          </section>
        </div>

        <section className="lp-in lp-sec" id="equipe" aria-labelledby="h-eq">
          <div className="lp-sec-head">
            <span className="eyebrow">Équipe</span>
            <h2 id="h-eq">Mboa Labs</h2>
          </div>
          <ul className="team">
            {TEAM.map(([ini, nom, role]) => (
              <li className="member" key={nom}>
                <span className="avatar">{ini}</span>
                <b>{nom}</b>
                <span>{role}</span>
              </li>
            ))}
          </ul>
          <div className="cta">
            <div>
              <h2>Voir FlowPulse en action</h2>
              <p>Alertes, recommandations justifiées et superviseur IA, sur des données de démonstration.</p>
            </div>
            <Link className="btn btn-primary" to={app}>
              Ouvrir la démo
              <Arrow />
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-in lp-foot">
        <span>© 2026 Mboa Labs · AI for Good Lab Hackathon</span>
        <span>Photos : Pexels · Cartes : OpenStreetMap, Esri</span>
      </footer>
    </div>
  );
}
