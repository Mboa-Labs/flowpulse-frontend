import { useState, type FormEvent } from "react";
import TracePanel, { Citations } from "../components/TracePanel";
import { demander, erreur, type Reponse } from "../flowpulse";

interface Echange {
  question: string;
  reponse?: Reponse;
  erreur?: string;
}

const SUGGESTIONS = [
  "Vérifie le trafic à Yaoundé II et propose des bus si besoin",
  "Quelle zone est la plus saturée en ce moment ?",
  "Qui est compétent pour organiser le transport urbain ?",
];

export default function Assistant() {
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [trace, setTrace] = useState<string | null>(null);

  async function envoyer(q: string) {
    if (!q.trim() || pending) return;
    setPending(true);
    setQuestion("");
    setEchanges((e) => [...e, { question: q }]);
    try {
      const r = await demander(q);
      setEchanges((e) => e.map((x, i) => (i === e.length - 1 ? { ...x, reponse: r } : x)));
    } catch (err) {
      setEchanges((e) => e.map((x, i) => (i === e.length - 1 ? { ...x, erreur: erreur(err) } : x)));
    } finally {
      setPending(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    envoyer(question);
  }

  return (
    <div className="split">
      <section className="chat">
        {echanges.length === 0 && (
          <div className="card">
            <h2 className="h-card">Posez une question sur la circulation, la flotte ou la réglementation</h2>
            <p className="small muted">Le modèle tourne en local : aucune donnée n'est envoyée hors du serveur. Une réponse peut prendre jusqu'à une minute.</p>
          </div>
        )}
        {echanges.map((x, i) => (
          <div key={i} className="exchange">
            <div className="msg user">{x.question}</div>
            {x.erreur && <div className="msg bot error">{x.erreur}</div>}
            {!x.reponse && !x.erreur && <div className="msg bot muted">Analyse en cours…</div>}
            {x.reponse && (
              <div className="msg bot">
                <p className="pre">{x.reponse.reponse}</p>
                {x.reponse.outils.length > 0 && (
                  <p className="small muted">Outils utilisés : {x.reponse.outils.map((o) => o.name).join(", ")}</p>
                )}
                {x.reponse.recommandations.length > 0 && (
                  <p className="small">Recommandation créée, à valider dans l'écran Flotte : {x.reponse.recommandations.join(", ")}</p>
                )}
                <Citations citations={x.reponse.citations} />
                <button className="btn btn-ghost" type="button" onClick={() => setTrace(x.reponse!.trace_id)}>Voir le raisonnement</button>
              </div>
            )}
          </div>
        ))}
        <div className="suggest">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => envoyer(s)} disabled={pending}>{s}</button>
          ))}
        </div>
        <form className="composer" onSubmit={submit}>
          <label htmlFor="q" className="sr-only">Votre question</label>
          <input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Votre question…" disabled={pending} />
          <button className="btn btn-primary" type="submit" disabled={pending || !question.trim()}>Envoyer</button>
        </form>
      </section>
      <aside className="card">
        <h2 className="h-card">Raisonnement</h2>
        {trace ? <TracePanel traceId={trace} /> : <p className="small muted">Choisissez « Voir le raisonnement » sous une réponse pour afficher chaque étape et ses sources.</p>}
      </aside>
    </div>
  );
}
