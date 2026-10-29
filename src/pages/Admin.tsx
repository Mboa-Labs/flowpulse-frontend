import { useEffect, useState, type FormEvent } from "react";
import type { Role } from "../api";
import { creerCompte, erreur, getComptes, modifierCompte, type Compte } from "../flowpulse";
import { ROLE_LABEL } from "../routes";

const ROLES: Role[] = ["GESTIONNAIRE", "OPERATEUR", "URBANISTE", "ADMIN"];

export default function Admin() {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "OPERATEUR" as Role });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getComptes().then(setComptes).catch((e) => setError(erreur(e)));
  }, []);

  async function creer(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const c = await creerCompte(form);
      setComptes((all) => [...all, c]);
      setForm({ nom: "", email: "", password: "", role: "OPERATEUR" });
      setMessage(`Compte créé pour ${c.email}.`);
    } catch (err) {
      setError(erreur(err));
    }
  }

  async function basculer(c: Compte) {
    try {
      const maj = await modifierCompte(c.id, { actif: !c.actif });
      setComptes((all) => all.map((x) => (x.id === maj.id ? maj : x)));
    } catch (err) {
      setError(erreur(err));
    }
  }

  return (
    <div className="split">
      <section className="card">
        <h2 className="h-card">Comptes</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>État</th><th></th></tr></thead>
            <tbody>
              {comptes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nom}</td>
                  <td>{c.email}</td>
                  <td>{ROLE_LABEL[c.role]}</td>
                  <td><span className={`badge ${c.actif ? "b-fluide" : "b-neutral"}`}>{c.actif ? "Actif" : "Désactivé"}</span></td>
                  <td><button className="btn btn-ghost btn-sm" type="button" onClick={() => basculer(c)}>{c.actif ? "Désactiver" : "Réactiver"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form className="card" onSubmit={creer}>
        <h2 className="h-card">Créer un compte</h2>
        <div className="field"><label htmlFor="a-nom">Nom</label><input id="a-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
        <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div className="field"><label htmlFor="a-pass">Mot de passe provisoire (8 caractères minimum)</label><input id="a-pass" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
        <div className="field">
          <label htmlFor="a-role">Rôle</label>
          <select id="a-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">Créer le compte</button>
        {message && <p className="small" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
