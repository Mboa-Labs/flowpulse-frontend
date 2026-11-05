import { useState, type FormEvent } from "react";
import TracePanel, { Citations } from "../components/TracePanel";
import { useTaches } from "../taches";

const SUGGESTIONS = [
  "Vérifie le trafic à Yaoundé II et propose des bus si besoin",
  "Quelle zone est la plus saturée en ce moment ?",
  "Qui est compétent pour organiser le transport urbain ?",
];

export default function Assistant() {
  const { echanges, questionEnCours: pending, envoyerQuestion } = useTaches();
  const [question, setQuestion] = useState("");
  const [trace, setTrace] = useState<string | null>(null);

  function envoyer(q: string) {
    if (!q.trim() || pending) return;
    setQuestion("");
    envoyerQuestion(q);
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
            <p className="small muted">Réponse en 30 secondes à 1 minute. Vous pouvez changer d'écran pendant ce temps.</p>
          </div>
        )}
        {echanges.map((x, i) => (
          <div key={i} className="exchange">
            <div className="msg user">{x.question}</div>
            {x.erreur && <div className="msg bot error">{x.erreur}</div>}
            {!x.reponse && !x.erreur && <div className="msg bot muted">L'IA consulte les données et les textes… (jusqu'à 1 minute)</div>}
            {x.reponse && (
              <div className="msg bot">
                <p className="pre">{x.reponse.reponse}</p>
                {x.reponse.outils.length > 0 && (
                  <p className="small muted">Données consultées : {x.reponse.outils.map((o) => o.name).join(", ")}</p>
                )}
                {x.reponse.recommandations.length > 0 && (
                  <p className="small">Recommandation à valider dans Flotte : {x.reponse.recommandations.join(", ")}</p>
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
        {trace ? <TracePanel traceId={trace} /> : <p className="small muted">Cliquez « Voir le raisonnement » sous une réponse pour voir chaque étape et ses sources.</p>}
      </aside>
    </div>
  );
}
