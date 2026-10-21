/** Écran en attente de son prototype (carte, alertes, flotte…), voir les maquettes. */
export default function Placeholder({ title }: { title: string }) {
  return (
    <section className="card empty">
      <span className="badge">Prochain prototype</span>
      <h2 style={{ fontSize: 20 }}>{title}</h2>
      <p className="muted">Cet écran sera construit à partir de sa maquette, dans un prochain prototype.</p>
    </section>
  );
}
