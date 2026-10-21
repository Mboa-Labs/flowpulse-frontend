/** Écran en attente de son lot (carte, alertes, flotte, simulation…). */
export default function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <h2>{title}</h2>
      <p className="muted">Écran prévu dans un prochain prototype.</p>
    </section>
  );
}
