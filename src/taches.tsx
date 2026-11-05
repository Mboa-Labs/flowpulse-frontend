import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { demander, erreur, simuler, type Reponse, type Scenario, type Simulation } from "./flowpulse";

/**
 * Traitements longs (simulation, superviseur IA) gardés au-dessus des écrans :
 * ils continuent quand on change d'onglet, et une notification signale la fin.
 */
export interface Echange {
  question: string;
  reponse?: Reponse;
  erreur?: string;
}

interface Taches {
  simulation: { enCours: boolean; resultat: Simulation | null; erreur: string | null; nouvelle: Simulation | null };
  lancerSimulation: (s: Scenario) => void;
  choisirSimulation: (s: Simulation) => void;
  echanges: Echange[];
  questionEnCours: boolean;
  envoyerQuestion: (q: string) => void;
}

const Ctx = createContext<Taches | null>(null);

export function useTaches() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTaches hors de TachesProvider");
  return c;
}

interface Notif {
  texte: string;
  lien: string;
  ok: boolean;
}

export function TachesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const ici = useRef(location.pathname);
  ici.current = location.pathname;

  const [simulation, setSimulation] = useState<Taches["simulation"]>({ enCours: false, resultat: null, erreur: null, nouvelle: null });
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [questionEnCours, setQuestionEnCours] = useState(false);
  const [notif, setNotif] = useState<Notif | null>(null);

  // Nouvel utilisateur : on repart de zéro
  useEffect(() => {
    setSimulation({ enCours: false, resultat: null, erreur: null, nouvelle: null });
    setEchanges([]);
    setNotif(null);
  }, [user?.id]);

  // La notification n'apparaît que si l'on a quitté l'écran concerné
  const notifier = useCallback((n: Notif) => {
    if (!ici.current.startsWith(n.lien)) setNotif(n);
  }, []);

  useEffect(() => {
    if (!notif) return;
    const t = window.setTimeout(() => setNotif(null), 10000);
    return () => window.clearTimeout(t);
  }, [notif]);

  const lancerSimulation = useCallback((s: Scenario) => {
    setSimulation((x) => ({ ...x, enCours: true, erreur: null }));
    simuler(s)
      .then((r) => {
        setSimulation({ enCours: false, resultat: r, erreur: null, nouvelle: r });
        notifier({ texte: `Simulation terminée : ${r.libelle}`, lien: "/simulation", ok: true });
      })
      .catch((e) => {
        setSimulation((x) => ({ ...x, enCours: false, erreur: erreur(e) }));
        notifier({ texte: "La simulation a échoué.", lien: "/simulation", ok: false });
      });
  }, [notifier]);

  const choisirSimulation = useCallback((s: Simulation) => setSimulation((x) => ({ ...x, resultat: s })), []);

  const envoyerQuestion = useCallback((q: string) => {
    setQuestionEnCours(true);
    setEchanges((e) => [...e, { question: q }]);
    const maj = (champ: Partial<Echange>) =>
      setEchanges((e) => e.map((x, i) => (i === e.length - 1 ? { ...x, ...champ } : x)));
    demander(q)
      .then((r) => {
        maj({ reponse: r });
        notifier({ texte: "Le superviseur IA a répondu.", lien: "/assistant", ok: true });
      })
      .catch((err) => {
        maj({ erreur: erreur(err) });
        notifier({ texte: "Le superviseur IA n'a pas pu répondre.", lien: "/assistant", ok: false });
      })
      .finally(() => setQuestionEnCours(false));
  }, [notifier]);

  return (
    <Ctx.Provider value={{ simulation, lancerSimulation, choisirSimulation, echanges, questionEnCours, envoyerQuestion }}>
      {children}
      {notif && (
        <div className={`toast${notif.ok ? "" : " toast-ko"}`} role="status">
          <span>{notif.texte}</span>
          <Link to={notif.lien} onClick={() => setNotif(null)}>Voir</Link>
          <button type="button" aria-label="Fermer" onClick={() => setNotif(null)}>×</button>
        </div>
      )}
    </Ctx.Provider>
  );
}
