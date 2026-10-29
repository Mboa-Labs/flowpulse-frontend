import { useEffect, useState } from "react";
import { erreur, getTrace, type Citation, type Trace } from "../flowpulse";

const AGENT: Record<string, string> = {
  watcher: "Surveillance",
  optimizer: "Optimisation",
  policy: "Conformité",
  orchestrator: "Superviseur",
  outil: "Outil",
};

function texte(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : JSON.stringify(v);
}

export function Citations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <div className="row">
      {citations.map((c, i) => (
        <span key={`${c.doc_id}-${i}`} className="cite" title={c.extrait || c.titre}>
          {(c.reference || c.titre || c.doc_id) + (c.article ? ` · ${c.article}` : "")}
        </span>
      ))}
    </div>
  );
}

/** Raisonnement complet d'un agent : chaque étape, sa durée et ses sources (critère d'auditabilité). */
export default function TracePanel({ traceId }: { traceId: string }) {
  const [trace, setTrace] = useState<Trace | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTrace(null);
    getTrace(traceId).then(setTrace).catch((e) => setError(erreur(e)));
  }, [traceId]);

  if (error) return <p className="error">{error}</p>;
  if (!trace) return <p className="muted small">Chargement du raisonnement…</p>;
  const total = trace.etapes.reduce((s, e) => s + e.duree_ms, 0);

  return (
    <div className="trace">
      <div className="row between small muted">
        <span className="mono">{trace.id}</span>
        <span>
          {trace.etapes.length} étapes · {(total / 1000).toFixed(1)} s
        </span>
      </div>
      <ol className="steps">
        {trace.etapes.map((e, i) => (
          <li key={i}>
            <div className="row between">
              <b>{AGENT[e.agent] ?? e.agent}</b>
              <span className="small muted">{e.duree_ms} ms</span>
            </div>
            <span className="small muted">{e.action}</span>
            <span className="small">{texte(e.sortie).slice(0, 300)}</span>
            <Citations citations={e.sources} />
          </li>
        ))}
      </ol>
    </div>
  );
}
